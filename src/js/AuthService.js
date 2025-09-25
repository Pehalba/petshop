/**
 * AuthService.js - Serviço de Autenticação
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 *
 * NOTA: Este módulo é opcional e pode ser desabilitado
 * para uso apenas local (localStorage)
 */

class AuthService {
  constructor() {
    this.isEnabled = false; // Desabilitado por padrão
    this.currentUser = null;
    this.init();
  }

  init() {
    // Verificar se o serviço está habilitado
    const settings = store.getSettings();
    if (settings && settings.authEnabled) {
      this.isEnabled = true;
      this.loadCurrentUser();
    }
  }

  // ===== CONFIGURAÇÃO =====
  enable() {
    this.isEnabled = true;
    const settings = store.getSettings();
    if (settings) {
      settings.authEnabled = true;
      store.saveSettings(settings);
    }
  }

  disable() {
    this.isEnabled = false;
    const settings = store.getSettings();
    if (settings) {
      settings.authEnabled = false;
      store.saveSettings(settings);
    }
    this.logout();
  }

  // ===== AUTENTICAÇÃO LOCAL =====
  login(username, password) {
    if (!this.isEnabled) {
      return { success: false, message: "Autenticação não habilitada" };
    }

    // Verificar credenciais (em produção, isso seria feito no servidor)
    const users = this.getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return { success: false, message: "Credenciais inválidas" };
    }

    if (!user.active) {
      return { success: false, message: "Usuário inativo" };
    }

    this.currentUser = user;
    this.saveCurrentUser();

    return { success: true, user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("pet_shop_current_user");
  }

  // ===== GERENCIAMENTO DE USUÁRIOS =====
  createUser(userData) {
    if (!this.isEnabled) {
      return { success: false, message: "Autenticação não habilitada" };
    }

    const users = this.getUsers();

    // Verificar se usuário já existe
    if (users.find((u) => u.username === userData.username)) {
      return { success: false, message: "Usuário já existe" };
    }

    const newUser = {
      id: store.generateId("user"),
      username: userData.username,
      password: userData.password, // Em produção, seria hash
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("pet_shop_users", JSON.stringify(users));

    return { success: true, user: newUser };
  }

  updateUser(userId, userData) {
    if (!this.isEnabled) {
      return { success: false, message: "Autenticação não habilitada" };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: "Usuário não encontrado" };
    }

    Object.keys(userData).forEach((key) => {
      if (key !== "id" && key !== "createdAt") {
        users[userIndex][key] = userData[key];
      }
    });

    users[userIndex].updatedAt = new Date().toISOString();
    localStorage.setItem("pet_shop_users", JSON.stringify(users));

    return { success: true, user: users[userIndex] };
  }

  deleteUser(userId) {
    if (!this.isEnabled) {
      return { success: false, message: "Autenticação não habilitada" };
    }

    const users = this.getUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);

    if (filteredUsers.length === users.length) {
      return { success: false, message: "Usuário não encontrado" };
    }

    localStorage.setItem("pet_shop_users", JSON.stringify(filteredUsers));

    // Se o usuário deletado é o atual, fazer logout
    if (this.currentUser && this.currentUser.id === userId) {
      this.logout();
    }

