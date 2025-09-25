# 🐾 Sistema de Gerenciamento para Pet Shop

Sistema completo de gerenciamento para pet shops desenvolvido em HTML, CSS e JavaScript puro, espelhando a arquitetura do projeto "Pedidos – Nuvem".

## 🚀 Funcionalidades Implementadas

### ✅ Módulos Principais
- **Clientes**: CRUD completo com integração WhatsApp
- **Pets**: Cadastro com porte (Pequeno, Médio, Grande) e histórico
- **Serviços**: Sistema de variações de preço por porte do pet
- **Dashboard**: Métricas e visão geral do negócio

### ✅ Recursos Avançados
- **Variações de Preço**: Serviços com preços diferentes por porte do pet
- **Integração WhatsApp**: Links diretos para contato com clientes
- **Validações Inteligentes**: Formulários com validação em tempo real
- **Interface Responsiva**: Design adaptável para diferentes telas
- **Persistência Local**: Dados salvos no localStorage
- **Sistema de Badges**: Visualização clara de status e categorias

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com variáveis CSS e flexbox/grid
- **JavaScript ES6+**: Módulos, classes, async/await
- **LocalStorage**: Persistência de dados no navegador

## 📁 Estrutura do Projeto

```
Sistema_pet/
├── index.html              # Página principal (SPA)
├── src/
│   ├── css/
│   │   ├── main.css        # Estilos principais
│   │   ├── page.css        # Estilos específicos de páginas
│   │   └── elements.css    # Componentes e elementos
│   └── js/
│       ├── index.js        # Lógica principal da aplicação
│       ├── Store.js        # Camada de persistência
│       ├── UI.js           # Componentes de interface
│       ├── Utils.js        # Utilitários gerais
│       └── MoneyUtils.js   # Utilitários para formatação monetária
├── README.md
└── .gitignore
```

## 🎯 Funcionalidades Detalhadas

### Clientes
- Cadastro completo com dados pessoais e contato
- Integração WhatsApp com links diretos
- Vinculação automática com pets
- Busca e filtros avançados
- Validação de CPF, telefone e email

### Pets
- Cadastro com informações detalhadas
- Sistema de porte (Pequeno, Médio, Grande)
- Cálculo automático de idade
- Histórico médico e observações
- Vinculação com clientes

### Serviços
- CRUD completo de serviços
- Sistema de variações de preço por porte
- Controle de custos e margem
- Validação de preços únicos
- Interface intuitiva para configuração

## 🚀 Como Usar

1. **Abrir o sistema**: Abra o arquivo `index.html` no navegador
2. **Cadastrar clientes**: Comece cadastrando os tutores dos pets
3. **Cadastrar pets**: Adicione os pets vinculados aos clientes
4. **Configurar serviços**: Defina os serviços e preços por porte
5. **Gerenciar**: Use o dashboard para acompanhar o negócio

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-pet-shop.git
```

2. Abra o arquivo `index.html` no navegador

3. Pronto! O sistema está funcionando localmente

## 📱 Responsividade

O sistema foi desenvolvido com foco em responsividade:
- **Desktop**: Interface completa com todas as funcionalidades
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Interface otimizada para smartphones

## 🎨 Design System

- **Cores**: Paleta consistente com variáveis CSS
- **Tipografia**: Hierarquia clara e legível
- **Componentes**: Botões, formulários e tabelas padronizados
- **Ícones**: Sistema de ícones consistente
- **Espaçamentos**: Grid system para alinhamento

## 🔒 Persistência de Dados

- **LocalStorage**: Dados salvos localmente no navegador
- **Backup**: Sistema de exportação/importação de dados
- **Validação**: Dados validados antes de serem salvos
- **Integridade**: Verificação de consistência dos dados

## 🚧 Próximas Funcionalidades

- [ ] Sistema de agendamentos
- [ ] Ordens de serviço
- [ ] Relatórios avançados
- [ ] Integração com APIs externas
- [ ] Sistema de notificações

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Pedro Alba**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Pedro Alba](https://linkedin.com/in/pedro-alba)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!