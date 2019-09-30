/**
 * Returns the numbers typed into the input field.
 */

function getSelectedNumbers(
  insertByNumberInputField: HTMLTextAreaElement
) : Array<number> {

  var typedNumbers = insertByNumberInputField.value.split(/[, ]+/gi);
  var selectedNumbers = [];

  for (var i = 0; i < typedNumbers.length; i++) {
    var numberString = typedNumbers[i];

    if (numberString == '') {
      continue;
    }

    var pos = numberString.indexOf('-');

    if (pos != -1) {
      var start = parseInt(numberString.substring(0, pos));
      var end = parseInt(numberString.substring(pos + 1));

      for (var j = start; j <= end; j++) {
        selectedNumbers.push(j);
      }
    }
    else {
      selectedNumbers.push(parseInt(numberString));
    }
  }

  return selectedNumbers;
}

/**
 * Updates the margins around wardrobe items so you can scan through
 * the list 12 items at a time, instead of 2 items at a time.
 */

function updateWardrobeMargin(
  ownedFilterElement: HTMLAnchorElement,
  notOwnedFilterElement: HTMLAnchorElement
) : void {

  if (ownedFilterElement.classList.contains('filter-selected')) {
    var wardrobeItems = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll('.have-witem, .have-sitem'));

    for (var i = 0; i < wardrobeItems.length; i++) {
      wardrobeItems[i].style.marginBottom = (i % 12 == 11) ? '2em' : '0px';
    }
  }
  else if (notOwnedFilterElement.classList.contains('filter-selected')) {
    var visible = 0;
    var wardrobeItems = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll('.witem'));

    for (var i = 0; i < wardrobeItems.length; i++) {
      if (wardrobeItems[i].classList.contains('have-witem') || wardrobeItems[i].classList.contains('have-sitem')) {
        continue;
      }

      wardrobeItems[i].style.marginBottom = (++visible % 12 == 0) ? '2em' : '0px';
    }
  }
}

/**
 * Make it easier to add items by unhiding anything that you list.
 */

function markItemInWardrobe(
  ownedFilterElement: HTMLAnchorElement,
  notOwnedFilterElement: HTMLAnchorElement,
  insertByNumberInputField: HTMLTextAreaElement,
  event: KeyboardEvent
) : void {

  if (event && event.keyCode != 188) {
    return;
  }

  var owned = ownedFilterElement.classList.contains('filter-selected');
  var notOwned = notOwnedFilterElement.classList.contains('filter-selected');

  var type = pathParts[2];
  var selectedNumbers = getSelectedNumbers(insertByNumberInputField);
  var checkSelectedNumbers = new Set(selectedNumbers);

  var checkItems = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll(owned ? 'a.witem.filtered-out' : notOwned ? 'a.witem:not(.filtered-out)' : 'a.witem'));

  for (var i = 0; i < checkItems.length; i++) {
    var href = checkItems[i].getAttribute('href');

    if (href == null) {
      continue;
    }

    var itemId = parseInt(href.substring('/wardrobe/'.length + type.length + 1));

    if (notOwned) {
      if (checkSelectedNumbers.has(itemId)) {
        checkItems[i].style.display = 'none';
        checkItems[i].classList.add('have-sitem');
      }
      else {
        checkItems[i].style.display = '';
        checkItems[i].classList.remove('have-sitem');
      }
    }
    else {
      if (checkSelectedNumbers.has(itemId)) {
        if (owned) {
          checkItems[i].style.display = '';
        }

        checkItems[i].classList.add('have-sitem');
      }
      else {
        if (owned) {
          checkItems[i].style.display = 'none';
        }

        checkItems[i].classList.remove('have-sitem');
      }
    }
  }

  updateWardrobeMargin(ownedFilterElement, notOwnedFilterElement);

  if (owned || notOwned) {
    var reverseSortedItemIds = selectedNumbers.sort((a, b) => b - a);

    for (var j = 0; j < reverseSortedItemIds.length; j++) {
      var newItemId = reverseSortedItemIds[j];
      var newItem = document.querySelector('a[href="/wardrobe/' + type + '/' + newItemId + '"]');

      if (newItem) {
        newItem.scrollIntoView();
        break;
      }
    }
  }
}

/**
 * Update wardrobe selections.
 */

function updateWardrobeSelections(
  ownedFilterElement: HTMLAnchorElement | null,
  notOwnedFilterElement: HTMLAnchorElement | null,
  selectItemList: Array<string>,
  action: string
) : void {

  var owned = !ownedFilterElement || ownedFilterElement.classList.contains('filter-selected');
  var notOwned = notOwnedFilterElement && notOwnedFilterElement.classList.contains('filter-selected');

  for (var i = 0; i < selectItemList.length; i++) {
    var attributeSelector = '[wid="' + selectItemList[i] + '"]';
    var items = document.querySelectorAll('a' + attributeSelector + ', div' + attributeSelector);

    for (var j = 0; j < items.length; j++) {
      var item = <HTMLElement> items[j];

      item.classList.remove('have-sitem');

      if (action == '+') {
        item.classList.add('have-witem');

        if (owned) {
          item.style.display = '';
        }
        else if (notOwned) {
          item.style.display = 'none';
        }
      }
      else if (action == '-') {
        item.classList.remove('have-witem');

        if (owned) {
          item.style.display = 'none';
        }
        else if (notOwned) {
          item.style.display = '';
        }
      }
    }
  }

  var currentCountContainer = document.querySelector('.current-count');

  if (currentCountContainer) {
    var wardrobeCount = document.querySelectorAll('.have-witem').length;
    currentCountContainer.textContent = wardrobeCount + ' matching item' + (wardrobeCount == 1 ? '' : 's');
  }

  if (ownedFilterElement && notOwnedFilterElement) {
    updateWardrobeMargin(ownedFilterElement, notOwnedFilterElement);
  }
}

