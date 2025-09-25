/**
 * UI.js - Componentes de interface
 * Baseado no padrão do projeto "Pedidos – Nuvem"
 * Adaptado para Pet Shop
 */

class UI {
  constructor() {
    this.modals = new Map();
    this.toasts = [];
    this.init();
  }

  init() {
    // Criar container de toasts
    this.createToastContainer();

    // Adicionar event listeners globais
    this.addGlobalEventListeners();
  }

  // ===== MODAIS =====
  createModal(id, options = {}) {
    const {
      title = "Modal",
      content = "",
      size = "medium",
      closable = true,
      onClose = null,
      onConfirm = null,
      confirmText = "Confirmar",
      cancelText = "Cancelar",
      showCancel = true,
    } = options;

    const modalHtml = `
            <div class="modal-overlay" id="modal-${id}">
                <div class="modal modal-${size}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${
                          closable
                            ? '<button class="modal-close" data-modal-close="' +
                              id +
                              '">&times;</button>'
                            : ""
                        }
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${
                      onConfirm || showCancel
                        ? `
                        <div class="modal-footer">
                            ${
                              showCancel
                                ? `<button class="btn btn-secondary" data-modal-cancel="${id}">${cancelText}</button>`
                                : ""
                            }
                            ${
                              onConfirm
                                ? `<button class="btn btn-primary" data-modal-confirm="${id}">${confirmText}</button>`
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;

    // Remover modal existente se houver
    this.closeModal(id);

    // Adicionar ao DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Armazenar referência
    this.modals.set(id, {
      element: document.getElementById(`modal-${id}`),
      onClose,
      onConfirm,
    });

    // Adicionar event listeners
    this.addModalEventListeners(id);

    return document.getElementById(`modal-${id}`);
  }

  showModal(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.element.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.element.classList.remove("show");
      document.body.style.overflow = "";

      // Remover do DOM após animação
      setTimeout(() => {
        if (modal.element && modal.element.parentNode) {
          modal.element.parentNode.removeChild(modal.element);
        }
        this.modals.delete(id);
      }, 300);
    }
  }

