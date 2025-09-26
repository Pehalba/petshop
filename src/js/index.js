/**
 * index.js - Aplicação principal do Pet Shop
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class PetShopApp {
  constructor() {
    this.currentPage = "dashboard";
    this.routes = {
      dashboard: this.renderDashboard.bind(this),
      clientes: this.renderClientes.bind(this),
      pets: this.renderPets.bind(this),
      servicos: this.renderServicos.bind(this),
      agendamentos: this.renderAgendamentos.bind(this),
      prontuarios: this.renderProntuarios.bind(this),
      relatorios: this.renderRelatorios.bind(this),
      configuracoes: this.renderConfiguracoes.bind(this),
    };

    this.init();
  }

  init() {
    // Inicializar aplicação
    this.setupHeader();
    this.setupFooter();
    this.setupNavigation();
    this.cleanupCorruptedData();

    // Processar hash da URL
    this.processHash();

    this.loadPage();
  }

  // Processar hash da URL
  processHash() {
    const hash = window.location.hash.substring(1);
    if (hash && this.routes[hash]) {
      this.currentPage = hash;
    }
  }

  // Limpar dados corrompidos
  cleanupCorruptedData() {
    try {
      const result = store.cleanupCorruptedData();
      if (result.clientsRemoved > 0 || result.petsRemoved > 0) {
        console.log(
          `🧹 Limpeza concluída: ${result.clientsRemoved} clientes e ${result.petsRemoved} pets corrompidos removidos`
        );
        ui.success(
          `Dados corrompidos removidos: ${result.clientsRemoved} clientes e ${result.petsRemoved} pets`
        );

        // Se estamos na página de clientes, atualizar a lista
        if (window.location.hash === "#clientes") {
          this.renderClientes();
        }
      }
    } catch (error) {
      console.error("Erro na limpeza de dados:", error);
    }
  }

  // Forçar limpeza manual
  forceCleanup() {
    try {
      const result = store.cleanupCorruptedData();
      if (result.clientsRemoved > 0 || result.petsRemoved > 0) {
        ui.success(
          `✅ Limpeza concluída! Removidos: ${result.clientsRemoved} clientes e ${result.petsRemoved} pets corrompidos`
        );
        this.renderClientes(); // Atualizar a lista imediatamente
      } else {
        ui.info("✅ Nenhum dado corrompido encontrado. Sistema está limpo!");
      }
    } catch (error) {
      console.error("Erro na limpeza de dados:", error);
      ui.error("Erro ao limpar dados corrompidos");
    }
  }

  // Abrir WhatsApp
  openWhatsApp(phone) {
    if (!phone) {
      ui.error("Número de telefone não informado");
      return;
    }

    // Limpar o número (remover caracteres não numéricos)
    const cleanedPhone = phone.replace(/\D/g, "");

    // Verificar se o número é válido
    if (cleanedPhone.length < 10) {
      ui.error("Número de telefone inválido");
      return;
    }

    // Garantir que o número tenha o código do país (55 para Brasil)
    let phoneWithCountryCode = cleanedPhone;
    if (cleanedPhone.length === 10 || cleanedPhone.length === 11) {
      phoneWithCountryCode = "55" + cleanedPhone;
    }

    // Mensagem padrão
    const defaultMessage =
      "Olá! Gostaria de falar sobre os serviços do pet shop.";

    // Construir URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(
      defaultMessage
    )}`;

    // Abrir em nova aba
    window.open(whatsappUrl, "_blank");

    // Mostrar feedback
    ui.success(`Abrindo WhatsApp para ${phone}`);
  }

  setupHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const settings = store.getSettings();
    const businessName = settings ? settings.businessName : "Pet Shop";

    header.innerHTML = `
            <div class="header-container">
                <a href="#" class="header-logo" data-page="dashboard">
                    <div class="header-logo-icon">🐾</div>
                    <div class="header-logo-text">${businessName}</div>
                </a>
                
                <nav class="header-nav">
                    <a href="#" class="nav-link" data-page="dashboard">
                        <span class="nav-link-icon">📊</span>
                        Dashboard
                    </a>
                    <a href="#" class="nav-link" data-page="clientes">
                        <span class="nav-link-icon">👥</span>
                        Clientes
                    </a>
                    <a href="#" class="nav-link" data-page="pets">
                        <span class="nav-link-icon">🐕</span>
                        Pets
                    </a>
                    <a href="#" class="nav-link" data-page="servicos">
                        <span class="nav-link-icon">✂️</span>
                        Serviços
                    </a>
                    <a href="#" class="nav-link" data-page="agendamentos">
                        <span class="nav-link-icon">📅</span>
                        Agendamentos
                    </a>
                    <a href="#" class="nav-link" data-page="relatorios">
                        <span class="nav-link-icon">📈</span>
                        Relatórios
                    </a>
                    <a href="#" class="nav-link" data-page="configuracoes">
                        <span class="nav-link-icon">⚙️</span>
                        Configurações
                    </a>
                </nav>
                
                <div class="header-actions">
                    <div class="header-profile">
                        <button class="profile-button" id="profile-menu">
                            <div class="profile-avatar">👤</div>
                            <span class="profile-name">Admin</span>
                        </button>
                        <div class="profile-dropdown" id="profile-dropdown">
                            <a href="#" class="dropdown-item" data-page="configuracoes">
                                <span class="dropdown-item-icon">⚙️</span>
                                Configurações
                            </a>
                            <a href="#" class="dropdown-item" data-action="backup">
                                <span class="dropdown-item-icon">💾</span>
                                Backup
                            </a>
                            <a href="#" class="dropdown-item" data-action="restore">
                                <span class="dropdown-item-icon">📁</span>
                                Restaurar
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item" data-action="logout">
                                <span class="dropdown-item-icon">🚪</span>
                                Sair
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  setupFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;

    footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Sistema Pet Shop</h3>
                        <p>Gerencie seu pet shop de forma eficiente e profissional.</p>
                    </div>
                    <div class="footer-section">
                        <h3>Recursos</h3>
                        <ul class="footer-links">
                            <li><a href="#" data-page="clientes">Clientes</a></li>
            <li><a href="#" data-page="pets">Pets</a></li>
            <li><a href="#" data-page="servicos">Serviços</a></li>
            <li><a href="#" data-page="agendamentos">Agendamentos</a></li>
            <li><a href="#" data-page="prontuarios">Prontuários</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Suporte</h3>
                        <ul class="footer-links">
                            <li><a href="#" data-page="configuracoes">Configurações</a></li>
                            <li><a href="#" data-action="backup">Backup</a></li>
                            <li><a href="#" data-action="restore">Restaurar</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="footer-copyright">
                        © 2025 Sistema Pet Shop. Todos os direitos reservados.
                    </div>
                    <div class="footer-version">
                        v1.0.0
                    </div>
                </div>
            </div>
        `;
  }

  setupNavigation() {
    // Navegação principal
    document.addEventListener("click", (e) => {
      const pageLink = e.target.closest("[data-page]");
      if (pageLink) {
        e.preventDefault();
        const page = pageLink.dataset.page;
        this.navigateToPage(page);
      }
    });

    // Listener para mudanças de hash
    window.addEventListener("hashchange", () => {
      this.processHash();
      this.loadPage();
    });

    // Menu de perfil
    const profileButton = document.getElementById("profile-menu");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (profileButton && profileDropdown) {
      profileButton.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!profileButton.contains(e.target)) {
          profileDropdown.classList.remove("show");
        }
      });
    }

    // Ações do menu
    document.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]");
      if (action) {
        e.preventDefault();
        this.handleAction(action.dataset.action);
      }
    });
  }

  navigateToPage(page) {
    if (this.routes[page]) {
      this.currentPage = page;
      window.location.hash = page;
      this.updateActiveNav();
      this.loadPage();
    }
  }

  updateActiveNav() {
    // Remover classe active de todos os links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Adicionar classe active ao link atual
    const activeLink = document.querySelector(
      `[data-page="${this.currentPage}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  loadPage() {
    const content = document.getElementById("content");
    if (!content) return;

    // Limpar classes específicas de páginas
    content.classList.remove("dashboard-page");

    // Mostrar loading
    ui.showLoading(content, "Carregando página...");

    // Renderizar página
    setTimeout(() => {
      try {
        if (this.routes[this.currentPage]) {
          this.routes[this.currentPage]();
        }
        ui.hideLoading(content);
      } catch (error) {
        console.error("Erro ao carregar página:", error);
        ui.hideLoading(content);
        content.innerHTML = `
          <div class="error-state">
            <h2>Erro ao carregar página</h2>
            <p>Ocorreu um erro inesperado. Por favor, recarregue a página.</p>
            <button onclick="location.reload()" class="btn btn-primary">Recarregar</button>
          </div>
        `;
      }
    }, 100);
  }

  handleAction(action) {
    switch (action) {
      case "backup":
        this.exportData();
        break;
      case "restore":
        this.importData();
        break;
      case "logout":
        this.logout();
        break;
    }
  }

  // ===== ONBOARDING =====
  showOnboarding() {
    const content = document.getElementById("content");
    if (!content) return;

    content.innerHTML = `
            <div class="onboarding">
                <div class="onboarding-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="onboarding-progress" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="onboarding-progress-text">Passo 1 de 4</div>
                </div>
                
                <div class="onboarding-step" id="onboarding-step-1">
                    <h2 class="step-title">Bem-vindo ao Sistema Pet Shop!</h2>
                    <p class="step-description">Vamos configurar seu sistema em poucos passos.</p>
                    <div class="step-content">
                        <div class="form-group">
                            <label class="form-label">Nome do seu Pet Shop</label>
                            <input type="text" class="form-input" id="business-name" placeholder="Ex: Pet Shop do João">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Telefone</label>
                            <input type="tel" class="form-input" id="business-phone" placeholder="(41) 99999-9999">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="business-email" placeholder="contato@petshop.com">
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-primary" id="onboarding-next-1">Próximo</button>
                    </div>
                </div>
                
                <div class="onboarding-step hidden" id="onboarding-step-2">
                    <h2 class="step-title">Cadastre seus Serviços</h2>
                    <p class="step-description">Adicione pelo menos um serviço para começar.</p>
                    <div class="step-content">
                        <div id="services-list"></div>
                        <button class="btn btn-secondary" id="add-service">+ Adicionar Serviço</button>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-secondary" id="onboarding-prev-2">Anterior</button>
                        <button class="btn btn-primary" id="onboarding-next-2">Próximo</button>
                    </div>
                </div>
                
                <div class="onboarding-step hidden" id="onboarding-step-3">
                    <h2 class="step-title">Configure Profissionais</h2>
                    <p class="step-description">Adicione os profissionais que trabalham no pet shop.</p>
                    <div class="step-content">
                        <div id="professionals-list"></div>
                        <button class="btn btn-secondary" id="add-professional">+ Adicionar Profissional</button>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-secondary" id="onboarding-prev-3">Anterior</button>
                        <button class="btn btn-primary" id="onboarding-next-3">Próximo</button>
                    </div>
                </div>
                
                <div class="onboarding-step hidden" id="onboarding-step-4">
                    <h2 class="step-title">Tudo Pronto!</h2>
                    <p class="step-description">Seu sistema está configurado e pronto para uso.</p>
                    <div class="step-content">
                        <div class="success-message">
                            <div class="success-icon">✅</div>
                            <p>Você pode começar a cadastrar clientes e agendar serviços.</p>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-secondary" id="onboarding-prev-4">Anterior</button>
                        <button class="btn btn-primary" id="onboarding-finish">Finalizar</button>
                    </div>
                </div>
            </div>
        `;

    this.setupOnboardingEvents();
  }

  setupOnboardingEvents() {
    let currentStep = 1;
    const totalSteps = 4;

    const updateProgress = () => {
      const progress = (currentStep / totalSteps) * 100;
      document.getElementById(
        "onboarding-progress"
      ).style.width = `${progress}%`;
      document.getElementById(
        "onboarding-progress-text"
      ).textContent = `Passo ${currentStep} de ${totalSteps}`;
    };

    const showStep = (step) => {
      document
        .querySelectorAll(".onboarding-step")
        .forEach((el) => el.classList.add("hidden"));
      document
        .getElementById(`onboarding-step-${step}`)
        .classList.remove("hidden");
      currentStep = step;
      updateProgress();
    };

    // Navegação entre passos
    document
      .getElementById("onboarding-next-1")
      .addEventListener("click", () => {
        const businessName = document.getElementById("business-name").value;
        if (!businessName.trim()) {
          ui.error("Nome do pet shop é obrigatório");
          return;
        }
        showStep(2);
      });

    document
      .getElementById("onboarding-prev-2")
      .addEventListener("click", () => showStep(1));
    document
      .getElementById("onboarding-next-2")
      .addEventListener("click", () => {
        const services = store.getServices();
        if (services.length === 0) {
          ui.error("Adicione pelo menos um serviço");
          return;
        }
        showStep(3);
      });

    document
      .getElementById("onboarding-prev-3")
      .addEventListener("click", () => showStep(2));
    document
      .getElementById("onboarding-next-3")
      .addEventListener("click", () => showStep(4));

    document
      .getElementById("onboarding-prev-4")
      .addEventListener("click", () => showStep(3));
    document
      .getElementById("onboarding-finish")
      .addEventListener("click", () => {
        this.completeOnboarding();
      });

    // Adicionar serviço
    document.getElementById("add-service").addEventListener("click", () => {
      this.showAddServiceModal();
    });

    // Adicionar profissional
    document
      .getElementById("add-professional")
      .addEventListener("click", () => {
        this.showAddProfessionalModal();
      });

    updateProgress();
  }

  completeOnboarding() {
    // Salvar configurações
    const settings = store.getSettings();
    if (settings) {
      settings.businessName = document.getElementById("business-name").value;
      settings.businessPhone = document.getElementById("business-phone").value;
      settings.businessEmail = document.getElementById("business-email").value;
      settings.firstRun = false;
      store.saveSettings(settings);
    }

    // Finalizar onboarding
    store.completeOnboarding();

    // Reinicializar aplicação
    this.setupHeader();
    this.setupFooter();
    this.setupNavigation();
    this.navigateToPage("dashboard");

    ui.success("Onboarding concluído! Seu sistema está pronto para uso.");
  }

  // ===== PÁGINAS =====
  async renderDashboard() {
    const content = document.getElementById("content");
    if (!content) return;

    // Limpar classes específicas de outras páginas
    content.classList.remove("dashboard-page");

    // Adicionar classe específica para o dashboard
    content.classList.add("dashboard-page");

    try {
      const clients = await store.getClients();
      const pets = await store.getPets();
      const services = await store.getServices();
      const appointments = await store.getAppointments();

      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointments.filter(
        (apt) => apt.dataHoraInicio && apt.dataHoraInicio.startsWith(today)
      );

      // Calcular pets com vacina a vencer neste mês
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const petsWithVaccinesDue = this.getPetsWithVaccinesDueThisMonth(
        pets,
        currentMonth,
        currentYear
      );

      content.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Visão geral do seu pet shop</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Clientes</div>
                        <div class="stat-icon stat-icon-primary">👥</div>
                    </div>
                    <div class="stat-value">${clients.length}</div>
                    <div class="stat-change positive">
                        <span>+${
                          clients.filter((c) => c.status === "ativo").length
                        } ativos</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Pets</div>
                        <div class="stat-icon stat-icon-success">🐕</div>
                    </div>
                    <div class="stat-value">${pets.length}</div>
                    <div class="stat-change positive">
                        <span>+${pets.length} cadastrados</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Vacinas a Vencer</div>
                        <div class="stat-icon stat-icon-warning">💉</div>
                    </div>
                    <div class="stat-value">${petsWithVaccinesDue.length}</div>
                    <div class="stat-change positive">
                        <span>+${petsWithVaccinesDue.length} este mês</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Serviços para Hoje</div>
                        <div class="stat-icon stat-icon-error">📅</div>
                    </div>
                    <div class="stat-value">${todayAppointments.length}</div>
                    <div class="stat-change positive">
                        <span>+${todayAppointments.length} programados</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-calendar-section">
                <div id="dashboard-calendar"></div>
                <div id="dashboard-day-list"></div>
            </div>

        `;

      // Inicializar calendário após renderizar o HTML
      setTimeout(() => {
        this.initCalendar();
      }, 100);
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
      content.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Erro ao carregar dados</p>
        </div>
        <div class="error-state">
          <p>❌ Erro ao carregar o dashboard. Verifique sua conexão com a internet.</p>
          <button class="btn btn-primary" onclick="location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }

  initCalendar() {
    const calendarContainer = document.getElementById("dashboard-calendar");
    const dayListContainer = document.getElementById("dashboard-day-list");

    if (!calendarContainer || !dayListContainer) {
      console.warn("Containers do calendário não encontrados");
      return;
    }

    // Inicializar controlador do calendário
    if (window.CalendarController) {
      this.calendarController = new CalendarController(store);
      this.calendarController.init(calendarContainer, dayListContainer);
    } else {
      console.warn("CalendarController não carregado");
    }
  }

  renderTodayAppointments(appointments) {
    if (appointments.length === 0) {
      return '<div class="empty-state">Nenhum agendamento para hoje</div>';
    }

    return `
            <div class="appointments-list">
                ${appointments
                  .map((apt) => {
                    const client = store.getClient(apt.clienteId);
                    const pet = apt.petId ? store.getPet(apt.petId) : null;
                    const time = apt.dataHoraInicio
                      ? new Date(apt.dataHoraInicio).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "N/A";

                    return `
                    <div class="appointment-item">
                        <div class="appointment-time">${time}</div>
                        <div class="appointment-details">
                            <div class="appointment-client">${
                              client
                                ? client.nomeCompleto
                                : "Cliente não encontrado"
                            }</div>
                            <div class="appointment-pet">${
                              pet ? pet.nome : "Sem pet"
                            }</div>
                            <div class="appointment-services">${apt.itens
                              .map((s) => s.nome)
                              .join(", ")}</div>
                        </div>
                        <div class="appointment-status">
                            <span class="badge badge-${apt.status}">${
                      apt.status
                    }</span>
                        </div>
                    </div>
                `;
                  })
                  .join("")}
            </div>
        `;
  }

  // ===== MÉTODOS AUXILIARES DO DASHBOARD =====
  getPetsWithVaccinesDueThisMonth(pets, currentMonth, currentYear) {
    const petsWithVaccinesDue = [];

    pets.forEach((pet) => {
      if (pet.vacinas && pet.vacinas.length > 0) {
        pet.vacinas.forEach((vacina) => {
          if (vacina.proximaDose) {
            const proximaDoseDate = new Date(vacina.proximaDose);
            const proximaDoseMonth = proximaDoseDate.getMonth();
            const proximaDoseYear = proximaDoseDate.getFullYear();

            // Se a próxima dose é neste mês e ano
            if (
              proximaDoseMonth === currentMonth &&
              proximaDoseYear === currentYear
            ) {
              petsWithVaccinesDue.push({
                pet,
                vacina,
                proximaDose: vacina.proximaDose,
              });
            }
          }
        });
      }
    });

    return petsWithVaccinesDue;
  }

  renderPetsWithVaccinesDue(petsWithVaccinesDue) {
    if (petsWithVaccinesDue.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>Nenhuma vacina vence este mês</p>
        </div>
      `;
    }

    return `
      <div class="vaccines-due-list">
        ${petsWithVaccinesDue
          .map((item) => {
            const proximaDoseDate = new Date(item.proximaDose);
            const diasRestantes = Math.ceil(
              (proximaDoseDate - new Date()) / (1000 * 60 * 60 * 24)
            );

            return `
            <div class="vaccine-due-item">
              <div class="vaccine-due-pet">
                <strong>${item.pet.nome}</strong>
                <span class="vaccine-due-owner">(${item.pet.clienteId})</span>
              </div>
              <div class="vaccine-due-details">
                <span class="vaccine-name">${item.vacina.nomeVacina}</span>
                <span class="vaccine-date">${utils.formatDate(
                  item.proximaDose
                )}</span>
              </div>
              <div class="vaccine-due-status">
                <span class="badge ${
                  diasRestantes <= 7 ? "badge-warning" : "badge-info"
                }">
                  ${diasRestantes <= 0 ? "Vencida" : `${diasRestantes} dias`}
                </span>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  // Placeholder para outras páginas
  async renderClientes() {
    const content = document.getElementById("content");

    try {
      const clients = await store.getClients();

      content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Clientes</h1>
          <p>Gerencie os tutores dos pets</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="app.showClientForm()">
            <i class="icon-plus"></i> Novo Cliente
          </button>
          <button class="btn btn-outline" onclick="app.forceCleanup()" style="margin-left: 10px;">
            <i class="icon-refresh"></i> Limpar Dados Corrompidos
          </button>
        </div>
      </div>

      <div class="page-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="clientSearch" 
            placeholder="Buscar por nome, telefone ou email..."
            class="form-input"
          >
          <i class="icon-search"></i>
        </div>
        <div class="filter-actions">
          <select id="clientSort" class="form-select">
            <option value="nomeCompleto">Ordenar por Nome</option>
            <option value="createdAt">Ordenar por Data</option>
            <option value="cidade">Ordenar por Cidade</option>
          </select>
        </div>
      </div>

      <div class="data-container">
        ${this.renderClientsTable(clients)}
      </div>
    `;

      this.setupClientEvents();
    } catch (error) {
      console.error("❌ Erro ao carregar clientes:", error);
      content.innerHTML = `
        <div class="page-header">
          <h1>Clientes</h1>
        </div>
        <div class="error-state">
          <p>❌ Erro ao carregar clientes. Verifique sua conexão com a internet.</p>
          <button class="btn btn-primary" onclick="location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }

  renderClientsTable(clients) {
    if (clients.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Nenhum cliente cadastrado</h3>
          <p>Comece cadastrando seu primeiro cliente</p>
          <button class="btn btn-primary" onclick="app.showClientForm()">
            Cadastrar Primeiro Cliente
          </button>
        </div>
      `;
    }

    const tableRows = clients
      .map((client) => {
        const pets = store.getPetsByClient(client.id);
        const whatsappIcon = client.telefoneWhatsApp
          ? '<i class="icon-whatsapp" title="WhatsApp disponível"></i>'
          : "";
        const cidadeUF =
          client.endereco?.cidade && client.endereco?.uf
            ? `${client.endereco.cidade}/${client.endereco.uf}`
            : "-";

        return `
        <tr>
          <td>
            <div class="client-info">
              <strong class="clickable-name" onclick="app.viewClient('${
                client.id
              }')" title="Clique para ver detalhes">${
          client.nomeCompleto
        }</strong>
              ${whatsappIcon}
            </div>
          </td>
          <td>${
            client.telefoneWhatsApp
              ? `<span class="clickable-phone" onclick="app.openWhatsApp('${client.telefoneWhatsApp}')" title="Clique para enviar mensagem no WhatsApp">${client.telefoneWhatsApp}</span>`
              : "-"
          }</td>
          <td>${client.email || "-"}</td>
          <td>${cidadeUF}</td>
          <td>
            <span class="badge badge-info">${pets.length} pet${
          pets.length !== 1 ? "s" : ""
        }</span>
          </td>
          <td>
            <div class="data-table-actions">
              <button class="btn btn-sm btn-outline" onclick="app.viewClient('${
                client.id
              }')" title="Ver detalhes">
                <i class="icon-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.editClient('${
                client.id
              }')" title="Editar">
                <i class="icon-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="app.deleteClient('${
                client.id
              }')" title="Excluir">
                <i class="icon-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    return `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th class="whatsapp-column">WhatsApp</th>
              <th>Email</th>
              <th>Cidade/UF</th>
              <th>Pets</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  setupClientEvents() {
    // Busca
    const searchInput = document.getElementById("clientSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterClients(e.target.value);
      });
    }

    // Ordenação
    const sortSelect = document.getElementById("clientSort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortClients(e.target.value);
      });
    }
  }

  async filterClients(query) {
    const clients = await store.getClients();
    const filtered = clients.filter((client) => {
      const searchText = `${client.nomeCompleto} ${
        client.telefoneWhatsApp || ""
      } ${client.email || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderClientsTable(filtered);
  }

  async sortClients(field) {
    const clients = await store.getClients();
    const sorted = clients.sort((a, b) => {
      let aVal = a[field] || "";
      let bVal = b[field] || "";

      if (field === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderClientsTable(sorted);
  }

  // ===== MÉTODOS DE CLIENTES =====
  showClientForm(clientId = null) {
    const isEdit = clientId !== null;
    const client = isEdit ? store.getClient(clientId) : null;

    const content = `
      <div class="form-container">
        <div class="form-header">
          <h2>${isEdit ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button class="btn btn-outline" onclick="app.renderClientes()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>

        <form id="clientForm" data-is-edit="${isEdit}" data-client-id="${
      clientId || ""
    }">
          <div class="form-section">
            <h3>Dados Principais</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="nomeCompleto">Nome Completo *</label>
                <input 
                  type="text" 
                  id="nomeCompleto" 
                  name="nomeCompleto" 
                  class="form-input" 
                  value="${client?.nomeCompleto || ""}"
                  required
                  minlength="3"
                >
                <div class="form-error" id="nomeCompleto-error"></div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Contato</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="telefoneWhatsApp">WhatsApp</label>
                <input 
                  type="tel" 
                  id="telefoneWhatsApp" 
                  name="telefoneWhatsApp" 
                  class="form-input" 
                  value="${client?.telefoneWhatsApp || ""}"
                  placeholder="(11) 99999-9999"
                >
                <div class="form-error" id="telefoneWhatsApp-error"></div>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input" 
                  value="${client?.email || ""}"
                >
                <div class="form-error" id="email-error"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="cpf">CPF</label>
                <input 
                  type="text" 
                  id="cpf" 
                  name="cpf" 
                  class="form-input" 
                  value="${client?.cpf || ""}"
                  placeholder="000.000.000-00"
                >
                <div class="form-error" id="cpf-error"></div>
              </div>
              <div class="form-group">
                <label for="dataNascimento">Data de Nascimento</label>
                <input 
                  type="date" 
                  id="dataNascimento" 
                  name="dataNascimento" 
                  class="form-input" 
                  value="${client?.dataNascimento || ""}"
                >
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Endereço</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="rua">Rua</label>
                <input 
                  type="text" 
                  id="rua" 
                  name="rua" 
                  class="form-input" 
                  value="${client?.endereco?.rua || ""}"
                >
              </div>
              <div class="form-group">
                <label for="numero">Número</label>
                <input 
                  type="text" 
                  id="numero" 
                  name="numero" 
                  class="form-input" 
                  value="${client?.endereco?.numero || ""}"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bairro">Bairro</label>
                <input 
                  type="text" 
                  id="bairro" 
                  name="bairro" 
                  class="form-input" 
                  value="${client?.endereco?.bairro || ""}"
                >
              </div>
              <div class="form-group">
                <label for="cidade">Cidade</label>
                <input 
                  type="text" 
                  id="cidade" 
                  name="cidade" 
                  class="form-input" 
                  value="${client?.endereco?.cidade || ""}"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="uf">UF</label>
                <select id="uf" name="uf" class="form-select">
                  <option value="">Selecione</option>
                  <option value="AC" ${
                    client?.endereco?.uf === "AC" ? "selected" : ""
                  }>AC</option>
                  <option value="AL" ${
                    client?.endereco?.uf === "AL" ? "selected" : ""
                  }>AL</option>
                  <option value="AP" ${
                    client?.endereco?.uf === "AP" ? "selected" : ""
                  }>AP</option>
                  <option value="AM" ${
                    client?.endereco?.uf === "AM" ? "selected" : ""
                  }>AM</option>
                  <option value="BA" ${
                    client?.endereco?.uf === "BA" ? "selected" : ""
                  }>BA</option>
                  <option value="CE" ${
                    client?.endereco?.uf === "CE" ? "selected" : ""
                  }>CE</option>
                  <option value="DF" ${
                    client?.endereco?.uf === "DF" ? "selected" : ""
                  }>DF</option>
                  <option value="ES" ${
                    client?.endereco?.uf === "ES" ? "selected" : ""
                  }>ES</option>
                  <option value="GO" ${
                    client?.endereco?.uf === "GO" ? "selected" : ""
                  }>GO</option>
                  <option value="MA" ${
                    client?.endereco?.uf === "MA" ? "selected" : ""
                  }>MA</option>
                  <option value="MT" ${
                    client?.endereco?.uf === "MT" ? "selected" : ""
                  }>MT</option>
                  <option value="MS" ${
                    client?.endereco?.uf === "MS" ? "selected" : ""
                  }>MS</option>
                  <option value="MG" ${
                    client?.endereco?.uf === "MG" ? "selected" : ""
                  }>MG</option>
                  <option value="PA" ${
                    client?.endereco?.uf === "PA" ? "selected" : ""
                  }>PA</option>
                  <option value="PB" ${
                    client?.endereco?.uf === "PB" ? "selected" : ""
                  }>PB</option>
                  <option value="PR" ${
                    client?.endereco?.uf === "PR" ? "selected" : ""
                  }>PR</option>
                  <option value="PE" ${
                    client?.endereco?.uf === "PE" ? "selected" : ""
                  }>PE</option>
                  <option value="PI" ${
                    client?.endereco?.uf === "PI" ? "selected" : ""
                  }>PI</option>
                  <option value="RJ" ${
                    client?.endereco?.uf === "RJ" ? "selected" : ""
                  }>RJ</option>
                  <option value="RN" ${
                    client?.endereco?.uf === "RN" ? "selected" : ""
                  }>RN</option>
                  <option value="RS" ${
                    client?.endereco?.uf === "RS" ? "selected" : ""
                  }>RS</option>
                  <option value="RO" ${
                    client?.endereco?.uf === "RO" ? "selected" : ""
                  }>RO</option>
                  <option value="RR" ${
                    client?.endereco?.uf === "RR" ? "selected" : ""
                  }>RR</option>
                  <option value="SC" ${
                    client?.endereco?.uf === "SC" ? "selected" : ""
                  }>SC</option>
                  <option value="SP" ${
                    client?.endereco?.uf === "SP" ? "selected" : ""
                  }>SP</option>
                  <option value="SE" ${
                    client?.endereco?.uf === "SE" ? "selected" : ""
                  }>SE</option>
                  <option value="TO" ${
                    client?.endereco?.uf === "TO" ? "selected" : ""
                  }>TO</option>
                </select>
              </div>
              <div class="form-group">
                <label for="cep">CEP</label>
                <input 
                  type="text" 
                  id="cep" 
                  name="cep" 
                  class="form-input" 
                  value="${client?.endereco?.cep || ""}"
                  placeholder="00000-000"
                >
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Observações</h3>
            <div class="form-group">
              <textarea 
                id="observacoes" 
                name="observacoes" 
                class="form-textarea" 
                rows="3"
                placeholder="Observações sobre o cliente..."
              >${client?.observacoes || ""}</textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Pets (Opcional)</h3>
            <div id="petsContainer">
              <button type="button" class="btn btn-outline add-pet-button" onclick="app.addPetToClient()">
                <i class="icon-plus"></i> Adicionar 1º Pet
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.renderClientes()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? "Atualizar" : "Salvar"} Cliente
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
    this.setupClientFormEvents();
  }

  setupClientFormEvents() {
    // Event listener para o formulário
    const form = document.getElementById("clientForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isEdit = form.dataset.isEdit === "true";
        const clientId = form.dataset.clientId || null;
        this.saveClient(e, clientId);
      });
    }

    // Máscaras
    const telefoneInput = document.getElementById("telefoneWhatsApp");
    if (telefoneInput) {
      telefoneInput.addEventListener("input", (e) => {
        e.target.value = utils.formatPhone(e.target.value);
      });
    }

    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
      cpfInput.addEventListener("input", (e) => {
        e.target.value = utils.formatCPF(e.target.value);
      });
    }

    const cepInput = document.getElementById("cep");
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        e.target.value = utils.formatCEP(e.target.value);
      });
    }
  }

  addPetToClient() {
    const container = document.getElementById("petsContainer");
    const petIndex = container.querySelectorAll(".pet-form").length;

    // Remover o botão original do topo se existir
    const originalButton = container.querySelector(".add-pet-button");
    if (originalButton) {
      originalButton.remove();
    }

    const petForm = document.createElement("div");
    petForm.className = "pet-form";
    petForm.innerHTML = `
      <div class="pet-form-header">
        <h4>Pet ${petIndex + 1}</h4>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove(); app.updateAddPetButton()">
          <i class="icon-trash"></i> Remover
        </button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Nome do Pet</label>
          <input type="text" name="petNome[]" class="form-input" placeholder="Nome do pet">
        </div>
        <div class="form-group">
          <label>Espécie</label>
          <select name="petEspecie[]" class="form-select">
            <option value="cão">Cão</option>
            <option value="gato">Gato</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Raça</label>
          <input type="text" name="petRaca[]" class="form-input" placeholder="Raça do pet">
        </div>
        <div class="form-group">
          <label>Sexo</label>
          <select name="petSexo[]" class="form-select">
            <option value="">Selecione</option>
            <option value="M">Macho</option>
            <option value="F">Fêmea</option>
            <option value="Indef.">Indefinido</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Porte</label>
          <select name="petPorte[]" class="form-select">
            <option value="">Selecione</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </div>
        <div class="form-group">
          <label>Data de Nascimento</label>
          <input type="date" name="petDataNascimento[]" class="form-input">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Peso Aproximado (kg)</label>
          <input type="number" name="petPeso[]" class="form-input" step="0.1" min="0">
        </div>
      </div>
      <div class="form-group">
        <label>Observações</label>
        <textarea name="petObservacoes[]" class="form-textarea" rows="2" placeholder="Observações sobre o pet..."></textarea>
      </div>
      <div class="pet-form-footer">
        <button type="button" class="btn btn-outline add-pet-button" onclick="app.addPetToClient()">
          <i class="icon-plus"></i> Adicionar ${this.getNextPetNumber()}º Pet
        </button>
      </div>
    `;

    container.appendChild(petForm);
    this.updateAddPetButton();
  }

  // Atualizar botão de adicionar pet
  updateAddPetButton() {
    const container = document.getElementById("petsContainer");
    const petCount = container.querySelectorAll(".pet-form").length;
    const addButton = container.querySelector(".add-pet-button");

    if (petCount === 0) {
      // Se não há pets, criar botão no topo
      if (addButton) {
        addButton.remove();
      }
      const topButton = document.createElement("button");
      topButton.type = "button";
      topButton.className = "btn btn-outline add-pet-button";
      topButton.onclick = () => this.addPetToClient();
      topButton.innerHTML = `<i class="icon-plus"></i> Adicionar 1º Pet`;
      container.appendChild(topButton);
    } else if (addButton) {
      // Se há pets, atualizar o botão existente
      addButton.innerHTML = `<i class="icon-plus"></i> Adicionar ${
        petCount + 1
      }º Pet`;
    }
  }

  // Obter número do próximo pet
  getNextPetNumber() {
    const container = document.getElementById("petsContainer");
    const petCount = container.querySelectorAll(".pet-form").length;
    return petCount + 1;
  }

  async saveClient(event, clientId = null) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const clientData = {
      nomeCompleto: formData.get("nomeCompleto"),
      telefoneWhatsApp: formData.get("telefoneWhatsApp"),
      email: formData.get("email"),
      cpf: formData.get("cpf"),
      dataNascimento: formData.get("dataNascimento"),
      endereco: {
        rua: formData.get("rua"),
        numero: formData.get("numero"),
        bairro: formData.get("bairro"),
        cidade: formData.get("cidade"),
        uf: formData.get("uf"),
        cep: formData.get("cep"),
      },
      observacoes: formData.get("observacoes"),
    };

    // Validações
    if (!this.validateClient(clientData)) {
      return;
    }

    try {
      let savedClient;
      if (clientId) {
        // Para atualizar, incluir o ID no objeto
        savedClient = await store.saveClient({ ...clientData, id: clientId });
      } else {
        // Para criar novo, gerar ID único
        const newClientId = store.generateId("cli");
        savedClient = await store.saveClient({
          ...clientData,
          id: newClientId,
        });
      }

      // Salvar pets se houver
      const petNames = formData.getAll("petNome[]");
      if (petNames.length > 0) {
        for (let i = 0; i < petNames.length; i++) {
          if (petNames[i].trim()) {
            const petData = {
              clienteId: savedClient.id,
              nome: petNames[i],
              especie: formData.getAll("petEspecie[]")[i] || "cão",
              raca: formData.getAll("petRaca[]")[i] || "",
              sexo: formData.getAll("petSexo[]")[i] || "",
              porte: formData.getAll("petPorte[]")[i] || "",
              dataNascimento: formData.getAll("petDataNascimento[]")[i] || "",
              pesoAproximadoKg:
                parseFloat(formData.getAll("petPeso[]")[i]) || null,
              observacoes: formData.getAll("petObservacoes[]")[i] || "",
            };
            // Gerar ID único para cada pet
            const newPetId = store.generateId("pet");
            await store.savePet({ ...petData, id: newPetId });
          }
        }
      }

      ui.success(
        clientId
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!"
      );
      await this.viewClient(savedClient.id);
    } catch (error) {
      ui.error("Erro ao salvar cliente: " + error.message);
    }
  }

  validateClient(clientData) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    // Nome obrigatório
    if (!clientData.nomeCompleto || clientData.nomeCompleto.length < 3) {
      this.showFieldError(
        "nomeCompleto",
        "Nome completo é obrigatório (mín. 3 caracteres)"
      );
      isValid = false;
    }

    // WhatsApp válido (se preenchido)
    if (
      clientData.telefoneWhatsApp &&
      !utils.validatePhone(clientData.telefoneWhatsApp)
    ) {
      this.showFieldError(
        "telefoneWhatsApp",
        "WhatsApp deve ter entre 10 e 13 dígitos"
      );
      isValid = false;
    }

    // CPF válido (se preenchido)
    if (clientData.cpf && !utils.validateCPF(clientData.cpf)) {
      this.showFieldError("cpf", "CPF inválido");
      isValid = false;
    }

    return isValid;
  }

  showFieldError(fieldName, message) {
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  async viewClient(clientId) {
    const client = await store.getClient(clientId);
    if (!client) {
      ui.error("Cliente não encontrado");
      return;
    }

    const pets = store.getPetsByClient(clientId);

    const content = `
      <div class="detail-container">
        <div class="detail-header">
          <div class="detail-title">
            <h1>${client.nomeCompleto}</h1>
            <div class="detail-actions">
              ${
                client.telefoneWhatsApp
                  ? `
                <button class="btn btn-success" onclick="app.openWhatsApp('${client.telefoneWhatsApp}')">
                  <i class="icon-whatsapp"></i> Enviar WhatsApp
                </button>
              `
                  : ""
              }
              <button class="btn btn-outline" onclick="app.editClient('${
                client.id
              }')">
                <i class="icon-edit"></i> Editar
              </button>
              <button class="btn btn-outline" onclick="app.renderClientes()">
                <i class="icon-arrow-left"></i> Voltar
              </button>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-grid">
            <div class="detail-card">
              <h3>Contato</h3>
              <div class="detail-info">
                ${
                  client.telefoneWhatsApp
                    ? `<p><strong>WhatsApp:</strong> ${client.telefoneWhatsApp}</p>`
                    : ""
                }
                ${
                  client.email
                    ? `<p><strong>Email:</strong> ${client.email}</p>`
                    : ""
                }
                ${
                  client.cpf ? `<p><strong>CPF:</strong> ${client.cpf}</p>` : ""
                }
                ${
                  client.dataNascimento
                    ? `<p><strong>Nascimento:</strong> ${utils.formatDate(
                        client.dataNascimento
                      )}</p>`
                    : ""
                }
              </div>
            </div>

            ${
              client.endereco && (client.endereco.rua || client.endereco.cidade)
                ? `
            <div class="detail-card">
              <h3>Endereço</h3>
              <div class="detail-info">
                ${
                  client.endereco.rua
                    ? `<p><strong>Rua:</strong> ${client.endereco.rua}${
                        client.endereco.numero
                          ? ", " + client.endereco.numero
                          : ""
                      }</p>`
                    : ""
                }
                ${
                  client.endereco.bairro
                    ? `<p><strong>Bairro:</strong> ${client.endereco.bairro}</p>`
                    : ""
                }
                ${
                  client.endereco.cidade
                    ? `<p><strong>Cidade:</strong> ${client.endereco.cidade}${
                        client.endereco.uf ? "/" + client.endereco.uf : ""
                      }</p>`
                    : ""
                }
                ${
                  client.endereco.cep
                    ? `<p><strong>CEP:</strong> ${client.endereco.cep}</p>`
                    : ""
                }
              </div>
            </div>
            `
                : ""
            }

            ${
              client.observacoes
                ? `
            <div class="detail-card">
              <h3>Observações</h3>
              <p>${client.observacoes}</p>
            </div>
            `
                : ""
            }
          </div>

          <div class="detail-section">
            <div class="section-header">
              <h3>Pets deste Cliente (${pets.length})</h3>
              <button class="btn btn-primary" onclick="app.showPetForm(null, '${
                client.id
              }')">
                <i class="icon-plus"></i> Novo Pet
              </button>
            </div>
            
            ${
              pets.length === 0
                ? `
              <div class="empty-state">
                <div class="empty-icon">🐕</div>
                <h4>Nenhum pet cadastrado</h4>
                <p>Este cliente ainda não possui pets cadastrados</p>
                <button class="btn btn-primary" onclick="app.showPetForm(null, '${client.id}')">
                  Cadastrar Primeiro Pet
                </button>
              </div>
            `
                : `
              <div class="pets-grid">
                 ${pets
                   .map(
                     (pet) => `
                    <div class="pet-card">
                      <div class="pet-info">
                        <h4 class="clickable-name" onclick="app.viewPet('${
                          pet.id
                        }')" title="Clique para ver detalhes do pet">${
                       pet.nome || "Sem nome"
                     }</h4>
                      <p><strong>Espécie:</strong> ${pet.especie || "-"}</p>
                      <p><strong>Raça:</strong> ${pet.raca || "-"}</p>
                      <p><strong>Porte:</strong> ${
                        pet.porte
                          ? pet.porte.charAt(0).toUpperCase() +
                            pet.porte.slice(1)
                          : "-"
                      }</p>
                      <p><strong>Sexo:</strong> ${pet.sexo || "-"}</p>
                      ${
                        pet.dataNascimento
                          ? `<p><strong>Idade:</strong> ${utils.calculateAge(
                              pet.dataNascimento
                            )}</p>`
                          : ""
                      }
                      ${
                        pet.pesoAproximadoKg
                          ? `<p><strong>Peso:</strong> ${pet.pesoAproximadoKg}kg</p>`
                          : ""
                      }
                    </div>
                    <div class="pet-actions">
                      <button class="btn btn-sm btn-outline" onclick="app.viewPet('${
                        pet.id
                      }')">
                        <i class="icon-eye"></i> Ver
                      </button>
                      <button class="btn btn-sm btn-outline" onclick="app.editPet('${
                        pet.id
                      }')">
                        <i class="icon-edit"></i> Editar
                      </button>
                    </div>
                  </div>
                `
                   )
                   .join("")}
              </div>
            `
            }
          </div>
        </div>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
  }

  editClient(clientId) {
    this.showClientForm(clientId);
  }

  async deleteClient(clientId) {
    // Verificar se o ID é válido
    if (!clientId || clientId === "undefined") {
      ui.error("ID do cliente inválido");
      return;
    }

    const client = store.getClient(clientId);
    if (!client) {
      ui.error("Cliente não encontrado");
      return;
    }

    const pets = store.getPetsByClient(clientId);
    const petsCount = pets.length;

    let confirmMessage = `Tem certeza que deseja excluir o cliente "${client.nomeCompleto}"?`;
    if (petsCount > 0) {
      confirmMessage += `\n\n⚠️ ATENÇÃO: ${petsCount} pet${
        petsCount !== 1 ? "s" : ""
      } cadastrado${petsCount !== 1 ? "s" : ""} também será${
        petsCount !== 1 ? "ão" : ""
      } excluído${petsCount !== 1 ? "s" : ""} automaticamente.`;
    }

    const confirmed = await ui.confirm(confirmMessage, "Confirmar Exclusão", {
      type: "danger",
    });

    if (confirmed) {
      try {
        // Excluir pets primeiro
        if (petsCount > 0) {
          pets.forEach((pet) => {
            store.deletePet(pet.id);
          });
        }

        // Excluir cliente
        store.deleteClient(clientId);

        const successMessage =
          petsCount > 0
            ? `Cliente e ${petsCount} pet${
                petsCount !== 1 ? "s" : ""
              } excluído${petsCount !== 1 ? "s" : ""} com sucesso!`
            : "Cliente excluído com sucesso!";

        ui.success(successMessage);
        this.renderClientes();
      } catch (error) {
        ui.error("Erro ao excluir cliente: " + error.message);
      }
    }
  }

  openWhatsApp(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Olá! Gostaria de falar sobre meus pets.`;
    const url = utils.generateWhatsAppLink(cleanPhone, message);
    window.open(url, "_blank");
  }

  // ===== PÁGINA DE SERVIÇOS =====
  async renderServicos() {
    const content = document.getElementById("content");

    try {
      const services = await store.getServices();

      // Verificar se é primeira execução (sem serviços)
      if (services.length === 0) {
        this.renderServicosOnboarding();
        return;
      }

      content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Serviços</h1>
          <p>Gerencie os serviços oferecidos pelo pet shop</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="app.showServiceForm()">
            <i class="icon-plus"></i> Novo Serviço
          </button>
        </div>
      </div>

      <div class="page-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="serviceSearch" 
            placeholder="Buscar por nome do serviço..."
            class="form-input"
          >
          <i class="icon-search"></i>
        </div>
        <div class="filter-actions">
          <select id="serviceSort" class="form-select">
            <option value="nome">Ordenar por Nome</option>
            <option value="preco">Ordenar por Preço</option>
            <option value="createdAt">Ordenar por Data</option>
          </select>
        </div>
      </div>

      ${this.renderServicesTable(services)}
    `;

      this.setupServiceEvents();
    } catch (error) {
      console.error("❌ Erro ao carregar serviços:", error);
      content.innerHTML = `
        <div class="page-header">
          <h1>Serviços</h1>
        </div>
        <div class="error-state">
          <p>❌ Erro ao carregar serviços. Verifique sua conexão com a internet.</p>
          <button class="btn btn-primary" onclick="location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }

  renderServicosOnboarding() {
    const content = document.getElementById("content");

    content.innerHTML = `
      <div class="onboarding-container">
        <div class="onboarding-card">
          <div class="onboarding-header">
            <div class="onboarding-icon">🛠️</div>
            <h1>Configure seus Serviços</h1>
            <p>Para começar a usar o sistema, você precisa cadastrar pelo menos um serviço oferecido pelo seu pet shop.</p>
          </div>
          
          <div class="onboarding-content">
            <h3>💡 Dicas para organizar seus serviços:</h3>
            <ul class="onboarding-tips">
              <li><strong>Banho:</strong> Serviço básico de higiene</li>
              <li><strong>Tosa:</strong> Corte e modelagem dos pelos</li>
              <li><strong>Hidratação:</strong> Tratamento para pelos saudáveis</li>
              <li><strong>Escovação:</strong> Desembaraço e escovação</li>
              <li><strong>Unhas:</strong> Corte e limpeza das unhas</li>
            </ul>
            
            <div class="onboarding-actions">
              <button class="btn btn-primary btn-lg" onclick="app.showServiceForm()">
                <i class="icon-plus"></i> Cadastrar Primeiro Serviço
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderServicesTable(services) {
    if (services.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🛠️</div>
          <h3>Nenhum serviço cadastrado</h3>
          <p>Comece cadastrando seus primeiros serviços</p>
          <button class="btn btn-primary" onclick="app.showServiceForm()">
            Cadastrar Primeiro Serviço
          </button>
        </div>
      `;
    }

    const tableRows = services
      .map((service) => {
        const margem =
          service.temCusto && service.custoAproximado
            ? MoneyUtils.formatMargin(service.preco, service.custoAproximado)
            : null;

        return `
        <tr>
          <td>
            <div class="service-info">
              <strong>${service.nome}</strong>
              ${service.descricao ? `<small>${service.descricao}</small>` : ""}
            </div>
          </td>
          <td>
            ${
              service.temVariacoes && service.variacoes
                ? `
              <div class="price-variations">
                <div class="price-base">Base: ${MoneyUtils.formatBRL(
                  service.preco
                )}</div>
                <div class="price-range">
                  ${MoneyUtils.formatBRL(
                    Math.min(
                      ...Object.values(service.variacoes).filter((v) => v > 0)
                    )
                  )} - 
                  ${MoneyUtils.formatBRL(
                    Math.max(
                      ...Object.values(service.variacoes).filter((v) => v > 0)
                    )
                  )}
                </div>
                <small class="price-note">Varia por porte</small>
              </div>
            `
                : MoneyUtils.formatBRL(service.preco)
            }
          </td>
          <td>${
            service.temCusto && service.custoAproximado
              ? MoneyUtils.formatBRL(service.custoAproximado)
              : "-"
          }</td>
          <td>
            ${
              margem
                ? `
              <div class="margin-info ${
                margem.isNegative ? "negative" : "positive"
              }">
                <span class="margin-value">${margem.valor}</span>
                <span class="margin-percent">${margem.percentual}</span>
              </div>
            `
                : "-"
            }
          </td>
          <td>
            <div class="data-table-actions">
              <button class="btn btn-sm btn-outline" onclick="app.editService('${
                service.id
              }')" title="Editar">
                <i class="icon-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="app.deleteService('${
                service.id
              }')" title="Excluir">
                <i class="icon-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    return `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Custo Aprox.</th>
              <th>Margem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Formulário de serviço
  async showServiceForm(serviceId = null) {
    const isEdit = serviceId !== null;
    const service = isEdit ? await store.getService(serviceId) : null;

    const content = `
      <div class="form-container">
        <div class="form-header">
          <h2>${isEdit ? "Editar Serviço" : "Novo Serviço"}</h2>
          <button class="btn btn-outline" onclick="app.renderServicos()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>

        <form id="serviceForm" data-is-edit="${isEdit}" data-service-id="${
      serviceId || ""
    }">
          <div class="form-section">
            <h3>Informações Básicas</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="nome">Nome do Serviço *</label>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome" 
                  class="form-input" 
                  value="${service?.nome || ""}"
                  required
                  minlength="2"
                  maxlength="100"
                  placeholder="Ex: Banho, Tosa, Hidratação..."
                >
                <div class="form-error" id="nome-error"></div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group required">
                <label for="preco">Preço Cobrado *</label>
                <div class="input-group">
                  <span class="input-group-text">R$</span>
                  <input 
                    type="text" 
                    id="preco" 
                    name="preco" 
                    class="form-input" 
                    value="${
                      service?.preco ? MoneyUtils.formatBRL(service.preco) : ""
                    }"
                    required
                    placeholder="0,00"
                  >
                </div>
                <div class="form-error" id="preco-error"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="descricao">Descrição</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                class="form-textarea" 
                rows="3"
                maxlength="280"
                placeholder="Breve descrição do serviço (opcional)..."
              >${service?.descricao || ""}</textarea>
              <div class="form-help">Máximo 280 caracteres</div>
            </div>
          </div>

          <div class="form-section">
            <h3>Controle de Custos</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  id="temCusto" 
                  name="temCusto" 
                  ${service?.temCusto ? "checked" : ""}
                >
                <span class="checkmark"></span>
                Este serviço tem custo aproximado
              </label>
            </div>

            <div class="form-group" id="custoGroup" style="display: ${
              service?.temCusto ? "block" : "none"
            };">
              <label for="custoAproximado">Custo Aproximado</label>
              <div class="input-group">
                <span class="input-group-text">R$</span>
                <input 
                  type="text" 
                  id="custoAproximado" 
                  name="custoAproximado" 
                  class="form-input" 
                  value="${
                    service?.custoAproximado
                      ? MoneyUtils.formatBRL(service.custoAproximado)
                      : ""
                  }"
                  placeholder="0,00"
                >
              </div>
              <div class="form-error" id="custoAproximado-error"></div>
            </div>

            <div id="marginPreview" style="display: none;">
              <div class="margin-preview">
                <h4>Margem Calculada:</h4>
                <div class="margin-values">
                  <span class="margin-value" id="marginValue">R$ 0,00</span>
                  <span class="margin-percent" id="marginPercent">0%</span>
                </div>
                <div class="margin-warning" id="marginWarning" style="display: none;">
                  ⚠️ Margem negativa: o custo é maior que o preço
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Variações por Porte</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  id="temVariacoes" 
                  name="temVariacoes" 
                  ${service?.temVariacoes ? "checked" : ""}
                >
                <span class="checkmark"></span>
                Este serviço tem preços diferentes por porte do pet
              </label>
            </div>

            <div id="variacoesGroup" style="display: ${
              service?.temVariacoes ? "block" : "none"
            };">
              <div class="variacoes-grid">
                <div class="variacao-item">
                  <label for="precoPequeno">Pequeno</label>
                  <div class="input-group">
                    <span class="input-group-text">R$</span>
                    <input 
                      type="text" 
                      id="precoPequeno" 
                      name="precoPequeno" 
                      class="form-input" 
                      value="${
                        service?.variacoes?.pequeno
                          ? MoneyUtils.formatBRL(service.variacoes.pequeno)
                          : MoneyUtils.formatBRL(service?.preco || 0)
                      }"
                      placeholder="0,00"
                    >
                  </div>
                </div>

                <div class="variacao-item">
                  <label for="precoMedio">Médio</label>
                  <div class="input-group">
                    <span class="input-group-text">R$</span>
                    <input 
                      type="text" 
                      id="precoMedio" 
                      name="precoMedio" 
                      class="form-input" 
                      value="${
                        service?.variacoes?.medio
                          ? MoneyUtils.formatBRL(service.variacoes.medio)
                          : MoneyUtils.formatBRL(service?.preco || 0)
                      }"
                      placeholder="0,00"
                    >
                  </div>
                </div>

                <div class="variacao-item">
                  <label for="precoGrande">Grande</label>
                  <div class="input-group">
                    <span class="input-group-text">R$</span>
                    <input 
                      type="text" 
                      id="precoGrande" 
                      name="precoGrande" 
                      class="form-input" 
                      value="${
                        service?.variacoes?.grande
                          ? MoneyUtils.formatBRL(service.variacoes.grande)
                          : MoneyUtils.formatBRL(service?.preco || 0)
                      }"
                      placeholder="0,00"
                    >
                  </div>
                </div>
              </div>
              <div class="form-help">
                💡 Dica: O preço base será usado como referência. Ajuste os valores conforme necessário para cada porte.
              </div>
            </div>
          </div>


          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.renderServicos()">
              Cancelar
            </button>
            <button type="button" class="btn btn-outline" onclick="app.saveServiceAndNew()">
              Salvar e Novo
            </button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? "Atualizar" : "Salvar"} Serviço
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
    this.setupServiceFormEvents();
  }

  // Eventos do formulário de serviço
  setupServiceFormEvents() {
    const form = document.getElementById("serviceForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isEdit = form.dataset.isEdit === "true";
        const serviceId = form.dataset.serviceId || null;
        this.saveService(e, serviceId);
      });
    }

    // Toggle de custo
    const temCustoCheckbox = document.getElementById("temCusto");
    const custoGroup = document.getElementById("custoGroup");

    temCustoCheckbox.addEventListener("change", (e) => {
      custoGroup.style.display = e.target.checked ? "block" : "none";
      if (!e.target.checked) {
        document.getElementById("custoAproximado").value = "";
        this.updateMarginPreview();
      }
    });

    // Toggle de variações
    const temVariacoesCheckbox = document.getElementById("temVariacoes");
    const variacoesGroup = document.getElementById("variacoesGroup");

    if (temVariacoesCheckbox) {
      temVariacoesCheckbox.addEventListener("change", (e) => {
        variacoesGroup.style.display = e.target.checked ? "block" : "none";
        if (!e.target.checked) {
          // Limpar variações se desmarcar
          document.getElementById("precoPequeno").value = "";
          document.getElementById("precoMedio").value = "";
          document.getElementById("precoGrande").value = "";
        } else {
          // Preencher com preço base se marcar
          const precoBase = MoneyUtils.parseBRL(
            document.getElementById("preco").value
          );
          if (precoBase > 0) {
            document.getElementById("precoPequeno").value =
              MoneyUtils.formatBRL(precoBase);
            document.getElementById("precoMedio").value =
              MoneyUtils.formatBRL(precoBase);
            document.getElementById("precoGrande").value =
              MoneyUtils.formatBRL(precoBase);
          }
        }
      });
    }

    // Formatação de preço
    const precoInput = document.getElementById("preco");
    if (precoInput) {
      precoInput.addEventListener("input", (e) => {
        const cursorPosition = e.target.selectionStart;
        const oldValue = e.target.value;
        const newValue = MoneyUtils.formatInput(e.target.value);

        if (oldValue !== newValue) {
          e.target.value = newValue;
          // Manter posição do cursor
          e.target.setSelectionRange(cursorPosition, cursorPosition);
        }

        this.updateMarginPreview();
      });
    }

    // Formatação de custo
    const custoInput = document.getElementById("custoAproximado");
    if (custoInput) {
      custoInput.addEventListener("input", (e) => {
        const cursorPosition = e.target.selectionStart;
        const oldValue = e.target.value;
        const newValue = MoneyUtils.formatInput(e.target.value);

        if (oldValue !== newValue) {
          e.target.value = newValue;
          // Manter posição do cursor
          e.target.setSelectionRange(cursorPosition, cursorPosition);
        }

        this.updateMarginPreview();
      });
    }

    // Formatação dos campos de variações
    const variacaoInputs = ["precoPequeno", "precoMedio", "precoGrande"];

    variacaoInputs.forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener("input", (e) => {
          const cursorPosition = e.target.selectionStart;
          const oldValue = e.target.value;
          const newValue = MoneyUtils.formatInput(e.target.value);

          if (oldValue !== newValue) {
            e.target.value = newValue;
            e.target.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
      }
    });
  }

  // Atualizar preview de margem
  updateMarginPreview() {
    const preco = MoneyUtils.parseBRL(document.getElementById("preco").value);
    const custo = MoneyUtils.parseBRL(
      document.getElementById("custoAproximado").value
    );
    const temCusto = document.getElementById("temCusto").checked;

    const marginPreview = document.getElementById("marginPreview");
    const marginValue = document.getElementById("marginValue");
    const marginPercent = document.getElementById("marginPercent");
    const marginWarning = document.getElementById("marginWarning");

    if (temCusto && preco > 0 && custo >= 0) {
      const margin = MoneyUtils.formatMargin(preco, custo);

      marginValue.textContent = margin.valor;
      marginPercent.textContent = margin.percentual;

      if (margin.isNegative) {
        marginValue.classList.add("negative");
        marginPercent.classList.add("negative");
        marginWarning.style.display = "block";
      } else {
        marginValue.classList.remove("negative");
        marginPercent.classList.remove("negative");
        marginWarning.style.display = "none";
      }

      marginPreview.style.display = "block";
    } else {
      marginPreview.style.display = "none";
    }
  }

  // Salvar serviço
  async saveService(event, serviceId = null) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const serviceData = {
      nome: formData.get("nome").trim(),
      preco: MoneyUtils.parseBRL(formData.get("preco")),
      temCusto: formData.get("temCusto") === "on",
      custoAproximado:
        formData.get("temCusto") === "on"
          ? MoneyUtils.parseBRL(formData.get("custoAproximado"))
          : null,
      descricao: formData.get("descricao").trim(),
      ativo: true, // Sempre ativo - se não quiser, pode excluir
      temVariacoes: formData.get("temVariacoes") === "on",
      variacoes:
        formData.get("temVariacoes") === "on"
          ? {
              pequeno: MoneyUtils.parseBRL(formData.get("precoPequeno")),
              medio: MoneyUtils.parseBRL(formData.get("precoMedio")),
              grande: MoneyUtils.parseBRL(formData.get("precoGrande")),
            }
          : null,
    };

    // Validações
    if (!(await this.validateService(serviceData, serviceId))) {
      return;
    }

    try {
      let savedService;
      if (serviceId) {
        // Atualizar
        console.log("🔄 Atualizando serviço:", serviceId, serviceData);
        savedService = await store.saveService({
          ...serviceData,
          id: serviceId,
        });
      } else {
        // Criar novo
        const newServiceId = store.generateId("srv");
        console.log("➕ Criando novo serviço:", newServiceId, serviceData);
        savedService = await store.saveService({
          ...serviceData,
          id: newServiceId,
        });
      }

      console.log("✅ Serviço salvo:", savedService);
      ui.success(
        serviceId
          ? "Serviço atualizado com sucesso!"
          : "Serviço cadastrado com sucesso!"
      );
      await this.renderServicos();
    } catch (error) {
      console.error("❌ Erro ao salvar serviço:", error);
      ui.error("Erro ao salvar serviço: " + error.message);
    }
  }

  // Salvar e criar novo
  async saveServiceAndNew() {
    const form = document.getElementById("serviceForm");
    const formData = new FormData(form);

    const serviceData = {
      nome: formData.get("nome").trim(),
      preco: MoneyUtils.parseBRL(formData.get("preco")),
      temCusto: formData.get("temCusto") === "on",
      custoAproximado:
        formData.get("temCusto") === "on"
          ? MoneyUtils.parseBRL(formData.get("custoAproximado"))
          : null,
      descricao: formData.get("descricao").trim(),
      ativo: true, // Sempre ativo - se não quiser, pode excluir
      temVariacoes: formData.get("temVariacoes") === "on",
      variacoes:
        formData.get("temVariacoes") === "on"
          ? {
              pequeno: MoneyUtils.parseBRL(formData.get("precoPequeno")),
              medio: MoneyUtils.parseBRL(formData.get("precoMedio")),
              grande: MoneyUtils.parseBRL(formData.get("precoGrande")),
            }
          : null,
    };

    if (!(await this.validateService(serviceData))) {
      return;
    }

    try {
      const newServiceId = store.generateId("srv");
      await store.saveService({ ...serviceData, id: newServiceId });

      ui.success("Serviço cadastrado com sucesso!");
      this.showServiceForm(); // Abrir formulário limpo
    } catch (error) {
      ui.error("Erro ao salvar serviço: " + error.message);
    }
  }

  // Validar serviço
  async validateService(serviceData, serviceId = null) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    // Nome obrigatório
    if (!serviceData.nome || serviceData.nome.length < 2) {
      this.showFieldError(
        "nome",
        "Nome do serviço é obrigatório (mín. 2 caracteres)"
      );
      isValid = false;
    }

    // Preço obrigatório
    if (!serviceData.preco || serviceData.preco <= 0) {
      this.showFieldError("preco", "Preço deve ser maior que zero");
      isValid = false;
    }

    // Custo aproximado (se tem custo)
    if (
      serviceData.temCusto &&
      (serviceData.custoAproximado === null || serviceData.custoAproximado < 0)
    ) {
      this.showFieldError(
        "custoAproximado",
        "Custo aproximado deve ser maior ou igual a zero"
      );
      isValid = false;
    }

    // Validação das variações (se tem variações)
    if (serviceData.temVariacoes && serviceData.variacoes) {
      const variacoes = serviceData.variacoes;
      const variacoesValidas = Object.values(variacoes).some((v) => v > 0);

      if (!variacoesValidas) {
        this.showFieldError(
          "precoPequeno",
          "Pelo menos uma variação de preço deve ser preenchida"
        );
        isValid = false;
      }
    }

    // Verificar nome único
    if (serviceData.nome) {
      const existingServices = await store.getServices();
      const duplicateService = existingServices.find(
        (s) =>
          s.id !== serviceId &&
          s.nome.toLowerCase().trim() === serviceData.nome.toLowerCase().trim()
      );

      if (duplicateService) {
        this.showFieldError(
          "nome",
          "Já existe um serviço com este nome. Use um nome diferente."
        );
        isValid = false;
      }
    }

    return isValid;
  }

  // Eventos da página de serviços
  setupServiceEvents() {
    // Busca
    const searchInput = document.getElementById("serviceSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterServices(e.target.value);
      });
    }

    // Ordenação
    const sortSelect = document.getElementById("serviceSort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortServices(e.target.value);
      });
    }
  }

  // Filtrar serviços
  filterServices(searchTerm) {
    const services = store.getServices();
    const filtered = services.filter((service) =>
      service.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableContainer = document.querySelector(".data-table");
    if (tableContainer) {
      tableContainer.outerHTML = this.renderServicesTable(filtered);
    }
  }

  // Ordenar serviços
  sortServices(sortBy) {
    const services = store.getServices();
    const sorted = [...services].sort((a, b) => {
      switch (sortBy) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "preco":
          return a.preco - b.preco;
        case "createdAt":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    const tableContainer = document.querySelector(".data-table");
    if (tableContainer) {
      tableContainer.outerHTML = this.renderServicesTable(sorted);
    }
  }

  // Ações CRUD
  editService(serviceId) {
    this.showServiceForm(serviceId);
  }

  async deleteService(serviceId) {
    const service = await store.getService(serviceId);
    if (!service) return;

    const confirmed = await ui.confirm(
      `Tem certeza que deseja excluir o serviço "${service.nome}"?`,
      "Confirmar Exclusão",
      { type: "danger" }
    );

    if (confirmed) {
      try {
        store.deleteService(serviceId);
        ui.success("Serviço excluído com sucesso!");
        this.renderServicos();
      } catch (error) {
        ui.error("Erro ao excluir serviço: " + error.message);
      }
    }
  }

  // ===== MÉTODOS DE AGENDAMENTOS =====
  async renderAgendamentos() {
    const content = document.getElementById("content");

    try {
      const appointments = await store.getAppointments();

      content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Agendamentos</h1>
          <p>Gerencie os agendamentos de serviços</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="app.showAppointmentForm()">
            <i class="icon-plus"></i> Novo Agendamento
          </button>
        </div>
      </div>

      <div class="page-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="appointmentSearch" 
            placeholder="Buscar por cliente, pet ou serviço..."
            class="form-input"
          >
          <i class="icon-search"></i>
        </div>
        <div class="filter-actions">
          <select id="appointmentStatusFilter" class="form-select form-select-sm">
            <option value="">Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select id="appointmentPaymentFilter" class="form-select form-select-sm">
            <option value="">Pagamento</option>
            <option value="pago">Pago</option>
            <option value="nao_pago">Não Pago</option>
            <option value="previsto">Previsto</option>
            <option value="parcial">Parcial</option>
          </select>
          <input 
            type="date" 
            id="appointmentDateFilter" 
            class="form-input form-input-sm"
            title="Filtrar por data"
          >
        </div>
      </div>

      <div class="view-tabs">
        <button class="tab-btn active" onclick="app.switchAppointmentView('list')">
          <i class="icon-list"></i> Lista
        </button>
        <button class="tab-btn" onclick="app.switchAppointmentView('calendar')">
          <i class="icon-calendar"></i> Calendário
        </button>
      </div>

      <div class="data-container">
        ${await this.renderAppointmentsTable(appointments)}
      </div>
    `;

      this.setupAppointmentEvents();
    } catch (error) {
      console.error("❌ Erro ao carregar agendamentos:", error);
      content.innerHTML = `
        <div class="page-header">
          <h1>Agendamentos</h1>
        </div>
        <div class="error-state">
          <p>❌ Erro ao carregar agendamentos. Verifique sua conexão com a internet.</p>
          <button class="btn btn-primary" onclick="location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }

  async renderAppointmentsTable(appointments) {
    if (appointments.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>Nenhum agendamento cadastrado</h3>
          <p>Comece criando o primeiro agendamento</p>
          <button class="btn btn-primary" onclick="app.showAppointmentForm()">
            Criar Primeiro Agendamento
          </button>
        </div>
      `;
    }

    const tableRows = await Promise.all(
      appointments.map(async (appointment) => {
        // Corrigir agendamentos antigos que não têm nome nos itens
        if (appointment.itens && appointment.itens.length > 0) {
          for (let item of appointment.itens) {
            if (!item.nome && item.serviceId) {
              const service = await store.getService(item.serviceId);
              if (service) {
                item.nome = service.nome;
              }
            }
          }
        }

        // Garantir que itens existe e é um array
        if (!appointment.itens || !Array.isArray(appointment.itens)) {
          appointment.itens = [];
        }

        const client = await store.getClient(appointment.clienteId);
        const pet = appointment.petId
          ? await store.getPet(appointment.petId)
          : null;
        const professional = appointment.profissionalId
          ? await store.getProfessional(appointment.profissionalId)
          : null;

        const statusBadge = this.getStatusBadge(appointment.status);
        const paymentBadge = this.getPaymentBadge(appointment.pagamento || {});
        console.log("🔍 Dados do agendamento:", appointment);
        console.log(
          "🔍 Itens do agendamento:",
          JSON.stringify(appointment.itens, null, 2)
        );

        const servicesText =
          appointment.itens.length === 1
            ? appointment.itens[0].nome || "Serviço sem nome"
            : `${appointment.itens.length} serviços`;

        return `
        <tr>
          <td>
            <div class="appointment-datetime">
              <strong>${DateUtils.formatDate(
                appointment.dataHoraInicio
              )}</strong>
              <small>${DateUtils.formatTime(appointment.dataHoraInicio)}</small>
            </div>
          </td>
          <td>
            <div class="appointment-client">
              <strong class="clickable-name" onclick="app.viewClient('${
                appointment.clienteId
              }')" title="Ver cliente">
                ${client?.nomeCompleto || "Cliente não encontrado"}
              </strong>
              ${pet ? `<small>Pet: ${pet.nome}</small>` : ""}
            </div>
          </td>
          <td>${servicesText}</td>
          <td>${MoneyUtils.formatBRL(appointment.totalPrevisto)}</td>
          <td>${professional?.nome || "-"}</td>
          <td>${statusBadge}</td>
          <td>${paymentBadge}</td>
          <td>
            <div class="data-table-actions">
              <button class="btn btn-sm btn-outline" onclick="app.viewAppointment('${
                appointment.id
              }')" title="Ver detalhes">
                <i class="icon-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.editAppointment('${
                appointment.id
              }')" title="Editar">
                <i class="icon-edit"></i>
              </button>
              <button class="btn btn-sm btn-info" onclick="app.sendConfirmationWhatsApp('${
                appointment.id
              }')" title="Enviar confirmação via WhatsApp">
                <i class="icon-message-circle"></i>
              </button>
              ${
                appointment.pagamento && appointment.pagamento.status !== "pago"
                  ? `
                <button class="btn btn-sm btn-success" onclick="app.markAppointmentPaid('${appointment.id}')" title="Marcar como pago">
                  <i class="icon-check"></i>
                </button>
              `
                  : ""
              }
              <button class="btn btn-sm btn-danger" onclick="app.cancelAppointment('${
                appointment.id
              }')" title="Cancelar">
                <i class="icon-x"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
    );

    return `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Cliente</th>
              <th>Serviços</th>
              <th>Total</th>
              <th>Profissional</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  getStatusBadge(status) {
    const statusConfig = {
      pendente: { class: "badge-warning", text: "Pendente" },
      confirmado: { class: "badge-info", text: "Confirmado" },
      em_andamento: { class: "badge-primary", text: "Em Andamento" },
      concluido: { class: "badge-success", text: "Concluído" },
      cancelado: { class: "badge-danger", text: "Cancelado" },
    };

    const config = statusConfig[status] || {
      class: "badge-secondary",
      text: status,
    };
    return `<span class="badge ${config.class}">${config.text}</span>`;
  }

  getPaymentBadge(payment) {
    // Verificar se payment existe e tem status
    if (!payment || !payment.status) {
      return `<span class="badge badge-secondary">Indefinido</span>`;
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

  async renderPets() {
    const content = document.getElementById("content");
    console.log("🔍 renderPets iniciado");

    try {
      console.log("🔍 Carregando pets...");
      const pets = await store.getPets();
      console.log("🔍 Pets carregados:", pets.length, "itens");

      content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Pets</h1>
          <p>Gerencie os pets dos clientes</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="app.showPetForm()">
            <i class="icon-plus"></i> Novo Pet
          </button>
          <button class="btn btn-outline" onclick="app.clearCacheAndReload()" style="margin-left: 10px;">
            <i class="icon-refresh"></i> Sincronizar Dados
          </button>
        </div>
      </div>

      <div class="page-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="petSearch" 
            placeholder="Buscar por nome, raça ou tutor..."
            class="form-input"
          >
          <i class="icon-search"></i>
        </div>
        <div class="filter-actions">
          <select id="petClientFilter" class="form-select">
            <option value="">Todos os clientes</option>
            ${(await store.getClients())
              .map(
                (client) =>
                  `<option value="${client.id}">${client.nomeCompleto}</option>`
              )
              .join("")}
          </select>
          <select id="petSort" class="form-select">
            <option value="nome">Ordenar por Nome</option>
            <option value="especie">Ordenar por Espécie</option>
            <option value="createdAt">Ordenar por Data</option>
          </select>
        </div>
      </div>

      <div class="data-container">
        ${await this.renderPetsTable(pets)}
      </div>
    `;

      this.setupPetEvents();
    } catch (error) {
      console.error("❌ Erro ao carregar pets:", error);
      content.innerHTML = `
        <div class="page-header">
          <h1>Pets</h1>
        </div>
        <div class="error-state">
          <p>❌ Erro ao carregar pets. Verifique sua conexão com a internet.</p>
          <button class="btn btn-primary" onclick="location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }

  async renderPetsTable(pets) {
    if (pets.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🐕</div>
          <h3>Nenhum pet cadastrado</h3>
          <p>Comece cadastrando o primeiro pet</p>
          <button class="btn btn-primary" onclick="app.showPetForm()">
            Cadastrar Primeiro Pet
          </button>
        </div>
      `;
    }

    const tableRows = await Promise.all(
      pets.map(async (pet) => {
        const client = await store.getClient(pet.clienteId);
        const idade = pet.dataNascimento
          ? utils.calculateAge(pet.dataNascimento)
          : pet.idade || "-";

        return `
        <tr>
          <td>
            <div class="pet-info">
              <strong class="clickable-name" onclick="app.viewPet('${
                pet.id
              }')" title="Clique para ver detalhes">${
          pet.nome || "Sem nome"
        }</strong>
              <span class="pet-species">${pet.especie || "-"}</span>
            </div>
          </td>
          <td>${pet.raca || "-"}</td>
          <td>${
            pet.porte
              ? `<span class="badge badge-${
                  pet.porte === "pequeno"
                    ? "info"
                    : pet.porte === "medio"
                    ? "warning"
                    : "danger"
                }">${
                  pet.porte.charAt(0).toUpperCase() + pet.porte.slice(1)
                }</span>`
              : "-"
          }</td>
          <td>${
            client
              ? `<span class="clickable-name" onclick="app.viewClient('${pet.clienteId}')" title="Clique para ver detalhes do tutor">${client.nomeCompleto}</span>`
              : "Cliente não encontrado"
          }</td>
          <td>${idade}</td>
          <td>${pet.pesoAproximadoKg ? pet.pesoAproximadoKg + "kg" : "-"}</td>
          <td>
            <div class="data-table-actions">
              <button class="btn btn-sm btn-outline" onclick="app.viewPet('${
                pet.id
              }')" title="Ver detalhes">
                <i class="icon-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.editPet('${
                pet.id
              }')" title="Editar">
                <i class="icon-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="app.deletePet('${
                pet.id
              }')" title="Excluir">
                <i class="icon-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
    );

    return `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Nome do Pet</th>
              <th>Raça</th>
              <th>Porte</th>
              <th>Tutor</th>
              <th>Idade</th>
              <th>Peso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  setupPetEvents() {
    // Busca
    const searchInput = document.getElementById("petSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterPets(e.target.value);
      });
    }

    // Filtro por cliente
    const clientFilter = document.getElementById("petClientFilter");
    if (clientFilter) {
      clientFilter.addEventListener("change", (e) => {
        this.filterPetsByClient(e.target.value);
      });
    }

    // Ordenação
    const sortSelect = document.getElementById("petSort");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortPets(e.target.value);
      });
    }
  }

  async filterPets(query) {
    const pets = await store.getPets();
    const filtered = await Promise.all(
      pets.filter(async (pet) => {
        const client = await store.getClient(pet.clienteId);
        const searchText = `${pet.nome || ""} ${pet.raca || ""} ${
          client?.nomeCompleto || ""
        }`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
    );

    const container = document.querySelector(".data-container");
    container.innerHTML = await this.renderPetsTable(filtered);
  }

  async filterPetsByClient(clientId) {
    const pets = await store.getPets();
    const filtered = clientId
      ? pets.filter((pet) => pet.clienteId === clientId)
      : pets;

    const container = document.querySelector(".data-container");
    container.innerHTML = await this.renderPetsTable(filtered);
  }

  async sortPets(field) {
    const pets = await store.getPets();
    const sorted = pets.sort((a, b) => {
      let aVal = a[field] || "";
      let bVal = b[field] || "";

      if (field === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = await this.renderPetsTable(sorted);
  }

  // ===== MÉTODOS DE PETS =====
  async clearCacheAndReload() {
    try {
      await store.clearCacheAndSync();
      ui.success("Cache limpo! Recarregando dados...");
      await this.renderPets();
    } catch (error) {
      ui.error("Erro ao limpar cache: " + error.message);
    }
  }

  // ===== MÉTODOS DE VACINAS =====
  toggleVaccineSection() {
    const statusSelect = document.getElementById("petStatusVacinal");
    const vaccinesSection = document.getElementById("vaccinesSection");

    if (statusSelect.value === "registrar_agora") {
      vaccinesSection.style.display = "block";
    } else {
      vaccinesSection.style.display = "none";
    }
  }

  addVaccine() {
    const container = document.getElementById("vaccinesContainer");
    const vaccineIndex = container.children.length;

    const vaccineItem = this.renderVaccineItem(null, vaccineIndex);
    container.insertAdjacentHTML("beforeend", vaccineItem);

    // Se era o primeiro item, remover mensagem de vazio
    const emptyMessage = container.querySelector(".empty-vaccines");
    if (emptyMessage) {
      emptyMessage.remove();
    }
  }

  removeVaccine(index) {
    const container = document.getElementById("vaccinesContainer");
    const vaccineItem = container.querySelector(
      `[data-vaccine-index="${index}"]`
    );

    if (vaccineItem) {
      vaccineItem.remove();
    }

    // Se não há mais vacinas, mostrar mensagem de vazio
    if (container.children.length === 0) {
      container.innerHTML =
        '<div class="empty-vaccines">Nenhuma vacina registrada</div>';
    }
  }

  renderVaccineItem(vaccine, index) {
    const vaccineId = vaccine?.id || `temp_${index}`;

    return `
      <div class="vaccine-item" data-vaccine-index="${index}">
        <div class="vaccine-header">
          <h5>Vacina ${index + 1}</h5>
          <button type="button" class="btn btn-sm btn-danger" onclick="app.removeVaccine(${index})">
            <i class="icon-trash"></i> Remover
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nome da Vacina</label>
            <input 
              type="text" 
              name="vacinaNome[]" 
              class="form-input vaccine-name-input" 
              value="${vaccine?.nomeVacina || ""}"
              placeholder="Ex: V10, Antirrábica, Gripe Canina..."
              list="vaccineSuggestions"
              required
            >
            <datalist id="vaccineSuggestions">
              <option value="V8">
              <option value="V10">
              <option value="V12">
              <option value="Antirrábica">
              <option value="Gripe Canina (Tosse dos Canis)">
              <option value="Leptospirose">
              <option value="Giárdia">
              <option value="V4 Felina">
              <option value="Raiva">
            </datalist>
          </div>
          
          <div class="form-group">
            <label>Data de Aplicação</label>
            <input 
              type="date" 
              name="vacinaDataAplicacao[]" 
              class="form-input" 
              value="${vaccine?.dataAplicacao || ""}"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Próxima Dose (Opcional)</label>
            <input 
              type="date" 
              name="vacinaProximaDose[]" 
              class="form-input" 
              value="${vaccine?.proximaDose || ""}"
              onchange="app.toggleVaccineReminder(${index})"
            >
          </div>
          
          <div class="form-group">
            <label>Antecedência (dias)</label>
            <input 
              type="number" 
              name="vacinaAntecedenciaDias[]" 
              class="form-input" 
              value="${vaccine?.antecedenciaDias || 7}"
              min="0"
              max="30"
              placeholder="7"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="vacinaHabilitarLembrete[]" 
                class="form-checkbox" 
                ${vaccine?.habilitarLembrete ? "checked" : ""}
                onchange="app.toggleVaccineReminder(${index})"
              >
              <span class="checkmark"></span>
              Habilitar lembrete
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Observações</label>
          <input 
            type="text" 
            name="vacinaObservacoes[]" 
            class="form-input" 
            value="${vaccine?.observacoes || ""}"
            placeholder="Observações sobre a vacina..."
          >
        </div>
        
        <input type="hidden" name="vacinaId[]" value="${vaccineId}">
      </div>
    `;
  }

  toggleVaccineReminder(index) {
    const vaccineItem = document.querySelector(
      `[data-vaccine-index="${index}"]`
    );
    const proximaDoseInput = vaccineItem.querySelector(
      'input[name="vacinaProximaDose[]"]'
    );
    const habilitarLembreteCheckbox = vaccineItem.querySelector(
      'input[name="vacinaHabilitarLembrete[]"]'
    );

    // Se habilitar lembrete está marcado mas não há próxima dose, exigir próxima dose
    if (habilitarLembreteCheckbox.checked && !proximaDoseInput.value) {
      proximaDoseInput.required = true;
      proximaDoseInput.focus();
    } else {
      proximaDoseInput.required = false;
    }
  }

  processVaccines(formData) {
    const vacinas = [];
    const nomes = formData.getAll("vacinaNome[]");
    const datasAplicacao = formData.getAll("vacinaDataAplicacao[]");
    const proximasDoses = formData.getAll("vacinaProximaDose[]");
    const antecedencias = formData.getAll("vacinaAntecedenciaDias[]");
    const habilitarLembretes = formData.getAll("vacinaHabilitarLembrete[]");
    const observacoes = formData.getAll("vacinaObservacoes[]");
    const ids = formData.getAll("vacinaId[]");

    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i] && datasAplicacao[i]) {
        const vacina = {
          id: ids[i] || store.generateId("vac"),
          nomeVacina: nomes[i].trim(),
          dataAplicacao: datasAplicacao[i],
          proximaDose: proximasDoses[i] || null,
          antecedenciaDias: parseInt(antecedencias[i]) || 7,
          habilitarLembrete: habilitarLembretes[i] === "on",
          observacoes: observacoes[i] || "",
        };
        vacinas.push(vacina);
      }
    }

    return vacinas;
  }

  renderPetVaccines(pet) {
    if (!pet.vacinas || pet.vacinas.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💉</div>
          <p>Nenhuma vacina registrada</p>
          <button class="btn btn-primary btn-sm" onclick="app.editPet('${pet.id}')">
            <i class="icon-plus"></i> Registrar Vacinas
          </button>
        </div>
      `;
    }

    const vacinas = pet.vacinas.sort(
      (a, b) => new Date(b.dataAplicacao) - new Date(a.dataAplicacao)
    );

    return `
      <div class="vaccines-list">
        ${vacinas.map((vacina) => this.renderVaccineCard(vacina, pet)).join("")}
      </div>
    `;
  }

  renderVaccineCard(vacina, pet) {
    const status = this.getVaccineStatus(vacina);
    const statusClass = this.getVaccineStatusClass(status);

    return `
      <div class="vaccine-card">
        <div class="vaccine-header">
          <h4>${vacina.nomeVacina}</h4>
          <span class="badge ${statusClass}">${status}</span>
        </div>
        
        <div class="vaccine-details">
          <p><strong>Data de Aplicação:</strong> ${utils.formatDate(
            vacina.dataAplicacao
          )}</p>
          ${
            vacina.proximaDose
              ? `<p><strong>Próxima Dose:</strong> ${utils.formatDate(
                  vacina.proximaDose
                )}</p>`
              : ""
          }
          ${
            vacina.observacoes
              ? `<p><strong>Observações:</strong> ${vacina.observacoes}</p>`
              : ""
          }
        </div>
        
        <div class="vaccine-actions">
          ${
            vacina.habilitarLembrete && vacina.proximaDose
              ? `
            <button class="btn btn-sm btn-outline" onclick="app.sendVaccineWhatsApp('${pet.clienteId}', '${vacina.nomeVacina}', '${vacina.proximaDose}')">
              <i class="icon-whatsapp"></i> WhatsApp
            </button>
            <button class="btn btn-sm btn-outline" onclick="app.createVaccineAppointment('${pet.id}', '${vacina.nomeVacina}')">
              <i class="icon-calendar"></i> Agendar
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  getVaccineStatus(vacina) {
    if (!vacina.proximaDose) return "Sem próxima dose";

    const today = new Date().toISOString().split("T")[0];
    const proximaDose = vacina.proximaDose;
    const antecedenciaDias = vacina.antecedenciaDias || 7;

    if (today > proximaDose) {
      return "Atrasada";
    }

    const diasRestantes = Math.ceil(
      (new Date(proximaDose) - new Date(today)) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes <= antecedenciaDias) {
      return `Próximo reforço em ${diasRestantes} dias`;
    }

    return "Em dia";
  }

  getVaccineStatusClass(status) {
    if (status === "Atrasada") return "badge-danger";
    if (status.includes("Próximo reforço")) return "badge-warning";
    if (status === "Em dia") return "badge-success";
    return "badge-secondary";
  }

  async sendVaccineWhatsApp(clienteId, nomeVacina, proximaDose) {
    const client = await store.getClient(clienteId);
    if (!client || !client.telefoneWhatsApp) {
      ui.error("Cliente não encontrado ou sem telefone WhatsApp");
      return;
    }

    const message = `Olá ${client.nomeCompleto.split(" ")[0]}! 

Lembramos que o reforço da vacina ${nomeVacina} está previsto para ${utils.formatDate(
      proximaDose
    )}.

Entre em contato conosco para agendar o reforço!`;

    const url = utils.generateWhatsAppLink(client.telefoneWhatsApp, message);
    window.open(url, "_blank");
  }

  async sendConfirmationWhatsApp(appointmentId) {
    try {
      const appointment = await store.getAppointment(appointmentId);
      if (!appointment) {
        UI.showToast("Agendamento não encontrado", "error");
        return;
      }

      const cliente = await store.getClient(appointment.clienteId);
      if (!cliente || !cliente.telefoneWhatsApp) {
        UI.showToast("Cliente não encontrado ou sem WhatsApp", "error");
        return;
      }

      const pet = appointment.petId
        ? await store.getPet(appointment.petId)
        : null;
      const dataHora = new Date(appointment.dataHoraInicio).toLocaleString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      const servicos = appointment.itens.map((item) => item.nome).join(", ");
      const petNome = pet ? pet.nome : "seu pet";

      const mensagem = `Olá ${
        cliente.nomeCompleto.split(" ")[0]
      }! Tudo certo para recebermos o ${petNome} hoje? Confirmação do agendamento para ${dataHora} - Serviços: ${servicos}. Aguardamos você! 🐾`;

      const whatsappLink = buildWhatsAppLink(
        cliente.telefoneWhatsApp,
        mensagem
      );
      window.open(whatsappLink, "_blank");
    } catch (error) {
      console.error("Erro ao enviar confirmação:", error);
      UI.showToast("Erro ao enviar confirmação", "error");
    }
  }

  async createVaccineAppointment(petId, nomeVacina) {
    // Redirecionar para página de agendamentos com pet pré-selecionado
    window.location.hash = "#agendamentos";

    // Aguardar um pouco para a página carregar
    setTimeout(() => {
      const petSelect = document.getElementById("petId");
      if (petSelect) {
        petSelect.value = petId;

        // Disparar evento de mudança para carregar dados do pet
        petSelect.dispatchEvent(new Event("change"));
      }
    }, 500);
  }

  async showPetForm(petId = null, preSelectedClientId = null) {
    const isEdit = petId !== null;
    const pet = isEdit ? await store.getPet(petId) : null;
    const clients = await store.getClients();

    const content = `
      <div class="form-container">
        <div class="form-header">
          <h2>${isEdit ? "Editar Pet" : "Novo Pet"}</h2>
          <button class="btn btn-outline" onclick="app.renderPets()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>

        <form id="petForm" data-is-edit="${isEdit}" data-pet-id="${
      petId || ""
    }">
          <div class="form-section">
            <h3>Dados do Pet</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="petNome">Nome do Pet</label>
                <input 
                  type="text" 
                  id="petNome" 
                  name="nome" 
                  class="form-input" 
                  value="${pet?.nome || ""}"
                  placeholder="Nome do pet"
                >
                <div class="form-error" id="petNome-error"></div>
              </div>
              <div class="form-group">
                <label for="petEspecie">Espécie</label>
                <select id="petEspecie" name="especie" class="form-select">
                  <option value="cão" ${
                    pet?.especie === "cão" ? "selected" : ""
                  }>Cão</option>
                  <option value="gato" ${
                    pet?.especie === "gato" ? "selected" : ""
                  }>Gato</option>
                  <option value="outros" ${
                    pet?.especie === "outros" ? "selected" : ""
                  }>Outros</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="petRaca">Raça</label>
                <input 
                  type="text" 
                  id="petRaca" 
                  name="raca" 
                  class="form-input" 
                  value="${pet?.raca || ""}"
                  placeholder="Raça do pet"
                >
              </div>
              <div class="form-group">
                <label for="petSexo">Sexo</label>
                <select id="petSexo" name="sexo" class="form-select">
                  <option value="">Selecione</option>
                  <option value="M" ${
                    pet?.sexo === "M" ? "selected" : ""
                  }>Macho</option>
                  <option value="F" ${
                    pet?.sexo === "F" ? "selected" : ""
                  }>Fêmea</option>
                  <option value="Indef." ${
                    pet?.sexo === "Indef." ? "selected" : ""
                  }>Indefinido</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="petPorte">Porte</label>
                <select id="petPorte" name="porte" class="form-select">
                  <option value="">Selecione</option>
                  <option value="pequeno" ${
                    pet?.porte === "pequeno" ? "selected" : ""
                  }>Pequeno</option>
                  <option value="medio" ${
                    pet?.porte === "medio" ? "selected" : ""
                  }>Médio</option>
                  <option value="grande" ${
                    pet?.porte === "grande" ? "selected" : ""
                  }>Grande</option>
                </select>
              </div>
              <div class="form-group">
                <label for="petDataNascimento">Data de Nascimento</label>
                <input 
                  type="date" 
                  id="petDataNascimento" 
                  name="dataNascimento" 
                  class="form-input" 
                  value="${pet?.dataNascimento || ""}"
                >
                <div class="form-error" id="petDataNascimento-error"></div>
              </div>
              <div class="form-group">
                <label for="petIdade">Idade (se não souber a data)</label>
                <input 
                  type="text" 
                  id="petIdade" 
                  name="idade" 
                  class="form-input" 
                  value="${pet?.idade || ""}"
                  placeholder="Ex: 2 anos, 6 meses"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="petPeso">Peso Aproximado (kg)</label>
                <input 
                  type="number" 
                  id="petPeso" 
                  name="pesoAproximadoKg" 
                  class="form-input" 
                  value="${pet?.pesoAproximadoKg || ""}"
                  step="0.1" 
                  min="0"
                  placeholder="0.0"
                >
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Tutor</h3>
            <div class="form-group ${preSelectedClientId ? "required" : ""}">
              <label for="petClienteId">Cliente *</label>
              <select 
                id="petClienteId" 
                name="clienteId" 
                class="form-select" 
                ${preSelectedClientId ? "disabled" : ""}
                required
              >
                <option value="">Selecione um cliente</option>
                ${clients
                  .map(
                    (client) =>
                      `<option value="${client.id}" ${
                        pet?.clienteId === client.id ||
                        preSelectedClientId === client.id
                          ? "selected"
                          : ""
                      }>${client.nomeCompleto}</option>`
                  )
                  .join("")}
              </select>
              ${
                preSelectedClientId
                  ? `<input type="hidden" name="clienteId" value="${preSelectedClientId}">`
                  : ""
              }
              <div class="form-error" id="petClienteId-error"></div>
            </div>
          </div>

          <div class="form-section">
            <h3>Observações</h3>
            <div class="form-group">
              <textarea 
                id="petObservacoes" 
                name="observacoes" 
                class="form-textarea" 
                rows="3"
                placeholder="Observações sobre o pet..."
              >${pet?.observacoes || ""}</textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Vacinas</h3>
            <div class="form-group">
              <label for="petStatusVacinal">Status Vacinal</label>
              <select id="petStatusVacinal" name="statusVacinal" class="form-select" onchange="app.toggleVaccineSection()">
                <option value="nao_vacinado" ${
                  pet?.statusVacinal === "nao_vacinado" ? "selected" : ""
                }>Não vacinado ainda</option>
                <option value="sem_registro" ${
                  pet?.statusVacinal === "sem_registro" ? "selected" : ""
                }>Sem registro informado</option>
                <option value="registrar_agora" ${
                  pet?.statusVacinal === "registrar_agora" ? "selected" : ""
                }>Registrar vacinas agora</option>
                <option value="registrar_depois" ${
                  pet?.statusVacinal === "registrar_depois" ? "selected" : ""
                }>Vou registrar depois</option>
              </select>
            </div>
            
            <div id="vaccinesSection" style="display: ${
              pet?.statusVacinal === "registrar_agora" ? "block" : "none"
            };">
              <div class="vaccines-header">
                <h4>Vacinas Aplicadas</h4>
                <button type="button" class="btn btn-sm btn-outline" onclick="app.addVaccine()">
                  <i class="icon-plus"></i> Adicionar Vacina
                </button>
              </div>
              <div id="vaccinesContainer">
                ${
                  pet?.vacinas && pet.vacinas.length > 0
                    ? pet.vacinas
                        .map((vacina, index) =>
                          this.renderVaccineItem(vacina, index)
                        )
                        .join("")
                    : '<div class="empty-vaccines">Nenhuma vacina registrada</div>'
                }
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.renderPets()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? "Atualizar" : "Salvar"} Pet
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
    this.setupPetFormEvents();
  }

  setupPetFormEvents() {
    // Event listener para o formulário
    const form = document.getElementById("petForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isEdit = form.dataset.isEdit === "true";
        const petId = form.dataset.petId || null;
        this.savePet(e, petId);
      });
    }

    // Cálculo automático de idade
    const dataNascimentoInput = document.getElementById("petDataNascimento");
    const idadeInput = document.getElementById("petIdade");

    if (dataNascimentoInput && idadeInput) {
      dataNascimentoInput.addEventListener("change", (e) => {
        if (e.target.value) {
          const idade = utils.calculateAge(e.target.value);
          idadeInput.value = idade;
        }
      });
    }
  }

  async savePet(event, petId = null) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const petData = {
      nome: formData.get("nome"),
      especie: formData.get("especie") || "cão",
      raca: formData.get("raca"),
      sexo: formData.get("sexo"),
      porte: formData.get("porte"),
      dataNascimento: formData.get("dataNascimento"),
      idade: formData.get("idade"),
      pesoAproximadoKg: parseFloat(formData.get("pesoAproximadoKg")) || null,
      clienteId: formData.get("clienteId"),
      observacoes: formData.get("observacoes"),
      statusVacinal: formData.get("statusVacinal") || "nao_vacinado",
    };

    // Processar vacinas se status for "registrar_agora"
    if (petData.statusVacinal === "registrar_agora") {
      const vacinas = this.processVaccines(formData);
      petData.vacinas = vacinas;
    } else {
      petData.vacinas = [];
    }

    // Validações
    if (!this.validatePet(petData)) {
      return;
    }

    try {
      let savedPet;
      if (petId) {
        // Para atualizar, incluir o ID no objeto
        savedPet = await store.savePet({ ...petData, id: petId });
      } else {
        // Para criar novo, gerar ID único
        const newPetId = store.generateId("pet");
        savedPet = await store.savePet({ ...petData, id: newPetId });
      }

      // Criar lembretes para vacinas com próxima dose
      if (savedPet.vacinas && savedPet.vacinas.length > 0) {
        for (const vacina of savedPet.vacinas) {
          if (vacina.habilitarLembrete && vacina.proximaDose) {
            await store.upsertVaccineReminder({
              petId: savedPet.id,
              clienteId: savedPet.clienteId,
              nomeVacina: vacina.nomeVacina,
              proximaDose: vacina.proximaDose,
              antecedenciaDias: vacina.antecedenciaDias,
            });
          }
        }
      }

      ui.success(
        petId ? "Pet atualizado com sucesso!" : "Pet cadastrado com sucesso!"
      );
      console.log("🔍 Redirecionando para pet:", savedPet.id);
      await this.viewPet(savedPet.id);
    } catch (error) {
      ui.error("Erro ao salvar pet: " + error.message);
    }
  }

  validatePet(petData) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    // Cliente obrigatório
    if (!petData.clienteId) {
      this.showFieldError("petClienteId", "Selecione um cliente");
      isValid = false;
    }

    // Data de nascimento válida (se preenchida)
    if (
      petData.dataNascimento &&
      new Date(petData.dataNascimento) > new Date()
    ) {
      this.showFieldError(
        "petDataNascimento",
        "Data de nascimento não pode ser futura"
      );
      isValid = false;
    }

    return isValid;
  }

  async viewPet(petId) {
    console.log("🔍 viewPet chamado com ID:", petId);
    const pet = await store.getPet(petId);
    if (!pet) {
      ui.error("Pet não encontrado");
      return;
    }
    console.log("🔍 Pet encontrado:", pet);

    const client = await store.getClient(pet.clienteId);
    console.log("🔍 Cliente encontrado:", client);
    const idade = pet.dataNascimento
      ? utils.calculateAge(pet.dataNascimento)
      : pet.idade || "-";
    console.log("🔍 Idade calculada:", idade);
    console.log("🔍 Criando conteúdo HTML...");

    const content = `
      <div class="detail-container">
        <div class="detail-header">
          <div class="detail-title">
            <h1>${pet.nome || "Sem nome"}</h1>
            <div class="detail-actions">
              <button class="btn btn-secondary" onclick="app.showProntuarioFormForPet('${
                pet.id
              }')">
                <i class="icon-plus"></i> Novo Prontuário
              </button>
              <button class="btn btn-outline" onclick="app.editPet('${
                pet.id
              }')">
                <i class="icon-edit"></i> Editar
              </button>
              <button class="btn btn-outline" onclick="app.viewClient('${
                pet.clienteId
              }')">
                <i class="icon-user"></i> Ver Cliente
              </button>
              <button class="btn btn-outline" onclick="app.renderPets()">
                <i class="icon-arrow-left"></i> Voltar
              </button>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-grid">
            <div class="detail-card">
              <h3>Informações Básicas</h3>
              <div class="detail-info">
                <p><strong>Espécie:</strong> ${pet.especie || "-"}</p>
                <p><strong>Raça:</strong> ${pet.raca || "-"}</p>
                <p><strong>Sexo:</strong> ${pet.sexo || "-"}</p>
                <p><strong>Idade:</strong> ${idade}</p>
                ${
                  pet.pesoAproximadoKg
                    ? `<p><strong>Peso:</strong> ${pet.pesoAproximadoKg}kg</p>`
                    : ""
                }
              </div>
            </div>

            <div class="detail-card">
              <h3>Tutor</h3>
              <div class="detail-info">
                <p><strong>Nome:</strong> ${
                  client
                    ? `<span class="clickable-name" onclick="app.viewClient('${pet.clienteId}')" title="Clique para ver detalhes do cliente">${client.nomeCompleto}</span>`
                    : "Cliente não encontrado"
                }</p>
                ${
                  client?.telefoneWhatsApp
                    ? `<p><strong>WhatsApp:</strong> ${client.telefoneWhatsApp}</p>`
                    : ""
                }
                ${
                  client?.email
                    ? `<p><strong>Email:</strong> ${client.email}</p>`
                    : ""
                }
              </div>
            </div>

            ${
              pet.observacoes
                ? `
            <div class="detail-card">
              <h3>Observações</h3>
              <p>${pet.observacoes}</p>
            </div>
            `
                : ""
            }

            <div class="detail-card">
              <h3>Vacinas</h3>
              <div class="vaccines-section">
                ${this.renderPetVaccines(pet)}
              </div>
            </div>

            <div class="detail-card">
              <h3>Histórico Médico</h3>
              <div class="prontuarios-history">
                ${await this.renderPetProntuarios(pet.id)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    console.log("🔍 Renderizando página de detalhes do pet");
    document.getElementById("content").innerHTML = content;
  }

  editPet(petId) {
    this.showPetForm(petId);
  }

  async deletePet(petId) {
    const pet = store.getPet(petId);
    if (!pet) return;

    const confirmed = await ui.confirm(
      `Tem certeza que deseja excluir o pet "${pet.nome || "Sem nome"}"?`,
      "Confirmar Exclusão",
      { type: "danger" }
    );

    if (confirmed) {
      try {
        store.deletePet(petId);
        ui.success("Pet excluído com sucesso!");
        this.renderPets();
      } catch (error) {
        ui.error("Erro ao excluir pet: " + error.message);
      }
    }
  }

  renderRelatorios() {
    const content = document.getElementById("content");
    content.innerHTML =
      "<h1>Relatórios</h1><p>Página em desenvolvimento...</p>";
  }

  renderConfiguracoes() {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="page-header">
        <h1>Configurações</h1>
        <p>Gerencie as configurações do sistema</p>
      </div>

      <div class="config-grid">
        <div class="config-card">
          <div class="config-icon">🎯</div>
          <h3>Configuração Inicial</h3>
          <p>Configure serviços, profissionais e regras de preço</p>
          <button class="btn btn-primary" onclick="app.showOnboarding()">
            Iniciar Configuração
          </button>
        </div>

        <div class="config-card">
          <div class="config-icon">💾</div>
          <h3>Backup e Restore</h3>
          <p>Exporte e importe dados do sistema</p>
          <div class="config-actions">
            <button class="btn btn-secondary" onclick="app.exportData()">
              Exportar Backup
            </button>
            <button class="btn btn-outline" onclick="app.importData()">
              Importar Backup
            </button>
          </div>
        </div>

        <div class="config-card">
          <div class="config-icon">📊</div>
          <h3>Dados do Sistema</h3>
          <p>Visualize estatísticas e limpe dados</p>
          <div class="config-actions">
            <button class="btn btn-outline" onclick="app.showSystemStats()">
              Ver Estatísticas
            </button>
            <button class="btn btn-danger" onclick="app.clearAllData()">
              Limpar Todos os Dados
            </button>
          </div>
        </div>

        <div class="config-card">
          <div class="config-icon">⚙️</div>
          <h3>Configurações Avançadas</h3>
          <p>Configurações específicas do sistema</p>
          <div class="config-actions">
            <button class="btn btn-outline" onclick="app.showAdvancedSettings()">
              Configurações Avançadas
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Formulário de agendamento
  async showAppointmentForm(appointmentId = null) {
    const isEdit = appointmentId !== null;
    const appointment = isEdit
      ? await store.getAppointment(appointmentId)
      : null;
    const clients = await store.getClients();
    const services = await store.getServices();
    const professionals = await store.getProfessionals();

    const content = `
      <div class="form-container">
        <div class="form-header">
          <h2>${isEdit ? "Editar Agendamento" : "Novo Agendamento"}</h2>
          <button class="btn btn-outline" onclick="app.renderAgendamentos()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>

        <form id="appointmentForm" data-is-edit="${isEdit}" data-appointment-id="${
      appointmentId || ""
    }">
          <!-- Passo 1: Cliente -->
          <div class="form-section">
            <h3>1. Cliente e Pet</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="clienteId">Cliente *</label>
                <select id="clienteId" name="clienteId" class="form-select" required>
                  <option value="">Selecione um cliente</option>
                  ${clients
                    .map(
                      (client) => `
                    <option value="${client.id}" ${
                        appointment?.clienteId === client.id ? "selected" : ""
                      }>
                      ${client.nomeCompleto}
                    </option>
                  `
                    )
                    .join("")}
                </select>
                <div class="form-help">
                  <button type="button" class="btn btn-sm btn-outline" onclick="app.showClientFormFromAppointment()">
                    <i class="icon-plus"></i> Cadastrar novo cliente
                  </button>
                </div>
                <div class="form-error" id="clienteId-error"></div>
              </div>
              <div class="form-group">
                <label for="petId">Pet (opcional)</label>
                <select id="petId" name="petId" class="form-select">
                  <option value="">Selecione um pet</option>
                </select>
                <div class="form-help">
                  <button type="button" class="btn btn-sm btn-outline" onclick="app.showPetFormFromAppointment()">
                    <i class="icon-plus"></i> Cadastrar novo pet
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Passo 2: Serviços -->
          <div class="form-section">
            <h3>2. Serviços</h3>
            <div class="form-group">
              <label>Selecione os serviços *</label>
              <div class="services-grid" id="servicesGrid">
                ${services
                  .map(
                    (service) => `
                  <div class="service-item">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="services" 
                        value="${service.id}"
                        data-preco="${service.preco}"
                        data-nome="${service.nome}"
                        ${
                          appointment?.itens?.some(
                            (item) => item.serviceId === service.id
                          )
                            ? "checked"
                            : ""
                        }
                      >
                      <span class="checkmark"></span>
                      <div class="service-info">
                        <strong>${service.nome}</strong>
                        <span class="service-price">${MoneyUtils.formatBRL(
                          service.preco
                        )}</span>
                      </div>
                    </label>
                  </div>
                `
                  )
                  .join("")}
              </div>
              <div class="form-error" id="services-error"></div>
            </div>
            <div class="total-preview" id="totalPreview">
              <strong>Total: <span id="totalValue">R$ 0,00</span></strong>
            </div>
          </div>

          <!-- Passo 3: Data/Hora e Profissional -->
          <div class="form-section">
            <h3>3. Data/Hora e Profissional</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="dataHoraInicio">Data e Hora de Início *</label>
                <input 
                  type="datetime-local" 
                  id="dataHoraInicio" 
                  name="dataHoraInicio" 
                  class="form-input" 
                  value="${
                    appointment
                      ? DateUtils.toISOStringDateTime(
                          appointment.dataHoraInicio
                        )
                      : ""
                  }"
                  required
                >
                <div class="form-error" id="dataHoraInicio-error"></div>
              </div>
              <div class="form-group required">
                <label for="duracaoMin">Duração (minutos) *</label>
                <input 
                  type="number" 
                  id="duracaoMin" 
                  name="duracaoMin" 
                  class="form-input" 
                  value="${appointment?.duracaoMin || 60}"
                  min="15"
                  step="15"
                  required
                >
                <div class="form-error" id="duracaoMin-error"></div>
              </div>
            </div>
            <div class="form-group">
              <label for="profissionalId">Profissional (opcional)</label>
              <select id="profissionalId" name="profissionalId" class="form-select">
                <option value="">Selecione um profissional</option>
                ${professionals
                  .map(
                    (prof) => `
                  <option value="${prof.id}" ${
                      appointment?.profissionalId === prof.id ? "selected" : ""
                    }>
                    ${prof.nome}
                  </option>
                `
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <!-- Passo 4: Pagamento -->
          <div class="form-section">
            <h3>4. Pagamento</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="paymentStatus">Status do Pagamento *</label>
                <select id="paymentStatus" name="paymentStatus" class="form-select" required>
                  <option value="nao_pago" ${
                    appointment?.pagamento?.status === "nao_pago"
                      ? "selected"
                      : ""
                  }>Não Pago</option>
                  <option value="previsto" ${
                    appointment?.pagamento?.status === "previsto"
                      ? "selected"
                      : ""
                  }>Será pago em</option>
                  <option value="pago" ${
                    appointment?.pagamento?.status === "pago" ? "selected" : ""
                  }>Pago agora</option>
                </select>
              </div>
              <div class="form-group" id="paymentMethodGroup" style="display: none;">
                <label for="paymentMethod">Método de Pagamento</label>
                <select id="paymentMethod" name="paymentMethod" class="form-select">
                  <option value="">Selecione</option>
                  <option value="PIX">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
            <div class="form-group" id="paymentDateGroup" style="display: none;">
              <label for="paymentDate">Data Prevista de Pagamento</label>
              <input 
                type="date" 
                id="paymentDate" 
                name="paymentDate" 
                class="form-input"
                value="${
                  appointment?.pagamento?.dataPrevista
                    ? DateUtils.toISOString(appointment.pagamento.dataPrevista)
                    : ""
                }"
              >
            </div>
          </div>

          <!-- Observações -->
          <div class="form-section">
            <h3>5. Observações</h3>
            <div class="form-group">
              <label for="observacoes">Observações</label>
              <textarea 
                id="observacoes" 
                name="observacoes" 
                class="form-input" 
                rows="3"
                placeholder="Observações sobre o agendamento..."
              >${appointment?.observacoes || ""}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.renderAgendamentos()">
              Cancelar
            </button>
            <button type="button" class="btn btn-outline" onclick="app.saveAppointmentAndNew()">
              Salvar e Novo
            </button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? "Atualizar" : "Salvar"} Agendamento
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
    await this.setupAppointmentFormEvents();
  }

  // Eventos do formulário de agendamento
  async setupAppointmentFormEvents() {
    const form = document.getElementById("appointmentForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isEdit = form.dataset.isEdit === "true";
        const appointmentId = form.dataset.appointmentId || null;
        this.saveAppointment(e, appointmentId);
      });
    }

    // Carregar pets quando cliente for selecionado
    const clienteSelect = document.getElementById("clienteId");
    if (clienteSelect) {
      clienteSelect.addEventListener("change", async (e) => {
        await this.loadPetsForClient(e.target.value);
      });
    }

    // Atualizar total quando serviços forem selecionados
    const serviceCheckboxes = document.querySelectorAll(
      'input[name="services"]'
    );
    serviceCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateAppointmentTotal();
      });
    });

    // Mostrar/ocultar campos de pagamento
    const paymentStatusSelect = document.getElementById("paymentStatus");
    if (paymentStatusSelect) {
      paymentStatusSelect.addEventListener("change", (e) => {
        this.togglePaymentFields(e.target.value);
      });
    }

    // Inicializar campos de pagamento
    if (paymentStatusSelect) {
      this.togglePaymentFields(paymentStatusSelect.value);
    }

    // Carregar pets se já houver cliente selecionado
    if (clienteSelect && clienteSelect.value) {
      await this.loadPetsForClient(clienteSelect.value);
    }

    // Atualizar total inicial
    this.updateAppointmentTotal();
  }

  // Carregar pets do cliente selecionado
  async loadPetsForClient(clienteId) {
    const petSelect = document.getElementById("petId");
    if (!petSelect || !clienteId) return;

    const pets = await store.getPets();
    const clientPets = pets.filter((pet) => pet.clienteId === clienteId);

    petSelect.innerHTML =
      '<option value="">Selecione um pet</option>' +
      clientPets
        .map(
          (pet) =>
            `<option value="${pet.id}">${pet.nome || "Sem nome"}</option>`
        )
        .join("");
  }

  // Atualizar total do agendamento
  updateAppointmentTotal() {
    const serviceCheckboxes = document.querySelectorAll(
      'input[name="services"]:checked'
    );
    let total = 0;

    serviceCheckboxes.forEach((checkbox) => {
      const preco = parseFloat(checkbox.dataset.preco) || 0;
      total += preco;
    });

    const totalElement = document.getElementById("totalValue");
    if (totalElement) {
      totalElement.textContent = MoneyUtils.formatBRL(total);
    }
  }

  // Mostrar/ocultar campos de pagamento
  togglePaymentFields(paymentStatus) {
    const methodGroup = document.getElementById("paymentMethodGroup");
    const dateGroup = document.getElementById("paymentDateGroup");
    const methodSelect = document.getElementById("paymentMethod");

    if (methodGroup && dateGroup && methodSelect) {
      if (paymentStatus === "pago") {
        methodGroup.style.display = "block";
        dateGroup.style.display = "none";
        methodSelect.required = true;
      } else if (paymentStatus === "previsto") {
        methodGroup.style.display = "none";
        dateGroup.style.display = "block";
        methodSelect.required = false;
      } else {
        methodGroup.style.display = "none";
        dateGroup.style.display = "none";
        methodSelect.required = false;
      }
    }
  }

  // Salvar agendamento
  async saveAppointment(event, appointmentId = null) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const selectedServices = Array.from(
      document.querySelectorAll('input[name="services"]:checked')
    );

    if (selectedServices.length === 0) {
      this.showFieldError("services", "Selecione pelo menos um serviço");
      return;
    }

    // Calcular total
    let totalPrevisto = 0;
    const itens = await Promise.all(
      selectedServices.map(async (checkbox) => {
        const serviceId = checkbox.value;
        const service = await store.getService(serviceId);
        const preco = parseFloat(checkbox.dataset.preco) || 0;
        totalPrevisto += preco;

        console.log("🔍 Serviço encontrado:", service);
        console.log("🔍 ServiceId:", serviceId);
        console.log("🔍 Preço:", preco);

        return {
          serviceId: serviceId,
          nome: service?.nome || "Serviço não encontrado",
          precoAplicado: preco,
          custoAproxAplicado: service?.temCusto
            ? service.custoAproximado
            : null,
        };
      })
    );

    console.log("🔍 Itens processados:", itens);

    const appointmentData = {
      clienteId: formData.get("clienteId"),
      petId: formData.get("petId") || null,
      itens: itens,
      totalPrevisto: totalPrevisto,
      dataHoraInicio: formData.get("dataHoraInicio"),
      duracaoMin: parseInt(formData.get("duracaoMin")),
      profissionalId: formData.get("profissionalId") || null,
      status: "pendente",
      pagamento: {
        status: formData.get("paymentStatus"),
        metodo: formData.get("paymentMethod") || null,
        dataPrevista: formData.get("paymentDate") || null,
        dataPago:
          formData.get("paymentStatus") === "pago"
            ? new Date().toISOString().split("T")[0]
            : null,
        valorPago: formData.get("paymentStatus") === "pago" ? totalPrevisto : 0,
      },
      observacoes: formData.get("observacoes") || "",
    };

    console.log("📅 Dados do agendamento antes de salvar:", appointmentData);

    // Validações
    if (!this.validateAppointment(appointmentData, appointmentId)) {
      return;
    }

    try {
      let savedAppointment;
      if (appointmentId) {
        savedAppointment = await store.saveAppointment({
          ...appointmentData,
          id: appointmentId,
        });
      } else {
        const newAppointmentId = store.generateId("app");
        savedAppointment = await store.saveAppointment({
          ...appointmentData,
          id: newAppointmentId,
        });
      }

      ui.success(
        appointmentId
          ? "Agendamento atualizado com sucesso!"
          : "Agendamento criado com sucesso!"
      );
      this.renderAgendamentos();
    } catch (error) {
      ui.error("Erro ao salvar agendamento: " + error.message);
    }
  }

  // Validar agendamento
  validateAppointment(appointmentData, appointmentId = null) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    // Cliente obrigatório
    if (!appointmentData.clienteId) {
      this.showFieldError("clienteId", "Cliente é obrigatório");
      isValid = false;
    }

    // Data/hora obrigatória
    if (!appointmentData.dataHoraInicio) {
      this.showFieldError("dataHoraInicio", "Data e hora são obrigatórias");
      isValid = false;
    }

    // Duração obrigatória
    if (!appointmentData.duracaoMin || appointmentData.duracaoMin <= 0) {
      this.showFieldError("duracaoMin", "Duração deve ser maior que zero");
      isValid = false;
    }

    // Validação de pagamento
    if (
      appointmentData.pagamento.status === "pago" &&
      !appointmentData.pagamento.metodo
    ) {
      this.showFieldError(
        "paymentMethod",
        "Método de pagamento é obrigatório quando pago"
      );
      isValid = false;
    }

    if (
      appointmentData.pagamento.status === "previsto" &&
      !appointmentData.pagamento.dataPrevista
    ) {
      this.showFieldError(
        "paymentDate",
        "Data prevista é obrigatória quando status é 'Será pago em'"
      );
      isValid = false;
    }

    return isValid;
  }

  // Salvar e criar novo
  async saveAppointmentAndNew() {
    const form = document.getElementById("appointmentForm");
    const formData = new FormData(form);
    const selectedServices = Array.from(
      document.querySelectorAll('input[name="services"]:checked')
    );

    if (selectedServices.length === 0) {
      this.showFieldError("services", "Selecione pelo menos um serviço");
      return;
    }

    // Calcular total
    let totalPrevisto = 0;
    const itens = await Promise.all(
      selectedServices.map(async (checkbox) => {
        const serviceId = checkbox.value;
        const service = await store.getService(serviceId);
        const preco = parseFloat(checkbox.dataset.preco) || 0;
        totalPrevisto += preco;

        console.log("🔍 Serviço encontrado:", service);
        console.log("🔍 ServiceId:", serviceId);
        console.log("🔍 Preço:", preco);

        return {
          serviceId: serviceId,
          nome: service?.nome || "Serviço não encontrado",
          precoAplicado: preco,
          custoAproxAplicado: service?.temCusto
            ? service.custoAproximado
            : null,
        };
      })
    );

    console.log("🔍 Itens processados:", itens);

    const appointmentData = {
      clienteId: formData.get("clienteId"),
      petId: formData.get("petId") || null,
      itens: itens,
      totalPrevisto: totalPrevisto,
      dataHoraInicio: formData.get("dataHoraInicio"),
      duracaoMin: parseInt(formData.get("duracaoMin")),
      profissionalId: formData.get("profissionalId") || null,
      status: "pendente",
      pagamento: {
        status: formData.get("paymentStatus"),
        metodo: formData.get("paymentMethod") || null,
        dataPrevista: formData.get("paymentDate") || null,
        dataPago:
          formData.get("paymentStatus") === "pago"
            ? new Date().toISOString().split("T")[0]
            : null,
        valorPago: formData.get("paymentStatus") === "pago" ? totalPrevisto : 0,
      },
      observacoes: formData.get("observacoes") || "",
    };

    if (!this.validateAppointment(appointmentData)) {
      return;
    }

    try {
      const newAppointmentId = store.generateId("app");
      await store.saveAppointment({ ...appointmentData, id: newAppointmentId });
      ui.success("Agendamento criado com sucesso!");
      await this.showAppointmentForm(); // Abrir formulário limpo
    } catch (error) {
      ui.error("Erro ao salvar agendamento: " + error.message);
    }
  }

  // Ações de agendamento
  editAppointment(appointmentId) {
    this.showAppointmentForm(appointmentId);
  }

  async viewAppointment(appointmentId) {
    const appointment = await store.getAppointment(appointmentId);
    if (!appointment) return;

    const client = await store.getClient(appointment.clienteId);
    const pet = appointment.petId
      ? await store.getPet(appointment.petId)
      : null;
    const professional = appointment.profissionalId
      ? await store.getProfessional(appointment.profissionalId)
      : null;

    const content = `
      <div class="detail-container">
        <div class="detail-header">
          <h2>Detalhes do Agendamento</h2>
          <button class="btn btn-outline" onclick="app.renderAgendamentos()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h3>Informações Gerais</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Data e Hora</label>
                <p>${DateUtils.formatDateTime(appointment.dataHoraInicio)}</p>
              </div>
              <div class="detail-item">
                <label>Duração</label>
                <p>${appointment.duracaoMin} minutos</p>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <p>${this.getStatusBadge(appointment.status)}</p>
              </div>
              <div class="detail-item">
                <label>Pagamento</label>
                <p>${this.getPaymentBadge(appointment.pagamento)}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Cliente e Pet</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Cliente</label>
                <p>
                  <span class="clickable-name" onclick="app.viewClient('${
                    appointment.clienteId
                  }')" title="Ver cliente">
                    ${client?.nomeCompleto || "Cliente não encontrado"}
                  </span>
                </p>
              </div>
              ${
                pet
                  ? `
                <div class="detail-item">
                  <label>Pet</label>
                  <p>
                    <span class="clickable-name" onclick="app.viewPet('${
                      pet.id
                    }')" title="Ver pet">
                      ${pet.nome || "Sem nome"}
                    </span>
                  </p>
                </div>
              `
                  : ""
              }
              ${
                professional
                  ? `
                <div class="detail-item">
                  <label>Profissional</label>
                  <p>${professional.nome}</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="detail-section">
            <h3>Serviços</h3>
            <div class="services-list">
              ${appointment.itens
                .map(
                  (item) => `
                <div class="service-item">
                  <div class="service-name">${item.nome}</div>
                  <div class="service-price">${MoneyUtils.formatBRL(
                    item.precoAplicado
                  )}</div>
                </div>
              `
                )
                .join("")}
              <div class="service-total">
                <strong>Total: ${MoneyUtils.formatBRL(
                  appointment.totalPrevisto
                )}</strong>
              </div>
            </div>
          </div>

          ${
            appointment.observacoes
              ? `
            <div class="detail-section">
              <h3>Observações</h3>
              <p>${appointment.observacoes}</p>
            </div>
          `
              : ""
          }

          <div class="detail-actions">
            <button class="btn btn-outline" onclick="app.editAppointment('${appointmentId}')">
              <i class="icon-edit"></i> Editar
            </button>
            ${
              appointment.pagamento.status !== "pago"
                ? `
              <button class="btn btn-success" onclick="app.markAppointmentPaid('${appointmentId}')">
                <i class="icon-check"></i> Marcar como Pago
              </button>
            `
                : ""
            }
            <button class="btn btn-danger" onclick="app.cancelAppointment('${appointmentId}')">
              <i class="icon-x"></i> Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("content").innerHTML = content;
  }

  async markAppointmentPaid(appointmentId) {
    const appointment = await store.getAppointment(appointmentId);
    if (!appointment) return;

    const confirmed = await ui.confirm(
      `Marcar agendamento como pago?\n\nCliente: ${
        store.getClient(appointment.clienteId)?.nomeCompleto
      }\nTotal: ${MoneyUtils.formatBRL(appointment.totalPrevisto)}`,
      "Confirmar Pagamento",
      { type: "success" }
    );

    if (confirmed) {
      try {
        const updatedAppointment = {
          ...appointment,
          pagamento: {
            ...appointment.pagamento,
            status: "pago",
            dataPago: new Date().toISOString().split("T")[0],
            valorPago: appointment.totalPrevisto,
          },
        };

        await store.saveAppointment(updatedAppointment);
        ui.success("Agendamento marcado como pago!");
        await this.renderAgendamentos();
      } catch (error) {
        ui.error("Erro ao marcar como pago: " + error.message);
      }
    }
  }

  async cancelAppointment(appointmentId) {
    const appointment = await store.getAppointment(appointmentId);
    if (!appointment) return;

    const confirmed = await ui.confirm(
      `Cancelar agendamento?\n\nCliente: ${
        store.getClient(appointment.clienteId)?.nomeCompleto
      }\nData: ${DateUtils.formatDateTime(appointment.dataHoraInicio)}`,
      "Confirmar Cancelamento",
      { type: "danger" }
    );

    if (confirmed) {
      try {
        const updatedAppointment = {
          ...appointment,
          status: "cancelado",
        };

        await store.saveAppointment(updatedAppointment);
        ui.success("Agendamento cancelado!");
        await this.renderAgendamentos();
      } catch (error) {
        ui.error("Erro ao cancelar agendamento: " + error.message);
      }
    }
  }

  // Eventos de agendamentos
  setupAppointmentEvents() {
    // Busca
    const searchInput = document.getElementById("appointmentSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterAppointments();
      });
    }

    // Filtros
    const statusFilter = document.getElementById("appointmentStatusFilter");
    const paymentFilter = document.getElementById("appointmentPaymentFilter");
    const dateFilter = document.getElementById("appointmentDateFilter");

    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this.filterAppointments();
      });
    }

    if (paymentFilter) {
      paymentFilter.addEventListener("change", () => {
        this.filterAppointments();
      });
    }

    if (dateFilter) {
      dateFilter.addEventListener("change", () => {
        this.filterAppointments();
      });
    }
  }

  // Filtrar agendamentos
  async filterAppointments() {
    const appointments = await store.getAppointments();
    const searchTerm =
      document.getElementById("appointmentSearch")?.value.toLowerCase() || "";
    const statusFilter =
      document.getElementById("appointmentStatusFilter")?.value || "";
    const paymentFilter =
      document.getElementById("appointmentPaymentFilter")?.value || "";
    const dateFilter =
      document.getElementById("appointmentDateFilter")?.value || "";

    const filtered = appointments.filter((appointment) => {
      const client = store.getClient(appointment.clienteId);
      const pet = appointment.petId ? store.getPet(appointment.petId) : null;

      // Busca por texto
      const matchesSearch =
        !searchTerm ||
        client?.nomeCompleto?.toLowerCase().includes(searchTerm) ||
        pet?.nome?.toLowerCase().includes(searchTerm) ||
        appointment.itens.some((item) =>
          item.nome.toLowerCase().includes(searchTerm)
        );

      // Filtro por status
      const matchesStatus =
        !statusFilter || appointment.status === statusFilter;

      // Filtro por pagamento
      const matchesPayment =
        !paymentFilter || appointment.pagamento.status === paymentFilter;

      // Filtro por data
      const matchesDate =
        !dateFilter ||
        DateUtils.isSameDay(appointment.dataHoraInicio, dateFilter);

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderAppointmentsTable(filtered);
  }

  // Alternar visualização (lista/calendário)
  switchAppointmentView(view) {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    if (view === "list") {
      document
        .querySelector('.tab-btn[onclick*="list"]')
        .classList.add("active");
      // Implementar visualização de lista (já implementada)
    } else if (view === "calendar") {
      document
        .querySelector('.tab-btn[onclick*="calendar"]')
        .classList.add("active");
      this.renderAppointmentCalendar();
    }
  }

  // Renderizar calendário de agendamentos
  async renderAppointmentCalendar() {
    const appointments = await store.getAppointments();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const weeks = DateUtils.getWeeksInMonth(today);

    const content = `
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="btn btn-outline" onclick="app.previousMonth()">
            <i class="icon-arrow-left"></i>
          </button>
          <h3>${DateUtils.getMonthName(today)} ${currentYear}</h3>
          <button class="btn btn-outline" onclick="app.nextMonth()">
            <i class="icon-arrow-right"></i>
          </button>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div class="weekday">Dom</div>
            <div class="weekday">Seg</div>
            <div class="weekday">Ter</div>
            <div class="weekday">Qua</div>
            <div class="weekday">Qui</div>
            <div class="weekday">Sex</div>
            <div class="weekday">Sáb</div>
          </div>
          
          <div class="calendar-days">
            ${weeks
              .map(
                (week) => `
              <div class="calendar-week">
                ${week
                  .map((day) => {
                    if (!day) return '<div class="calendar-day empty"></div>';

                    const dayAppointments = appointments.filter((apt) =>
                      DateUtils.isSameDay(apt.dataHoraInicio, day)
                    );

                    const isToday = DateUtils.isSameDay(day, new Date());

                    return `
                    <div class="calendar-day ${
                      isToday ? "today" : ""
                    }" onclick="app.showDayAppointments('${day.toISOString()}')">
                      <div class="day-number">${day.getDate()}</div>
                      <div class="day-appointments">
                        ${dayAppointments
                          .slice(0, 3)
                          .map((apt) => {
                            const client = store.getClient(apt.clienteId);
                            return `
                            <div class="appointment-mini ${
                              apt.status
                            }" title="${
                              client?.nomeCompleto
                            } - ${DateUtils.formatTime(apt.dataHoraInicio)}">
                              ${DateUtils.formatTime(apt.dataHoraInicio)} ${
                              client?.nomeCompleto?.split(" ")[0] || ""
                            }
                            </div>
                          `;
                          })
                          .join("")}
                        ${
                          dayAppointments.length > 3
                            ? `<div class="more-appointments">+${
                                dayAppointments.length - 3
                              } mais</div>`
                            : ""
                        }
                      </div>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    const container = document.querySelector(".data-container");
    container.innerHTML = content;
  }

  // ===== PRONTUÁRIOS VETERINÁRIOS =====
  renderProntuarios() {
    const content = document.getElementById("content");
    const prontuarios = store.getProntuarios();

    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Prontuários Veterinários</h1>
          <p>Controle dermatológico e histórico médico dos pets</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="app.showProntuarioForm()">
            <i class="icon-plus"></i> Novo Prontuário
          </button>
        </div>
      </div>

      <div class="page-filters">
        <div class="search-box">
          <input 
            type="text" 
            id="prontuarioSearch" 
            placeholder="Buscar por pet, cliente ou diagnóstico..."
            class="form-input"
          >
          <i class="icon-search"></i>
        </div>
        <div class="filter-actions">
          <select id="prontuarioPetFilter" class="form-select">
            <option value="">Todos os pets</option>
            ${store
              .getPets()
              .map(
                (pet) => `
              <option value="${pet.id}">${pet.nome} - ${
                  store.getClient(pet.clienteId)?.nomeCompleto ||
                  "Cliente não encontrado"
                }</option>
            `
              )
              .join("")}
          </select>
          <input 
            type="date" 
            id="prontuarioDateFilter" 
            class="form-input"
            title="Filtrar por data"
          >
        </div>
      </div>

      <div class="data-container">
        ${this.renderProntuariosTable(prontuarios)}
      </div>
    `;

    this.setupProntuarioEvents();
  }

  renderProntuariosTable(prontuarios) {
    if (prontuarios.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🏥</div>
          <h3>Nenhum prontuário encontrado</h3>
          <p>Comece criando o primeiro prontuário veterinário para acompanhar a saúde dos pets.</p>
          <button class="btn btn-primary" onclick="app.showProntuarioForm()">
            <i class="icon-plus"></i> Criar Primeiro Prontuário
          </button>
        </div>
      `;
    }

    return `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pet</th>
              <th>Cliente</th>
              <th>Diagnóstico</th>
              <th>Evolução</th>
              <th>Fotos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${prontuarios
              .map((prontuario) => {
                const pet = store.getPet(prontuario.petId);
                const client = pet ? store.getClient(pet.clienteId) : null;
                const evolucaoBadge = this.getEvolucaoBadge(
                  prontuario.evolucao
                );

                return `
                <tr>
                  <td class="prontuario-date">${new Date(
                    prontuario.dataConsulta
                  ).toLocaleDateString("pt-BR")}</td>
                  <td class="prontuario-pet clickable-name" onclick="app.viewPet('${
                    prontuario.petId
                  }')">
                    ${pet ? pet.nome : "Pet não encontrado"}
                  </td>
                  <td class="prontuario-client clickable-name" onclick="app.viewClient('${
                    client?.id
                  }')">
                    ${client ? client.nomeCompleto : "Cliente não encontrado"}
                  </td>
                  <td class="prontuario-diagnostico">${
                    prontuario.diagnostico || "-"
                  }</td>
                  <td>${evolucaoBadge}</td>
                  <td class="prontuario-fotos">
                    <span class="photo-count">${
                      prontuario.fotos ? prontuario.fotos.length : 0
                    } foto(s)</span>
                  </td>
                  <td class="table-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.viewProntuario('${
                      prontuario.id
                    }')" title="Ver detalhes">
                      <i class="icon-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="app.editProntuario('${
                      prontuario.id
                    }')" title="Editar">
                      <i class="icon-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteProntuario('${
                      prontuario.id
                    }')" title="Excluir">
                      <i class="icon-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  getEvolucaoBadge(evolucao) {
    const badges = {
      pior: '<span class="badge badge-danger">Pior</span>',
      igual: '<span class="badge badge-warning">Igual</span>',
      melhor: '<span class="badge badge-success">Melhor</span>',
      primeira: '<span class="badge badge-info">Primeira consulta</span>',
    };
    return badges[evolucao] || '<span class="badge badge-secondary">-</span>';
  }

  async showProntuarioForm(prontuarioId = null) {
    const content = document.getElementById("content");
    const prontuario = prontuarioId
      ? await store.getProntuario(prontuarioId)
      : null;
    const pets = await store.getPets();

    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>${prontuario ? "Editar Prontuário" : "Novo Prontuário"}</h1>
          <p>Registre a consulta dermatológica do pet</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="app.renderProntuarios()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
        </div>
      </div>

      <form id="prontuarioForm" data-is-edit="${!!prontuario}" ${
      prontuario ? `data-prontuario-id="${prontuario.id}"` : ""
    }>
        <div class="form-container">
          <div class="form-section">
            <h3>Dados da Consulta</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="prontuarioPetId">Pet *</label>
                <select id="prontuarioPetId" name="petId" class="form-select" required>
                  <option value="">Selecione o pet</option>
                  ${pets
                    .map((pet) => {
                      const client = store.getClient(pet.clienteId);
                      return `
                      <option value="${pet.id}" ${
                        prontuario?.petId === pet.id ? "selected" : ""
                      }>
                        ${pet.nome} - ${
                        client?.nomeCompleto || "Cliente não encontrado"
                      }
                      </option>
                    `;
                    })
                    .join("")}
                </select>
                <div class="form-error" id="prontuarioPetId-error"></div>
              </div>
              <div class="form-group required">
                <label for="prontuarioDataConsulta">Data da Consulta *</label>
                <input 
                  type="date" 
                  id="prontuarioDataConsulta" 
                  name="dataConsulta" 
                  class="form-input" 
                  value="${
                    prontuario?.dataConsulta
                      ? new Date(prontuario.dataConsulta)
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }"
                  required
                >
                <div class="form-error" id="prontuarioDataConsulta-error"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="prontuarioDiagnostico">Diagnóstico</label>
              <textarea 
                id="prontuarioDiagnostico" 
                name="diagnostico" 
                class="form-input" 
                rows="3"
                placeholder="Descreva o diagnóstico dermatológico..."
              >${prontuario?.diagnostico || ""}</textarea>
            </div>

            <div class="form-group">
              <label for="prontuarioTratamento">Tratamento Prescrito</label>
              <textarea 
                id="prontuarioTratamento" 
                name="tratamento" 
                class="form-input" 
                rows="3"
                placeholder="Descreva o tratamento prescrito..."
              >${prontuario?.tratamento || ""}</textarea>
            </div>

            <div class="form-group">
              <label for="prontuarioObservacoes">Observações</label>
              <textarea 
                id="prontuarioObservacoes" 
                name="observacoes" 
                class="form-input" 
                rows="3"
                placeholder="Observações adicionais..."
              >${prontuario?.observacoes || ""}</textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Avaliação de Evolução</h3>
            <div class="form-group">
              <label for="prontuarioEvolucao">Como está em relação à última consulta?</label>
              <select id="prontuarioEvolucao" name="evolucao" class="form-select">
                <option value="primeira" ${
                  prontuario?.evolucao === "primeira" ? "selected" : ""
                }>Primeira consulta</option>
                <option value="pior" ${
                  prontuario?.evolucao === "pior" ? "selected" : ""
                }>Pior que a última</option>
                <option value="igual" ${
                  prontuario?.evolucao === "igual" ? "selected" : ""
                }>Igual à última</option>
                <option value="melhor" ${
                  prontuario?.evolucao === "melhor" ? "selected" : ""
                }>Melhor que a última</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h3>Fotos da Consulta</h3>
            <div class="form-group">
              <label for="prontuarioFotos">Adicionar Fotos</label>
              <input 
                type="file" 
                id="prontuarioFotos" 
                name="fotos" 
                class="form-input" 
                multiple 
                accept="image/*"
              >
              <div class="form-help">Selecione uma ou mais fotos da condição dermatológica</div>
            </div>
            
            <div id="fotosPreview" class="fotos-preview">
              ${
                prontuario?.fotos
                  ? this.renderFotosPreview(prontuario.fotos)
                  : ""
              }
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.renderProntuarios()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              ${prontuario ? "Atualizar Prontuário" : "Salvar Prontuário"}
            </button>
          </div>
        </div>
      </form>
    `;

    this.setupProntuarioFormEvents();
  }

  renderFotosPreview(fotos) {
    if (!fotos || fotos.length === 0) return "";

    return `
      <div class="fotos-grid">
        ${fotos
          .map(
            (foto, index) => `
          <div class="foto-item">
            <img src="${foto}" alt="Foto ${index + 1}" class="foto-thumbnail">
            <button type="button" class="btn btn-sm btn-danger foto-remove" onclick="app.removeFoto(${index})">
              <i class="icon-x"></i>
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  setupProntuarioFormEvents() {
    const form = document.getElementById("prontuarioForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveProntuario(e);
      });
    }

    // Preview de fotos
    const fotoInput = document.getElementById("prontuarioFotos");
    if (fotoInput) {
      fotoInput.addEventListener("change", (e) => {
        this.handleFotoUpload(e);
      });
    }
  }

  handleFotoUpload(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById("fotosPreview");

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fotoItem = document.createElement("div");
          fotoItem.className = "foto-item";
          fotoItem.innerHTML = `
            <img src="${e.target.result}" alt="Nova foto" class="foto-thumbnail">
            <button type="button" class="btn btn-sm btn-danger foto-remove" onclick="this.parentElement.remove()">
              <i class="icon-x"></i>
            </button>
          `;
          preview.appendChild(fotoItem);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  async saveProntuario(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const isEdit = event.target.dataset.isEdit === "true";
    const prontuarioId = event.target.dataset.prontuarioId;

    // Coletar fotos do preview
    const fotos = [];
    const fotoItems = document.querySelectorAll(".foto-item img");
    fotoItems.forEach((img) => {
      if (img.src.startsWith("data:")) {
        fotos.push(img.src);
      }
    });

    const prontuarioData = {
      petId: formData.get("petId"),
      dataConsulta: formData.get("dataConsulta"),
      diagnostico: formData.get("diagnostico"),
      tratamento: formData.get("tratamento"),
      observacoes: formData.get("observacoes"),
      evolucao: formData.get("evolucao"),
      fotos: fotos,
    };

    // Validações
    if (!this.validateProntuario(prontuarioData)) {
      return;
    }

    try {
      let savedProntuario;
      if (isEdit) {
        savedProntuario = store.saveProntuario({
          ...prontuarioData,
          id: prontuarioId,
        });
      } else {
        const newProntuarioId = store.generateId("prontuario");
        savedProntuario = store.saveProntuario({
          ...prontuarioData,
          id: newProntuarioId,
        });
      }

      ui.success(
        isEdit
          ? "Prontuário atualizado com sucesso!"
          : "Prontuário criado com sucesso!"
      );

      this.renderProntuarios();
    } catch (error) {
      ui.error("Erro ao salvar prontuário: " + error.message);
    }
  }

  validateProntuario(prontuarioData) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    // Pet obrigatório
    if (!prontuarioData.petId) {
      this.showFieldError("prontuarioPetId", "Selecione um pet");
      isValid = false;
    }

    // Data obrigatória
    if (!prontuarioData.dataConsulta) {
      this.showFieldError(
        "prontuarioDataConsulta",
        "Data da consulta é obrigatória"
      );
      isValid = false;
    }

    return isValid;
  }

  viewProntuario(prontuarioId) {
    const prontuario = store.getProntuario(prontuarioId);
    if (!prontuario) {
      ui.error("Prontuário não encontrado");
      return;
    }

    const pet = store.getPet(prontuario.petId);
    const client = pet ? store.getClient(pet.clienteId) : null;

    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Prontuário Veterinário</h1>
          <p>Consulta de ${new Date(prontuario.dataConsulta).toLocaleDateString(
            "pt-BR"
          )}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="app.renderProntuarios()">
            <i class="icon-arrow-left"></i> Voltar
          </button>
          <button class="btn btn-primary" onclick="app.editProntuario('${
            prontuario.id
          }')">
            <i class="icon-edit"></i> Editar
          </button>
        </div>
      </div>

      <div class="prontuario-details">
        <div class="prontuario-info">
          <div class="info-section">
            <h3>Dados da Consulta</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Pet:</label>
                <span class="clickable-name" onclick="app.viewPet('${
                  prontuario.petId
                }')">
                  ${pet ? pet.nome : "Pet não encontrado"}
                </span>
              </div>
              <div class="info-item">
                <label>Cliente:</label>
                <span class="clickable-name" onclick="app.viewClient('${
                  client?.id
                }')">
                  ${client ? client.nomeCompleto : "Cliente não encontrado"}
                </span>
              </div>
              <div class="info-item">
                <label>Data:</label>
                <span>${new Date(prontuario.dataConsulta).toLocaleDateString(
                  "pt-BR"
                )}</span>
              </div>
              <div class="info-item">
                <label>Evolução:</label>
                <span>${this.getEvolucaoBadge(prontuario.evolucao)}</span>
              </div>
            </div>
          </div>

          ${
            prontuario.diagnostico
              ? `
            <div class="info-section">
              <h3>Diagnóstico</h3>
              <p>${prontuario.diagnostico}</p>
            </div>
          `
              : ""
          }

          ${
            prontuario.tratamento
              ? `
            <div class="info-section">
              <h3>Tratamento</h3>
              <p>${prontuario.tratamento}</p>
            </div>
          `
              : ""
          }

          ${
            prontuario.observacoes
              ? `
            <div class="info-section">
              <h3>Observações</h3>
              <p>${prontuario.observacoes}</p>
            </div>
          `
              : ""
          }

          ${
            prontuario.fotos && prontuario.fotos.length > 0
              ? `
            <div class="info-section">
              <h3>Fotos da Consulta</h3>
              <div class="fotos-gallery">
                ${prontuario.fotos
                  .map(
                    (foto, index) => `
                  <div class="foto-gallery-item">
                    <img src="${foto}" alt="Foto ${
                      index + 1
                    }" class="foto-gallery-img" onclick="app.openFotoModal('${foto}')">
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  editProntuario(prontuarioId) {
    this.showProntuarioForm(prontuarioId);
  }

  deleteProntuario(prontuarioId) {
    if (confirm("Tem certeza que deseja excluir este prontuário?")) {
      try {
        store.deleteProntuario(prontuarioId);
        ui.success("Prontuário excluído com sucesso!");
        this.renderProntuarios();
      } catch (error) {
        ui.error("Erro ao excluir prontuário: " + error.message);
      }
    }
  }

  setupProntuarioEvents() {
    // Busca
    const searchInput = document.getElementById("prontuarioSearch");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.filterProntuarios();
      });
    }

    // Filtros
    const petFilter = document.getElementById("prontuarioPetFilter");
    if (petFilter) {
      petFilter.addEventListener("change", () => {
        this.filterProntuarios();
      });
    }

    const dateFilter = document.getElementById("prontuarioDateFilter");
    if (dateFilter) {
      dateFilter.addEventListener("change", () => {
        this.filterProntuarios();
      });
    }
  }

  filterProntuarios() {
    const searchTerm =
      document.getElementById("prontuarioSearch")?.value.toLowerCase() || "";
    const petFilter =
      document.getElementById("prontuarioPetFilter")?.value || "";
    const dateFilter =
      document.getElementById("prontuarioDateFilter")?.value || "";

    let prontuarios = store.getProntuarios();

    // Filtro por busca
    if (searchTerm) {
      prontuarios = prontuarios.filter((prontuario) => {
        const pet = store.getPet(prontuario.petId);
        const client = pet ? store.getClient(pet.clienteId) : null;
        return (
          pet?.nome?.toLowerCase().includes(searchTerm) ||
          client?.nomeCompleto?.toLowerCase().includes(searchTerm) ||
          prontuario.diagnostico?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filtro por pet
    if (petFilter) {
      prontuarios = prontuarios.filter(
        (prontuario) => prontuario.petId === petFilter
      );
    }

    // Filtro por data
    if (dateFilter) {
      prontuarios = prontuarios.filter((prontuario) =>
        prontuario.dataConsulta.startsWith(dateFilter)
      );
    }

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderProntuariosTable(prontuarios);
  }

  // Métodos auxiliares para prontuários
  async showProntuarioFormForPet(petId) {
    const content = document.getElementById("content");
    const pet = await store.getPet(petId);
    const pets = await store.getPets();

    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">
          <h1>Novo Prontuário</h1>
          <p>Registre a consulta dermatológica de ${pet?.nome || "o pet"}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="app.viewPet('${petId}')">
            <i class="icon-arrow-left"></i> Voltar ao Pet
          </button>
        </div>
      </div>

      <form id="prontuarioForm" data-is-edit="false">
        <div class="form-container">
          <div class="form-section">
            <h3>Dados da Consulta</h3>
            <div class="form-row">
              <div class="form-group required">
                <label for="prontuarioPetId">Pet *</label>
                <select id="prontuarioPetId" name="petId" class="form-select" required>
                  <option value="">Selecione o pet</option>
                  ${pets
                    .map((p) => {
                      const client = store.getClient(p.clienteId);
                      return `
                      <option value="${p.id}" ${
                        p.id === petId ? "selected" : ""
                      }>
                        ${p.nome} - ${
                        client?.nomeCompleto || "Cliente não encontrado"
                      }
                      </option>
                    `;
                    })
                    .join("")}
                </select>
                <div class="form-error" id="prontuarioPetId-error"></div>
              </div>
              <div class="form-group required">
                <label for="prontuarioDataConsulta">Data da Consulta *</label>
                <input 
                  type="date" 
                  id="prontuarioDataConsulta" 
                  name="dataConsulta" 
                  class="form-input" 
                  value="${new Date().toISOString().split("T")[0]}"
                  required
                >
                <div class="form-error" id="prontuarioDataConsulta-error"></div>
              </div>
            </div>

            <div class="form-group">
              <label for="prontuarioDiagnostico">Diagnóstico</label>
              <textarea 
                id="prontuarioDiagnostico" 
                name="diagnostico" 
                class="form-input" 
                rows="3"
                placeholder="Descreva o diagnóstico dermatológico..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="prontuarioTratamento">Tratamento Prescrito</label>
              <textarea 
                id="prontuarioTratamento" 
                name="tratamento" 
                class="form-input" 
                rows="3"
                placeholder="Descreva o tratamento prescrito..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="prontuarioObservacoes">Observações</label>
              <textarea 
                id="prontuarioObservacoes" 
                name="observacoes" 
                class="form-input" 
                rows="3"
                placeholder="Observações adicionais..."
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Avaliação de Evolução</h3>
            <div class="form-group">
              <label for="prontuarioEvolucao">Como está em relação à última consulta?</label>
              <select id="prontuarioEvolucao" name="evolucao" class="form-select">
                <option value="primeira">Primeira consulta</option>
                <option value="pior">Pior que a última</option>
                <option value="igual">Igual à última</option>
                <option value="melhor">Melhor que a última</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h3>Fotos da Consulta</h3>
            <div class="form-group">
              <label for="prontuarioFotos">Adicionar Fotos</label>
              <input 
                type="file" 
                id="prontuarioFotos" 
                name="fotos" 
                class="form-input" 
                multiple 
                accept="image/*"
              >
              <div class="form-help">Selecione uma ou mais fotos da condição dermatológica</div>
            </div>
            
            <div id="fotosPreview" class="fotos-preview"></div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="app.viewPet('${petId}')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Salvar Prontuário
            </button>
          </div>
        </div>
      </form>
    `;

    this.setupProntuarioFormEvents();
  }

  async renderPetProntuarios(petId) {
    const prontuarios = await store.getProntuariosByPet(petId);

    if (prontuarios.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🏥</div>
          <p>Nenhum prontuário encontrado</p>
          <button class="btn btn-primary btn-sm" onclick="app.showProntuarioFormForPet('${petId}')">
            <i class="icon-plus"></i> Criar Primeiro Prontuário
          </button>
        </div>
      `;
    }

    return `
      <div class="prontuarios-list">
        ${prontuarios
          .map(
            (prontuario) => `
          <div class="prontuario-item">
            <div class="prontuario-header">
              <div class="prontuario-date">
                ${new Date(prontuario.dataConsulta).toLocaleDateString("pt-BR")}
              </div>
              <div class="prontuario-evolucao">
                ${this.getEvolucaoBadge(prontuario.evolucao)}
              </div>
            </div>
            <div class="prontuario-content">
              ${
                prontuario.diagnostico
                  ? `
                <div class="prontuario-field">
                  <strong>Diagnóstico:</strong> ${prontuario.diagnostico}
                </div>
              `
                  : ""
              }
              ${
                prontuario.tratamento
                  ? `
                <div class="prontuario-field">
                  <strong>Tratamento:</strong> ${prontuario.tratamento}
                </div>
              `
                  : ""
              }
              ${
                prontuario.fotos && prontuario.fotos.length > 0
                  ? `
                <div class="prontuario-field">
                  <strong>Fotos:</strong> ${prontuario.fotos.length} foto(s)
                </div>
              `
                  : ""
              }
            </div>
            <div class="prontuario-actions">
              <button class="btn btn-sm btn-outline" onclick="app.viewProntuario('${
                prontuario.id
              }')">
                <i class="icon-eye"></i> Ver
              </button>
              <button class="btn btn-sm btn-primary" onclick="app.editProntuario('${
                prontuario.id
              }')">
                <i class="icon-edit"></i> Editar
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // Formulário de cliente a partir de agendamento
  showClientFormFromAppointment() {
    // Criar modal simples para teste
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 0;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        ">
          <h3 style="margin: 0; color: #111827; font-size: 1.25rem;">Novo Cliente</h3>
          <button onclick="app.closeModal()" style="
            background: none;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 0.5rem;
            cursor: pointer;
            color: #6b7280;
          ">✕</button>
        </div>
        
        <form id="clientFormFromAppointment" style="padding: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome Completo *</label>
            <input 
              type="text" 
              id="clientNomeCompleto" 
              name="nomeCompleto" 
              required
              placeholder="Digite o nome completo do cliente"
              style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 1rem;
                box-sizing: border-box;
              "
            >
            <div id="clientNomeCompleto-error" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;"></div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">WhatsApp</label>
              <input 
                type="text" 
                id="clientTelefoneWhatsApp" 
                name="telefoneWhatsApp" 
                placeholder="(41) 99999-9999"
                style="
                  width: 100%;
                  padding: 0.75rem;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  font-size: 1rem;
                  box-sizing: border-box;
                "
              >
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Email</label>
              <input 
                type="email" 
                id="clientEmail" 
                name="email" 
                placeholder="cliente@email.com"
                style="
                  width: 100%;
                  padding: 0.75rem;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  font-size: 1rem;
                  box-sizing: border-box;
                "
              >
            </div>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
            <button type="button" onclick="app.closeModal()" style="
              background: none;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 0.75rem 1.5rem;
              cursor: pointer;
              color: #374151;
            ">Cancelar</button>
            <button type="submit" style="
              background: #3b82f6;
              border: none;
              border-radius: 6px;
              padding: 0.75rem 1.5rem;
              cursor: pointer;
              color: white;
              font-weight: 500;
            ">Salvar e Selecionar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Configurar eventos do formulário
    const form = document.getElementById("clientFormFromAppointment");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveClientFromAppointment(e);
      });
    }
  }

  // Salvar cliente a partir de agendamento
  async saveClientFromAppointment(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const clientData = {
      nomeCompleto: formData.get("nomeCompleto").trim(),
      telefoneWhatsApp: formData.get("telefoneWhatsApp").trim(),
      email: formData.get("email").trim(),
      cpf: formData.get("cpf").trim(),
      dataNascimento: formData.get("dataNascimento") || null,
      observacoes: formData.get("observacoes").trim(),
    };

    // Validações
    if (!this.validateClientFromAppointment(clientData)) {
      return;
    }

    try {
      const newClientId = store.generateId("cli");
      const savedClient = await store.saveClient({
        ...clientData,
        id: newClientId,
      });

      ui.success("Cliente criado com sucesso!");

      // Fechar modal
      this.closeModal();

      // Atualizar select de clientes e selecionar o novo cliente
      this.updateClientSelectAndSelect(newClientId);
    } catch (error) {
      ui.error("Erro ao salvar cliente: " + error.message);
    }
  }

  // Validar cliente a partir de agendamento
  validateClientFromAppointment(clientData) {
    let isValid = true;

    // Limpar erros anteriores
    document
      .querySelectorAll("#clientFormFromAppointment .form-error")
      .forEach((el) => (el.textContent = ""));

    // Nome completo obrigatório
    if (!clientData.nomeCompleto || clientData.nomeCompleto.length < 3) {
      this.showFieldError(
        "clientNomeCompleto",
        "Nome completo deve ter pelo menos 3 caracteres"
      );
      isValid = false;
    }

    // WhatsApp (se preenchido)
    if (
      clientData.telefoneWhatsApp &&
      !Utils.validatePhone(clientData.telefoneWhatsApp)
    ) {
      this.showFieldError("clientTelefoneWhatsApp", "WhatsApp inválido");
      isValid = false;
    }

    // Email (se preenchido)
    if (clientData.email && !Utils.validateEmail(clientData.email)) {
      this.showFieldError("clientEmail", "Email inválido");
      isValid = false;
    }

    // CPF (se preenchido)
    if (clientData.cpf && !Utils.validateCPF(clientData.cpf)) {
      this.showFieldError("clientCpf", "CPF inválido");
      isValid = false;
    }

    return isValid;
  }

  // Atualizar select de clientes e selecionar o novo cliente
  async updateClientSelectAndSelect(clientId) {
    const clienteSelect = document.getElementById("clienteId");
    if (!clienteSelect) return;

    // Recarregar lista de clientes
    const clients = await store.getClients();

    // Atualizar options
    clienteSelect.innerHTML =
      '<option value="">Selecione um cliente</option>' +
      clients
        .map(
          (client) => `
        <option value="${client.id}" ${
            client.id === clientId ? "selected" : ""
          }>
          ${client.nomeCompleto}
        </option>
      `
        )
        .join("");

    // Disparar evento change para carregar pets
    clienteSelect.dispatchEvent(new Event("change"));
  }

  // Configurar máscaras do formulário de cliente
  setupClientFormMasks() {
    // Máscara do WhatsApp
    const telefoneInput = document.getElementById("clientTelefoneWhatsApp");
    if (telefoneInput) {
      telefoneInput.addEventListener("input", (e) => {
        e.target.value = Utils.formatPhone(e.target.value);
      });
    }

    // Máscara do CPF
    const cpfInput = document.getElementById("clientCpf");
    if (cpfInput) {
      cpfInput.addEventListener("input", (e) => {
        e.target.value = Utils.formatCPF(e.target.value);
      });
    }
  }

  // Formulário de pet a partir de agendamento
  showPetFormFromAppointment() {
    const clienteId = document.getElementById("clienteId")?.value;

    if (!clienteId) {
      ui.error("Selecione um cliente primeiro");
      return;
    }

    const client = store.getClient(clienteId);
    if (!client) {
      ui.error("Cliente não encontrado");
      return;
    }

    const modalContent = `
      <div class="modal-header">
        <h3>Novo Pet - ${client.nomeCompleto}</h3>
        <button class="btn btn-sm btn-outline" onclick="app.closeModal()">
          <i class="icon-x"></i>
        </button>
      </div>
      
      <form id="petFormFromAppointment" data-is-edit="false">
        <div class="modal-body">
          <div class="form-group">
            <label for="petNome">Nome do Pet</label>
            <input 
              type="text" 
              id="petNome" 
              name="nome" 
              class="form-input" 
              placeholder="Digite o nome do pet"
            >
            <div class="form-error" id="petNome-error"></div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="petEspecie">Espécie</label>
              <select id="petEspecie" name="especie" class="form-select">
                <option value="">Selecione</option>
                <option value="cão">Cão</option>
                <option value="gato">Gato</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div class="form-group">
              <label for="petRaca">Raça</label>
              <input 
                type="text" 
                id="petRaca" 
                name="raca" 
                class="form-input" 
                placeholder="Ex: Golden Retriever"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="petSexo">Sexo</label>
              <select id="petSexo" name="sexo" class="form-select">
                <option value="">Selecione</option>
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
                <option value="Indef.">Indefinido</option>
              </select>
            </div>
            <div class="form-group">
              <label for="petPorte">Porte</label>
              <select id="petPorte" name="porte" class="form-select">
                <option value="">Selecione</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="petDataNascimento">Data de Nascimento</label>
              <input 
                type="date" 
                id="petDataNascimento" 
                name="dataNascimento" 
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="petPesoAproximadoKg">Peso Aproximado (kg)</label>
              <input 
                type="number" 
                id="petPesoAproximadoKg" 
                name="pesoAproximadoKg" 
                class="form-input" 
                step="0.1"
                min="0"
                placeholder="Ex: 15.5"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="petObservacoes">Observações</label>
            <textarea 
              id="petObservacoes" 
              name="observacoes" 
              class="form-input" 
              rows="3"
              placeholder="Observações sobre o pet..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="app.closeModal()">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            Salvar e Selecionar
          </button>
        </div>
      </form>
    `;

    // Criar modal
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        ${modalContent}
      </div>
    `;

    document.body.appendChild(modal);

    // Configurar eventos do formulário
    const form = document.getElementById("petFormFromAppointment");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.savePetFromAppointment(e, clienteId);
    });
  }

  // Salvar pet a partir de agendamento
  async savePetFromAppointment(event, clienteId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const petData = {
      clienteId: clienteId,
      nome: formData.get("nome").trim(),
      especie: formData.get("especie") || null,
      raca: formData.get("raca").trim(),
      sexo: formData.get("sexo") || null,
      porte: formData.get("porte") || null,
      dataNascimento: formData.get("dataNascimento") || null,
      pesoAproximadoKg: formData.get("pesoAproximadoKg")
        ? parseFloat(formData.get("pesoAproximadoKg"))
        : null,
      observacoes: formData.get("observacoes").trim(),
    };

    try {
      const newPetId = store.generateId("pet");
      const savedPet = await store.savePet({ ...petData, id: newPetId });

      ui.success("Pet criado com sucesso!");

      // Fechar modal
      this.closeModal();

      // Atualizar select de pets e selecionar o novo pet
      this.updatePetSelectAndSelect(newPetId);
    } catch (error) {
      ui.error("Erro ao salvar pet: " + error.message);
    }
  }

  // Atualizar select de pets e selecionar o novo pet
  async updatePetSelectAndSelect(petId) {
    const petSelect = document.getElementById("petId");
    if (!petSelect) return;

    const clienteId = document.getElementById("clienteId")?.value;
    if (!clienteId) return;

    // Recarregar pets do cliente
    const pets = (await store.getPets()).filter(
      (pet) => pet.clienteId === clienteId
    );

    // Atualizar options
    petSelect.innerHTML =
      '<option value="">Selecione um pet</option>' +
      pets
        .map(
          (pet) => `
        <option value="${pet.id}" ${pet.id === petId ? "selected" : ""}>
          ${pet.nome || "Sem nome"}
        </option>
      `
        )
        .join("");
  }

  // Fechar modal
  closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
      modal.remove();
    }
  }

  // ===== MÉTODOS DE CONFIGURAÇÃO =====
  async showSystemStats() {
    const clients = await store.getClients();
    const pets = await store.getPets();
    const services = await store.getServices();
    const appointments = await store.getAppointments();
    const orders = await store.getOrders();
    const payments = await store.getPayments();

    const stats = {
      totalClients: clients.length,
      totalPets: pets.length,
      totalServices: services.length,
      totalAppointments: appointments.length,
      totalOrders: orders.length,
      totalPayments: payments.length,
      activeClients: clients.filter((c) => c.status === "ativo").length,
      activeServices: services.filter((s) => s.ativo).length,
      completedOrders: orders.filter((o) => o.status === "concluido").length,
      totalRevenue: payments.reduce((sum, p) => sum + (p.valorTotal || 0), 0),
    };

    const content = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>${stats.totalClients}</h3>
          <p>Total de Clientes</p>
        </div>
        <div class="stat-card">
          <h3>${stats.activeClients}</h3>
          <p>Clientes Ativos</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalPets}</h3>
          <p>Total de Pets</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalServices}</h3>
          <p>Serviços Cadastrados</p>
        </div>
        <div class="stat-card">
          <h3>${stats.activeServices}</h3>
          <p>Serviços Ativos</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalAppointments}</h3>
          <p>Agendamentos</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalOrders}</h3>
          <p>Ordens de Serviço</p>
        </div>
        <div class="stat-card">
          <h3>${stats.completedOrders}</h3>
          <p>Ordens Concluídas</p>
        </div>
        <div class="stat-card">
          <h3>${utils.formatCurrency(stats.totalRevenue)}</h3>
          <p>Faturamento Total</p>
        </div>
      </div>
    `;

    ui.createModal("systemStats", {
      title: "Estatísticas do Sistema",
      content: content,
      size: "large",
    });
    ui.showModal("systemStats");
  }

  clearAllData() {
    ui.confirm(
      "Tem certeza que deseja limpar TODOS os dados do sistema? Esta ação não pode ser desfeita!",
      "Confirmar Limpeza",
      {
        confirmText: "Sim, Limpar Tudo",
        cancelText: "Cancelar",
        type: "danger",
      }
    )
      .then(() => {
        store.clearAllData();
        ui.success("Todos os dados foram removidos!");
        setTimeout(() => {
          location.reload();
        }, 2000);
      })
      .catch(() => {
        // Usuário cancelou
      });
  }

  showAdvancedSettings() {
    const content = `
      <div class="advanced-settings">
        <h3>Configurações Avançadas</h3>
        <p>Em desenvolvimento...</p>
        <div class="setting-item">
          <label>Modo de Desenvolvimento</label>
          <input type="checkbox" disabled>
        </div>
        <div class="setting-item">
          <label>Logs Detalhados</label>
          <input type="checkbox" disabled>
        </div>
        <div class="setting-item">
          <label>Backup Automático</label>
          <input type="checkbox" disabled>
        </div>
      </div>
    `;

    ui.createModal("advancedSettings", {
      title: "Configurações Avançadas",
      content: content,
      size: "medium",
    });
    ui.showModal("advancedSettings");
  }

  // ===== UTILITÁRIOS =====
  exportData() {
    const data = store.exportData();
    const json = JSON.stringify(data, null, 2);
    utils.downloadFile(
      json,
      `pet-shop-backup-${new Date().toISOString().split("T")[0]}.json`
    );
    ui.success("Backup exportado com sucesso!");
  }

  importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      utils.uploadFile(input, (data, error) => {
        if (error) {
          ui.error("Erro ao importar arquivo");
          return;
        }

        if (confirm("Isso irá substituir todos os dados atuais. Continuar?")) {
          store.importData(data);
          ui.success("Dados importados com sucesso!");
          location.reload();
        }
      });
    };
    input.click();
  }

  logout() {
    if (confirm("Tem certeza que deseja sair?")) {
      // Limpar dados locais se necessário
      location.reload();
    }
  }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PetShopApp();
});