/**
 * Checks the wardrobe against the specified text area, and then
 * update with the new values.
 */

function checkWardrobe(
  ownedFilterElement: HTMLAnchorElement,
  notOwnedFilterElement: HTMLAnchorElement,
  insertByNumberInputField: HTMLTextAreaElement,
  action: string
) : void {

  var type = pathParts[2];
  var selectedNumbers = getSelectedNumbers(insertByNumberInputField);

  var selectedWIDs = selectedNumbers
    .map(x => <HTMLAnchorElement> document.querySelector('a[href="/wardrobe/' + type + '/' + x + '"]'))
    .filter(x => x)
    .map(x => <string> x.getAttribute('wid'));

  var selectValues = new Set(selectedWIDs);

  if (selectValues.size == 0) {
    return;
  }

  updateWardrobe(selectValues, action, updateWardrobeSelections.bind(null, ownedFilterElement, notOwnedFilterElement));
};

/**
 * Get the wardrobe as a string.
 */

function getWardrobeShorthand(
  current: Array<number>,
  available: Array<number>
) : string {

  if (current.length == 0) {
    return '';
  }

  var matchIndex = -1;
  var matchStart = -1;

  var matches = [];

  for (var i = 0; i < available.length; i++) {
    if (available[i] == current[matchIndex + 1]) {
      matchIndex++;

      if (matchStart == -1) {
        matchStart = matchIndex;
      }
    }
    else if (matchStart != -1) {
      var newMatch = [current[matchStart].toString()];

      if (matchIndex != matchStart) {
        newMatch.push(matchIndex == matchStart + 1 ? ',' : '-');
        newMatch.push(current[matchIndex].toString());
      }

      matches.push(newMatch.join(''));
      matchStart = -1;
    }
  }

  return matches.join(',');
}

/**
 * Add a helper to the page to make it easier to update your wardrobe by number.
 */

function addWardrobeHelper() : void {
  var wardrobeManager = <HTMLDivElement> document.getElementById('wardrobe-manager');

  if (!wardrobeManager) {
    return;
  }

  var wardrobeManagerParentNode = <HTMLDivElement> wardrobeManager.parentNode;

  if (!wardrobeManagerParentNode) {
    return;
  }

  var ownedFilterElement = <HTMLAnchorElement> document.getElementById('filter-owned');
  var notOwnedFilterElement = <HTMLAnchorElement> document.getElementById('filter-notowned');

  if (!ownedFilterElement || !notOwnedFilterElement) {
    return;
  }

  getWardrobe(
    function(wardrobe) : void {
      var currentWardrobe = wardrobe
        .map(x => <HTMLAnchorElement> document.querySelector('a[wid="' + x + '"]'))
        .filter(x => x)
        .map(x => parseInt(x.href.split('/')[5]))
        .sort((a, b) => a - b);

      var itemElements = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll('a[wid]'));
      var availableWardrobe = itemElements.map(x => parseInt(x.href.split('/')[5])).sort((a, b) => a - b);

      var currentWardrobeShorthand = getWardrobeShorthand(currentWardrobe, availableWardrobe);

      var insertByNumberContainer = document.createElement('div');

      var oldWardrobeInputField = document.createElement('input');
      oldWardrobeInputField.setAttribute('type', 'hidden');
      oldWardrobeInputField.value = currentWardrobeShorthand;
      insertByNumberContainer.appendChild(oldWardrobeInputField);

      var currentCountContainer = document.createElement('div');
      currentCountContainer.classList.add('current-count');
      currentCountContainer.textContent = currentWardrobe.length + ' matching item' + (currentWardrobe.length == 1 ? '' : 's');
      insertByNumberContainer.appendChild(currentCountContainer);

      var insertByNumberInputField = document.createElement('textarea');
      var boundMarkItemInWardrobe = markItemInWardrobe.bind(null, ownedFilterElement, notOwnedFilterElement, insertByNumberInputField);

      insertByNumberInputField.onkeyup = _.debounce(boundMarkItemInWardrobe, 500);
      insertByNumberInputField.setAttribute('placeholder', 'Enter numbers (1,2,3) and number ranges (1-3,4-7)');
      insertByNumberContainer.appendChild(insertByNumberInputField);

      var submitHolder = document.createElement('div');
      submitHolder.appendChild(createButton('Add to Wardrobe', checkWardrobe.bind(null, ownedFilterElement, notOwnedFilterElement, insertByNumberInputField, '+')));
      submitHolder.appendChild(document.createTextNode(' '));
      submitHolder.appendChild(createButton('Remove from Wardrobe', checkWardrobe.bind(null, ownedFilterElement, notOwnedFilterElement, insertByNumberInputField, '-')));
      insertByNumberContainer.appendChild(submitHolder);

      wardrobeManagerParentNode.insertBefore(insertByNumberContainer, wardrobeManager);

      var updateMarginAndFocus = function(e: MouseEvent) {
        boundMarkItemInWardrobe();
        updateWardrobeMargin(ownedFilterElement, notOwnedFilterElement);
        insertByNumberInputField.focus();
      };

      ownedFilterElement.addEventListener('click', updateMarginAndFocus);
      notOwnedFilterElement.addEventListener('click', updateMarginAndFocus);
    }
  );
}