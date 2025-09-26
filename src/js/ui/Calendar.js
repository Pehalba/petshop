/**
 * Componente de Calendário - Dashboard
 * Calendário mensal sem dependências externas
 */

class Calendar {
  constructor() {
    this.container = null;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1; // 1-12
    this.selectedDay = null;
    this.counts = {};
    this.config = {
      locale: 'pt-BR',
      weekStartsOn: 0, // 0 = domingo
      minMonth: 'auto',
      maxMonth: '2026-12'
    };
    this.callbacks = {
      onMonthChange: null,
      onDayClick: null,
      getDayCount: null
    };
  }

  init(options = {}) {
    this.container = options.container;
    this.config = { ...this.config, ...options };
    this.callbacks = { ...this.callbacks, ...options };
    
    if (this.config.minMonth === 'auto') {
      const now = new Date();
      this.config.minMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    this.render();
    this.setupEventListeners();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="cal-nav cal-prev" type="button" aria-label="Mês anterior">
            <i class="icon-chevron-left"></i>
          </button>
          <h3 class="cal-title"></h3>
          <button class="cal-nav cal-next" type="button" aria-label="Próximo mês">
            <i class="icon-chevron-right"></i>
          </button>
        </div>
        <div class="calendar-grid">
          <div class="cal-weekdays">
            <div class="cal-weekday">D</div>
            <div class="cal-weekday">S</div>
            <div class="cal-weekday">T</div>
            <div class="cal-weekday">Q</div>
            <div class="cal-weekday">Q</div>
            <div class="cal-weekday">S</div>
            <div class="cal-weekday">S</div>
          </div>
          <div class="cal-days"></div>
        </div>
      </div>
    `;

    this.renderMonth(this.currentYear, this.currentMonth);
  }

  renderMonth(year, month) {
    this.currentYear = year;
    this.currentMonth = month;

    // Atualizar título
    const titleEl = this.container.querySelector('.cal-title');
    const monthName = new Intl.DateTimeFormat(this.config.locale, {
      month: 'long',
      year: 'numeric'
    }).format(new Date(year, month - 1));
    titleEl.textContent = monthName;

    // Calcular dias do mês
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

    // Renderizar dias
    const daysEl = this.container.querySelector('.cal-days');
    daysEl.innerHTML = '';

    // Dias do mês anterior (cinza)
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEl = this.createDayElement(day, prevYear, prevMonth, true);
      daysEl.appendChild(dayEl);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const dayEl = this.createDayElement(day, year, month, false, isToday);
      daysEl.appendChild(dayEl);
    }

    // Dias do próximo mês (cinza)
    const totalCells = 42; // 6 semanas × 7 dias
    const remainingCells = totalCells - (firstDayOfWeek + daysInMonth);
    
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = this.createDayElement(day, nextYear, nextMonth, true);
      daysEl.appendChild(dayEl);
    }

    // Atualizar navegação
    this.updateNavigation();

    // Buscar contagens do mês
    this.loadMonthCounts();

    // Callback
    if (this.callbacks.onMonthChange) {
      this.callbacks.onMonthChange(year, month);
    }
  }

  createDayElement(day, year, month, isOtherMonth = false, isToday = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    
    if (isOtherMonth) {
      dayEl.classList.add('is-other-month');
    }
    if (isToday) {
      dayEl.classList.add('is-today');
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = this.counts[dateStr] || 0;

    dayEl.innerHTML = `
      <span class="cal-day-number">${day}</span>
      ${count > 0 ? `<span class="cal-count">${count}</span>` : ''}
    `;

    if (!isOtherMonth) {
      dayEl.addEventListener('click', () => this.selectDay(dateStr));
      dayEl.setAttribute('aria-label', `${day} de ${this.getMonthName(month)} de ${year}${count > 0 ? ` — ${count} serviços` : ''}`);
    }

    // Aplicar classes de contagem
    if (count > 0) {
      if (count === 1) dayEl.classList.add('has-1');
      else if (count <= 3) dayEl.classList.add('has-2-3');
      else dayEl.classList.add('has-4plus');
    }

    return dayEl;
  }

  selectDay(dateStr) {
    // Remover seleção anterior
    const prevSelected = this.container.querySelector('.cal-day.is-selected');
    if (prevSelected) {
      prevSelected.classList.remove('is-selected');
    }

    // Selecionar novo dia
    const dayEl = this.container.querySelector(`[aria-label*="${dateStr}"]`);
    if (dayEl) {
      dayEl.classList.add('is-selected');
      this.selectedDay = dateStr;
    }

    // Callback
    if (this.callbacks.onDayClick) {
      this.callbacks.onDayClick(dateStr);
    }
  }

  setCounts(countMap) {
    this.counts = { ...countMap };
    this.updateDayCounts();
  }

  updateDayCounts() {
    const dayElements = this.container.querySelectorAll('.cal-day:not(.is-other-month)');
    dayElements.forEach(dayEl => {
      const dayNumber = dayEl.querySelector('.cal-day-number').textContent;
      const month = this.currentMonth;
      const year = this.currentYear;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const count = this.counts[dateStr] || 0;

      // Remover classes de contagem anteriores
      dayEl.classList.remove('has-1', 'has-2-3', 'has-4plus');

      // Atualizar contador
      const countEl = dayEl.querySelector('.cal-count');
      if (count > 0) {
        if (!countEl) {
          dayEl.innerHTML += `<span class="cal-count">${count}</span>`;
        } else {
          countEl.textContent = count;
        }

        // Aplicar classes de contagem
        if (count === 1) dayEl.classList.add('has-1');
        else if (count <= 3) dayEl.classList.add('has-2-3');
        else dayEl.classList.add('has-4plus');
      } else if (countEl) {
        countEl.remove();
      }
    });
  }

  updateNavigation() {
    const prevBtn = this.container.querySelector('.cal-prev');
    const nextBtn = this.container.querySelector('.cal-next');

    // Verificar limites
    const currentMonthStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
    const isMinMonth = currentMonthStr <= this.config.minMonth;
    const isMaxMonth = currentMonthStr >= this.config.maxMonth;

    prevBtn.disabled = isMinMonth;
    nextBtn.disabled = isMaxMonth;

    if (isMinMonth) {
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.classList.remove('disabled');
    }

    if (isMaxMonth) {
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.classList.remove('disabled');
    }
  }

  async loadMonthCounts() {
    if (this.callbacks.getDayCount) {
      try {
        const countMap = await this.callbacks.getDayCount(this.currentYear, this.currentMonth);
        this.setCounts(countMap);
      } catch (error) {
        console.error('Erro ao carregar contagens do mês:', error);
      }
    }
  }

  setupEventListeners() {
    const prevBtn = this.container.querySelector('.cal-prev');
    const nextBtn = this.container.querySelector('.cal-next');

    prevBtn.addEventListener('click', () => {
      if (!prevBtn.disabled) {
        this.navigateMonth(-1);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!nextBtn.disabled) {
        this.navigateMonth(1);
      }
    });
  }

  navigateMonth(direction) {
    let newMonth = this.currentMonth + direction;
    let newYear = this.currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    this.renderMonth(newYear, newMonth);
  }

  getMonthName(month) {
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return months[month - 1];
  }

  // Métodos públicos
  renderMonth(year, month) {
    this.renderMonth(year, month);
  }

  selectDay(dateStr) {
    this.selectDay(dateStr);
  }

  disableNavPrev() {
    const prevBtn = this.container.querySelector('.cal-prev');
    prevBtn.disabled = true;
    prevBtn.classList.add('disabled');
  }

  disableNavNext() {
    const nextBtn = this.container.querySelector('.cal-next');
    nextBtn.disabled = true;
    nextBtn.classList.add('disabled');
  }
}

// Exportar para uso global
window.Calendar = Calendar;
