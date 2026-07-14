/**
 * DropdownSelector - Plain JavaScript Version
 * A dropdown selector using Bootstrap dropdown component (without Web Components)
 *
 * Usage:
 * const selector = new DropdownSelector('#myContainer', {
 *     apiUrl: 'https://api.example.com/data',
 *     apiKey: 'your-api-key',
 *     selectedId: '1',
 *     labelField: 'label',
 *     valueField: 'id',
 *     placeholder: 'Sélectionner un élément',
 *     onChange: (value, item) => { console.log(value, item); }
 * });
 *
 * Methods:
 * - getValue(): Returns the selected item's value
 * - getSelectedItem(): Returns the complete selected item object
 * - setValue(value): Sets the selected value programmatically
 * - setItems(items): Sets the items manually
 * - destroy(): Removes the selector from DOM
 */
export default class DropdownSelector {
  constructor(container, options = {}) {
    // Get container element
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Initialize properties
    this.items = [];
    this.selectedItem = null;
    this.uniqueId = 'dropdown-' + Math.random().toString(36).substr(2, 9);

    // Set options with defaults
    this.options = {
      apiUrl: options.apiUrl || null,
      apiKey: options.apiKey || null,
      selectedId: options.selectedId || null,
      labelField: options.labelField || 'label',
      valueField: options.valueField || 'id',
      placeholder: options.placeholder || 'Sélectionner un élément',
      onChange: options.onChange || null,
      onLoad: options.onLoad || null,
    };

    // Render and initialize
    this.render();

    // Load data from API if URL is provided
    if (this.options.apiUrl) {
      this.loadData();
    }
  }

  render() {
    this.container.innerHTML = `
            <div class="dropdown">
                <span class="dropdown-toggle" id="${this.uniqueId}" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer; user-select: none;">
                    ${this.options.placeholder}
                </span>
                <ul class="dropdown-menu w-100" aria-labelledby="${this.uniqueId}" style="max-height: 300px; overflow-y: auto;">
                    <li><a class="dropdown-item text-center text-muted" href="#">Chargement...</a></li>
                </ul>
            </div>
        `;

    this.triggerElement = this.container.querySelector('span[data-bs-toggle="dropdown"]');
    this.menu = this.container.querySelector('.dropdown-menu');
  }

  async loadData() {
    try {
      // Show loading state
      this.showLoading();

      // Construct URL
      let url = this.options.apiUrl;
      if (this.options.apiKey) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}DOLAPIKEY=${this.options.apiKey}`;
      }

      // Fetch data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.items = Array.isArray(data) ? data : [];

      // Render items
      this.renderItems();

      // Select initial item if specified
      if (this.options.selectedId) {
        this.selectById(this.options.selectedId);
      }

      // Call onLoad callback if provided
      if (typeof this.options.onLoad === 'function') {
        this.options.onLoad(this.items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Erreur de chargement des données');
    }
  }

  showLoading() {
    if (this.menu) {
      this.menu.innerHTML = `
                <li><a class="dropdown-item text-center text-muted" href="#">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Chargement...
                </a></li>
            `;
    }
  }

  showError(message) {
    if (this.menu) {
      this.menu.innerHTML = `
                <li><a class="dropdown-item text-center text-danger" href="#">${message}</a></li>
            `;
    }
  }

  renderItems() {
    if (!this.menu) return;

    if (this.items.length === 0) {
      this.menu.innerHTML = `
                <li><a class="dropdown-item text-center text-muted" href="#">Aucun élément disponible</a></li>
            `;
      return;
    }

    // Add search input
    const searchHtml = `
            <li class="px-3 py-2">
                <input type="text" class="form-control form-control-sm" placeholder="Rechercher..." id="searchInput-${this.uniqueId}">
            </li>
            <li><hr class="dropdown-divider"></li>
        `;

    // Render items
    const itemsHtml = this.items
      .map((item) => {
        const value = item[this.options.valueField];
        const label = item[this.options.labelField] || 'Sans titre';
        const ref = item.ref ? `<small class="text-muted d-block">${item.ref}</small>` : '';

        return `
                <li>
                    <a class="dropdown-item" href="#" data-value="${value}">
                        ${ref}
                        ${label}
                    </a>
                </li>
            `;
      })
      .join('');

    this.menu.innerHTML = searchHtml + itemsHtml;

    // Add click listeners to items
    this.menu.querySelectorAll('a.dropdown-item[data-value]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const value = link.getAttribute('data-value');
        this.selectByValue(value);
      });
    });

    // Add search functionality
    const searchInput = this.menu.querySelector(`#searchInput-${this.uniqueId}`);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterItems(e.target.value);
      });
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  filterItems(searchTerm) {
    const links = this.menu.querySelectorAll('a.dropdown-item[data-value]');
    const term = searchTerm.toLowerCase();

    links.forEach((link) => {
      const text = link.textContent.toLowerCase();
      const li = link.parentElement;
      if (text.includes(term)) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });
  }

  selectByValue(value) {
    // Find item by value
    const item = this.items.find((i) => String(i[this.options.valueField]) === String(value));
    if (item) {
      this.selectedItem = item;
      this.updateTriggerText();

      // Call onChange callback if provided
      if (typeof this.options.onChange === 'function') {
        this.options.onChange(this.getValue(), this.getSelectedItem());
      }
      return true;
    }
    return false;
  }

  selectById(id) {
    return this.selectByValue(id);
  }

  updateTriggerText() {
    if (this.triggerElement) {
      if (this.selectedItem) {
        const label = this.selectedItem[this.options.labelField] || 'Sans titre';
        const ref = this.selectedItem.ref
          ? `<small class="text-muted">${this.selectedItem.ref}</small> - `
          : '';
        this.triggerElement.innerHTML = ref + label;
      } else {
        this.triggerElement.textContent = this.options.placeholder;
      }
    }
  }

  // Public methods
  getValue() {
    return this.selectedItem ? this.selectedItem[this.options.valueField] : null;
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  setValue(value) {
    return this.selectByValue(value);
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
    this.renderItems();
  }

  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    if (!this.selectedItem) {
      this.updateTriggerText();
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
