# 🐾 Sistema de Gerenciamento Pet Shop

Sistema completo de gerenciamento para Pet Shop com sincronização na nuvem, desenvolvido em HTML, CSS e JavaScript puro.

## 🌐 **Acesso Online**

**URL:** https://pehalba.github.io/petshop

## ✨ **Funcionalidades**

### 📊 **Dashboard**
- Visão geral do negócio
- Métricas em tempo real
- Agendamentos do dia

### 👥 **Clientes**
- Cadastro completo de tutores
- Integração WhatsApp
- Histórico de pets e serviços

### 🐕 **Pets**
- Cadastro detalhado dos animais
- Prontuários veterinários
- Histórico médico com fotos
- Controle de vacinas e vermífugos

### ✂️ **Serviços**
- Catálogo de serviços personalizável
- Preços por porte (Pequeno, Médio, Grande)
- Controle de custos e margens

### 📅 **Agendamentos**
- Calendário visual
- Gestão de horários
- Controle de profissionais
- Status de pagamento

### 🏥 **Prontuários Veterinários**
- Histórico dermatológico
- Upload de fotos
- Controle de evolução
- Relatórios por pet

## ☁️ **Sincronização na Nuvem**

### **Modo Online:**
- Dados sincronizados automaticamente
- Acesso de qualquer dispositivo
- Backup automático na nuvem
- Fotos armazenadas na nuvem

### **Modo Offline:**
- Funciona sem internet
- Dados salvos localmente
- Sincronização automática quando voltar online

## 🔐 **Autenticação**

- Login/Registro seguro
- Dados privados por usuário
- Acesso multiplataforma
- Sincronização em tempo real

## 🚀 **Como Usar**

### **1. Acesso Rápido:**
1. Acesse: https://pehalba.github.io/petshop
2. Clique em **"Entrar"** no canto superior direito
3. Crie uma conta ou faça login
4. Comece a usar o sistema!

### **2. Configuração Firebase (Opcional):**
Para sincronização na nuvem, siga o guia em `FIREBASE_SETUP.md`

### **3. Uso Offline:**
O sistema funciona perfeitamente sem internet, salvando dados localmente.

## 📱 **Dispositivos Suportados**

- ✅ **Desktop** (Windows, Mac, Linux)
- ✅ **Tablet** (iPad, Android)
- ✅ **Mobile** (iPhone, Android)
- ✅ **Qualquer navegador moderno**

## 🛠️ **Tecnologias**

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Storage:** LocalStorage + Cloud Sync
- **Deploy:** GitHub Pages

## 📋 **Estrutura do Projeto**

```
/
├── index.html              # Página principal
├── src/
│   ├── css/               # Estilos
│   └── js/                # JavaScript
│       ├── Store.js       # Persistência de dados
│       ├── FirebaseService.js # Sincronização na nuvem
│       ├── AuthComponent.js   # Autenticação
│       └── index.js       # Lógica principal
├── FIREBASE_SETUP.md      # Guia de configuração
└── README.md              # Este arquivo
```

## 🔧 **Desenvolvimento Local**

1. Clone o repositório:
```bash
git clone https://github.com/Pehalba/petshop.git
cd petshop
```

2. Abra `index.html` no navegador

3. Para desenvolvimento com servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## 📊 **Funcionalidades Avançadas**

### **Relatórios:**
- Faturamento por período
- Serviços mais vendidos
- Clientes recorrentes
- Exportação CSV/Excel

### **Integrações:**
- WhatsApp para comunicação
- Backup/Restore de dados
- Impressão de recibos
- Etiquetas para pets

### **Gestão:**
- Múltiplos profissionais
- Controle de estoque
- Lembretes automáticos
- Histórico completo

## 🆘 **Suporte**

### **Problemas Comuns:**

**Sistema não carrega:**
- Verifique se está acessando a URL correta
- Limpe o cache do navegador
- Teste em modo anônimo

**Dados não sincronizam:**
- Verifique a conexão com internet
- Faça login novamente
- Verifique as configurações do Firebase

**Fotos não carregam:**
- Verifique as permissões do navegador
- Teste com imagens menores
- Verifique o espaço de armazenamento

### **Contato:**
- **GitHub Issues:** https://github.com/Pehalba/petshop/issues
- **Email:** [Seu email aqui]

## 📈 **Roadmap**

- [ ] App mobile nativo
- [ ] Integração com sistemas de pagamento
- [ ] Relatórios avançados
- [ ] Notificações push
- [ ] API para integrações

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**🎉 Desenvolvido com ❤️ para Pet Shops**

**Versão:** 2.0.0  
**Última atualização:** Janeiro 2025