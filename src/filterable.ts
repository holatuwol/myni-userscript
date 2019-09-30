class FilterableElement {
  lowerCaseName: string;
  element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;

    var titleElement = element.querySelector('span.title.truncate');
    this.lowerCaseName = (titleElement && titleElement.textContent || '').trim().toLowerCase();
  };

  filter(text: string) : boolean {
    if (!text || this.lowerCaseName.indexOf(text) != -1) {
      this.element.style.display = 'block';
      return true;
    }
    else {
      this.element.style.display = 'none';
      return false;
    }
  };
}

class FilterableSection {
  section: HTMLElement;
  header: HTMLDivElement;
  body: HTMLDivElement;
  items: Array<FilterableElement>;

  constructor(section: HTMLElement, selector: string) {
    this.section = section;
    this.header = <HTMLDivElement> section.querySelector('div.collapsible-header');
    this.body = <HTMLDivElement> section.querySelector('div.collapsible-body');

    var itemElements = <Array<HTMLElement>>Array.from(section.querySelectorAll(selector));
    this.items = itemElements.map(x => new FilterableElement(x))
  };

  filter(text: string) : boolean {
    var count = 0;

    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].filter(text)) {
        count++;
      }
    }
    if (!text) {
      this.section.classList.remove('active');
      this.header.classList.remove('active');
      this.body.style.display = 'none';
      this.section.style.display = 'block';
    }
    else if (count > 0) {
      this.section.classList.add('active');
      this.header.classList.add('active');
      this.body.style.display = 'block';
      this.section.style.display = 'block';
    }
    else {
      this.section.classList.remove('active');
      this.header.classList.remove('active');
      this.body.style.display = 'none';
      this.section.style.display = 'none';
    }

    return count > 0;
  }
}

class FilterableAccordion {
  sections: Array<FilterableSection>;
  inputField: HTMLInputElement;

  constructor(selector: string, placeholder: string) {
    var container = <HTMLUListElement> document.querySelector('ul[data-collapsible]');

    if (!container) {
      return;
    }

    var containerParentElement = container.parentElement;

    if (!containerParentElement) {
      return;
    }

    this.sections = Array.from(container.querySelectorAll('li')).map(x => new FilterableSection(x, selector));

    var filterHolder = <HTMLDivElement> document.createElement('div');
    filterHolder.classList.add('filter-input');

    var inputHolder = <HTMLDivElement> document.createElement('div');
    inputHolder.classList.add('input-field');

    this.inputField = <HTMLInputElement> document.createElement('input');
    this.inputField.setAttribute('placeholder', placeholder);
    inputHolder.appendChild(this.inputField);

    this.inputField.onkeyup = _.debounce(FilterableAccordion.prototype.filter.bind(this), 500);

    filterHolder.appendChild(inputHolder);
    containerParentElement.insertBefore(filterHolder, container);
  };

  filter() {
    var text = this.inputField.value.toLowerCase();

    for (var i = 0; i < this.sections.length; i++) {
      this.sections[i].filter(text);
    }
  };
}
