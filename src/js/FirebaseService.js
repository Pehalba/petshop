/**
 * FirebaseService - Serviço de sincronização com Firebase
 * Integra com Firestore, Authentication e Storage
 */

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.listeners = new Map();

    // Configuração do Firebase (substitua pelos seus valores)
    this.firebaseConfig = {
      apiKey: "AIzaSyDLRM7XsFM4qM7S4rdl7uO7d-7JlZhJrK8",
      authDomain: "petshop-8dab6.firebaseapp.com",
      projectId: "petshop-8dab6",
      storageBucket: "petshop-8dab6.firebasestorage.app",
      messagingSenderId: "722294554362",
      appId: "1:722294554362:web:e786dabe0e224bca8b1343",
      measurementId: "G-MN4CKNGJWQ"
    };

    this.init();
  }

  async init() {
    try {
      // Carregar Firebase dinamicamente
      if (typeof window !== "undefined") {
        await this.loadFirebase();
        this.isInitialized = true;
        this.setupOfflineHandling();
        console.log("🔥 Firebase inicializado com sucesso");
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar Firebase:", error);
      this.isInitialized = false;
    }
  }

  async loadFirebase() {
    // Carregar Firebase via CDN se não estiver disponível
    if (!window.firebase) {
      await this.loadScript(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
      );
      await this.loadScript(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );
      await this.loadScript(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
      );
      await this.loadScript(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"
      );
    }

    // Inicializar Firebase
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(this.firebaseConfig);
    }

    this.db = window.firebase.firestore();
    this.auth = window.firebase.auth();
    this.storage = window.firebase.storage();
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupOfflineHandling() {
    // Detectar mudanças de conectividade
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
      console.log("🌐 Conectado - iniciando sincronização");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("📴 Desconectado - modo offline");
    });
  }

  // ===== AUTENTICAÇÃO =====
  async signIn(email, password) {
    if (!this.isInitialized) throw new Error("Firebase não inicializado");

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      console.log("✅ Login realizado:", userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error("❌ Erro no login:", error);
      throw error;
    }
  }

  async signUp(email, password, displayName) {
    if (!this.isInitialized) throw new Error("Firebase não inicializado");

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.updateProfile({ displayName });
      console.log("✅ Usuário criado:", userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error("❌ Erro no registro:", error);
      throw error;
    }
  }

  async signOut() {
    if (!this.isInitialized) return;

    try {
      await this.auth.signOut();
      console.log("✅ Logout realizado");
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  onAuthStateChanged(callback) {
    if (!this.isInitialized) return;
    return this.auth.onAuthStateChanged(callback);
  }

  // ===== FIRESTORE =====
  async saveDocument(collection, docId, data) {
    if (!this.isInitialized) {
      throw new Error("Firebase não inicializado. Verifique sua conexão com a internet.");
    }

    try {
      const docRef = this.db.collection(collection).doc(docId);
      await docRef.set({
        ...data,
        updatedAt: new Date(),
        syncedAt: new Date(),
      });

      console.log(`✅ Documento salvo: ${collection}/${docId}`);
      return data;
    } catch (error) {
      console.error(`❌ Erro ao salvar ${collection}/${docId}:`, error);
      throw new Error("Erro ao salvar na nuvem. Verifique sua conexão com a internet.");
    }
  }

  async getDocument(collection, docId) {
    if (!this.isInitialized) {
      throw new Error("Firebase não inicializado. Verifique sua conexão com a internet.");
    }

    try {
      const doc = await this.db.collection(collection).doc(docId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar ${collection}/${docId}:`, error);
      throw new Error("Erro ao buscar dados da nuvem. Verifique sua conexão com a internet.");
    }
  }

  async getAllDocuments(collection) {
    if (!this.isInitialized) {
      throw new Error("Firebase não inicializado. Verifique sua conexão com a internet.");
    }

    try {
      const snapshot = await this.db.collection(collection).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`❌ Erro ao buscar todos os ${collection}:`, error);
      throw new Error("Erro ao buscar dados da nuvem. Verifique sua conexão com a internet.");
    }
  }

  async deleteDocument(collection, docId) {
    if (!this.isInitialized) {
      throw new Error("Firebase não inicializado. Verifique sua conexão com a internet.");
    }

    try {
      await this.db.collection(collection).doc(docId).delete();
      console.log(`✅ Documento excluído: ${collection}/${docId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao excluir ${collection}/${docId}:`, error);
      throw new Error("Erro ao excluir dados da nuvem. Verifique sua conexão com a internet.");
    }
  }

  // ===== LISTENERS EM TEMPO REAL =====
  subscribeToCollection(collection, callback) {
    if (!this.isInitialized) return;

    const unsubscribe = this.db.collection(collection).onSnapshot(
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(docs);
      },
      (error) => {
        console.error(`❌ Erro no listener de ${collection}:`, error);
      }
    );

    this.listeners.set(collection, unsubscribe);
    return unsubscribe;
  }

  unsubscribeFromCollection(collection) {
    const unsubscribe = this.listeners.get(collection);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(collection);
    }
  }

  // ===== STORAGE PARA FOTOS =====
  async uploadPhoto(file, path) {
    if (!this.isInitialized) {
      // Converter para base64 como fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      const storageRef = this.storage.ref().child(path);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();

      console.log("✅ Foto enviada:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("❌ Erro ao enviar foto:", error);
      // Fallback para base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  }

  async deletePhoto(url) {
    if (!this.isInitialized) return;

    try {
      const photoRef = this.storage.refFromURL(url);
      await photoRef.delete();
      console.log("✅ Foto excluída:", url);
    } catch (error) {
      console.error("❌ Erro ao excluir foto:", error);
    }
  }

  // ===== SINCRONIZAÇÃO =====
  async processSyncQueue() {
    if (!this.isOnline || !this.isInitialized || this.syncQueue.length === 0) {
      return;
    }

    console.log(
      `🔄 Processando ${this.syncQueue.length} itens da fila de sincronização`
    );

    for (const item of [...this.syncQueue]) {
      try {
        if (item.action === "save") {
          await this.saveDocument(item.collection, item.docId, item.data);
        } else if (item.action === "delete") {
          await this.deleteDocument(item.collection, item.docId);
        }

        // Remover da fila após sucesso
        const index = this.syncQueue.indexOf(item);
        if (index > -1) {
          this.syncQueue.splice(index, 1);
        }
      } catch (error) {
        console.error("❌ Erro na sincronização:", error);
      }
    }
  }

  // ===== MIGRAÇÃO DE DADOS =====
  async migrateFromLocalStorage() {
    if (!this.isInitialized) return;

    const collections = [
      "clients",
      "pets",
      "services",
      "appointments",
      "prontuarios",
    ];

    for (const collection of collections) {
      const localData = this.getAllFromLocalStorage(collection);

      for (const item of localData) {
        try {
          await this.saveDocument(collection, item.id, item);
          console.log(`✅ Migrado: ${collection}/${item.id}`);
        } catch (error) {
          console.error(`❌ Erro ao migrar ${collection}/${item.id}:`, error);
        }
      }
    }
  }

  // ===== VERIFICAÇÃO DE CONECTIVIDADE =====
  checkConnection() {
    if (!this.isOnline) {
      throw new Error("Sem conexão com a internet. Verifique sua rede.");
    }
    if (!this.isInitialized) {
      throw new Error("Sistema não inicializado. Recarregue a página.");
    }
  }

  // ===== UTILITÁRIOS =====
  isConnected() {
    return this.isOnline && this.isInitialized;
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isInitialized: this.isInitialized,
      queueLength: this.syncQueue.length,
      isConnected: this.isConnected(),
    };
  }
}

// Instância global
window.firebaseService = new FirebaseService();
