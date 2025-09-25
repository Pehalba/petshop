/**
 * CsvImport.js - Sistema de Importação CSV
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class CsvImport {
  constructor() {
    this.supportedTypes = ["clients", "pets", "services", "professionals"];
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Event listeners serão adicionados conforme necessário
  }

  // ===== IMPORTAÇÃO DE CLIENTES =====
  importClients(csvData) {
    try {
      const clients = this.parseCsvData(csvData);
      const validatedClients = this.validateClients(clients);

      if (validatedClients.errors.length > 0) {
        ui.error("Erros de validação encontrados");
        return { success: false, errors: validatedClients.errors };
      }

      let imported = 0;
      let updated = 0;
      let errors = [];

      validatedClients.data.forEach((clientData) => {
        try {
          const existingClient = store
            .getClients()
            .find(
              (c) =>
                c.email === clientData.email ||
                c.telefoneWhatsApp === clientData.telefoneWhatsApp
            );

          if (existingClient) {
            // Atualizar cliente existente
            Object.keys(clientData).forEach((key) => {
              if (clientData[key] !== null && clientData[key] !== undefined) {
                existingClient[key] = clientData[key];
              }
            });
            existingClient.updatedAt = new Date().toISOString();
            store.saveClient(existingClient);
            updated++;
          } else {
            // Criar novo cliente
            const newClient = {
              id: store.generateId("cli"),
              ...clientData,
              dataCadastro: new Date().toISOString(),
              status: "ativo",
            };
            store.saveClient(newClient);
            imported++;
          }
        } catch (error) {
          errors.push(
            `Erro ao processar cliente ${clientData.nomeCompleto}: ${error.message}`
          );
        }
      });

      return {
        success: true,
        imported,
        updated,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na importação: ${error.message}`],
      };
    }
  }

  // ===== IMPORTAÇÃO DE PETS =====
  importPets(csvData) {
    try {
      const pets = this.parseCsvData(csvData);
      const validatedPets = this.validatePets(pets);

      if (validatedPets.errors.length > 0) {
        ui.error("Erros de validação encontrados");
        return { success: false, errors: validatedPets.errors };
      }

      let imported = 0;
      let updated = 0;
      let errors = [];

      validatedPets.data.forEach((petData) => {
        try {
          // Verificar se cliente existe
          const client = store
            .getClients()
            .find(
              (c) =>
                c.email === petData.clienteEmail ||
                c.telefoneWhatsApp === petData.clienteTelefone
            );

          if (!client) {
            errors.push(`Cliente não encontrado para pet ${petData.nome}`);
            return;
          }

          const existingPet = store
            .getPets()
            .find((p) => p.nome === petData.nome && p.clienteId === client.id);

          if (existingPet) {
            // Atualizar pet existente
            Object.keys(petData).forEach((key) => {
              if (
                key !== "clienteEmail" &&
                key !== "clienteTelefone" &&
                petData[key] !== null &&
                petData[key] !== undefined
              ) {
                existingPet[key] = petData[key];
              }
            });
            existingPet.updatedAt = new Date().toISOString();
            store.savePet(existingPet);
            updated++;
          } else {
            // Criar novo pet
            const newPet = {
              id: store.generateId("pet"),
              clienteId: client.id,
              ...petData,
              dataCadastro: new Date().toISOString(),
            };
            delete newPet.clienteEmail;
            delete newPet.clienteTelefone;
            store.savePet(newPet);
            imported++;
          }
        } catch (error) {
          errors.push(
            `Erro ao processar pet ${petData.nome}: ${error.message}`
          );
        }
      });

      return {
        success: true,
        imported,
        updated,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na importação: ${error.message}`],
      };
    }
  }

  // ===== IMPORTAÇÃO DE SERVIÇOS =====
  importServices(csvData) {
    try {
      const services = this.parseCsvData(csvData);
      const validatedServices = this.validateServices(services);

      if (validatedServices.errors.length > 0) {
        ui.error("Erros de validação encontrados");
        return { success: false, errors: validatedServices.errors };
      }

      let imported = 0;
      let updated = 0;
      let errors = [];

      validatedServices.data.forEach((serviceData) => {
        try {
          const existingService = store
            .getServices()
            .find((s) => s.nome === serviceData.nome);

          if (existingService) {
            // Atualizar serviço existente
            Object.keys(serviceData).forEach((key) => {
              if (serviceData[key] !== null && serviceData[key] !== undefined) {
                existingService[key] = serviceData[key];
              }
            });
            existingService.updatedAt = new Date().toISOString();
            store.saveService(existingService);
            updated++;
          } else {
            // Criar novo serviço
            const newService = {
              id: store.generateId("srv"),
              ...serviceData,
              ativo: true,
            };
            store.saveService(newService);
            imported++;
          }
        } catch (error) {
          errors.push(
            `Erro ao processar serviço ${serviceData.nome}: ${error.message}`
          );
        }
      });

      return {
        success: true,
        imported,
        updated,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na importação: ${error.message}`],
      };
    }
  }

  // ===== IMPORTAÇÃO DE PROFISSIONAIS =====
  importProfessionals(csvData) {
    try {
      const professionals = this.parseCsvData(csvData);
      const validatedProfessionals = this.validateProfessionals(professionals);

      if (validatedProfessionals.errors.length > 0) {
        ui.error("Erros de validação encontrados");
        return { success: false, errors: validatedProfessionals.errors };
      }

      let imported = 0;
      let updated = 0;
      let errors = [];

      validatedProfessionals.data.forEach((professionalData) => {
        try {
          const existingProfessional = store
            .getProfessionals()
            .find(
              (p) =>
                p.nome === professionalData.nome ||
                p.email === professionalData.email
            );

          if (existingProfessional) {
            // Atualizar profissional existente
            Object.keys(professionalData).forEach((key) => {
              if (
                professionalData[key] !== null &&
                professionalData[key] !== undefined
              ) {
                existingProfessional[key] = professionalData[key];
              }
            });
            existingProfessional.updatedAt = new Date().toISOString();
            store.saveProfessional(existingProfessional);
            updated++;
          } else {
            // Criar novo profissional
            const newProfessional = {
              id: store.generateId("prof"),
              ...professionalData,
              ativo: true,
            };
            store.saveProfessional(newProfessional);
            imported++;
          }
        } catch (error) {
          errors.push(
            `Erro ao processar profissional ${professionalData.nome}: ${error.message}`
          );
        }
      });

      return {
        success: true,
        imported,
        updated,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na importação: ${error.message}`],
      };
    }
  }

  // ===== PARSING DE CSV =====
  parseCsvData(csvData) {
    if (typeof csvData === "string") {
      return Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      }).data;
    }
    return csvData;
  }

  // ===== VALIDAÇÕES =====
  validateClients(clients) {
    const errors = [];
    const validatedClients = [];

    clients.forEach((client, index) => {
      const clientErrors = [];

      // Campos obrigatórios
      if (!client.nomecompleto && !client.nome_completo) {
        clientErrors.push("Nome completo é obrigatório");
      }

      if (!client.telefone && !client.telefonewhatsapp) {
        clientErrors.push("Telefone é obrigatório");
      }

      // Validar email se informado
      if (client.email && !utils.validateEmail(client.email)) {
        clientErrors.push("Email inválido");
      }

      // Validar CPF se informado
      if (client.cpf && !utils.validateCPF(client.cpf)) {
        clientErrors.push("CPF inválido");
      }

      if (clientErrors.length > 0) {
        errors.push(`Linha ${index + 2}: ${clientErrors.join(", ")}`);
      } else {
        // Normalizar dados
        const normalizedClient = {
          nomeCompleto: client.nomecompleto || client.nome_completo,
          telefoneWhatsApp: utils.formatPhoneInput(
            client.telefone || client.telefonewhatsapp
          ),
          email: client.email || "",
          cpfOpcional: client.cpf ? utils.formatCPF(client.cpf) : "",
          endereco: {
            rua: client.rua || "",
            numero: client.numero || "",
            bairro: client.bairro || "",
            cidade: client.cidade || "",
            uf: client.uf || "PR",
            cep: client.cep ? utils.formatCEP(client.cep) : "",
          },
          observacoes: client.observacoes || "",
        };
        validatedClients.push(normalizedClient);
      }
    });

    return {
      data: validatedClients,
      errors,
    };
  }

  validatePets(pets) {
    const errors = [];
    const validatedPets = [];

    pets.forEach((pet, index) => {
      const petErrors = [];

      // Campos obrigatórios
      if (!pet.nome) {
        petErrors.push("Nome é obrigatório");
      }

      if (!pet.especie) {
        petErrors.push("Espécie é obrigatória");
      }

      if (!pet.raca) {
        petErrors.push("Raça é obrigatória");
      }

      if (!pet.clienteemail && !pet.cliente_telefone) {
        petErrors.push("Email ou telefone do cliente é obrigatório");
      }

      // Validar peso se informado
      if (pet.peso && isNaN(parseFloat(pet.peso))) {
        petErrors.push("Peso deve ser um número");
      }

      if (petErrors.length > 0) {
        errors.push(`Linha ${index + 2}: ${petErrors.join(", ")}`);
      } else {
        // Normalizar dados
        const normalizedPet = {
          nome: pet.nome,
          especie: pet.especie.toLowerCase(),
          raca: pet.raca,
          sexo: pet.sexo || "M",
          dataNascimento: pet.datanascimento || pet.data_nascimento || "",
          pesoAtualKg: pet.peso ? parseFloat(pet.peso) : 0,
          pelagem: pet.pelagem || "",
          microchipOpcional: pet.microchip || "",
          vacinas: pet.vacinas ? JSON.parse(pet.vacinas) : [],
          vermifugacao: pet.vermifugacao ? JSON.parse(pet.vermifugacao) : [],
          alergiasAtenções: pet.alergias || "",
          temperamento: pet.temperamento || "",
          fotoUrl: pet.foto || "",
          observacoesGrooming: pet.observacoes || "",
          restricoesSaude: pet.restricoes || "",
          clienteEmail: pet.clienteemail || "",
          clienteTelefone: pet.cliente_telefone || "",
        };
        validatedPets.push(normalizedPet);
      }
    });

    return {
      data: validatedPets,
      errors,
    };
  }

  validateServices(services) {
    const errors = [];
    const validatedServices = [];

    services.forEach((service, index) => {
      const serviceErrors = [];

      // Campos obrigatórios
      if (!service.nome) {
        serviceErrors.push("Nome é obrigatório");
      }

      if (!service.preco && !service.preco_base) {
        serviceErrors.push("Preço base é obrigatório");
      }

      // Validar preço
      const preco = parseFloat(service.preco || service.preco_base);
      if (isNaN(preco) || preco < 0) {
        serviceErrors.push("Preço deve ser um número positivo");
      }

      if (serviceErrors.length > 0) {
        errors.push(`Linha ${index + 2}: ${serviceErrors.join(", ")}`);
      } else {
        // Normalizar dados
        const normalizedService = {
          nome: service.nome,
          descricao: service.descricao || "",
          precoBase: preco,
          variacoes: service.variacoes
            ? JSON.parse(service.variacoes)
            : [
                { porte: "P", fator: 1.0 },
                { porte: "M", fator: 1.2 },
                { porte: "G", fator: 1.5 },
                { porte: "XXG", fator: 2.0 },
              ],
          duracaoMinutos: service.duracao ? parseInt(service.duracao) : 60,
          itensInclusos: service.itens_inclusos
            ? JSON.parse(service.itens_inclusos)
            : [],
          adicionais: service.adicionais ? JSON.parse(service.adicionais) : [],
        };
        validatedServices.push(normalizedService);
      }
    });

    return {
      data: validatedServices,
      errors,
    };
  }

  validateProfessionals(professionals) {
    const errors = [];
    const validatedProfessionals = [];

    professionals.forEach((professional, index) => {
      const professionalErrors = [];

      // Campos obrigatórios
      if (!professional.nome) {
        professionalErrors.push("Nome é obrigatório");
      }

      if (!professional.email) {
        professionalErrors.push("Email é obrigatório");
      }

      // Validar email
      if (professional.email && !utils.validateEmail(professional.email)) {
        professionalErrors.push("Email inválido");
      }

      if (professionalErrors.length > 0) {
        errors.push(`Linha ${index + 2}: ${professionalErrors.join(", ")}`);
      } else {
        // Normalizar dados
        const normalizedProfessional = {
          nome: professional.nome,
          email: professional.email,
          telefone: professional.telefone || "",
          especialidade: professional.especialidade || "Grooming",
          ativo: true,
        };
        validatedProfessionals.push(normalizedProfessional);
      }
    });

    return {
      data: validatedProfessionals,
      errors,
    };
  }

  // ===== TEMPLATES DE CSV =====
  getClientTemplate() {
    return `nomecompleto,telefone,email,cpf,rua,numero,bairro,cidade,uf,cep,observacoes
João Silva,+55 41 99999-9999,joao@email.com,123.456.789-00,Rua das Flores,123,Centro,Curitiba,PR,80010-000,Cliente preferencial
Maria Santos,+55 41 88888-8888,maria@email.com,,Rua das Palmeiras,456,Vila Nova,Curitiba,PR,80020-000,`;
  }

  getPetTemplate() {
    return `nome,especie,raca,sexo,data_nascimento,peso,pelagem,microchip,cliente_telefone,observacoes
Rex,cão,Golden Retriever,M,2022-05-10,30.5,longo,123456789,+55 41 99999-9999,Prefere água morna
Mimi,gato,Persa,F,2021-03-15,4.2,longo,,+55 41 88888-8888,Alérgica a pulgas`;
  }

  getServiceTemplate() {
    return `nome,descricao,preco_base,duracao,itens_inclusos,adicionais
Banho,Banho completo com shampoo e condicionador,50.00,60,"[""Shampoo"",""Condicionador"",""Secador""]","[{""nome"":""Hidratação"",""preco"":20.00}]"
Tosa,Tosa higiênica,30.00,45,"[""Tesoura"",""Máquina""]","[{""nome"":""Tosa completa"",""preco"":40.00}]"`;
  }

  getProfessionalTemplate() {
    return `nome,email,telefone,especialidade
Ana Silva,ana@petshop.com,+55 41 77777-7777,Grooming
Carlos Santos,carlos@petshop.com,+55 41 66666-6666,Tosa`;
  }

  // ===== DOWNLOAD DE TEMPLATES =====
  downloadTemplate(type) {
    let template = "";
    let filename = "";

    switch (type) {
      case "clients":
        template = this.getClientTemplate();
        filename = "template-clientes.csv";
        break;
      case "pets":
        template = this.getPetTemplate();
        filename = "template-pets.csv";
        break;
      case "services":
        template = this.getServiceTemplate();
        filename = "template-servicos.csv";
        break;
      case "professionals":
        template = this.getProfessionalTemplate();
        filename = "template-profissionais.csv";
        break;
      default:
        ui.error("Tipo de template não suportado");
        return;
    }

    utils.downloadFile(template, filename, "text/csv");
    ui.success("Template baixado com sucesso!");
  }

  // ===== UTILITÁRIOS =====
  getSupportedTypes() {
    return this.supportedTypes;
  }

  isTypeSupported(type) {
    return this.supportedTypes.includes(type);
  }
}

// Instância global
window.csvImport = new CsvImport();