    return { success: true };
  }

  // ===== PERMISSÕES =====
  hasPermission(permission) {
    if (!this.isEnabled || !this.currentUser) {
      return true; // Se não há autenticação, permitir tudo
    }

    const rolePermissions = this.getRolePermissions();
    const userPermissions = rolePermissions[this.currentUser.role] || [];

    return (
      userPermissions.includes(permission) || userPermissions.includes("*")
    );
  }

  canAccess(page) {
    const pagePermissions = {
      dashboard: ["view_dashboard"],
      clientes: ["view_clients", "manage_clients"],
      pets: ["view_pets", "manage_pets"],
      servicos: ["view_services", "manage_services"],
      agendamentos: ["view_appointments", "manage_appointments"],
      ordem: ["manage_orders"],
      pagamentos: ["view_payments", "manage_payments"],
      relatorios: ["view_reports"],
      configuracoes: ["manage_settings"],
    };

    const requiredPermissions = pagePermissions[page] || [];

    return requiredPermissions.some((permission) =>
      this.hasPermission(permission)
    );
  }

  // ===== UTILITÁRIOS =====
  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getUsers() {
    const users = localStorage.getItem("pet_shop_users");
    return users ? JSON.parse(users) : [];
  }

  loadCurrentUser() {
    const userData = localStorage.getItem("pet_shop_current_user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem(
        "pet_shop_current_user",
        JSON.stringify(this.currentUser)
      );
    }
  }

  getRolePermissions() {
    return {
      admin: ["*"], // Acesso total
      manager: [
        "view_dashboard",
        "view_clients",
        "manage_clients",
        "view_pets",
        "manage_pets",
        "view_services",
        "manage_services",
        "view_appointments",
        "manage_appointments",
        "manage_orders",
        "view_payments",
        "manage_payments",
        "view_reports",
      ],
      user: [
        "view_dashboard",
        "view_clients",
        "manage_clients",
        "view_pets",
        "manage_pets",
        "view_services",
        "view_appointments",
        "manage_appointments",
        "manage_orders",
        "view_payments",
      ],
      viewer: [
        "view_dashboard",
        "view_clients",
        "view_pets",
        "view_services",
        "view_appointments",
        "view_payments",
        "view_reports",
      ],
    };
  }

  // ===== CONFIGURAÇÃO INICIAL =====
  setupInitialUsers() {
    if (!this.isEnabled) return;

    const users = this.getUsers();
    if (users.length === 0) {
      // Criar usuário administrador padrão
      this.createUser({
        username: "admin",
        password: "admin123",
        name: "Administrador",
        email: "admin@petshop.com",
        role: "admin",
      });

      ui.success("Usuário administrador criado: admin / admin123");
    }
  }

  // ===== VALIDAÇÕES =====
  validateUser(userData) {
    const errors = [];

    if (!userData.username || userData.username.trim() === "") {
      errors.push("Nome de usuário é obrigatório");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (!userData.name || userData.name.trim() === "") {
      errors.push("Nome é obrigatório");
    }

    if (userData.email && !utils.validateEmail(userData.email)) {
      errors.push("Email inválido");
    }

    const validRoles = ["admin", "manager", "user", "viewer"];
    if (userData.role && !validRoles.includes(userData.role)) {
      errors.push("Função inválida");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ===== SEGURANÇA =====
  changePassword(userId, currentPassword, newPassword) {
    if (!this.isEnabled) {
      return { success: false, message: "Autenticação não habilitada" };
    }

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (user.password !== currentPassword) {
      return { success: false, message: "Senha atual incorreta" };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: "Nova senha deve ter pelo menos 6 caracteres",
      };
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();

    localStorage.setItem("pet_shop_users", JSON.stringify(users));

    return { success: true };
  }

  // ===== SESSÃO =====
  checkSession() {
    if (!this.isEnabled) return true;

    const userData = localStorage.getItem("pet_shop_current_user");
    if (!userData) return false;

    try {
      const user = JSON.parse(userData);
      const users = this.getUsers();
      const currentUser = users.find((u) => u.id === user.id);

      if (!currentUser || !currentUser.active) {
        this.logout();
        return false;
      }

      this.currentUser = currentUser;
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // ===== LOGS DE AUDITORIA =====
  logActivity(activity, details = {}) {
    if (!this.isEnabled) return;

    const logs = this.getActivityLogs();
    const log = {
      id: store.generateId("log"),
      userId: this.currentUser ? this.currentUser.id : null,
      userName: this.currentUser ? this.currentUser.name : "Sistema",
      activity,
      details,
      timestamp: new Date().toISOString(),
      ip: "local", // Em produção, seria capturado do servidor
    };

    logs.push(log);
    localStorage.setItem("pet_shop_activity_logs", JSON.stringify(logs));
  }

  getActivityLogs(limit = 100) {
    const logs = localStorage.getItem("pet_shop_activity_logs");
    const allLogs = logs ? JSON.parse(logs) : [];
    return allLogs.slice(-limit);
  }
}

// Instância global
window.authService = new AuthService();
