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
      
      // Buscar vacinas vencendo no mês
      const vaccines = await this.getVaccinesDueInMonth(year, month);
      
      // Agrupar agendamentos por dia
      const countMap = {};
      appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.dataHoraInicio);
        const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!countMap[dateStr]) {
          countMap[dateStr] = { appointments: 0, vaccines: 0 };
        }
        countMap[dateStr].appointments++;
      });

      // Agrupar vacinas por dia
      vaccines.forEach(vaccine => {
        const vaccineDate = new Date(vaccine.proximaDose);
        const dateStr = vaccineDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!countMap[dateStr]) {
          countMap[dateStr] = { appointments: 0, vaccines: 0 };
        }
        countMap[dateStr].vaccines++;
      });

      // Cachear resultado
      this.cache.set(cacheKey, countMap);
      
      return countMap;
    } catch (error) {
      console.error('Erro ao buscar contagens do mês:', error);
      return {};
    }
  }

  async getVaccinesDueInMonth(year, month) {
    try {
      // Buscar todos os pets
      const pets = await this.store.getPets();
      const vaccines = [];

      // Calcular range do mês
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      pets.forEach(pet => {
        if (pet.vacinas && Array.isArray(pet.vacinas)) {
          pet.vacinas.forEach(vaccine => {
            if (vaccine.proximaDose) {
              const doseDate = new Date(vaccine.proximaDose);
              
              // Verificar se a dose está no mês
              if (doseDate >= startDate && doseDate <= endDate) {
                vaccines.push({
                  ...vaccine,
                  petId: pet.id,
                  petNome: pet.nome,
                  clienteId: pet.clienteId,
                  proximaDose: vaccine.proximaDose
                });
              }
            }
          });
        }
      });

      return vaccines;
    } catch (error) {
      console.error('Erro ao buscar vacinas do mês:', error);
      return [];
    }
  }

  async loadDayAppointments(dateStr) {
    if (!this.dayListContainer) return;

    try {
      // Calcular range do dia sem problemas de fuso horário
      const [year, month, day] = dateStr.split('-').map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      const from = startOfDay.toISOString();
      const to = endOfDay.toISOString();

      // Buscar agendamentos do dia
      const appointments = await this.store.getAppointmentsByDateRange(from, to);
      
      // Buscar vacinas do dia
      const vaccines = await this.getVaccinesDueOnDay(dateStr);
      
      // Ordenar agendamentos por hora
      appointments.sort((a, b) => {
        const timeA = new Date(a.dataHoraInicio).getTime();
        const timeB = new Date(b.dataHoraInicio).getTime();
        return timeA - timeB;
      });

      // Renderizar lista do dia
      await this.renderDayList(dateStr, appointments, vaccines);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dia:', error);
      this.dayListContainer.innerHTML = `
        <div class="day-list-error">
          <p>❌ Erro ao carregar dados do dia</p>
          <p>Verifique sua conexão com a internet</p>
        </div>
      `;
    }
  }

  async getVaccinesDueOnDay(dateStr) {
    try {
      // Buscar todos os pets
      const pets = await this.store.getPets();
      const vaccines = [];

      // Converter dateStr para Date sem problemas de fuso horário
      const [year, month, day] = dateStr.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);

      pets.forEach(pet => {
        if (pet.vacinas && Array.isArray(pet.vacinas)) {
          pet.vacinas.forEach(vaccine => {
            if (vaccine.proximaDose) {
              const doseDate = new Date(vaccine.proximaDose);
              
              // Verificar se a dose é no dia específico
              if (doseDate.toDateString() === targetDate.toDateString()) {
                vaccines.push({
                  ...vaccine,
                  petId: pet.id,
                  petNome: pet.nome,
                  clienteId: pet.clienteId,
                  proximaDose: vaccine.proximaDose
                });
              }
            }
          });
        }
      });

      return vaccines;
    } catch (error) {
      console.error('Erro ao buscar vacinas do dia:', error);
      return [];
    }
  }

  async renderDayList(dateStr, appointments, vaccines = []) {
    // Criar data sem problemas de fuso horário
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const totalCount = appointments.length + vaccines.length;
    
    if (totalCount === 0) {
      this.dayListContainer.innerHTML = `
        <div class="day-list">
          <h4>${formattedDate} — Sem compromissos</h4>
          <div class="empty-day">
            <p>Nenhum agendamento ou vacina para este dia</p>
          </div>
        </div>
      `;
      return;
    }

    const appointmentsHtml = await Promise.all(
      appointments.map(appointment => this.renderAppointmentCard(appointment))
    );
    const vaccinesHtml = await Promise.all(
      vaccines.map(vaccine => this.renderVaccineCard(vaccine))
    );
    
    let title = `${formattedDate} — `;
    let titleParts = [];
    if (appointments.length > 0) {
      titleParts.push(`${appointments.length} ${appointments.length === 1 ? 'serviço' : 'serviços'}`);
    }
    if (vaccines.length > 0) {
      titleParts.push(`${vaccines.length} ${vaccines.length === 1 ? 'vacina' : 'vacinas'}`);
    }
    title += titleParts.join(' • ');
    
    this.dayListContainer.innerHTML = `
      <div class="day-list">
        <h4>${title}</h4>
        ${appointments.length > 0 ? `
          <div class="section-header">
            <h5>📅 Agendamentos</h5>
          </div>
          <div class="appointments-list">
            ${appointmentsHtml.join('')}
          </div>
        ` : ''}
        ${vaccines.length > 0 ? `
          <div class="section-header">
            <h5>💉 Vacinas</h5>
          </div>
          <div class="vaccines-list">
            ${vaccinesHtml.join('')}
          </div>
        ` : ''}
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

  async renderVaccineCard(vaccine) {
    try {
      const client = await this.store.getClient(vaccine.clienteId);
      const pet = await this.store.getPet(vaccine.petId);
      
      const dueDate = new Date(vaccine.proximaDose);
      const today = new Date();
      const isOverdue = dueDate < today;
      const statusClass = isOverdue ? 'vaccine-overdue' : 'vaccine-due';
      const statusText = isOverdue ? 'Atrasada' : 'Prevista';
      
      const clientName = client ? client.nomeCompleto : 'Cliente não encontrado';
      const petName = pet ? pet.nome : 'Pet não encontrado';

      return `
        <div class="vaccine-card">
          <div class="vaccine-icon">💉</div>
          <div class="vaccine-details">
            <div class="vaccine-client">
              <strong>${clientName}</strong> • ${petName}
            </div>
            <div class="vaccine-name">${vaccine.nomeVacina}</div>
            <div class="vaccine-meta">
              <span class="vaccine-badge ${statusClass}">${statusText}</span>
              ${vaccine.observacoes ? `<span class="vaccine-notes">${vaccine.observacoes}</span>` : ''}
            </div>
          </div>
          <div class="vaccine-actions">
            <button class="btn btn-sm btn-outline" onclick="app.viewPet('${vaccine.petId}')" title="Ver pet">
              <i class="icon-eye"></i>
            </button>
            ${client && client.telefoneWhatsApp ? `
              <button class="btn btn-sm btn-info" onclick="app.sendVaccineWhatsApp('${vaccine.clienteId}', '${vaccine.nomeVacina}', '${vaccine.proximaDose}')" title="Enviar WhatsApp">
                <i class="icon-message-circle"></i>
              </button>
            ` : ''}
            <button class="btn btn-sm btn-success" onclick="app.createVaccineAppointment('${vaccine.petId}', '${vaccine.nomeVacina}')" title="Agendar aplicação">
              <i class="icon-calendar"></i>
            </button>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Erro ao renderizar card da vacina:', error);
      return `
        <div class="vaccine-card error">
          <div class="vaccine-icon">💉</div>
          <div class="vaccine-details">
            <div class="vaccine-client">Erro ao carregar vacina</div>
            <div class="vaccine-name">${vaccine.nomeVacina || 'Vacina desconhecida'}</div>
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
