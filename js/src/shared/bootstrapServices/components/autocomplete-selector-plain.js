/**
 * AutocompleteSelector - Plain JavaScript Version
 * An autocomplete dropdown selector (without Web Components)
 * The dropdown is triggered by typing at least one character in an input field
 *
 * Usage:
 * const autocomplete = new AutocompleteSelector('#myContainer', {
 *     apiUrl: 'https://api.example.com/data',
 *     apiKey: 'your-api-key',
 *     selectedId: '1',
 *     labelField: 'label',
 *     valueField: 'id',
 *     placeholder: 'Tapez pour rechercher...',
 *     minChars: 1,
 *     onChange: (value, item) => { console.log(value, item); },
 *     onInput: (searchTerm) => { console.log(searchTerm); }
 * });
 *
 * Methods:
 * - getValue(): Returns the selected item's value
 * - getSelectedItem(): Returns the complete selected item object
 * - setValue(value): Sets the selected value programmatically
 * - clear(): Clears the selection and input
 * - setItems(items): Sets the items manually
 * - destroy(): Removes the selector from DOM
 */
export default class AutocompleteSelector {
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
    this.filteredItems = [];
    this.selectedItem = null;
    this.uniqueId = 'autocomplete-' + Math.random().toString(36).substr(2, 9);

    // Set options with defaults
    this.options = {
      apiUrl: options.apiUrl || null,
      apiKey: options.apiKey || null,
      selectedId: options.selectedId || null,
      labelField: options.labelField || 'label',
      valueField: options.valueField || 'id',
      placeholder: options.placeholder || 'Tapez pour rechercher...',
      minChars: options.minChars || 1,
      onChange: options.onChange || null,
      onInput: options.onInput || null,
      onLoad: options.onLoad || null,
    };

    // Render and initialize
    this.render();
    this.setupEventListeners();

    // Load data from API if URL is provided
    if (this.options.apiUrl) {
      this.loadData();
    }
  }

  render() {
    this.container.innerHTML = `
            <div class="autocomplete-wrapper position-relative">
                <input
                    type="text"
                    class="form-control"
                    placeholder="${this.options.placeholder}"
                    autocomplete="off"
                    id="${this.uniqueId}"
                    style="padding-right: 55px;"
                >
                <i class="bi bi-x-circle position-absolute text-secondary"
                   role="button"
                   title="Effacer la sélection"
                   style="right: 30px; top: 50%; transform: translateY(-50%); display: none; cursor: pointer; z-index: 3;"></i>
                <i class="bi bi-chevron-down position-absolute text-secondary"
                   role="button"
                   title="Afficher la liste"
                   style="right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 3;"></i>
                <div class="dropdown-menu w-100  " style="max-height: 300px; overflow-y: auto; display: none;var(--bs-blue)">
                    <div class="dropdown-item text-center text-muted">
                        Tapez au moins ${this.options.minChars} caractère${this.options.minChars > 1 ? 's' : ''} pour rechercher...
                    </div>
                </div>
            </div>
        `;

    this.input = this.container.querySelector('input');
    this.menu = this.container.querySelector('.dropdown-menu');
    this.clearIcon = this.container.querySelector('.bi-x-circle');
    this.toggleIcon = this.container.querySelector('.bi-chevron-down');
  }

  setupEventListeners() {
    if (!this.input || !this.menu) return;

    // Input event - trigger filtering
    this.input.addEventListener('input', (e) => {
      const value = e.target.value.trim();

      if (value.length >= this.options.minChars) {
        this.filterItems(value);
        this.showDropdown();
      } else {
        this.hideDropdown();
      }

      // Call onInput callback if provided
      if (typeof this.options.onInput === 'function') {
        this.options.onInput(value);
      }
    });

    // Focus event - show dropdown if there's text
    this.input.addEventListener('focus', () => {
      const value = this.input.value.trim();
      if (value.length >= this.options.minChars) {
        this.filterItems(value);
        this.showDropdown();
      }
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideDropdown();
      }
    });

    // Prevent dropdown from closing when clicking inside
    this.menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Clear icon click
    if (this.clearIcon) {
      this.clearIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clear();
        this.input.focus();
      });
    }

    // Toggle icon click - show all items
    if (this.toggleIcon) {
      this.toggleIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.menu.style.display === 'block') {
          this.hideDropdown();
        } else {
          this.showAllItems();
          this.showDropdown();
        }
        this.input.focus();
      });
    }
  }

  async loadData() {
    try {
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

  showError(message) {
    if (this.menu) {
      this.menu.innerHTML = `
                <div class="dropdown-item text-center text-danger">${message}</div>
            `;
    }
  }

  filterItems(searchTerm) {
    if (!searchTerm || searchTerm.length < this.options.minChars) {
      this.filteredItems = [];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredItems = this.items.filter((item) => {
      const label = (item[this.options.labelField] || '').toLowerCase();
      const ref = (item.ref || '').toLowerCase();
      return label.includes(term) || ref.includes(term);
    });

    this.renderFilteredItems();
  }

  renderFilteredItems() {
    if (!this.menu) return;

    if (this.filteredItems.length === 0) {
      this.menu.innerHTML = `
                <div class="dropdown-item text-center text-muted">Aucun résultat trouvé</div>
            `;
      return;
    }

    // Render filtered items
    const itemsHtml = this.filteredItems
      .map((item) => {
        const value = item[this.options.valueField];
        const label = item[this.options.labelField] || 'Sans titre';
        const ref = item.ref ? `<small class="text-muted me-2">${item.ref}</small>` : '';

        return `
                <a class="dropdown-item" href="#" data-value="${value}">
                    ${ref !== '' ? ref + ' -' + label : label}
                </a>
            `;
      })
      .join('');

    this.menu.innerHTML = itemsHtml;

    // Add click listeners to items
    this.menu.querySelectorAll('a.dropdown-item[data-value]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const value = link.getAttribute('data-value');
        this.selectByValue(value);
        this.hideDropdown();
      });
    });
  }

  showAllItems() {
    this.filteredItems = [...this.items];
    this.renderFilteredItems();
  }

  showDropdown() {
    if (this.menu) {
      this.menu.style.display = 'block';
    }
  }

  hideDropdown() {
    if (this.menu) {
      this.menu.style.display = 'none';
    }
  }

  selectByValue(value) {
    // Find item by value
    const item = this.items.find((i) => String(i[this.options.valueField]) === String(value));
    if (item) {
      this.selectedItem = item;
      this.updateInputValue();

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

  updateInputValue() {
    if (this.input && this.selectedItem) {
      const label = this.selectedItem[this.options.labelField] || 'Sans titre';
      const ref = this.selectedItem.ref ? `${this.selectedItem.ref} - ` : '';
      this.input.value = ref + label;
    }
    this.updateClearIcon();
  }

  updateClearIcon() {
    if (this.clearIcon) {
      this.clearIcon.style.display = this.selectedItem ? 'block' : 'none';
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

  clear() {
    this.selectedItem = null;
    if (this.input) {
      this.input.value = '';
    }
    this.hideDropdown();
    this.updateClearIcon();

    // Call onChange callback if provided
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(null, null);
    }
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
  }

  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    if (this.input) {
      this.input.placeholder = placeholder;
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
