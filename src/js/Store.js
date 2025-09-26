/**
 * Store.js - Sistema de persistência de dados
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop com stores: clients, pets, services, appointments, orders, payments, settings
 */

class Store {
  constructor() {
    this.stores = {
      clients: "pet_shop_clients",
      pets: "pet_shop_pets",
      services: "pet_shop_services",
      appointments: "pet_shop_appointments",
      settings: "pet_shop_settings",
      professionals: "pet_shop_professionals",
      breeds: "pet_shop_breeds",
      sizes: "pet_shop_sizes",
      prontuarios: "pet_shop_prontuarios",
      reminders: "pet_shop_reminders",
    };

    this.init();
  }

  init() {
    // Verificar se é primeira execução
    const firstRun = !localStorage.getItem("pet_shop_first_run");
    if (firstRun) {
      this.setupFirstRun();
    }

    // Inicializar stores vazios se não existirem
    Object.values(this.stores).forEach((storeName) => {
      if (!localStorage.getItem(storeName)) {
        localStorage.setItem(storeName, JSON.stringify([]));
      }
    });
  }

  setupFirstRun() {
    // Configurações padrão para primeira execução
    const defaultSettings = {
      id: "settings_001",
      businessName: "Pet Shop",
      businessPhone: "",
      businessEmail: "",
      businessAddress: {
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "PR",
        zipCode: "",
      },
      defaultPetSize: "M",
      professionals: [],
      whatsappMessages: {
        appointmentConfirmation:
          "Olá! Seu agendamento foi confirmado para {date} às {time}.",
        appointmentReminder:
          "Lembrete: Seu pet tem agendamento amanhã às {time}.",
        serviceCompleted: "Seu pet está pronto! Pode vir buscar.",
        paymentReminder:
          "Lembrete: Você tem um pagamento pendente de R$ {amount}.",
      },
      priceRules: {
        sizeMultipliers: {
          P: 1.0,
          M: 1.2,
          G: 1.5,
          XXG: 2.0,
        },
      },
      firstRun: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Dados iniciais opcionais (apenas clientes e pets de exemplo)
    const sampleData = {
      clients: [
        {
          id: "cli_001",
          nomeCompleto: "Maria Silva",
          telefoneWhatsApp: "+55 41 99999-0000",
          email: "maria@email.com",
          cpfOpcional: "",
          endereco: {
            rua: "Rua das Flores",
            numero: "123",
            bairro: "Centro",
            cidade: "Curitiba",
            uf: "PR",
            cep: "80010-000",
          },
          observacoes: "Cliente preferencial",
          dataCadastro: new Date().toISOString(),
          status: "ativo",
        },
      ],
      pets: [
        {
          id: "pet_001",
          clienteId: "cli_001",
          nome: "Harley",
          especie: "cão",
          raca: "Golden Retriever",
          sexo: "M",
          dataNascimento: "2022-05-10",
          pesoAtualKg: 30.5,
          pelagem: "longo",
          microchipOpcional: "",
          vacinas: [{ nome: "V10", data: "2025-01-10" }],
          vermifugacao: [{ produto: "Vermífugo XYZ", data: "2025-06-10" }],
          alergiasAtenções: "alérgico a pulgas",
          temperamento: "dócil",
          fotoUrl: "",
          observacoesGrooming: "prefere água morna",
          restricoesSaude: "",
          dataCadastro: new Date().toISOString(),
        },
      ],
      breeds: [
        { id: "breed_001", nome: "Golden Retriever", especie: "cão" },
        { id: "breed_002", nome: "Labrador", especie: "cão" },
        { id: "breed_003", nome: "Pastor Alemão", especie: "cão" },
        { id: "breed_004", nome: "Persa", especie: "gato" },
        { id: "breed_005", nome: "Siamês", especie: "gato" },
        { id: "breed_006", nome: "Maine Coon", especie: "gato" },
      ],
      sizes: [
        {
          id: "size_001",
          nome: "Pequeno (P)",
          codigo: "P",
          pesoMin: 0,
          pesoMax: 10,
        },
        {
          id: "size_002",
          nome: "Médio (M)",
          codigo: "M",
          pesoMin: 10,
          pesoMax: 25,
        },
        {
          id: "size_003",
          nome: "Grande (G)",
          codigo: "G",
          pesoMin: 25,
          pesoMax: 45,
        },
        {
          id: "size_004",
          nome: "Extra Grande (XXG)",
          codigo: "XXG",
          pesoMin: 45,
          pesoMax: 999,
        },
      ],
    };

    // Salvar configurações
    localStorage.setItem(
      this.stores.settings,
      JSON.stringify([defaultSettings])
    );

    // Salvar dados de exemplo
    Object.keys(sampleData).forEach((storeName) => {
      if (this.stores[storeName]) {
        localStorage.setItem(
          this.stores[storeName],
          JSON.stringify(sampleData[storeName])
        );
      }
    });

    // Marcar primeira execução como concluída
    localStorage.setItem("pet_shop_first_run", "false");
  }

  // Métodos genéricos para todos os stores
  getAllSync(storeName) {
    const data = localStorage.getItem(this.stores[storeName]);
    return data ? JSON.parse(data) : [];
  }

  // Limpar campos undefined (Firebase não aceita)
  cleanUndefinedFields(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedFields(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedFields(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  async getAll(storeName) {
    console.log(`🔍 getAll chamado para: ${storeName}`);
    
    // Verificar se Firebase está disponível
    if (!window.firebaseService || !window.firebaseService.isConnected()) {
      console.log(`🔍 Firebase não disponível, usando localStorage para: ${storeName}`);
      // Fallback para localStorage se Firebase não estiver pronto
      const data = localStorage.getItem(this.stores[storeName]);
      const result = data ? JSON.parse(data) : [];
      console.log(`🔍 ${storeName} do localStorage:`, result.length, 'itens');
      return result;
    }

    try {
      // Buscar dados diretamente do Firebase
      const items = await window.firebaseService.getAllDocuments(storeName);
      console.log(`✅ ${storeName} carregados da nuvem:`, items.length, 'itens');
      
      // Sincronizar com localStorage para manter consistência
      localStorage.setItem(this.stores[storeName], JSON.stringify(items));
      console.log(`🔄 ${storeName} sincronizado com localStorage`);
      
      return items;
    } catch (error) {
      console.error(`❌ Erro ao carregar ${storeName} da nuvem, usando localStorage:`, error);
      // Fallback para localStorage em caso de erro
      const data = localStorage.getItem(this.stores[storeName]);
      const result = data ? JSON.parse(data) : [];
      console.log(`🔍 ${storeName} do localStorage (fallback):`, result.length, 'itens');
      return result;
    }
  }

  async getById(storeName, id) {
    // Verificar se Firebase está disponível
    if (!window.firebaseService || !window.firebaseService.isConnected()) {
      // Fallback para localStorage se Firebase não estiver pronto
      const items = this.getAllSync(storeName);
      return items.find((item) => item.id === id) || null;
    }

    try {
      // Buscar item diretamente do Firebase
      const item = await window.firebaseService.getDocument(storeName, id);
      return item;
    } catch (error) {
      console.error(`❌ Erro ao buscar ${storeName}/${id} da nuvem, usando localStorage:`, error);
      // Fallback para localStorage em caso de erro
      const items = this.getAllSync(storeName);
      return items.find((item) => item.id === id) || null;
    }
  }

  async save(storeName, item) {
    // Preparar dados com timestamps
    const itemData = {
      ...item,
      updatedAt: new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString()
    };

    // Limpar campos undefined (Firebase não aceita)
    console.log("🧹 Dados antes da limpeza:", itemData);
    const cleanedData = this.cleanUndefinedFields(itemData);
    console.log("🧹 Dados após limpeza:", cleanedData);
    
    // Usar dados limpos
    Object.assign(itemData, cleanedData);

    // Verificar se Firebase está disponível
    if (!window.firebaseService || !window.firebaseService.isConnected()) {
      // Fallback para localStorage se Firebase não estiver pronto
      const items = this.getAllSync(storeName);
      const existingIndex = items.findIndex((i) => i.id === item.id);

      if (existingIndex >= 0) {
        items[existingIndex] = itemData;
      } else {
        items.push(itemData);
      }

      localStorage.setItem(this.stores[storeName], JSON.stringify(items));
      console.log(`✅ ${storeName} salvo localmente:`, item.id);
      return item;
    }

    try {
      // Salvar diretamente no Firebase
      await window.firebaseService.saveDocument(storeName, item.id, itemData);
      
      console.log(`✅ ${storeName} salvo na nuvem:`, item.id);
      return item;
    } catch (error) {
      console.error(`❌ Erro ao salvar ${storeName} na nuvem, salvando localmente:`, error);
      // Fallback para localStorage em caso de erro
      const items = this.getAllSync(storeName);
      const existingIndex = items.findIndex((i) => i.id === item.id);

      if (existingIndex >= 0) {
        items[existingIndex] = itemData;
      } else {
        items.push(itemData);
      }

      localStorage.setItem(this.stores[storeName], JSON.stringify(items));
      console.log(`✅ ${storeName} salvo localmente:`, item.id);
      return item;
    }
  }

  async delete(storeName, id) {
    // Verificar se Firebase está disponível
    if (!window.firebaseService || !window.firebaseService.isConnected()) {
      // Fallback para localStorage se Firebase não estiver pronto
      const items = this.getAllSync(storeName);
      const filteredItems = items.filter((item) => item.id !== id);
      localStorage.setItem(this.stores[storeName], JSON.stringify(filteredItems));
      console.log(`✅ ${storeName} excluído localmente:`, id);
      return true;
    }

    try {
      // Excluir diretamente do Firebase
      await window.firebaseService.deleteDocument(storeName, id);
      
      console.log(`✅ ${storeName} excluído da nuvem:`, id);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao excluir ${storeName} da nuvem, excluindo localmente:`, error);
      // Fallback para localStorage em caso de erro
      const items = this.getAllSync(storeName);
      const filteredItems = items.filter((item) => item.id !== id);
      localStorage.setItem(this.stores[storeName], JSON.stringify(filteredItems));
      console.log(`✅ ${storeName} excluído localmente:`, id);
      return true;
    }
  }

  query(storeName, predicate) {
    const items = this.getAllSync(storeName);
    return items.filter(predicate);
  }

  // Métodos específicos para cada store
  // Clientes
  async getClients() {
    return await this.getAll("clients");
  }

  async getClient(id) {
    return await this.getById("clients", id);
  }

  saveClient(client) {
    return this.save("clients", client);
  }

  deleteClient(id) {
    // Verificar se cliente tem agendamentos vinculados (pets são excluídos automaticamente)
    const appointments = this.getAppointmentsByClient(id);

    if (appointments.length > 0) {
      throw new Error(
        "Não é possível excluir cliente com agendamentos vinculados. Use inativação."
      );
    }

    return this.delete("clients", id);
  }

  getPetsByClient(clientId) {
    return this.query("pets", (pet) => pet.clienteId === clientId);
  }

  getAppointmentsByClient(clientId) {
    return this.query("appointments", (apt) => apt.clienteId === clientId);
  }

  // Pets
  async getPets() {
    return await this.getAll("pets");
  }

  async getPet(id) {
    return await this.getById("pets", id);
  }

  savePet(pet) {
    return this.save("pets", pet);
  }

  deletePet(id) {
    // Verificar se pet tem agendamentos vinculados
    const appointments = this.getAppointmentsByPet(id);

    if (appointments.length > 0) {
      throw new Error(
        "Não é possível excluir pet com agendamentos vinculados."
      );
    }

    return this.delete("pets", id);
  }

  getAppointmentsByPet(petId) {
    return this.query("appointments", (apt) => apt.petId === petId);
  }

  // Serviços
  async getServices() {
    return await this.getAll("services");
  }

  async getService(id) {
    return await this.getById("services", id);
  }

  saveService(service) {
    return this.save("services", service);
  }

  deleteService(id) {
    // Verificar se serviço tem agendamentos vinculados
    const appointments = this.getAppointmentsByService(id);

    if (appointments.length > 0) {
      throw new Error(
        "Não é possível excluir serviço com agendamentos vinculados."
      );
    }

    return this.delete("services", id);
  }

  getAppointmentsByService(serviceId) {
    return this.query(
      "appointments",
      (apt) =>
        apt.servicosSelecionados &&
        apt.servicosSelecionados.some((s) => s.id === serviceId)
    );
  }

  // Agendamentos
  async getAppointments() {
    return await this.getAll("appointments");
  }

  async getAppointment(id) {
    return await this.getById("appointments", id);
  }

  saveAppointment(appointment) {
    return this.save("appointments", appointment);
  }

  deleteAppointment(id) {
    return this.delete("appointments", id);
  }

  getAppointmentsByDate(date) {
    return this.query("appointments", (apt) => apt.dataHora.startsWith(date));
  }

  getAppointmentsByProfessional(professionalId) {
    return this.query(
      "appointments",
      (apt) => apt.profissionalId === professionalId
    );
  }



  // Configurações
  getSettings() {
    const settings = this.getAll("settings");
    return settings.length > 0 ? settings[0] : null;
  }

  saveSettings(settings) {
    const existingSettings = this.getSettings();
    if (existingSettings) {
      settings.id = existingSettings.id;
    } else {
      settings.id = "settings_001";
    }
    return this.save("settings", settings);
  }

  // Profissionais
  getProfessionals() {
    return this.getAll("professionals");
  }

  getProfessional(id) {
    return this.getById("professionals", id);
  }

  saveProfessional(professional) {
    return this.save("professionals", professional);
  }

  deleteProfessional(id) {
    // Verificar se profissional tem agendamentos vinculados
    const appointments = this.getAppointmentsByProfessional(id);

    if (appointments.length > 0) {
      throw new Error(
        "Não é possível excluir profissional com agendamentos vinculados."
      );
    }

    return this.delete("professionals", id);
  }

  // Raças
  getBreeds() {
    return this.getAll("breeds");
  }

  getBreed(id) {
    return this.getById("breeds", id);
  }

  saveBreed(breed) {
    return this.save("breeds", breed);
  }

  deleteBreed(id) {
    return this.delete("breeds", id);
  }

  // Portes
  getSizes() {
    return this.getAll("sizes");
  }

  getSize(id) {
    return this.getById("sizes", id);
  }

  saveSize(size) {
    return this.save("sizes", size);
  }

  deleteSize(id) {
    return this.delete("sizes", id);
  }

  // Backup e Restore
  exportData() {
    const data = {};
    Object.keys(this.stores).forEach((storeName) => {
      data[storeName] = this.getAll(storeName);
    });
    return data;
  }

  importData(data) {
    Object.keys(data).forEach((storeName) => {
      if (this.stores[storeName]) {
        localStorage.setItem(
          this.stores[storeName],
          JSON.stringify(data[storeName])
        );
      }
    });
    return true;
  }

  clearAllData() {
    Object.values(this.stores).forEach((storeName) => {
      localStorage.removeItem(storeName);
    });
    localStorage.removeItem("pet_shop_first_run");
    this.init();
  }

  // Utilitários
  generateId(prefix = "item") {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Agendamentos
  async getAppointments() {
    return await this.getAll("appointments");
  }

  async getAppointment(id) {
    return await this.getById("appointments", id);
  }

  saveAppointment(appointment) {
    return this.save("appointments", appointment);
  }

  deleteAppointment(id) {
    return this.delete("appointments", id);
  }

  // Profissionais (para agendamentos)
  getProfessionals() {
    return this.getAll("professionals");
  }

  getProfessional(id) {
    return this.getById("professionals", id);
  }

  saveProfessional(professional) {
    return this.save("professionals", professional);
  }

  deleteProfessional(id) {
    return this.delete("professionals", id);
  }

  // Prontuários veterinários
  getProntuarios() {
    return this.getAll("prontuarios");
  }

  getProntuario(id) {
    return this.getById("prontuarios", id);
  }

  saveProntuario(prontuario) {
    return this.save("prontuarios", prontuario);
  }

  deleteProntuario(id) {
    return this.delete("prontuarios", id);
  }

  async getProntuariosByPet(petId) {
    const prontuarios = await this.getAll("prontuarios");
    return prontuarios
      .filter((p) => p.petId === petId)
      .sort((a, b) => new Date(b.dataConsulta) - new Date(a.dataConsulta));
  }

  // Função para limpar cache e forçar sincronização
  async clearCacheAndSync() {
    console.log("🧹 Limpando cache e forçando sincronização...");
    
    // Limpar localStorage
    Object.values(this.stores).forEach(storeKey => {
      localStorage.removeItem(storeKey);
    });
    
    console.log("✅ Cache limpo, dados serão recarregados do Firebase");
  }

  // ===== MÉTODOS DE LEMBRETES =====
  async getReminders() {
    return await this.getAll("reminders");
  }

  async getReminder(id) {
    return await this.getById("reminders", id);
  }

  async saveReminder(reminder) {
    return await this.save("reminders", reminder);
  }

  async deleteReminder(id) {
    return await this.delete("reminders", id);
  }

  // Buscar lembretes vencidos ou próximos do vencimento
  async getDueReminders() {
    const reminders = await this.getReminders();
    const today = new Date().toISOString().split('T')[0];
    
    return reminders.filter(reminder => {
      if (!reminder.ativo) return false;
      
      const notifyFrom = reminder.notifyFrom;
      const proximaDose = reminder.proximaDose;
      
      // Lembretes que devem ser notificados hoje ou estão atrasados
      return (notifyFrom <= today && today <= proximaDose) || today > proximaDose;
    });
  }

  // Criar/atualizar lembrete de vacina
  async upsertVaccineReminder({ petId, clienteId, nomeVacina, proximaDose, antecedenciaDias = 7 }) {
    const notifyFrom = this.addDays(proximaDose, -antecedenciaDias);
    
    const reminderData = {
      tipo: 'vacina',
      petId,
      clienteId,
      nomeVacina,
      proximaDose,
      antecedenciaDias,
      notifyFrom,
      notifiedAt: null,
      ativo: true
    };

    // Verificar se já existe lembrete para esta vacina
    const existingReminders = await this.getReminders();
    const existing = existingReminders.find(r => 
      r.petId === petId && 
      r.nomeVacina === nomeVacina && 
      r.tipo === 'vacina' &&
      r.ativo
    );

    if (existing) {
      // Atualizar lembrete existente
      return await this.saveReminder({ ...existing, ...reminderData });
    } else {
      // Criar novo lembrete
      const newId = this.generateId("rem");
      return await this.saveReminder({ ...reminderData, id: newId });
    }
  }

  // Adiar lembrete
  async snoozeReminder(id, days = 3) {
    const reminder = await this.getReminder(id);
    if (!reminder) return null;

    const newNotifyFrom = this.addDays(reminder.notifyFrom, days);
    return await this.saveReminder({ 
      ...reminder, 
      notifyFrom: newNotifyFrom,
      notifiedAt: null 
    });
  }

  // Resolver lembrete
  async resolveReminder(id) {
    const reminder = await this.getReminder(id);
    if (!reminder) return null;

    return await this.saveReminder({ 
      ...reminder, 
      notifiedAt: new Date().toISOString().split('T')[0],
      ativo: false 
    });
  }

  // Desativar lembrete
  async deactivateReminder(id) {
    const reminder = await this.getReminder(id);
    if (!reminder) return null;

    return await this.saveReminder({ 
      ...reminder, 
      ativo: false 
    });
  }

  // Utilitário para adicionar dias a uma data
  addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // Função para limpar dados corrompidos
  cleanupCorruptedData() {
    console.log("🧹 Iniciando limpeza de dados corrompidos...");

    // Limpar clientes com ID undefined ou inválido
    const clients = this.getAllSync("clients");
    const validClients = clients.filter(
      (client) => client && client.id && client.id !== "undefined"
    );

    if (clients.length !== validClients.length) {
      console.log(
        `🧹 Removendo ${
          clients.length - validClients.length
        } clientes corrompidos`
      );
      localStorage.setItem(
        this.stores["clients"],
        JSON.stringify(validClients)
      );
    }

    // Limpar pets com clienteId undefined ou inválido
    const pets = this.getAllSync("pets");
    const validPets = pets.filter(
      (pet) =>
        pet &&
        pet.id &&
        pet.id !== "undefined" &&
        pet.clienteId &&
        pet.clienteId !== "undefined"
    );

    if (pets.length !== validPets.length) {
      console.log(
        `🧹 Removendo ${pets.length - validPets.length} pets corrompidos`
      );
      localStorage.setItem(this.stores["pets"], JSON.stringify(validPets));
    }

    console.log("✅ Limpeza concluída!");
    return {
      clientsRemoved: clients.length - validClients.length,
      petsRemoved: pets.length - validPets.length,
    };
  }

  // Verificar se é primeira execução
  isFirstRun() {
    const settings = this.getSettings();
    return settings && settings.firstRun === true;
  }

  // Finalizar onboarding
  completeOnboarding() {
    const settings = this.getSettings();
    if (settings) {
      settings.firstRun = false;
      this.saveSettings(settings);
    }
  }
}

// Instância global do store
window.store = new Store();
