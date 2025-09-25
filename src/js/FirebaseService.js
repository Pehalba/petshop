/**
 * FirebaseService.js - Serviço Firebase (Opcional)
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 *
 * NOTA: Este módulo é opcional e pode ser desabilitado
 * para uso apenas local (localStorage)
 */

class FirebaseService {
  constructor() {
    this.isEnabled = false; // Desabilitado por padrão
    this.db = null;
    this.auth = null;
    this.storage = null;
    this.init();
  }

  init() {
    // Verificar se o Firebase está configurado
    const settings = store.getSettings();
    if (settings && settings.firebaseEnabled && settings.firebaseConfig) {
      this.isEnabled = true;
      this.initializeFirebase(settings.firebaseConfig);
    }
  }

  // ===== CONFIGURAÇÃO =====
  enable(config) {
    this.isEnabled = true;
    const settings = store.getSettings();
    if (settings) {
      settings.firebaseEnabled = true;
      settings.firebaseConfig = config;
      store.saveSettings(settings);
    }
    this.initializeFirebase(config);
  }

  disable() {
    this.isEnabled = false;
    const settings = store.getSettings();
    if (settings) {
      settings.firebaseEnabled = false;
      settings.firebaseConfig = null;
      store.saveSettings(settings);
    }
  }

  initializeFirebase(config) {
    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK não carregado");
      return;
    }

