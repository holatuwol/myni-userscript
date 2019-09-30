/**
 * Update suit selections.
 */

function updateSuitSelections(
  selectItemList: Array<string>
) : void {

  var updatedSuits = <{[s: string] : HTMLAnchorElement}> {};

  for (var i = 0; i < selectItemList.length; i++) {
    var item = document.querySelector('img[wid="' + selectItemList[i] + '"]');

    if (!item) {
      continue;
    }

    item.classList.add('have-suit-part');
    item.setAttribute('src', '/img/suit_dia_has.png');

    var suit = <HTMLAnchorElement> item.closest('a');
    var href = <string> suit.getAttribute('href');
    updatedSuits[href] = suit;
  }

  var keys = Object.keys(updatedSuits)

  for (var i = 0; i < keys.length; i++) {
    var suit = updatedSuits[keys[i]];
    suit.classList.remove('have-witem');
    suit.classList.add('have-sitem');
  }
}

/**
 * Adds an annotation to the suit describing one of its cost elements.
 */

function addSuitAnnotation(
  suit: HTMLAnchorElement,
  costType: string
) {

  var amount = suit.getAttribute('data-cost-' + costType);

  if (!amount) {
    return;
  }

  var annotation = suit.querySelector('.secondary-content .suit-metadata');

  if (!annotation) {
    annotation = document.createElement('div');
    annotation.classList.add('suit-metadata');

    var container = <HTMLElement> suit.querySelector('.secondary-content');
    container.appendChild(annotation);
  }

  annotation.appendChild(createDropLabel(costType, amount));
}

/**
 * Adds annotations to all suits describing all of its cost elements, using the
 * provided drops page content.
 */

function annotateStoreSuitItems(
  e: MouseEvent
) {
  getWardrobe(function(wardrobe) {
    var wardrobeSet = new Set(wardrobe);

    var pieces = <Array<HTMLImageElement>> Array.from(document.querySelectorAll('img[wid]'));

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      var wid = <string> piece.getAttribute('wid');

      var metadata = itemMetadata[wid];

      if (!metadata) {
        continue;
      }

      var dropItems = metadata['drops'];

      if (!dropItems) {
        continue;
      }

      var haveSuitPart = wardrobeSet.has(wid);

      if (haveSuitPart) {
        continue;
      }

      var suit = <HTMLAnchorElement> piece.closest('a');

      dropItems = dropItems.filter(x => /^[0-9]* [A-Z]*$/.exec(x));

      for (var j = 0; j < dropItems.length; j++) {
        var dropItem = dropItems[j];
        var cost = dropItem.split(' ');

        var costAmount = cost[0];
        var costType = cost[1];

        if (costType == 'SC') {
          continue;
        }

        piece.classList.add('store');

        var oldCost = parseInt(suit.getAttribute('data-cost-' + costType) || '0');
        var newCost = oldCost + parseInt(costAmount);
        suit.setAttribute('data-cost-' + costType, newCost.toString());
      }
    }

    var keys = Array.from(Object.keys(dropLabelIcons));
    var querySelector = Array.from(keys).map(x => 'a[data-cost-' + x + ']').concat(['a[data-cost-tags]']).join(',');

    var dropSuits = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll(querySelector));

    for (var i = 0; i < dropSuits.length; i++) {
      for (var j = 0; j < keys.length; j++) {
        addSuitAnnotation(dropSuits[i], keys[j]);
      }

      addSuitAnnotation(dropSuits[i], 'tags');
    }

    var button = <HTMLElement> e.target;
    button.remove();
  });
}

/**
 * Update suit pieces selections (on the single suit page).
 */

function updateSuitPiecesSelections(
  selectItemList: Array<string>,
  action: string
) : void {

  updateWardrobeSelections(null, null, selectItemList, action);

  var suit = document.querySelector('div.sitem');

  if (!suit) {
    return;
  }

  if (action == '+') {
    suit.classList.add('have-sitem');
  }
  else if (action == '-') {
    suit.classList.remove('have-sitem');
  }
}

