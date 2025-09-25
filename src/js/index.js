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
      ordem: this.renderOrdem.bind(this),
      pagamentos: this.renderPagamentos.bind(this),
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
                    <a href="#" class="nav-link" data-page="ordem">
                        <span class="nav-link-icon">📋</span>
                        Ordem
                    </a>
                    <a href="#" class="nav-link" data-page="pagamentos">
                        <span class="nav-link-icon">💳</span>
                        Pagamentos
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
                    <div class="header-search">
                        <input type="text" class="search-input" placeholder="Buscar..." id="global-search">
                        <span class="search-icon">🔍</span>
                    </div>
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

    // Busca global
    const globalSearch = document.getElementById("global-search");
    if (globalSearch) {
      globalSearch.addEventListener(
        "input",
        utils.debounce((e) => {
          this.handleGlobalSearch(e.target.value);
        }, 300)
      );
    }
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

    // Mostrar loading
    ui.showLoading(content, "Carregando página...");

    // Renderizar página
    setTimeout(() => {
      if (this.routes[this.currentPage]) {
        this.routes[this.currentPage]();
      }
      ui.hideLoading(content);
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

  handleGlobalSearch(query) {
    if (!query.trim()) return;

    // Buscar em clientes
    const clients = store.getClients();
    const clientResults = utils.searchInArray(clients, query, [
      "nomeCompleto",
      "telefoneWhatsApp",
      "email",
    ]);

    // Buscar em pets
    const pets = store.getPets();
    const petResults = utils.searchInArray(pets, query, ["nome", "raca"]);

    // Buscar em serviços
    const services = store.getServices();
    const serviceResults = utils.searchInArray(services, query, [
      "nome",
      "descricao",
    ]);

    // Mostrar resultados
    this.showSearchResults({
      clients: clientResults,
      pets: petResults,
      services: serviceResults,
    });
  }

  showSearchResults(results) {
    const modal = ui.createModal("search-results", {
      title: "Resultados da Busca",
      content: this.renderSearchResults(results),
      size: "large",
    });
    ui.showModal("search-results");
  }

  renderSearchResults(results) {
    let html = '<div class="search-results">';

    if (results.clients.length > 0) {
      html += "<h4>Clientes</h4>";
      html += '<ul class="search-list">';
      results.clients.forEach((client) => {
        html += `<li><a href="#" data-page="clientes" data-client-id="${client.id}">${client.nomeCompleto}</a></li>`;
      });
      html += "</ul>";
    }

    if (results.pets.length > 0) {
      html += "<h4>Pets</h4>";
      html += '<ul class="search-list">';
      results.pets.forEach((pet) => {
        html += `<li><a href="#" data-page="pets" data-pet-id="${pet.id}">${pet.nome} (${pet.raca})</a></li>`;
      });
      html += "</ul>";
    }

    if (results.services.length > 0) {
      html += "<h4>Serviços</h4>";
      html += '<ul class="search-list">';
      results.services.forEach((service) => {
        html += `<li><a href="#" data-page="servicos" data-service-id="${service.id}">${service.nome}</a></li>`;
      });
      html += "</ul>";
    }

    if (
      results.clients.length === 0 &&
      results.pets.length === 0 &&
      results.services.length === 0
    ) {
      html += "<p>Nenhum resultado encontrado.</p>";
    }

    html += "</div>";
    return html;
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
  renderDashboard() {
    const content = document.getElementById("content");
    if (!content) return;

    const clients = store.getClients();
    const pets = store.getPets();
    const services = store.getServices();
    const appointments = store.getAppointments();
    const orders = store.getOrders();

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter((apt) =>
      apt.dataHora.startsWith(today)
    );
    const pendingOrders = orders.filter((order) => order.status === "pendente");

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
                        <div class="stat-title">Serviços</div>
                        <div class="stat-icon stat-icon-warning">✂️</div>
                    </div>
                    <div class="stat-value">${services.length}</div>
                    <div class="stat-change positive">
                        <span>+${
                          services.filter((s) => s.ativo).length
                        } ativos</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Agendamentos Hoje</div>
                        <div class="stat-icon stat-icon-error">📅</div>
                    </div>
                    <div class="stat-value">${todayAppointments.length}</div>
                    <div class="stat-change positive">
                        <span>+${todayAppointments.length} hoje</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-main">
                    <div class="card">
                        <div class="card-header">
                            <h3>Agendamentos de Hoje</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderTodayAppointments(todayAppointments)}
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-sidebar">
                    <div class="card">
                        <div class="card-header">
                            <h3>Atividades Recentes</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderRecentActivities()}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  renderTodayAppointments(appointments) {
    if (appointments.length === 0) {
      return '<div class="empty-state">Nenhum agendamento para hoje</div>';
    }

    return `
            <div class="appointments-list">
                ${appointments
                  .map(
                    (apt) => `
                    <div class="appointment-item">
                        <div class="appointment-time">${utils.formatTime(
                          apt.dataHora
                        )}</div>
                        <div class="appointment-details">
                            <div class="appointment-client">${
                              apt.clienteNome
                            }</div>
                            <div class="appointment-pet">${apt.petNome}</div>
                            <div class="appointment-services">${apt.servicosSelecionados
                              .map((s) => s.nome)
                              .join(", ")}</div>
                        </div>
                        <div class="appointment-status">
                            <span class="badge badge-${apt.status}">${
                      apt.status
                    }</span>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  renderRecentActivities() {
    // Simular atividades recentes
    const activities = [
      {
        type: "client",
        message: "Novo cliente cadastrado",
        time: "2 min atrás",
      },
      {
        type: "pet",
        message: "Pet adicionado ao sistema",
        time: "5 min atrás",
      },
      {
        type: "appointment",
        message: "Agendamento confirmado",
        time: "10 min atrás",
      },
      {
        type: "order",
        message: "Ordem de serviço finalizada",
        time: "15 min atrás",
      },
    ];

    return `
            <div class="activity-list">
                ${activities
                  .map(
                    (activity) => `
                    <div class="activity-item">
                        <div class="activity-icon activity-icon-${activity.type}">📝</div>
                        <div class="activity-content">
                            <div class="activity-message">${activity.message}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // Placeholder para outras páginas
  renderClientes() {
    const content = document.getElementById("content");
    const clients = store.getClients();

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

  filterClients(query) {
    const clients = store.getClients();
    const filtered = clients.filter((client) => {
      const searchText = `${client.nomeCompleto} ${
        client.telefoneWhatsApp || ""
      } ${client.email || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderClientsTable(filtered);
  }

  sortClients(field) {
    const clients = store.getClients();
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
          <label>Data de Nascimento</label>
          <input type="date" name="petDataNascimento[]" class="form-input">
        </div>
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
        savedClient = store.saveClient({ ...clientData, id: clientId });
      } else {
        // Para criar novo, gerar ID único
        const newClientId = store.generateId("cli");
        savedClient = store.saveClient({ ...clientData, id: newClientId });
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
              dataNascimento: formData.getAll("petDataNascimento[]")[i] || "",
              pesoAproximadoKg:
                parseFloat(formData.getAll("petPeso[]")[i]) || null,
              observacoes: formData.getAll("petObservacoes[]")[i] || "",
            };
            // Gerar ID único para cada pet
            const newPetId = store.generateId("pet");
            store.savePet({ ...petData, id: newPetId });
          }
        }
      }

      ui.success(
        clientId
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!"
      );
      this.viewClient(savedClient.id);
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

  viewClient(clientId) {
    const client = store.getClient(clientId);
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
  renderServicos() {
    const content = document.getElementById("content");
    const services = store.getServices();

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
  showServiceForm(serviceId = null) {
    const isEdit = serviceId !== null;
    const service = isEdit ? store.getService(serviceId) : null;

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
    if (!this.validateService(serviceData, serviceId)) {
      return;
    }

    try {
      let savedService;
      if (serviceId) {
        // Atualizar
        savedService = store.saveService({ ...serviceData, id: serviceId });
      } else {
        // Criar novo
        const newServiceId = store.generateId("srv");
        savedService = store.saveService({ ...serviceData, id: newServiceId });
      }

      ui.success(
        serviceId
          ? "Serviço atualizado com sucesso!"
          : "Serviço cadastrado com sucesso!"
      );
      this.renderServicos();
    } catch (error) {
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

    if (!this.validateService(serviceData)) {
      return;
    }

    try {
      const newServiceId = store.generateId("srv");
      store.saveService({ ...serviceData, id: newServiceId });

      ui.success("Serviço cadastrado com sucesso!");
      this.showServiceForm(); // Abrir formulário limpo
    } catch (error) {
      ui.error("Erro ao salvar serviço: " + error.message);
    }
  }

  // Validar serviço
  validateService(serviceData, serviceId = null) {
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
      const existingServices = store.getServices();
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
    const service = store.getService(serviceId);
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

  renderPets() {
    const content = document.getElementById("content");
    const pets = store.getPets();

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
            ${store
              .getClients()
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
        ${this.renderPetsTable(pets)}
      </div>
    `;

    this.setupPetEvents();
  }

  renderPetsTable(pets) {
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

    const tableRows = pets
      .map((pet) => {
        const client = store.getClient(pet.clienteId);
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
      .join("");

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
            ${tableRows}
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

  filterPets(query) {
    const pets = store.getPets();
    const filtered = pets.filter((pet) => {
      const client = store.getClient(pet.clienteId);
      const searchText = `${pet.nome || ""} ${pet.raca || ""} ${
        client?.nomeCompleto || ""
      }`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderPetsTable(filtered);
  }

  filterPetsByClient(clientId) {
    const pets = store.getPets();
    const filtered = clientId
      ? pets.filter((pet) => pet.clienteId === clientId)
      : pets;

    const container = document.querySelector(".data-container");
    container.innerHTML = this.renderPetsTable(filtered);
  }

  sortPets(field) {
    const pets = store.getPets();
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
    container.innerHTML = this.renderPetsTable(sorted);
  }

  // ===== MÉTODOS DE PETS =====
  showPetForm(petId = null, preSelectedClientId = null) {
    const isEdit = petId !== null;
    const pet = isEdit ? store.getPet(petId) : null;
    const clients = store.getClients();

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
      dataNascimento: formData.get("dataNascimento"),
      idade: formData.get("idade"),
      pesoAproximadoKg: parseFloat(formData.get("pesoAproximadoKg")) || null,
      clienteId: formData.get("clienteId"),
      observacoes: formData.get("observacoes"),
    };

    // Validações
    if (!this.validatePet(petData)) {
      return;
    }

    try {
      let savedPet;
      if (petId) {
        // Para atualizar, incluir o ID no objeto
        savedPet = store.savePet({ ...petData, id: petId });
      } else {
        // Para criar novo, gerar ID único
        const newPetId = store.generateId("pet");
        savedPet = store.savePet({ ...petData, id: newPetId });
      }

      ui.success(
        petId ? "Pet atualizado com sucesso!" : "Pet cadastrado com sucesso!"
      );
      this.viewPet(savedPet.id);
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

  viewPet(petId) {
    const pet = store.getPet(petId);
    if (!pet) {
      ui.error("Pet não encontrado");
      return;
    }

    const client = store.getClient(pet.clienteId);
    const idade = pet.dataNascimento
      ? utils.calculateAge(pet.dataNascimento)
      : pet.idade || "-";

    const content = `
      <div class="detail-container">
        <div class="detail-header">
          <div class="detail-title">
            <h1>${pet.nome || "Sem nome"}</h1>
            <div class="detail-actions">
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
          </div>
        </div>
      </div>
    `;

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

  renderAgendamentos() {
    const content = document.getElementById("content");
    content.innerHTML =
      "<h1>Agendamentos</h1><p>Página em desenvolvimento...</p>";
  }

  renderOrdem() {
    const content = document.getElementById("content");
    content.innerHTML =
      "<h1>Ordem de Serviço</h1><p>Página em desenvolvimento...</p>";
  }

  renderPagamentos() {
    const content = document.getElementById("content");
    content.innerHTML =
      "<h1>Pagamentos</h1><p>Página em desenvolvimento...</p>";
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

  // ===== MÉTODOS DE CONFIGURAÇÃO =====
  showSystemStats() {
    const clients = store.getClients();
    const pets = store.getPets();
    const services = store.getServices();
    const appointments = store.getAppointments();
    const orders = store.getOrders();
    const payments = store.getPayments();

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
