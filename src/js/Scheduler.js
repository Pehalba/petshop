/**
 * Scheduler.js - Sistema de Agendamento
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class Scheduler {
  constructor() {
    this.currentDate = new Date();
    this.selectedProfessional = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Event listeners serão adicionados conforme necessário
  }

  // ===== CRIAÇÃO DE AGENDAMENTO =====
  createAppointment(appointmentData) {
    const {
      clienteId,
      petId,
      servicosSelecionados,
      dataHora,
      profissionalId,
      observacoes = "",
    } = appointmentData;

    // Validar dados obrigatórios
    if (
      !clienteId ||
      !petId ||
      !servicosSelecionados ||
      !dataHora ||
      !profissionalId
    ) {
      ui.error("Dados obrigatórios não informados");
      return null;
    }

    // Verificar conflito de horários
    if (this.hasTimeConflict(dataHora, profissionalId, servicosSelecionados)) {
      ui.error("Conflito de horário com outro agendamento");
      return null;
    }

    // Calcular duração total
    const duracaoMinutos = this.calculateTotalDuration(servicosSelecionados);

    // Buscar dados relacionados
    const client = store.getClient(clienteId);
    const pet = store.getPet(petId);
    const professional = store.getProfessional(profissionalId);

    if (!client || !pet || !professional) {
      ui.error("Dados relacionados não encontrados");
      return null;
    }

    const appointment = {
      id: store.generateId("apt"),
      clienteId,
      clienteNome: client.nomeCompleto,
      petId,
      petNome: pet.nome,
      servicosSelecionados,
      dataHora,
      duracaoMinutos,
      profissionalId,
      profissionalNome: professional.nome,
      status: "agendado",
      observacoes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salvar agendamento
    store.saveAppointment(appointment);

    ui.success("Agendamento criado com sucesso!");
    return appointment;
  }

  // ===== ATUALIZAÇÃO DE AGENDAMENTO =====
  updateAppointment(appointmentId, updateData) {
    const appointment = store.getAppointment(appointmentId);
    if (!appointment) {
      ui.error("Agendamento não encontrado");
      return null;
    }

    // Verificar conflito de horários se data/hora ou profissional mudaram
    if (updateData.dataHora || updateData.profissionalId) {
      const newDataHora = updateData.dataHora || appointment.dataHora;
      const newProfissionalId =
        updateData.profissionalId || appointment.profissionalId;

      if (
        this.hasTimeConflict(
          newDataHora,
          newProfissionalId,
          appointment.servicosSelecionados,
          appointmentId
        )
      ) {
        ui.error("Conflito de horário com outro agendamento");
        return null;
      }
    }

    // Atualizar dados
    Object.keys(updateData).forEach((key) => {
      appointment[key] = updateData[key];
    });

    // Recalcular duração se serviços mudaram
    if (updateData.servicosSelecionados) {
      appointment.duracaoMinutos = this.calculateTotalDuration(
        updateData.servicosSelecionados
      );
    }

    appointment.updatedAt = new Date().toISOString();

    // Salvar agendamento
    store.saveAppointment(appointment);

    ui.success("Agendamento atualizado com sucesso!");
    return appointment;
  }

  // ===== CANCELAMENTO DE AGENDAMENTO =====
  cancelAppointment(appointmentId, reason = "") {
    const appointment = store.getAppointment(appointmentId);
    if (!appointment) {
      ui.error("Agendamento não encontrado");
      return null;
    }

    appointment.status = "cancelado";
    appointment.observacoes = reason;
    appointment.updatedAt = new Date().toISOString();

    store.saveAppointment(appointment);

    ui.success("Agendamento cancelado");
    return appointment;
  }

  // ===== CONFIRMAÇÃO DE AGENDAMENTO =====
  confirmAppointment(appointmentId) {
    const appointment = store.getAppointment(appointmentId);
    if (!appointment) {
      ui.error("Agendamento não encontrado");
      return null;
    }

    appointment.status = "confirmado";
    appointment.updatedAt = new Date().toISOString();

    store.saveAppointment(appointment);

    ui.success("Agendamento confirmado");
    return appointment;
  }

  // ===== VERIFICAÇÃO DE CONFLITO =====
  hasTimeConflict(
    dataHora,
    profissionalId,
    servicosSelecionados,
    excludeId = null
  ) {
    const appointmentTime = new Date(dataHora);
    const duration = this.calculateTotalDuration(servicosSelecionados);
    const endTime = new Date(appointmentTime.getTime() + duration * 60000);

    const existingAppointments =
      store.getAppointmentsByProfessional(profissionalId);

    return existingAppointments.some((apt) => {
      if (apt.id === excludeId) return false;
      if (apt.status === "cancelado") return false;

      const existingStart = new Date(apt.dataHora);
      const existingEnd = new Date(
        existingStart.getTime() + apt.duracaoMinutos * 60000
      );

      return appointmentTime < existingEnd && endTime > existingStart;
    });
  }

  // ===== CÁLCULO DE DURAÇÃO =====
  calculateTotalDuration(servicosSelecionados) {
    return servicosSelecionados.reduce((total, service) => {
      const serviceData = store.getService(service.id);
      return total + (serviceData ? serviceData.duracaoMinutos : 60);
    }, 0);
  }

  // ===== BUSCA DE AGENDAMENTOS =====
  getAppointments(filters = {}) {
    let appointments = store.getAppointments();

    // Aplicar filtros
    if (filters.status) {
      appointments = appointments.filter(
        (apt) => apt.status === filters.status
      );
    }

    if (filters.clienteId) {
      appointments = appointments.filter(
        (apt) => apt.clienteId === filters.clienteId
      );
    }

    if (filters.petId) {
      appointments = appointments.filter((apt) => apt.petId === filters.petId);
    }

    if (filters.profissionalId) {
      appointments = appointments.filter(
        (apt) => apt.profissionalId === filters.profissionalId
      );
    }

    if (filters.dataInicio && filters.dataFim) {
      appointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.dataHora);
        const startDate = new Date(filters.dataInicio);
        const endDate = new Date(filters.dataFim);
        return aptDate >= startDate && aptDate <= endDate;
      });
    }

    if (filters.data) {
      appointments = appointments.filter((apt) =>
        apt.dataHora.startsWith(filters.data)
      );
    }

    return appointments;
  }

  // ===== AGENDAMENTOS POR DATA =====
  getAppointmentsByDate(date) {
    return this.getAppointments({ data: date });
  }

  // ===== AGENDAMENTOS POR PROFISSIONAL =====
  getAppointmentsByProfessional(profissionalId, date = null) {
    const filters = { profissionalId };
    if (date) {
      filters.data = date;
    }
    return this.getAppointments(filters);
  }

  // ===== HORÁRIOS DISPONÍVEIS =====
  getAvailableSlots(profissionalId, date, duration = 60) {
    const appointments = this.getAppointmentsByProfessional(
      profissionalId,
      date
    );
    const slots = [];

    // Horário de funcionamento (8h às 18h)
    const startHour = 8;
    const endHour = 18;
    const slotDuration = 30; // Slots de 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotTime.getTime() + duration * 60000);

        // Verificar se o slot está disponível
        const isAvailable = !appointments.some((apt) => {
          const aptStart = new Date(apt.dataHora);
          const aptEnd = new Date(
            aptStart.getTime() + apt.duracaoMinutos * 60000
          );

          return slotTime < aptEnd && slotEnd > aptStart;
        });

        if (isAvailable) {
          slots.push({
            time: slotTime,
            formatted: utils.formatTime(slotTime),
            available: true,
          });
        }
      }
    }

    return slots;
  }

  // ===== CALENDÁRIO =====
  getCalendarData(year, month) {
    const appointments = this.getAppointments();
    const calendar = [];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayAppointments = appointments.filter((apt) =>
        apt.dataHora.startsWith(dateStr)
      );

      calendar.push({
        date: date,
        dateStr: dateStr,
        day: day,
        appointments: dayAppointments,
        count: dayAppointments.length,
      });
    }

    return calendar;
  }

  // ===== ESTATÍSTICAS =====
  getAppointmentStats(period = "month") {
    const appointments = this.getAppointments();
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
    }

    const periodAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.dataHora);
      return aptDate >= startDate && aptDate < endDate;
    });

    const stats = {
      total: periodAppointments.length,
      agendados: periodAppointments.filter((apt) => apt.status === "agendado")
        .length,
      confirmados: periodAppointments.filter(
        (apt) => apt.status === "confirmado"
      ).length,
      concluidos: periodAppointments.filter((apt) => apt.status === "concluido")
        .length,
      cancelados: periodAppointments.filter((apt) => apt.status === "cancelado")
        .length,
      taxaConfirmacao:
        periodAppointments.length > 0
          ? (periodAppointments.filter((apt) => apt.status === "confirmado")
              .length /
              periodAppointments.length) *
            100
          : 0,
    };

    return stats;
  }

  // ===== LEMBRETES =====
  getUpcomingAppointments(days = 7) {
    const appointments = this.getAppointments();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.dataHora);
        return (
          aptDate >= now && aptDate <= futureDate && apt.status !== "cancelado"
        );
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
  }

  // ===== NOTIFICAÇÕES =====
  checkReminders() {
    const upcoming = this.getUpcomingAppointments(1);
    const now = new Date();

    upcoming.forEach((apt) => {
      const aptDate = new Date(apt.dataHora);
      const timeDiff = aptDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Lembrete 24h antes
      if (hoursDiff <= 24 && hoursDiff > 0) {
        this.sendReminder(apt, "24h");
      }

      // Lembrete 2h antes
      if (hoursDiff <= 2 && hoursDiff > 0) {
        this.sendReminder(apt, "2h");
      }
    });
  }

  sendReminder(appointment, type) {
    const client = store.getClient(appointment.clienteId);
    const settings = store.getSettings();

    if (!client || !settings) return;

    const message = this.generateReminderMessage(appointment, type, settings);
    const whatsappLink = utils.generateWhatsAppLink(
      client.telefoneWhatsApp,
      message
    );

    // Aqui você pode implementar o envio real da notificação
    console.log(`Lembrete ${type} para ${client.nomeCompleto}:`, whatsappLink);
  }

  generateReminderMessage(appointment, type, settings) {
    const aptDate = new Date(appointment.dataHora);
    const dateStr = utils.formatDate(aptDate);
    const timeStr = utils.formatTime(aptDate);

    let message;

    if (type === "24h") {
      message = settings.whatsappMessages.appointmentReminder
        .replace("{date}", dateStr)
        .replace("{time}", timeStr);
    } else if (type === "2h") {
      message = `Lembrete: Seu pet tem agendamento hoje às ${timeStr}.`;
    }

    return message;
  }

  // ===== UTILITÁRIOS =====
  getCurrentDate() {
    return this.currentDate;
  }

  setCurrentDate(date) {
    this.currentDate = date;
  }

  getSelectedProfessional() {
    return this.selectedProfessional;
  }

  setSelectedProfessional(professionalId) {
    this.selectedProfessional = professionalId;
  }

  // ===== VALIDAÇÕES =====
  validateAppointment(appointmentData) {
    const errors = [];

    if (!appointmentData.clienteId) {
      errors.push("Cliente é obrigatório");
    }

    if (!appointmentData.petId) {
      errors.push("Pet é obrigatório");
    }

    if (
      !appointmentData.servicosSelecionados ||
      appointmentData.servicosSelecionados.length === 0
    ) {
      errors.push("Pelo menos um serviço deve ser selecionado");
    }

    if (!appointmentData.dataHora) {
      errors.push("Data e hora são obrigatórios");
    }

    if (!appointmentData.profissionalId) {
      errors.push("Profissional é obrigatório");
    }

    // Validar data não pode ser no passado
    if (appointmentData.dataHora) {
      const aptDate = new Date(appointmentData.dataHora);
      const now = new Date();

      if (aptDate < now) {
        errors.push("Data e hora não podem ser no passado");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Instância global
window.scheduler = new Scheduler();
