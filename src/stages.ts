declare function guide_sort(guide_element: string, sort_order: string): void;
declare function loadCustomGuide(): void;

class GuideItem {
  id: string;
  name: string;
  typetitle: string;
  itemnum: number;
  type: string;
  typeid: number;
  sub: string;
  subannot: string | null;
  sortid: number;
  sortscore: number;
  sortsub: number;
  found: boolean;
  new: boolean;
}

/**
 * Retrieve the stage base score.
 */

function getBaseScore(
  stage: string,
  callback: (baseScore: string, guideItems: Array<GuideItem>) => void
) : void {

  jQuery.ajax({
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: 'https://my.nikkis.info/getguide/ln',
    data: JSON.stringify({'stage': stage}),
    success: function(data) {
      var guideItems = <Array<GuideItem>> data['guide']['wardrobe'];

      callback(data['guide']['score'], guideItems);
    }
  });
}

/**
 * Show the provided base score on the provided cell.
 */

function showBaseScore(
  cell: HTMLElement,
  baseScore: string,
  guideItems: Array<GuideItem>
) : void {

  var hasNew = guideItems.filter(x => x.new).length > 0;

  var content = <HTMLElement> cell.querySelector('.card-content');
  var baseScoreContent = '';

  if (hasNew) {
    content.classList.add('have-witem');
    baseScoreContent = '<strong class="new-icon">New!</strong>&nbsp;';
  }

  baseScoreContent += 'Base Score: ' + baseScore;

  var baseScoreHolder = document.createElement('p');
  baseScoreHolder.classList.add('base-score');
  baseScoreHolder.innerHTML = baseScoreContent;

  content.appendChild(baseScoreHolder);
}

/**
 * Show the base score for the given stylist arena stage.
 */

function addArenaStageHelper() : void {
  var cells = <Array<HTMLElement>> Array.from(document.querySelectorAll('.col'));

  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];

    var guideElement = <HTMLAnchorElement | null> cell.querySelector('.card-action a');

    if (!guideElement) {
      continue;
    }

    var stage = guideElement.href.substring(guideElement.href.lastIndexOf('/') + 1);
    getBaseScore('arena_common_' + stage, showBaseScore.bind(null, cell));
  }
}

/**
 * Show the base score for the given commission stage.
 */

function showCommissionStageBaseScore(
  cell: HTMLElement,
  stage: string | null
) : void {

  if (!stage) {
    return;
  }

  if (cell.querySelector('.base-score')) {
    return;
  }

  getBaseScore('commission_common_' + stage, showBaseScore.bind(null, cell));
}

/**
 * Filter the list of stages based on the percentage.
 */

function filterCommission(
  actRequest: Array<number>,
  container: HTMLElement,
  input: HTMLInputElement
) : void {

  container.classList.add('active');

  var body = <HTMLElement> container.querySelector('.collapsible-body');
  body.style.display = 'block';

  var cells = <Array<HTMLElement>> Array.from(body.querySelectorAll('.col'));

  var inputValue = parseInt(input.value || '0');

  var begin = 0;
  var increment = 100 / cells.length;
  var end = increment;

  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];

    if ((inputValue >= Math.floor(begin)) && (inputValue <= Math.floor(end))) {
      cell.style.display = '';
      var titleElement = <HTMLElement> cell.querySelector('.card-title');
      var stage = titleElement.textContent;
      showCommissionStageBaseScore(cell, stage);
    }
    else {
      cell.style.display = 'none';
    }

    begin += increment;
    end += increment;
  }
};

/**
 * Rather than having you click into each stage to figure out where you are at,
 * enter in all the percentages so you can know immediately, and see what your
 * base score is for the given stage.
 */

function addCommissionStageHelper() {
  const actRequests = [
    [4000, 4500, 5000, 5000, 5000, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000],
    [4000, 4500, 4500, 5000, 5500, 5500, 6000]
  ];

  var headers = document.querySelectorAll('.collapsible .collapsible-header');

  for (var i = 0; i < headers.length; i++) {
    var container = document.createElement('div');
    container.classList.add('stage-progress');

    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.addEventListener('click', stopPropagation);
    input.addEventListener('keypress', _.debounce(filterCommission.bind(null, actRequests[i], headers[i].parentElement, input), 500));
    container.appendChild(input);

    var percent = document.createElement('div');
    percent.innerHTML = '&nbsp;%';
    container.appendChild(percent);

    headers[i].appendChild(container);
  }
}


/**
 * Update the query string so that you can bookmark it for the helper to find again.
 */