/**
 * Adds the suit to the wardrobe.
 */

function addSuitToWardrobe() : void {
  var suitItems = Array.from(document.querySelectorAll('div.witem'));
  var suitPieces = suitItems.map(x => <string> x.getAttribute('wid'));

  updateWardrobe(new Set(suitPieces), '+', updateSuitPiecesSelections);
}

/**
 * Adds the suit to the wardrobe.
 */

function removeSuitFromWardrobe() : void {
  var suitItems = Array.from(document.querySelectorAll('div.witem'));
  var suitPieces = suitItems.map(x => <string> x.getAttribute('wid'));

  updateWardrobe(new Set(suitPieces), '-', updateSuitPiecesSelections);
}

/**
 * Adds the crafting cost to all items.
 */

function annotateSuitMaterialCost(
  graph: CraftingGraph,
  suitContainer: HTMLElement,
  e: MouseEvent
) : void {
  var items = <Array<HTMLElement>> Array.from(suitContainer.querySelectorAll('.witem'));

  var totalSuitMaterialCost = <{[s: string]: number}> {};
  var totalSuitOtherCost = <Set<string>> new Set();
  var itemWids = items.map(x => <string> x.getAttribute('wid'));

  for (var i = 0; i < items.length; i++) {
    var wid = <string> items[i].getAttribute('wid');

    var dropInfo = graph.getCraftingDrops(wid);
    var otherCost = dropInfo.other;
    var totalMaterialCost = dropInfo.getTotalMaterialCost();

    var container = <HTMLParagraphElement> items[i].querySelector('p');
    container.classList.add('drop-metadata');

    for (var j = container.childNodes.length - 1; j >= 0; j--) {
      container.childNodes[j].remove();
    }

    var costTypes = Object.keys(totalMaterialCost).sort();

    for (var j = 0; j < costTypes.length; j++) {
      var costType = costTypes[j];
      var amount = totalMaterialCost[costType];

      container.appendChild(createDropLabel(costType, amount.toString()));
      totalSuitMaterialCost[costType] = (totalSuitMaterialCost[costType] || 0) + amount;
    }

    for (var j = 0; j < otherCost.length; j++) {
      container.appendChild(createDropLabel(otherCost[j]));
      totalSuitOtherCost.add(otherCost[j]);
    }
  }

  var container = document.createElement('div');
  container.classList.add('drop-metadata');

  var label = document.createElement('strong');
  label.textContent = 'Approximate Value';
  container.appendChild(label);
  container.appendChild(document.createTextNode(' (excluding dyes): '));

  var costTypes = Object.keys(totalSuitMaterialCost).sort();

  for (var j = 0; j < costTypes.length; j++) {
    var costType = costTypes[j];
    var amount = totalSuitMaterialCost[costType];

    container.appendChild(createDropLabel(costType, amount.toString()));
  }

  var totalSuitOtherCostArray = Array.from(totalSuitOtherCost);

  for (var j = 0; j < totalSuitOtherCostArray.length; j++) {
    container.appendChild(createDropLabel(totalSuitOtherCostArray[j]));
  }

  var button = <HTMLElement> e.target;
  var buttonParentElement = <HTMLElement> button.parentElement;
  buttonParentElement.replaceChild(container, button);
}

/**
 * Add a helper to the page to make it easier to add a whole suit to your wardrobe.
 */

