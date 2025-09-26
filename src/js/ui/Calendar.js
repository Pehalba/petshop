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
    const dayData = this.counts[dateStr] || { appointments: 0, vaccines: 0 };
    
    // Compatibilidade com formato antigo (número simples)
    const appointmentsCount = typeof dayData === 'number' ? dayData : (dayData.appointments || 0);
    const vaccinesCount = typeof dayData === 'number' ? 0 : (dayData.vaccines || 0);
    const totalCount = appointmentsCount + vaccinesCount;

    let countsHtml = '';
    if (appointmentsCount > 0) {
      countsHtml += `<span class="cal-count appointments">${appointmentsCount}</span>`;
    }
    if (vaccinesCount > 0) {
      countsHtml += `<span class="cal-count vaccines">💉</span>`;
    }

    dayEl.innerHTML = `
      <span class="cal-day-number">${day}</span>
      ${countsHtml}
    `;

    if (!isOtherMonth) {
      dayEl.addEventListener('click', () => this.selectDay(dateStr));
      
      // Criar texto para aria-label
      let ariaText = `${day} de ${this.getMonthName(month)} de ${year}`;
      if (totalCount > 0) {
        let items = [];
        if (appointmentsCount > 0) items.push(`${appointmentsCount} ${appointmentsCount === 1 ? 'serviço' : 'serviços'}`);
        if (vaccinesCount > 0) items.push(`${vaccinesCount} ${vaccinesCount === 1 ? 'vacina' : 'vacinas'}`);
        ariaText += ` — ${items.join(' e ')}`;
      }
      dayEl.setAttribute('aria-label', ariaText);
    }

    // Não precisamos mais de classes de contagem - cores fixas

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
      const dayData = this.counts[dateStr] || { appointments: 0, vaccines: 0 };
      
      // Compatibilidade com formato antigo
      const appointmentsCount = typeof dayData === 'number' ? dayData : (dayData.appointments || 0);
      const vaccinesCount = typeof dayData === 'number' ? 0 : (dayData.vaccines || 0);
      const totalCount = appointmentsCount + vaccinesCount;

      // Não precisamos mais remover classes de contagem

      // Remover contadores antigos
      const oldCounts = dayEl.querySelectorAll('.cal-count');
      oldCounts.forEach(el => el.remove());

      // Adicionar novos contadores
      if (appointmentsCount > 0) {
        const appointmentEl = document.createElement('span');
        appointmentEl.className = 'cal-count appointments';
        appointmentEl.textContent = appointmentsCount;
        dayEl.appendChild(appointmentEl);
      }

      if (vaccinesCount > 0) {
        const vaccineEl = document.createElement('span');
        vaccineEl.className = 'cal-count vaccines';
        vaccineEl.textContent = '💉';
        dayEl.appendChild(vaccineEl);
      }

      // Cores fixas aplicadas via CSS - não precisamos de classes
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

  // Métodos públicos já implementados acima

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
