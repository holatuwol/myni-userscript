const pathParts = document.location.pathname.split('/');

const checkSessionURL = 'https://my.nikkis.info/checksession';
const getWardrobeURL = 'https://my.nikkis.info/getwardrobe/ln';
const updateWardrobeURL = 'https://my.nikkis.info/updatewardrobe/ln';

/**
 * Creates a button.
 */

function createButton(
  text: string,
  callback: (e: MouseEvent) => void
) : HTMLAnchorElement {

  var button = <HTMLAnchorElement> document.createElement('a');

  button.classList.add('waves-effect');
  button.classList.add('waves-light');
  button.classList.add('btn');
  button.classList.add('pink');
  button.classList.add('lighten-2')

  button.addEventListener('click', callback);

  button.textContent = text;

  return button;
}

/**
 * Function to retrieve the section with the specified header.
 */

function getSection(
  container: HTMLElement,
  headerName: string,
  referenceElement: HTMLElement | null = null
) : HTMLElement | null {

  var headers = <Array<HTMLHeadingElement>> Array.from(container.querySelectorAll('h5'));

  for (var i = 0; i < headers.length; i++) {
    var content = (headers[i].textContent || '').trim();

    if (content == headerName) {
      return headers[i].parentElement;
    }
  }

  if (!referenceElement) {
    return null;
  }

  var divider = <HTMLDivElement> document.createElement('div');
  divider.classList.add('divider');

  var section = <HTMLDivElement> document.createElement('div');
  section.classList.add('section');

  var header = <HTMLHeadingElement> document.createElement('h5');
  header.classList.add('item-section-head');
  header.textContent = headerName;

  section.appendChild(header);

  var referenceElementParentElement = <HTMLElement> referenceElement.parentElement;
  referenceElementParentElement.insertBefore(divider, referenceElement);
  referenceElementParentElement.insertBefore(section, referenceElement);

  return section;
}

/**
 * Retrieves the current wardrobe, and then invokes the provided
 * callback function, passing the current wardrobe.
 */

function getWardrobe(
  callback: (wardrobe: Array<string>) => void
) : void {

  jQuery.getJSON(checkSessionURL, function(d1) {
    if (!d1['authenticated']) {
      return;
    }

    jQuery.getJSON(getWardrobeURL, function(d2) {
      callback(d2.wardrobe);
    });
  });
}


/**
 * Make an XMLHttpRequest, and then invoke the specified callback once you have
 * constructed a document from it.
 */

function processXMLHttpRequest(
  href: string,
  callback: (container: HTMLElement) => void
) : void {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', href);

  // https://stackoverflow.com/questions/20583396/queryselectorall-to-html-from-another-page

  xhr.onload = function() {
    var container = document.implementation.createHTMLDocument().documentElement;
    container.innerHTML = xhr.responseText;
    callback(container);
  }

  xhr.send(null);
}

/**
 * Prevent event propagation.
 */

function stopPropagation(e: MouseEvent) : void {
  e.stopPropagation();
}

/**
 * Adds new items to the wardrobe, if action is '+',
 * or removes old items from the wardrobe, if action is '-'
 */

function updateWardrobe(
  selectItems: Set<string>,
  action: string,
  callback: (selectItems: Array<String>, action: string) => void
) : void {

  getWardrobe(
    function(oldWardrobe: Array<string>) {
      var oldWardrobeSet = new Set(oldWardrobe);
      var selectActions;
      var selectItemList = Array.from(selectItems);

      if (action == '+') {
        selectActions = selectItemList.filter(x => !oldWardrobeSet.has(x)).map(x => action + x);
      }
      else if (action == '-') {
        selectActions = selectItemList.filter(x => oldWardrobeSet.has(x)).map(x => action + x);
      }
      else {
        return;
      }

      jQuery.ajax({
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        url: updateWardrobeURL,
        data: JSON.stringify({'select_actions': selectActions})
      }).done(function() {
        if (callback) {
          callback(selectItemList, action);
        }

        Materialize.toast('Selections saved!', 4000);
    });
  })
}
