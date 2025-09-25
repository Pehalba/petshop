# 🔥 Configuração do Firebase

Este guia te ajudará a configurar o Firebase para sincronizar os dados do Pet Shop na nuvem.

## 📋 Pré-requisitos

1. Conta no Google (gmail)
2. Acesso ao [Firebase Console](https://console.firebase.google.com/)

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Criar um projeto"**
3. Digite o nome: `pet-shop-sistema` (ou o nome que preferir)
4. Desabilite o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### 2. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"** (para desenvolvimento)
4. Selecione uma localização (ex: `southamerica-east1`)
5. Clique em **"Ativar"**

### 3. Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Vá para a aba **"Sign-in method"**
4. Habilite **"Email/Password"**
5. Clique em **"Salvar"**

### 4. Configurar Storage (para fotos)

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Escolha **"Começar no modo de teste"**
4. Selecione a mesma localização do Firestore
5. Clique em **"Próximo"** e depois **"Concluído"**

### 5. Obter Configurações do Projeto

1. No menu lateral, clique no ícone de **engrenagem** ⚙️
2. Clique em **"Configurações do projeto"**
3. Role para baixo até **"Seus aplicativos"**
4. Clique no ícone **"</>"** (Web)
5. Digite um nome para o app: `pet-shop-web`
6. **NÃO** marque "Também configurar o Firebase Hosting"
7. Clique em **"Registrar app"**
8. Copie o objeto de configuração que aparece

### 6. Atualizar Configuração no Código

1. Abra o arquivo `src/js/FirebaseService.js`
2. Substitua o objeto `firebaseConfig` (linha 12-18) pelas suas configurações:

```javascript
this.firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

### 7. Configurar Regras de Segurança (Opcional)

#### Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload apenas para usuários autenticados
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Funcionalidades Ativadas

Após a configuração, o sistema terá:

- ✅ **Sincronização automática** dos dados na nuvem
- ✅ **Login/Registro** de usuários
- ✅ **Backup automático** na nuvem
- ✅ **Acesso de qualquer dispositivo** (com login)
- ✅ **Armazenamento de fotos** na nuvem
- ✅ **Modo offline** (funciona sem internet)
- ✅ **Sincronização em tempo real** entre dispositivos

## 🔧 Testando a Configuração

1. Abra o sistema no navegador
2. Clique no botão **"Entrar"** no canto superior direito
3. Crie uma conta ou faça login
4. Verifique se o status muda para **"☁️ Online"**
5. Teste criando um cliente - deve sincronizar automaticamente

## 🆘 Solução de Problemas

### Erro: "Firebase não inicializado"

- Verifique se as configurações estão corretas
- Verifique se o projeto Firebase está ativo

### Erro: "Permission denied"

- Verifique as regras de segurança do Firestore
- Certifique-se de que o usuário está logado

### Fotos não carregam

- Verifique as regras do Storage
- Verifique se o Storage está ativado

## 📞 Suporte

Se tiver problemas, verifique:

1. Console do navegador (F12) para erros
2. Firebase Console para logs
3. Regras de segurança do Firestore e Storage

---

**🎉 Pronto! Seu Pet Shop agora está na nuvem!**