    try {
      // Inicializar Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      this.db = firebase.firestore();
      this.auth = firebase.auth();
      this.storage = firebase.storage();

      // Configurar offline persistence
      this.db.enablePersistence().catch((err) => {
        console.warn("Persistence falhou:", err);
      });

      ui.success("Firebase configurado com sucesso!");
    } catch (error) {
      console.error("Erro ao inicializar Firebase:", error);
      ui.error("Erro ao configurar Firebase");
    }
  }

  // ===== SINCRONIZAÇÃO DE DADOS =====
  async syncToFirebase() {
    if (!this.isEnabled || !this.db) {
      ui.error("Firebase não configurado");
      return;
    }

    try {
      ui.showLoading(document.body, "Sincronizando dados...");

      // Sincronizar cada store
      await this.syncStore("clients", "clients");
      await this.syncStore("pets", "pets");
      await this.syncStore("services", "services");
      await this.syncStore("appointments", "appointments");
      await this.syncStore("orders", "orders");
      await this.syncStore("payments", "payments");
      await this.syncStore("professionals", "professionals");

      ui.hideLoading(document.body);
      ui.success("Dados sincronizados com sucesso!");
    } catch (error) {
      ui.hideLoading(document.body);
      console.error("Erro na sincronização:", error);
      ui.error("Erro ao sincronizar dados");
    }
  }

  async syncFromFirebase() {
    if (!this.isEnabled || !this.db) {
      ui.error("Firebase não configurado");
      return;
    }

    try {
      ui.showLoading(document.body, "Carregando dados...");

      // Carregar cada store
      await this.loadStore("clients", "clients");
      await this.loadStore("pets", "pets");
      await this.loadStore("services", "services");
      await this.loadStore("appointments", "appointments");
      await this.loadStore("orders", "orders");
      await this.loadStore("payments", "payments");
      await this.loadStore("professionals", "professionals");

      ui.hideLoading(document.body);
      ui.success("Dados carregados com sucesso!");
    } catch (error) {
      ui.hideLoading(document.body);
      console.error("Erro ao carregar dados:", error);
      ui.error("Erro ao carregar dados");
    }
  }

  async syncStore(storeName, collectionName) {
    const localData = store.getAll(storeName);

    for (const item of localData) {
      try {
        await this.db
          .collection(collectionName)
          .doc(item.id)
          .set(item, { merge: true });
      } catch (error) {
        console.error(`Erro ao sincronizar ${item.id}:`, error);
      }
    }
  }

  async loadStore(storeName, collectionName) {
    try {
      const snapshot = await this.db.collection(collectionName).get();
      const data = snapshot.docs.map((doc) => doc.data());

      // Salvar no localStorage
      localStorage.setItem(store.stores[storeName], JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error);
    }
  }

  // ===== OPERAÇÕES CRUD =====
  async createDocument(collection, data) {
    if (!this.isEnabled || !this.db) {
      return store.save(collection, data);
    }

    try {
      const docRef = await this.db.collection(collection).add(data);
      data.id = docRef.id;
      return data;
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      throw error;
    }
  }

  async updateDocument(collection, id, data) {
    if (!this.isEnabled || !this.db) {
      return store.save(collection, data);
    }

    try {
      await this.db.collection(collection).doc(id).update(data);
      return data;
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      throw error;
    }
  }

  async deleteDocument(collection, id) {
    if (!this.isEnabled || !this.db) {
      return store.delete(collection, id);
    }

    try {
      await this.db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      throw error;
    }
  }

  async getDocument(collection, id) {
    if (!this.isEnabled || !this.db) {
      return store.getById(collection, id);
    }

    try {
      const doc = await this.db.collection(collection).doc(id).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
      throw error;
    }
  }

  async getDocuments(collection, filters = {}) {
    if (!this.isEnabled || !this.db) {
      return store.getAll(collection);
    }

    try {
      let query = this.db.collection(collection);

      // Aplicar filtros
      Object.keys(filters).forEach((key) => {
        query = query.where(key, "==", filters[key]);
      });

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      throw error;
    }
  }

  // ===== AUTENTICAÇÃO =====
  async signIn(email, password) {
    if (!this.isEnabled || !this.auth) {
      return { success: false, message: "Firebase não configurado" };
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async signUp(email, password, displayName) {
    if (!this.isEnabled || !this.auth) {
      return { success: false, message: "Firebase não configurado" };
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.updateProfile({ displayName });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async signOut() {
    if (!this.isEnabled || !this.auth) {
      return;
    }

    try {
      await this.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  getCurrentUser() {
    if (!this.isEnabled || !this.auth) {
      return null;
    }

    return this.auth.currentUser;
  }

  // ===== ARMAZENAMENTO =====
  async uploadFile(file, path) {
    if (!this.isEnabled || !this.storage) {
      return null;
    }

    try {
      const storageRef = this.storage.ref();
      const fileRef = storageRef.child(path);
      const snapshot = await fileRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      throw error;
    }
  }

  async deleteFile(path) {
    if (!this.isEnabled || !this.storage) {
      return;
    }

    try {
      const storageRef = this.storage.ref();
      const fileRef = storageRef.child(path);
      await fileRef.delete();
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      throw error;
    }
  }

  // ===== LISTENERS EM TEMPO REAL =====
  setupRealtimeListeners() {
    if (!this.isEnabled || !this.db) {
      return;
    }

    // Listener para clientes
    this.db.collection("clients").onSnapshot((snapshot) => {
      const clients = snapshot.docs.map((doc) => doc.data());
      localStorage.setItem(store.stores.clients, JSON.stringify(clients));
    });

    // Listener para pets
    this.db.collection("pets").onSnapshot((snapshot) => {
      const pets = snapshot.docs.map((doc) => doc.data());
      localStorage.setItem(store.stores.pets, JSON.stringify(pets));
    });

    // Listener para agendamentos
    this.db.collection("appointments").onSnapshot((snapshot) => {
      const appointments = snapshot.docs.map((doc) => doc.data());
      localStorage.setItem(
        store.stores.appointments,
        JSON.stringify(appointments)
      );
    });
  }

  // ===== BACKUP E RESTORE =====
  async backupToFirebase() {
    if (!this.isEnabled || !this.db) {
      ui.error("Firebase não configurado");
      return;
    }

    try {
      const data = store.exportData();
      const backupId = "backup_" + Date.now();

      await this.db.collection("backups").doc(backupId).set({
        id: backupId,
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });

      ui.success("Backup salvo no Firebase!");
    } catch (error) {
      console.error("Erro ao fazer backup:", error);
      ui.error("Erro ao fazer backup");
    }
  }

  async restoreFromFirebase(backupId) {
    if (!this.isEnabled || !this.db) {
      ui.error("Firebase não configurado");
      return;
    }

    try {
      const doc = await this.db.collection("backups").doc(backupId).get();

      if (!doc.exists) {
        ui.error("Backup não encontrado");
        return;
      }

      const backup = doc.data();
      store.importData(backup.data);

      ui.success("Dados restaurados do Firebase!");
    } catch (error) {
      console.error("Erro ao restaurar:", error);
      ui.error("Erro ao restaurar dados");
    }
  }

  // ===== UTILITÁRIOS =====
  isConnected() {
    if (!this.isEnabled || !this.db) {
      return false;
    }

    return this.db.app.options.projectId !== undefined;
  }

  getConnectionStatus() {
    if (!this.isEnabled) {
      return "disabled";
    }

    if (!this.db) {
      return "not_configured";
    }

    return "connected";
  }

  // ===== CONFIGURAÇÃO DE SEGURANÇA =====
  setupSecurityRules() {
    // Em produção, as regras de segurança seriam configuradas no Firebase Console
    const rules = {
      rules: {
        clients: {
          ".read": "auth != null",
          ".write": "auth != null",
        },
        pets: {
          ".read": "auth != null",
          ".write": "auth != null",
        },
        appointments: {
          ".read": "auth != null",
          ".write": "auth != null",
        },
        orders: {
          ".read": "auth != null",
          ".write": "auth != null",
        },
        payments: {
          ".read": "auth != null",
          ".write": "auth != null",
        },
      },
    };

    console.log("Regras de segurança sugeridas:", rules);
    return rules;
  }
}

// Instância global
window.firebaseService = new FirebaseService();