  addModalEventListeners(id) {
    const modal = this.modals.get(id);
    if (!modal) return;

    // Botão de fechar
    const closeBtn = modal.element.querySelector("[data-modal-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.closeModal(id);
        if (modal.onClose) modal.onClose();
      });
    }

    // Botão de cancelar
    const cancelBtn = modal.element.querySelector("[data-modal-cancel]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeModal(id);
        if (modal.onClose) modal.onClose();
      });
    }

    // Botão de confirmar
    const confirmBtn = modal.element.querySelector("[data-modal-confirm]");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (modal.onConfirm) {
          const result = modal.onConfirm();
          if (result !== false) {
            this.closeModal(id);
          }
        } else {
          this.closeModal(id);
        }
      });
    }

    // Fechar ao clicar no overlay
    modal.element.addEventListener("click", (e) => {
      if (e.target === modal.element) {
        this.closeModal(id);
        if (modal.onClose) modal.onClose();
      }
    });

    // Fechar com ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        this.closeModal(id);
        if (modal.onClose) modal.onClose();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  // ===== TOASTS =====
  createToastContainer() {
    if (document.getElementById("toast-container")) return;

    const container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  showToast(message, type = "info", duration = 5000) {
    const toastId = "toast-" + Date.now();
    const iconMap = {
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ",
    };

    const toastHtml = `
            <div class="toast toast-${type}" id="${toastId}">
                <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
                <div class="toast-content">
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" data-toast-close="${toastId}">&times;</button>
            </div>
        `;

    const container = document.getElementById("toast-container");
    container.insertAdjacentHTML("beforeend", toastHtml);

    const toast = document.getElementById(toastId);
    this.toasts.push(toastId);

    // Mostrar toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Adicionar event listener para fechar
    const closeBtn = toast.querySelector("[data-toast-close]");
    closeBtn.addEventListener("click", () => this.hideToast(toastId));

    // Auto-remover
    if (duration > 0) {
      setTimeout(() => this.hideToast(toastId), duration);
    }

    return toastId;
  }

  hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts = this.toasts.filter((id) => id !== toastId);
      }, 300);
    }
  }

  // ===== TABELAS =====
  createTable(data, columns, options = {}) {
    const {
      id = "table-" + Date.now(),
      sortable = true,
      searchable = true,
      pagination = true,
      pageSize = 10,
      actions = [],
      onRowClick = null,
    } = options;

    let tableHtml = `
            <div class="data-table" id="${id}">
                <div class="data-table-header">
                    <h3 class="data-table-title">${
                      options.title || "Tabela"
                    }</h3>
                    <div class="data-table-actions">
                        ${
                          searchable
                            ? `
                            <div class="search-box">
                                <input type="text" class="search-input" placeholder="Buscar..." data-table-search="${id}">
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
                <div class="data-table-body">
                    <table class="table">
                        <thead>
                            <tr>
                                ${columns
                                  .map(
                                    (col) => `
                                    <th ${
                                      sortable ? `data-sort="${col.key}"` : ""
                                    }>
                                        ${col.title}
                                        ${
                                          sortable
                                            ? '<span class="sort-icon">↕</span>'
                                            : ""
                                        }
                                    </th>
                                `
                                  )
                                  .join("")}
                                ${actions.length > 0 ? "<th>Ações</th>" : ""}
                            </tr>
                        </thead>
                        <tbody data-table-body="${id}">
                            <!-- Dados serão inseridos aqui -->
                        </tbody>
                    </table>
                </div>
                ${
                  pagination
                    ? `<div class="pagination" data-table-pagination="${id}"></div>`
                    : ""
                }
            </div>
        `;

    return {
      html: tableHtml,
      id,
      data,
      columns,
      options,
    };
  }

  renderTable(tableConfig) {
    const { id, data, columns, options } = tableConfig;
    const { pageSize = 10, actions = [], onRowClick = null } = options;

    const tbody = document.querySelector(`[data-table-body="${id}"]`);
    if (!tbody) return;

    // Renderizar linhas
    tbody.innerHTML = data
      .map((row, index) => {
        const rowHtml = `
                <tr ${onRowClick ? `data-row-index="${index}"` : ""}>
                    ${columns
                      .map((col) => {
                        const value = this.getNestedValue(row, col.key);
                        return `<td>${
                          col.render ? col.render(value, row) : value
                        }</td>`;
                      })
                      .join("")}
                    ${
                      actions.length > 0
                        ? `
                        <td>
                            <div class="item-actions">
                                ${actions
                                  .map(
                                    (action) => `
                                    <button class="btn btn-sm ${
                                      action.class || "btn-secondary"
                                    }" 
                                            data-action="${action.name}" 
                                            data-row-index="${index}">
                                        ${action.icon || ""} ${action.label}
                                    </button>
                                `
                                  )
                                  .join("")}
                            </div>
                        </td>
                    `
                        : ""
                    }
                </tr>
            `;
        return rowHtml;
      })
      .join("");

    // Adicionar event listeners
    this.addTableEventListeners(id, tableConfig);
  }

  addTableEventListeners(id, tableConfig) {
    const { data, columns, options } = tableConfig;
    const { actions = [], onRowClick = null } = options;

    // Clique na linha
    if (onRowClick) {
      const rows = document.querySelectorAll(
        `[data-table-body="${id}"] tr[data-row-index]`
      );
      rows.forEach((row) => {
        row.addEventListener("click", (e) => {
          if (!e.target.closest("button")) {
            const index = parseInt(row.dataset.rowIndex);
            onRowClick(data[index], index);
          }
        });
      });
    }

    // Ações dos botões
    actions.forEach((action) => {
      const buttons = document.querySelectorAll(
        `[data-action="${action.name}"]`
      );
      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const index = parseInt(button.dataset.rowIndex);
          action.handler(data[index], index);
        });
      });
    });

    // Ordenação
    const headers = document.querySelectorAll(`#${id} th[data-sort]`);
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const key = header.dataset.sort;
        const sortedData = [...data].sort((a, b) => {
          const aVal = this.getNestedValue(a, key);
          const bVal = this.getNestedValue(b, key);
          return aVal > bVal ? 1 : -1;
        });
        tableConfig.data = sortedData;
        this.renderTable(tableConfig);
      });
    });
  }

  // ===== FORMULÁRIOS =====
  createForm(fields, options = {}) {
    const {
      id = "form-" + Date.now(),
      title = "Formulário",
      submitText = "Salvar",
      cancelText = "Cancelar",
      onSubmit = null,
      onCancel = null,
    } = options;

    const formHtml = `
            <form id="${id}" class="form">
                <div class="form-header">
                    <h3 class="form-title">${title}</h3>
                </div>
                <div class="form-body">
                    ${fields
                      .map((field) => this.renderFormField(field))
                      .join("")}
                </div>
                <div class="form-footer">
                    <button type="button" class="btn btn-secondary" data-form-cancel="${id}">${cancelText}</button>
                    <button type="submit" class="btn btn-primary">${submitText}</button>
                </div>
            </form>
        `;

    return {
      html: formHtml,
      id,
      fields,
      options,
    };
  }

  renderFormField(field) {
    const {
      type = "text",
      name,
      label,
      placeholder = "",
      required = false,
      value = "",
      options = [],
      validation = null,
    } = field;

    let inputHtml = "";

    switch (type) {
      case "text":
      case "email":
      case "tel":
      case "password":
        inputHtml = `
                    <input type="${type}" 
                           name="${name}" 
                           id="${name}" 
                           class="form-input" 
                           placeholder="${placeholder}" 
                           value="${value}"
                           ${required ? "required" : ""}>
                `;
        break;
      case "textarea":
        inputHtml = `
                    <textarea name="${name}" 
                              id="${name}" 
                              class="form-textarea" 
                              placeholder="${placeholder}" 
                              ${required ? "required" : ""}>${value}</textarea>
                `;
        break;
      case "select":
        inputHtml = `
                    <select name="${name}" 
                            id="${name}" 
                            class="form-select" 
                            ${required ? "required" : ""}>
                        <option value="">Selecione...</option>
                        ${options
                          .map(
                            (opt) => `
                            <option value="${opt.value}" ${
                              opt.value === value ? "selected" : ""
                            }>
                                ${opt.label}
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                `;
        break;
      case "checkbox":
        inputHtml = `
                    <div class="checkbox-group">
                        ${options
                          .map(
                            (opt) => `
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       name="${name}[]" 
                                       value="${opt.value}" 
                                       ${
                                         value.includes(opt.value)
                                           ? "checked"
                                           : ""
                                       }>
                                ${opt.label}
                            </label>
                        `
                          )
                          .join("")}
                    </div>
                `;
        break;
      case "radio":
        inputHtml = `
                    <div class="radio-group">
                        ${options
                          .map(
                            (opt) => `
                            <label class="radio-label">
                                <input type="radio" 
                                       name="${name}" 
                                       value="${opt.value}" 
                                       ${opt.value === value ? "checked" : ""}>
                                ${opt.label}
                            </label>
                        `
                          )
                          .join("")}
                    </div>
                `;
        break;
    }

    return `
            <div class="form-group">
                <label for="${name}" class="form-label">
                    ${label}
                    ${required ? '<span class="required">*</span>' : ""}
                </label>
                ${inputHtml}
                <div class="form-error" id="${name}-error"></div>
            </div>
        `;
  }

  // ===== UTILITÁRIOS =====
  getNestedValue(obj, path) {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  addGlobalEventListeners() {
    // Fechar modais com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.modals.forEach((modal, id) => {
          this.closeModal(id);
        });
      }
    });
  }

  // ===== CONFIRMAÇÃO =====
  confirm(message, title = "Confirmar", options = {}) {
    return new Promise((resolve) => {
      const {
        confirmText = "Sim",
        cancelText = "Não",
        type = "warning",
      } = options;

      const content = `
                <div class="confirm-content">
                    <div class="confirm-icon">${
                      type === "warning" ? "⚠" : "ℹ"
                    }</div>
                    <div class="confirm-message">${message}</div>
                </div>
            `;

      const modal = this.createModal("confirm", {
        title,
        content,
        confirmText,
        cancelText,
        onConfirm: () => {
          resolve(true);
          return true;
        },
        onClose: () => {
          resolve(false);
        },
      });

      this.showModal("confirm");
    });
  }

  // ===== LOADING =====
  showLoading(element, text = "Carregando...") {
    const loadingHtml = `
            <div class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${text}</div>
                </div>
            </div>
        `;

    element.style.position = "relative";
    element.insertAdjacentHTML("beforeend", loadingHtml);
  }

  hideLoading(element) {
    const loading = element.querySelector(".loading-overlay");
    if (loading) {
      loading.remove();
    }
  }

  // ===== NOTIFICAÇÕES =====
  notify(message, type = "info", duration = 5000) {
    return this.showToast(message, type, duration);
  }

  success(message, duration = 3000) {
    return this.showToast(message, "success", duration);
  }

  error(message, duration = 5000) {
    return this.showToast(message, "error", duration);
  }

  warning(message, duration = 4000) {
    return this.showToast(message, "warning", duration);
  }

  info(message, duration = 3000) {
    return this.showToast(message, "info", duration);
  }
}

// Instância global
window.ui = new UI();