function addSuitHelper() : void {
  getWardrobe(function(wardrobe) {
    var wardrobeSet = new Set(wardrobe);

    var submitHolder = document.createElement('div');

    var available = Array.from(document.querySelectorAll('div.witem'));
    var current = available.filter(x => wardrobeSet.has(<string> x.getAttribute('wid')));

    submitHolder.appendChild(createButton('Add to Wardrobe', addSuitToWardrobe));
    submitHolder.appendChild(document.createTextNode(' '));
    submitHolder.appendChild(createButton('Remove from Wardrobe', removeSuitFromWardrobe));

    var checkHolder = document.createElement('div');

    checkHolder.appendChild(createButton('Approximate Value', annotateSuitMaterialCost.bind(null, new CraftingGraph(), document.documentElement)));

    var headerContainer = <HTMLElement> document.querySelector('.container > .collection');
    var headerContainerParentElement = <HTMLElement> headerContainer.parentElement;
    headerContainerParentElement.insertBefore(submitHolder, headerContainer);

    var collectionContainer = <HTMLElement> document.querySelector('.section > .collection');
    var collectionContainerParentElement = <HTMLElement> collectionContainer.parentElement;
    collectionContainerParentElement.insertBefore(checkHolder, collectionContainer);
  });
}

/**
 * Adds selected suits to the wardrobe.
 */

function addSuitsToWardrobe() : void {
  var newSuits = Array.from(document.querySelectorAll('a[href].sitem.have-witem'));

  var newItems = Array.from(newSuits)
    .map(x => Array.from(x.querySelectorAll('.witem')).map(y => <string> y.getAttribute('wid')))
    .reduce((array, x) => array.concat(x), []);

  updateWardrobe(new Set(newItems), '+', updateSuitSelections);
}

/**
 * Add a marker to remember that the user wanted to add the selected suit
 * to their wardrobe.
 */

function markSuitInWardrobe(
  e: MouseEvent
) : void {
  e.preventDefault();

  var target = <HTMLAnchorElement> e.target;

  if ((target.tagName.toUpperCase() != 'A') || !target.href || (!target.classList.contains('sitem'))) {
    target = <HTMLAnchorElement> target.closest('a[href].sitem');
  }

  if (target.classList.contains('have-sitem')) {
    return;
  }

  if (target.classList.contains('have-witem')) {
    target.classList.remove('have-witem');
  }
  else {
    target.classList.add('have-witem');
  }
}

/**
 * Add a filter to make it easier to find specific suits.
 */

function addSuitsHelper() : void {
  new FilterableAccordion('a.sitem', 'Filter suits by name');

  var modeContainer = document.createElement('div');
  modeContainer.classList.add('fixed-action-btn');

  var modeToggle = document.createElement('a');
  modeToggle.setAttribute('id', 'save-button');
  modeToggle.classList.add('btn-floating');
  modeToggle.classList.add('btn-large');
  modeToggle.classList.add('waves-effect');
  modeToggle.classList.add('waves-light');
  modeToggle.classList.add('scale-transition');

  var modeToggleText = document.createElement('i');
  modeToggleText.setAttribute('id', 'save-button-text');
  modeToggleText.classList.add('material-icons');
  modeToggleText.textContent = 'turned_in_not';

  modeToggle.addEventListener('click', function(x) {
    var suits = document.querySelectorAll('a[href].sitem');

    if (modeToggleText.textContent == 'turned_in_not') {
      modeToggleText.textContent = 'save';
      modeToggle.classList.add('pink');
      modeToggle.classList.add('lighten-2');

      for (var i = 0; i < suits.length; i++) {
        suits[i].addEventListener('click', markSuitInWardrobe);
      }
    }
    else {
      addSuitsToWardrobe();
    }
  });

  modeToggle.appendChild(modeToggleText);
  modeContainer.appendChild(modeToggle);

  var modeContainerContainer = <HTMLElement> document.querySelector('.container');
  modeContainerContainer.appendChild(modeContainer);

  var checkHolder = document.createElement('div');
  checkHolder.appendChild(createButton('Store Completion', annotateStoreSuitItems));

  var collectionContainer = <HTMLElement> document.querySelector('.container > ul.collapsible');
  var collectionContainerParentElement = <HTMLElement> collectionContainer.parentElement;
  collectionContainerParentElement.insertBefore(checkHolder, collectionContainer);
}