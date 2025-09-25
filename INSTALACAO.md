# Guia de Instalação - Sistema Pet Shop

## 📋 Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (apenas para fontes e bibliotecas externas)
- Espaço em disco: ~10MB

## 🚀 Instalação Rápida

### Opção 1: Download Direto

1. Baixe todos os arquivos do projeto
2. Extraia em uma pasta local
3. Abra `index.html` no navegador
4. Complete o onboarding

### Opção 2: Clone do Repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-pet-shop
```

## 🔧 Configuração Inicial

### 1. Primeira Execução

Ao abrir o sistema pela primeira vez, você será direcionado para o onboarding:

1. **Configurações Gerais**

   - Nome do Pet Shop
   - Telefone de contato
   - Email de contato

2. **Cadastrar Serviços**

   - Adicione pelo menos um serviço
   - Configure preços por porte
   - Defina duração e adicionais

3. **Configurar Profissionais**

   - Adicione os profissionais
   - Defina especialidades

4. **Finalizar**
   - Sistema estará pronto para uso

### 2. Configurações Avançadas

#### Backup Automático

- O sistema faz backup automático no localStorage
- Exporte dados regularmente via menu Configurações
- Importe backup quando necessário

#### Integração WhatsApp

- Configure mensagens padrão em Configurações
- Use botões de WhatsApp para contato direto
- Lembretes automáticos de agendamentos

## 📁 Estrutura de Arquivos

```
sistema-pet-shop/
├── index.html              # Página principal
├── README.md              # Documentação
├── INSTALACAO.md          # Este arquivo
├── favicon.ico            # Ícone do site
├── vendor/                # Bibliotecas externas
│   ├── normalize.css      # Reset CSS
│   ├── fonts.css          # Fontes
│   └── papaparse.min.js   # Parser CSV
└── src/                   # Código fonte
    ├── css/               # Estilos
    └── js/                # JavaScript
```

## 🌐 Hospedagem Local

### Usando Python (Recomendado)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Acesse: http://localhost:8000

### Usando Node.js

```bash
# Instalar servidor local
npm install -g http-server

# Executar
http-server -p 8000
```

Acesse: http://localhost:8000

### Usando PHP

```bash
php -S localhost:8000
```

Acesse: http://localhost:8000

## 🔒 Segurança

### Dados Locais

- Todos os dados são armazenados no navegador
- Não há servidor externo
- Backup manual necessário

### Recomendações

- Faça backup regular dos dados
- Use HTTPS em produção
- Mantenha o navegador atualizado

## 📱 Acesso Mobile

### PWA (Progressive Web App)

1. Abra o sistema no navegador mobile
2. Adicione à tela inicial
3. Use como app nativo

### Responsividade

- Interface adaptada para mobile
- Touch-friendly
- Navegação otimizada

## 🔄 Atualizações

### Backup Antes de Atualizar

1. Vá em Configurações
2. Clique em "Exportar Backup"
3. Salve o arquivo JSON

### Aplicar Atualização

1. Substitua os arquivos antigos
2. Mantenha o backup seguro
3. Teste em ambiente de desenvolvimento

### Restaurar Dados

1. Vá em Configurações
2. Clique em "Importar Backup"
3. Selecione o arquivo JSON

## 🐛 Solução de Problemas

### Problema: Sistema não carrega

**Solução:**

- Verifique se todos os arquivos estão presentes
- Use servidor local (não abra diretamente o HTML)
- Verifique console do navegador para erros

### Problema: Dados não salvam

**Solução:**

- Verifique se localStorage está habilitado
- Limpe cache do navegador
- Verifique espaço em disco

### Problema: Onboarding não aparece

**Solução:**

- Limpe localStorage do navegador
- Recarregue a página
- Verifique se é primeira execução

### Problema: WhatsApp não funciona

**Solução:**

- Verifique formato do telefone
- Use formato: +55 41 99999-9999
- Teste em dispositivo mobile

## 📊 Performance

### Otimizações

- Dados carregados sob demanda
- Cache local eficiente
- Compressão de imagens

### Limites

- Máximo 1000 registros por módulo
- Backup limitado a 10MB
- Sessão de 8 horas

## 🔧 Personalização

### Cores e Tema

Edite `src/css/main.css`:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  /* ... outras variáveis */
}
```

### Logo e Favicon

- Substitua `favicon.ico`
- Edite logo no header
- Adicione imagens em `src/images/`

### Mensagens WhatsApp

Configure em Configurações > Mensagens:

- Confirmação de agendamento
- Lembrete de agendamento
- Serviço concluído
- Lembrete de pagamento

## 📞 Suporte

### Documentação

- README.md - Visão geral
- INSTALACAO.md - Este arquivo
- Código comentado

### Logs

- Console do navegador (F12)
- Logs de erro automáticos
- Histórico de atividades

### Backup de Emergência

Se o sistema não funcionar:

1. Exporte dados via console
2. Limpe localStorage
3. Reinicie o sistema
4. Importe backup

## 🎯 Próximos Passos

Após a instalação:

1. Complete o onboarding
2. Cadastre clientes e pets
3. Configure serviços
4. Crie agendamentos
5. Teste o fluxo completo
6. Faça backup dos dados

---

**Sistema Pet Shop v1.0.0**  
_Desenvolvido para facilitar o gerenciamento do seu pet shop_
