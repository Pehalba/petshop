/**
 * Printing.js - Sistema de impressão
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class Printing {
  constructor() {
    this.init();
  }

  init() {
    // Adicionar estilos de impressão
    this.addPrintStyles();
  }

  addPrintStyles() {
    const style = document.createElement("style");
    style.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .printable, .printable * {
                    visibility: visible;
                }
                .printable {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
                .print-break {
                    page-break-before: always;
                }
                .print-break-after {
                    page-break-after: always;
                }
                .print-break-inside-avoid {
                    page-break-inside: avoid;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // ===== IMPRESSÃO DE RECIBO =====
  printReceipt(payment) {
    const receipt = this.generateReceipt(payment);
    this.printContent(receipt, "Recibo de Pagamento");
  }

  generateReceipt(payment) {
    const order = store.getOrder(payment.ordemId);
    const client = store.getClient(order.clienteId);
    const pet = store.getPet(order.petId);
    const settings = store.getSettings();

    return `
            <div class="printable receipt">
                <div class="receipt-header">
                    <h1>${settings.businessName || "Pet Shop"}</h1>
                    <p>${settings.businessPhone || ""}</p>
                    <p>${settings.businessEmail || ""}</p>
                    <p>${this.formatAddress(settings.businessAddress)}</p>
                </div>
                
                <div class="receipt-body">
                    <div class="receipt-info">
                        <h2>RECIBO DE PAGAMENTO</h2>
                        <p><strong>Número:</strong> ${payment.id}</p>
                        <p><strong>Data:</strong> ${utils.formatDateTime(
                          payment.dataPagamento
                        )}</p>
                        <p><strong>Cliente:</strong> ${client.nomeCompleto}</p>
                        <p><strong>Pet:</strong> ${pet.nome} (${pet.raca})</p>
                    </div>
                    
                    <div class="receipt-services">
                        <h3>Serviços Realizados</h3>
                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th>Serviço</th>
                                    <th>Quantidade</th>
                                    <th>Preço Unit.</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.servicosSelecionados
                                  .map(
                                    (service) => `
                                    <tr>
                                        <td>${service.nome}</td>
                                        <td>1</td>
                                        <td>${utils.formatCurrency(
                                          service.preco
                                        )}</td>
                                        <td>${utils.formatCurrency(
                                          service.preco
                                        )}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="receipt-totals">
                        <div class="receipt-total-row">
                            <span>Subtotal:</span>
                            <span>${utils.formatCurrency(
                              payment.valorTotal
                            )}</span>
                        </div>
                        ${
                          payment.descontos > 0
                            ? `
                            <div class="receipt-total-row">
                                <span>Descontos:</span>
                                <span>-${utils.formatCurrency(
                                  payment.descontos
                                )}</span>
                            </div>
                        `
                            : ""
                        }
                        ${
                          payment.acrescimos > 0
                            ? `
                            <div class="receipt-total-row">
                                <span>Acréscimos:</span>
                                <span>+${utils.formatCurrency(
                                  payment.acrescimos
                                )}</span>
                            </div>
                        `
                            : ""
                        }
                        <div class="receipt-total-row receipt-total-final">
                            <span><strong>Total:</strong></span>
                            <span><strong>${utils.formatCurrency(
                              payment.valorTotal -
                                payment.descontos +
                                payment.acrescimos
                            )}</strong></span>
                        </div>
                    </div>
                    
                    <div class="receipt-payment">
                        <h3>Informações do Pagamento</h3>
                        <p><strong>Método:</strong> ${this.formatPaymentMethod(
                          payment.metodo
                        )}</p>
                        ${
                          payment.parcelas > 1
                            ? `<p><strong>Parcelas:</strong> ${payment.parcelas}x</p>`
                            : ""
                        }
                        <p><strong>Status:</strong> ${this.formatPaymentStatus(
                          payment.status
                        )}</p>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>Obrigado pela preferência!</p>
                    <p>Volte sempre!</p>
                </div>
            </div>
        `;
  }

  // ===== IMPRESSÃO DE ORDEM DE SERVIÇO =====
  printServiceOrder(order) {
    const orderDoc = this.generateServiceOrder(order);
    this.printContent(orderDoc, "Ordem de Serviço");
  }

  generateServiceOrder(order) {
    const client = store.getClient(order.clienteId);
    const pet = store.getPet(order.petId);
    const professional = store.getProfessional(order.profissionalId);
    const settings = store.getSettings();

    return `
            <div class="printable service-order">
                <div class="order-header">
                    <h1>ORDEM DE SERVIÇO</h1>
                    <p><strong>Número:</strong> ${order.id}</p>
                    <p><strong>Data:</strong> ${utils.formatDateTime(
                      order.dataHora
                    )}</p>
                </div>
                
                <div class="order-body">
                    <div class="order-info">
                        <h3>Informações do Cliente</h3>
                        <p><strong>Nome:</strong> ${client.nomeCompleto}</p>
                        <p><strong>Telefone:</strong> ${
                          client.telefoneWhatsApp
                        }</p>
                        <p><strong>Email:</strong> ${
                          client.email || "Não informado"
                        }</p>
                        <p><strong>Endereço:</strong> ${this.formatAddress(
                          client.endereco
                        )}</p>
                    </div>
                    
                    <div class="order-pet">
                        <h3>Informações do Pet</h3>
                        <p><strong>Nome:</strong> ${pet.nome}</p>
                        <p><strong>Espécie:</strong> ${pet.especie}</p>
                        <p><strong>Raça:</strong> ${pet.raca}</p>
                        <p><strong>Idade:</strong> ${utils.calculateAge(
                          pet.dataNascimento
                        )} anos</p>
                        <p><strong>Peso:</strong> ${pet.pesoAtualKg} kg</p>
                        <p><strong>Observações:</strong> ${
                          pet.observacoesGrooming || "Nenhuma"
                        }</p>
                    </div>
                    
                    <div class="order-services">
                        <h3>Serviços Solicitados</h3>
                        <table class="order-table">
                            <thead>
                                <tr>
                                    <th>Serviço</th>
                                    <th>Duração</th>
                                    <th>Preço</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.servicosSelecionados
                                  .map(
                                    (service) => `
                                    <tr>
                                        <td>${service.nome}</td>
                                        <td>${service.duracaoMinutos} min</td>
                                        <td>${utils.formatCurrency(
                                          service.preco
                                        )}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="order-professional">
                        <h3>Profissional Responsável</h3>
                        <p><strong>Nome:</strong> ${professional.nome}</p>
                        <p><strong>Especialidade:</strong> ${
                          professional.especialidade || "Grooming"
                        }</p>
                    </div>
                    
                    <div class="order-checklist">
                        <h3>Checklist de Entrada</h3>
                        <div class="checklist-items">
                            <label><input type="checkbox"> Pet recebido</label>
                            <label><input type="checkbox"> Documentos verificados</label>
                            <label><input type="checkbox"> Estado geral avaliado</label>
                            <label><input type="checkbox"> Observações anotadas</label>
                        </div>
                    </div>
                    
                    <div class="order-checklist">
                        <h3>Checklist de Saída</h3>
                        <div class="checklist-items">
                            <label><input type="checkbox"> Serviços concluídos</label>
                            <label><input type="checkbox"> Pet limpo e seco</label>
                            <label><input type="checkbox"> Unhas aparadas</label>
                            <label><input type="checkbox"> Cliente notificado</label>
                        </div>
                    </div>
                </div>
                
                <div class="order-footer">
                    <div class="signature-section">
                        <p>Assinatura do Cliente:</p>
                        <div class="signature-line"></div>
                        <p>Data: ___/___/______</p>
                    </div>
                </div>
            </div>
        `;
  }

  // ===== IMPRESSÃO DE ETIQUETAS =====
  printLabels(items, labelType = "pet") {
    const labels = this.generateLabels(items, labelType);
    this.printContent(labels, "Etiquetas");
  }

  generateLabels(items, labelType) {
    const settings = store.getSettings();

    return `
            <div class="printable labels">
                <div class="labels-grid">
                    ${items
                      .map((item) => {
                        if (labelType === "pet") {
                          return this.generatePetLabel(item);
                        } else if (labelType === "client") {
                          return this.generateClientLabel(item);
                        }
                        return "";
                      })
                      .join("")}
                </div>
            </div>
        `;
  }

  generatePetLabel(pet) {
    const client = store.getClient(pet.clienteId);

    return `
            <div class="label pet-label">
                <div class="label-header">
                    <h3>${pet.nome}</h3>
                    <p>${pet.raca} - ${pet.especie}</p>
                </div>
                <div class="label-body">
                    <p><strong>Cliente:</strong> ${client.nomeCompleto}</p>
                    <p><strong>Peso:</strong> ${pet.pesoAtualKg} kg</p>
                    <p><strong>Idade:</strong> ${utils.calculateAge(
                      pet.dataNascimento
                    )} anos</p>
                    <p><strong>Observações:</strong> ${
                      pet.observacoesGrooming || "Nenhuma"
                    }</p>
                </div>
                <div class="label-footer">
                    <p>${new Date().toLocaleDateString("pt-BR")}</p>
                </div>
            </div>
        `;
  }

  generateClientLabel(client) {
    return `
            <div class="label client-label">
                <div class="label-header">
                    <h3>${client.nomeCompleto}</h3>
                </div>
                <div class="label-body">
                    <p><strong>Telefone:</strong> ${client.telefoneWhatsApp}</p>
                    <p><strong>Email:</strong> ${
                      client.email || "Não informado"
                    }</p>
                    <p><strong>Endereço:</strong> ${this.formatAddress(
                      client.endereco
                    )}</p>
                </div>
                <div class="label-footer">
                    <p>Cliente desde: ${utils.formatDate(
                      client.dataCadastro
                    )}</p>
                </div>
            </div>
        `;
  }

  // ===== IMPRESSÃO DE RELATÓRIOS =====
  printReport(reportData, reportType) {
    const report = this.generateReport(reportData, reportType);
    this.printContent(report, `Relatório - ${reportType}`);
  }

  generateReport(reportData, reportType) {
    const settings = store.getSettings();

    return `
            <div class="printable report">
                <div class="report-header">
                    <h1>${settings.businessName || "Pet Shop"}</h1>
                    <h2>Relatório - ${reportType}</h2>
                    <p>Gerado em: ${utils.formatDateTime(new Date())}</p>
                </div>
                
                <div class="report-body">
                    ${this.generateReportContent(reportData, reportType)}
                </div>
                
                <div class="report-footer">
                    <p>Sistema Pet Shop - Relatório gerado automaticamente</p>
                </div>
            </div>
        `;
  }

  generateReportContent(reportData, reportType) {
    switch (reportType) {
      case "faturamento":
        return this.generateFaturamentoReport(reportData);
      case "servicos":
        return this.generateServicosReport(reportData);
      case "clientes":
        return this.generateClientesReport(reportData);
      case "agendamentos":
        return this.generateAgendamentosReport(reportData);
      default:
        return "<p>Relatório não disponível</p>";
    }
  }

  generateFaturamentoReport(data) {
    return `
            <div class="report-section">
                <h3>Resumo Financeiro</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Total de Vendas</th>
                            <th>Ticket Médio</th>
                            <th>Pagamentos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.periods
                          .map(
                            (period) => `
                            <tr>
                                <td>${period.period}</td>
                                <td>${utils.formatCurrency(
                                  period.totalSales
                                )}</td>
                                <td>${utils.formatCurrency(
                                  period.averageTicket
                                )}</td>
                                <td>${period.paymentCount}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  generateServicosReport(data) {
    return `
            <div class="report-section">
                <h3>Serviços Mais Vendidos</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Quantidade</th>
                            <th>Receita</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.services
                          .map(
                            (service) => `
                            <tr>
                                <td>${service.nome}</td>
                                <td>${service.quantidade}</td>
                                <td>${utils.formatCurrency(
                                  service.receita
                                )}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  generateClientesReport(data) {
    return `
            <div class="report-section">
                <h3>Clientes Mais Ativos</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Pets</th>
                            <th>Agendamentos</th>
                            <th>Valor Gasto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.clients
                          .map(
                            (client) => `
                            <tr>
                                <td>${client.nomeCompleto}</td>
                                <td>${client.petsCount}</td>
                                <td>${client.appointmentsCount}</td>
                                <td>${utils.formatCurrency(
                                  client.totalSpent
                                )}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  generateAgendamentosReport(data) {
    return `
            <div class="report-section">
                <h3>Agendamentos por Período</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Pet</th>
                            <th>Serviços</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.appointments
                          .map(
                            (apt) => `
                            <tr>
                                <td>${utils.formatDateTime(apt.dataHora)}</td>
                                <td>${apt.clienteNome}</td>
                                <td>${apt.petNome}</td>
                                <td>${apt.servicosSelecionados
                                  .map((s) => s.nome)
                                  .join(", ")}</td>
                                <td>${apt.status}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  // ===== IMPRESSÃO GENÉRICA =====
  printContent(content, title = "Documento") {
    // Criar elemento temporário
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .printable {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .receipt, .service-order, .report {
                        background: white;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .receipt-header, .order-header, .report-header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .receipt-table, .order-table, .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .receipt-table th, .receipt-table td,
                    .order-table th, .order-table td,
                    .report-table th, .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .receipt-table th, .order-table th, .report-table th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .receipt-totals {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .receipt-total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                    }
                    .receipt-total-final {
                        border-top: 2px solid #333;
                        padding-top: 10px;
                        font-size: 1.2em;
                    }
                    .labels-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                    .label {
                        border: 1px solid #ddd;
                        padding: 15px;
                        border-radius: 8px;
                        background: #f9f9f9;
                    }
                    .label-header {
                        text-align: center;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    .checklist-items {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .checklist-items label {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .signature-section {
                        margin-top: 40px;
                        text-align: center;
                    }
                    .signature-line {
                        border-bottom: 1px solid #333;
                        width: 300px;
                        margin: 20px auto;
                    }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .printable { border: none; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);

    printWindow.document.close();
    printWindow.focus();

    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  // ===== UTILITÁRIOS =====
  formatAddress(address) {
    if (!address) return "";

    const parts = [
      address.rua,
      address.numero,
      address.bairro,
      address.cidade,
      address.uf,
      address.cep,
    ].filter((part) => part && part.trim());

    return parts.join(", ");
  }

  formatPaymentMethod(method) {
    const methods = {
      pix: "PIX",
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      transferencia: "Transferência Bancária",
    };

    return methods[method] || method;
  }

  formatPaymentStatus(status) {
    const statuses = {
      pendente: "Pendente",
      pago: "Pago",
      cancelado: "Cancelado",
      reembolsado: "Reembolsado",
    };

    return statuses[status] || status;
  }
}

// Instância global
window.printing = new Printing();
