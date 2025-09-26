/**
 * Controlador do Calendário - Dashboard
 * Orquestra o calendário com os dados de agendamentos
 */

class CalendarController {
  constructor(store) {
    this.store = store;
    this.calendar = null;
    this.dayListContainer = null;
    this.cache = new Map(); // Cache por mês para navegação mais fluida
  }

  init(calendarContainer, dayListContainer) {
    this.dayListContainer = dayListContainer;
    
    this.calendar = new Calendar();
    this.calendar.init({
      container: calendarContainer,
      onMonthChange: (year, month) => this.onMonthChange(year, month),
      onDayClick: (dateStr) => this.onDayClick(dateStr),
      getDayCount: (year, month) => this.getDayCount(year, month)
    });
  }

  async onMonthChange(year, month) {
    console.log(`📅 Mês alterado: ${year}-${month}`);
    // O calendário já chama getDayCount automaticamente
  }

  async onDayClick(dateStr) {
    console.log(`📅 Dia clicado: ${dateStr}`);
    await this.loadDayAppointments(dateStr);
  }

  async getDayCount(year, month) {
    const cacheKey = `${year}-${month}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Calcular range do mês
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const from = startDate.toISOString();
      const to = endDate.toISOString();

      // Buscar agendamentos do mês
      const appointments = await this.store.getAppointmentsByDateRange(from, to);
      
      // Agrupar por dia
      const countMap = {};
      appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.dataHoraInicio);
        const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!countMap[dateStr]) {
          countMap[dateStr] = 0;
        }
        countMap[dateStr]++;
      });

      // Cachear resultado
      this.cache.set(cacheKey, countMap);
      
      return countMap;
    } catch (error) {
      console.error('Erro ao buscar contagens do mês:', error);
      return {};
    }
  }

  async loadDayAppointments(dateStr) {
    if (!this.dayListContainer) return;

    try {
      // Calcular range do dia
      const date = new Date(dateStr + 'T00:00:00');
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const from = startOfDay.toISOString();
      const to = endOfDay.toISOString();

      // Buscar agendamentos do dia
      const appointments = await this.store.getAppointmentsByDateRange(from, to);
      
      // Ordenar por hora
      appointments.sort((a, b) => {
        const timeA = new Date(a.dataHoraInicio).getTime();
        const timeB = new Date(b.dataHoraInicio).getTime();
        return timeA - timeB;
      });

      // Renderizar lista do dia
      this.renderDayList(dateStr, appointments);
      
    } catch (error) {
      console.error('Erro ao carregar agendamentos do dia:', error);
      this.dayListContainer.innerHTML = `
        <div class="day-list-error">
          <p>❌ Erro ao carregar agendamentos</p>
          <p>Verifique sua conexão com a internet</p>
        </div>
      `;
    }
  }

  renderDayList(dateStr, appointments) {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (appointments.length === 0) {
      this.dayListContainer.innerHTML = `
        <div class="day-list">
          <h4>${formattedDate} — Sem compromissos</h4>
          <div class="empty-day">
            <p>Nenhum agendamento para este dia</p>
          </div>
        </div>
      `;
      return;
    }

    const appointmentsHtml = appointments.map(appointment => this.renderAppointmentCard(appointment)).join('');
    
    this.dayListContainer.innerHTML = `
      <div class="day-list">
        <h4>${formattedDate} — ${appointments.length} ${appointments.length === 1 ? 'serviço' : 'serviços'}</h4>
        <div class="appointments-list">
          ${appointmentsHtml}
        </div>
      </div>
    `;
  }

  async renderAppointmentCard(appointment) {
    try {
      const client = await this.store.getClient(appointment.clienteId);
      const pet = appointment.petId ? await this.store.getPet(appointment.petId) : null;
      
      const time = new Date(appointment.dataHoraInicio).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const services = appointment.itens.map(item => item.nome).join(', ');
      const petName = pet ? pet.nome : 'Pet não informado';
      const clientName = client ? client.nomeCompleto : 'Cliente não encontrado';
      
      const statusClass = this.getStatusClass(appointment.status);
      const paymentBadge = this.getPaymentBadge(appointment.pagamento || {});

      return `
        <div class="appointment-card">
          <div class="appointment-time">${time}</div>
          <div class="appointment-details">
            <div class="appointment-client">
              <strong>${clientName}</strong>
              ${pet ? ` • ${petName}` : ''}
            </div>
            <div class="appointment-services">${services}</div>
            <div class="appointment-meta">
              <span class="status-badge ${statusClass}">${appointment.status}</span>
              ${paymentBadge}
            </div>
          </div>
          <div class="appointment-actions">
            <button class="btn btn-sm btn-outline" onclick="app.viewAppointment('${appointment.id}')" title="Ver detalhes">
              <i class="icon-eye"></i>
            </button>
            ${appointment.pagamento && appointment.pagamento.status !== "pago" ? `
              <button class="btn btn-sm btn-success" onclick="app.markAppointmentPaid('${appointment.id}')" title="Marcar como pago">
                <i class="icon-check"></i>
              </button>
            ` : ''}
            ${client && client.telefoneWhatsApp ? `
              <button class="btn btn-sm btn-info" onclick="app.sendConfirmationWhatsApp('${appointment.id}')" title="Enviar WhatsApp">
                <i class="icon-message-circle"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Erro ao renderizar card do agendamento:', error);
      return `
        <div class="appointment-card error">
          <div class="appointment-details">
            <div class="appointment-client">Erro ao carregar agendamento</div>
            <div class="appointment-services">ID: ${appointment.id}</div>
          </div>
        </div>
      `;
    }
  }

  getStatusClass(status) {
    const statusClasses = {
      'pendente': 'status-pending',
      'confirmado': 'status-confirmed',
      'em_andamento': 'status-in-progress',
      'concluido': 'status-completed',
      'cancelado': 'status-cancelled'
    };
    return statusClasses[status] || 'status-unknown';
  }

  getPaymentBadge(payment) {
    if (!payment || !payment.status) {
      return '<span class="badge badge-secondary">Indefinido</span>';
    }

    const paymentConfig = {
      pago: { class: "badge-success", text: "Pago" },
      nao_pago: { class: "badge-danger", text: "Não Pago" },
      previsto: { class: "badge-warning", text: "Previsto" },
      parcial: { class: "badge-info", text: "Parcial" },
    };

    const config = paymentConfig[payment.status] || {
      class: "badge-secondary",
      text: payment.status,
    };
    return `<span class="badge ${config.class}">${config.text}</span>`;
  }

  // Limpar cache quando necessário
  clearCache() {
    this.cache.clear();
  }

  // Atualizar calendário após mudanças nos dados
  async refresh() {
    this.clearCache();
    if (this.calendar) {
      await this.calendar.loadMonthCounts();
    }
  }
}

// Exportar para uso global
window.CalendarController = CalendarController;
