/**
 * AuthComponent - Componente de autenticação
 * Interface para login, registro e gerenciamento de usuário
 */

class AuthComponent {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.setupAuthStateListener();
  }

  setupAuthStateListener() {
    if (window.firebaseService) {
      window.firebaseService.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
        this.updateUI();
      });
    }
  }

  showAuthModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal auth-modal">
        <div class="modal-header">
          <h3>🔐 Acesso ao Sistema</h3>
          <button class="btn btn-sm btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="icon-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="auth-tabs">
            <button class="tab-btn active" onclick="authComponent.switchTab('login')">
              Entrar
            </button>
            <button class="tab-btn" onclick="authComponent.switchTab('register')">
              Registrar
            </button>
          </div>

          <form id="authForm" class="auth-form">
            <div class="form-group">
              <label for="authEmail">Email</label>
              <input 
                type="email" 
                id="authEmail" 
                name="email" 
                class="form-input" 
                required
                placeholder="seu@email.com"
              >
            </div>

            <div class="form-group">
              <label for="authPassword">Senha</label>
              <input 
                type="password" 
                id="authPassword" 
                name="password" 
                class="form-input" 
                required
                placeholder="Sua senha"
              >
            </div>

            <div id="registerFields" style="display: none;">
              <div class="form-group">
                <label for="authDisplayName">Nome Completo</label>
                <input 
                  type="text" 
                  id="authDisplayName" 
                  name="displayName" 
                  class="form-input" 
                  placeholder="Seu nome completo"
                >
              </div>
            </div>

            <div class="form-group">
              <button type="submit" class="btn btn-primary btn-full">
                <span id="authButtonText">Entrar</span>
              </button>
            </div>

            <div class="auth-help">
              <p>💡 <strong>Modo Offline:</strong> O sistema funciona mesmo sem internet, mas os dados ficam apenas no seu dispositivo.</p>
              <p>☁️ <strong>Modo Online:</strong> Com login, seus dados são sincronizados na nuvem e acessíveis de qualquer lugar.</p>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupAuthForm();
  }

  switchTab(tab) {
    const tabs = document.querySelectorAll(".tab-btn");
    const registerFields = document.getElementById("registerFields");
    const buttonText = document.getElementById("authButtonText");
    const form = document.getElementById("authForm");

    tabs.forEach((t) => t.classList.remove("active"));
    event.target.classList.add("active");

    if (tab === "login") {
      registerFields.style.display = "none";
      buttonText.textContent = "Entrar";
      form.dataset.mode = "login";
    } else {
      registerFields.style.display = "block";
      buttonText.textContent = "Registrar";
      form.dataset.mode = "register";
    }
  }

  setupAuthForm() {
    const form = document.getElementById("authForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAuth(e);
      });
    }
  }

  async handleAuth(event) {
    const formData = new FormData(event.target);
    const mode = event.target.dataset.mode;
    const email = formData.get("email");
    const password = formData.get("password");
    const displayName = formData.get("displayName");

    try {
      if (mode === "login") {
        await window.firebaseService.signIn(email, password);
        ui.success("✅ Login realizado com sucesso!");
      } else {
        await window.firebaseService.signUp(email, password, displayName);
        ui.success("✅ Conta criada com sucesso!");
      }

      this.closeAuthModal();
    } catch (error) {
      ui.error("❌ Erro na autenticação: " + error.message);
    }
  }

  closeAuthModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
      modal.remove();
    }
  }

  async signOut() {
    try {
      await window.firebaseService.signOut();
      ui.success("✅ Logout realizado com sucesso!");
      this.updateUI();
    } catch (error) {
      ui.error("❌ Erro no logout: " + error.message);
    }
  }

  updateUI() {
    const authButton = document.getElementById("authButton");
    const userInfo = document.getElementById("userInfo");

    if (this.isAuthenticated && this.currentUser) {
      if (authButton) {
        authButton.innerHTML = `
          <i class="icon-user"></i> ${
            this.currentUser.displayName || this.currentUser.email
          }
        `;
        authButton.onclick = () => this.showUserMenu();
      }

      if (userInfo) {
        userInfo.innerHTML = `
          <div class="user-info">
            <span class="user-name">${
              this.currentUser.displayName || this.currentUser.email
            }</span>
            <span class="sync-status online">☁️ Online</span>
          </div>
        `;
      }
    } else {
      if (authButton) {
        authButton.innerHTML = '<i class="icon-login"></i> Entrar';
        authButton.onclick = () => this.showAuthModal();
      }

      if (userInfo) {
        userInfo.innerHTML = `
          <div class="user-info">
            <span class="sync-status offline">📱 Offline</span>
          </div>
        `;
      }
    }
  }

  showUserMenu() {
    const menu = document.createElement("div");
    menu.className = "user-menu";
    menu.innerHTML = `
      <div class="user-menu-item" onclick="authComponent.showProfile()">
        <i class="icon-user"></i> Perfil
      </div>
      <div class="user-menu-item" onclick="authComponent.showSyncStatus()">
        <i class="icon-sync"></i> Sincronização
      </div>
      <div class="user-menu-item" onclick="authComponent.signOut()">
        <i class="icon-logout"></i> Sair
      </div>
    `;

    // Posicionar menu
    const authButton = document.getElementById("authButton");
    if (authButton) {
      const rect = authButton.getBoundingClientRect();
      menu.style.position = "absolute";
      menu.style.top = rect.bottom + 5 + "px";
      menu.style.right = "10px";
      menu.style.zIndex = "1000";
    }

    document.body.appendChild(menu);

    // Fechar menu ao clicar fora
    setTimeout(() => {
      document.addEventListener(
        "click",
        () => {
          menu.remove();
        },
        { once: true }
      );
    }, 100);
  }

  showProfile() {
    ui.info("👤 Perfil do usuário - Em desenvolvimento");
  }

  showSyncStatus() {
    const status = window.firebaseService?.getSyncStatus() || {};

    ui.info(`
      <div class="sync-status-info">
        <h4>📊 Status da Sincronização</h4>
        <p><strong>Status:</strong> ${
          status.isConnected ? "☁️ Online" : "📱 Offline"
        }</p>
        <p><strong>Firebase:</strong> ${
          status.isInitialized ? "✅ Conectado" : "❌ Desconectado"
        }</p>
        <p><strong>Fila de sincronização:</strong> ${
          status.queueLength || 0
        } itens</p>
        <p><strong>Conectividade:</strong> ${
          status.isOnline ? "🌐 Online" : "📴 Offline"
        }</p>
      </div>
    `);
  }
}

// Instância global
window.authComponent = new AuthComponent();