function updateCustomStageSearch(
  selectWrappers: Array<HTMLDivElement>
) : void {
  var attributes = null;
  var headers = document.querySelectorAll('.section .item-section-head');

  for (var i = 0; i < headers.length; i++) {
    if ((headers[i].textContent || '').toLowerCase().trim() == 'attributes') {
      attributes = headers[i].parentNode;
    }
  }

  if (!attributes) {
    return;
  }

  var parameters = [];
  var inputs = attributes.querySelectorAll('input');

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id) {
      parameters.push(inputs[i].id + '=' + inputs[i].value);
    }
  }

  var sa1Item = selectWrappers[0].querySelector('li.active');

  if (sa1Item) {
    var sa1Wrapper = <HTMLDivElement> sa1Item.closest('div.row');
    var sa1Input = <HTMLInputElement> sa1Wrapper.querySelector('input[type=range]');
    var sa1 = sa1Item.textContent + ',' + sa1Input.value;
    parameters.push('sa1=' + encodeURIComponent(sa1));
  }

  var sa2Item = selectWrappers[1].querySelector('li.active');

  if (sa2Item) {
    var sa2Wrapper = <HTMLDivElement> sa2Item.closest('div.row');
    var sa2Input = <HTMLInputElement> sa2Wrapper.querySelector('input[type=range]');
    var sa2 = sa2Item.textContent + ',' + sa2Input.value;
    parameters.push('sa2=' + encodeURIComponent(sa2));
  }

  document.location.hash = '#' + parameters.join('&');
}

/**
 * Select a custom attribute.
 */

function selectCustomAttribute(
  selectWrapper: HTMLDivElement,
  tag: string,
  value: string
) : void {

  var listItems = selectWrapper.querySelectorAll('li');

  for (var i = 0; i < listItems.length; i++) {
    if (listItems[i].textContent == tag) {
      listItems[i].click();

      break;
    }
  }

  var rowWrapper = <HTMLDivElement> selectWrapper.closest('div.row');

  var input = <HTMLInputElement> rowWrapper.querySelector('input[type=range]');

  input.value = value;
}

/**
 * Add a helper to the custom stage page.
 */

function selectCustomStageValues(
  selectWrappers: Array<HTMLDivElement>
) : void {

  // https://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
  var search = document.location.hash.substring(1);
  var parameters = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

  var keys = Object.keys(parameters);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    var input = <HTMLInputElement|null> document.getElementById(key);

    if (!input) {
      continue;
    }

    input.value = parameters[key];
  }

  if (parameters['sa1']) {
    var sa1 = decodeURIComponent(parameters['sa1']).split(',');
    selectCustomAttribute(selectWrappers[0], sa1[0], sa1[1]);
  }

  if (parameters['sa2']) {
    var sa2 = decodeURIComponent(parameters['sa2']).split(',');
    selectCustomAttribute(selectWrappers[1], sa2[0], sa2[1]);
  }
}

/**
 * Add listeners to update the location hash on user actions.
 */

function addCustomStageChangeListeners(
  selectWrappers: Array<HTMLDivElement>
) : void {

  var customStageChangeListener = _.debounce(updateCustomStageSearch.bind(null, selectWrappers), 500);

  var attributes = null;
  var headers = document.querySelectorAll('.section .item-section-head');

  var inputs = <Array<HTMLInputElement>> Array.from(document.querySelectorAll('input[type=range]'));

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', customStageChangeListener);
  }

  for (var i = 0; i < selectWrappers.length; i++) {
    var listItems = <Array<HTMLLIElement>> Array.from(selectWrappers[i].querySelectorAll('li'));

    for (var i = 0; i < listItems.length; i++) {
      listItems[i].addEventListener('click', customStageChangeListener);
    }
  }
}

/**
 * Add a helper to the custom stage page.
 */

function addCustomStageHelper() : void {
  var selectWrappers = <Array<HTMLDivElement>> Array.from(document.querySelectorAll('div.select-wrapper'));

  if (selectWrappers.length == 0) {
    setTimeout(addCustomStageHelper, 100);

    return;
  }

  if (document.location.hash) {
    selectCustomStageValues(selectWrappers);

    loadCustomGuide();
  }

  addCustomStageChangeListeners(selectWrappers);
}

/**
 * Updates the sort order for accessories.
 */

function updateMyNiGuideSortOrder(
  items: Array<HTMLElement>
) : void {

  const sortRemap = <{[i: number]: number}> {
    1:   1101,  // hair
    2:   2101,  // dress
    3:   3101,  // coat
    4:   4101,  // top
    5:   5101,  // bottom
    6:   6101,  // hosiery > leglet
    7:   6201,  // hosiery > hosiery
    8:   7001,  // shoes
    10:  8101,  // accessory > headwear > hair ornament
    20:  8102,  // accessory > headwear > veil
    28:  8103,  // accessory > headwear > hairpin
    29:  8104,  // accessory > headwear > ear
    11:  8201,  // accessory > earrings
    12:  8301,  // accessory > necklace > scarf
    13:  8302,  // accessory > necklace > necklace
    14:  8401,  // accessory > bracevar > right hand ornaments
    15:  8402,  // accessory > bracevar > left hand ornaments
    16:  8403,  // accessory > bracevar > glove
    17:  8501,  // accessory > handheld > right hand holding
    18:  8502,  // accessory > handheld > left hand holding
    33:  8503,  // accessory > handheld > both hand holding
    19:  8601,  // accessory > waist
    21:  8701,  // accessory > special > face
    22:  8702,  // accessory > special > brooch
    23:  8703,  // accessory > special > tattoo
    24:  8704,  // accessory > special > wing
    25:  8705,  // accessory > special > tail
    26:  8706,  // accessory > special > foreground
    27:  8707,  // accessory > special > background
    30:  8708,  // accessory > special > head ornaments
    31:  8709,  // accessory > special > ground
    32:  8801,  // accessory > skin
    9:   9101,  // makeup
    34: 10101,  // spirit
  }

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    var subSortString = <string> item.getAttribute('data-sortsub');
    var subSort = parseInt(subSortString);
    var gameSort = sortRemap[subSort] || 20000;

    item.setAttribute('data-sortgame', gameSort.toString());
  }

  var container = <HTMLElement> document.getElementById('myni-guide-sort');
  container.appendChild(document.createTextNode(' or '));

  var sortLink = document.createElement('a');
  sortLink.setAttribute('href', '#!');
  sortLink.onclick = guide_sort.bind(null, 'myni-guide', 'data-sortgame');
  sortLink.textContent = 'game order';
  container.appendChild(sortLink);
}

/**
 * Compare two different grades.
 */

function attachClothingAttributes(
  item: HTMLElement,
  stageAttributes: Set<string>,
  container: HTMLElement
) : void {

  var table = <HTMLElement> container.querySelector('.attr-table');
  var attributes = Array.from(table.querySelectorAll('.cloth-attr')).map(x => (x.textContent || '').trim());
  var grades = Array.from(table.querySelectorAll('.cloth-grade')).map(x => (x.textContent || '').trim());

  var attributeMetadataElement = document.createElement('span');

  attributeMetadataElement.classList.add('attr-metadata');
  attributeMetadataElement.classList.add('grey-text');
  attributeMetadataElement.classList.add('text-darken1');

  for (var i = 0; i < attributes.length; i++) {
    if (!stageAttributes.has(attributes[i])) {
      continue;
    }

    var span = document.createElement('span');
    span.classList.add('di');
    span.textContent = attributes[i] + ': ' + grades[i];
    attributeMetadataElement.appendChild(span);
  }

  var annotation = item.querySelector('span.item-annot');

  if (!annotation) {
    annotation = document.createElement('span');
    annotation.classList.add('item-annot');
    item.appendChild(annotation);
  }

  annotation.appendChild(attributeMetadataElement);
}

/**
 * Adds usability improvements to MyNi guide.
 */

function addStageHelper() {
  var guide = document.getElementById('myni-guide');

  if (!guide) {
    setTimeout(addStageHelper, 1000);
    return;
  }

  var items = <Array<HTMLElement>> Array.from(guide.querySelectorAll('.witem'));

  if (items.length == 0) {
    setTimeout(addStageHelper, 1000);
    return;
  }

  updateMyNiGuideSortOrder(items);

  var checkAttributesButton = createButton('Check Stage-Matching Attributes', function() {
    checkAttributesButton.remove();

    var table = <HTMLElement> document.querySelector('.attr-table');
    var stageAttributes = new Set(Array.from(table.querySelectorAll('.cloth-attr')).map(x => (x.textContent || '').trim()));

    for (var i = 0; i < items.length; i++) {
      var item = items[i];

      var title = <HTMLElement> item.querySelector('.title');
      var href = <string> title.getAttribute('href');

      processXMLHttpRequest(href, attachClothingAttributes.bind(null, item, stageAttributes));
    }
  });

  var guideParentElement = <HTMLElement> guide.parentElement;
  guideParentElement.insertBefore(checkAttributesButton, guide);
}