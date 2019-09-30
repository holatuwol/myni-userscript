const dropLabelIcons: {[s: string]: {[s: string]: string}} = {
  'G': {'name': 'Gold', 'location': 'Clothes Store', 'icon': '1/10/Gold.png'},
  'D': {'name': 'Diamond', 'location': 'Clothes Store', 'icon': 'e/ea/Diamond.png'},
  'SC': {'name': 'Starlight Coin', 'location': 'Store of Starlight', 'icon': '7/72/Starlight_Coin.png'},
  'CR': {'name': 'Crystal Rose', 'location': 'Crystal Garden', 'icon': '4/42/Crystal_Rose.png'},
  'AC': {'name': 'Association Coin', 'location': 'Association Store', 'icon': '9/9a/Association_Coin.png'},
  'SE': {'name': 'Starwish Earrings', 'location': 'Association Fantasy Workshop', 'icon': '1/10/Starwish_Earrings.png'},
  'SH': {'name': 'Starwish Hairpin', 'location': 'Association Fantasy Workshop', 'icon': '2/28/Starwish_Hairpin.png'},
  'SP': {'name': 'Starwish Pendant', 'location': 'Association Fantasy Workshop', 'icon': 'f/fb/Starwish_Pendant.png'},
  'HR': {'name': 'Hope Ring', 'location': 'Reconstruction', 'icon': '0/08/HopeRingIcon.PNG'},
  'RE': {'name': 'Rebirth Earring', 'location': 'Reconstruction', 'icon': 'c/ce/RebirthEarringsIcon.PNG'},
  'EN': {'name': 'Eternal Necklace', 'location': 'Reconstruction', 'icon': '1/12/EternalNecklaceIcon.PNG'},
  'J': {'name': 'Jade', 'location': 'Porch of Misty', 'icon': '7/7e/Jade.png'},
  'DH': {'name': 'Destiny Hourglass', 'location': 'Corridor of Clock', 'icon': 'c/c7/Destiny_Hourglass.png'},
  'SB': {'name': 'Suzaku Bell', 'location': 'Tower of Zen', 'icon': '3/36/Suzaku_Bell.png'},
  'KC': {'name': 'Karma Crystal', 'location': 'Time Yard', 'icon': '1/19/Karma_Crystal.png'},
  'CS': {'name': 'Crystal Shoes', 'location': 'Room of Cinderella', 'icon': '3/3a/Crystal_Shoe.png'}
}

/**
 * Replaces the drop information label with one that uses
 * an icon instead of letters, to make it easier to know
 * what it is visually.
 */

function updateDropLabelWithIcon(
  itemLabel: HTMLElement,
  width: number
) : void {

  var content = itemLabel.textContent || '';
  content = content.trim();

  var currencyMatcher = /^([0-9,]+)\s*([A-Z]+)$/.exec(content);
  if (!currencyMatcher) {
    return;
  }

  var currencyAmount = currencyMatcher[1];
  var currencyType = currencyMatcher[2];

  var currencyTitle = dropLabelIcons[currencyType]['name'] + ' (' + dropLabelIcons[currencyType]['location'] + ')';
  var wikiaImageURL = 'https://vignette.wikia.nocookie.net/lovenikki/images/' + dropLabelIcons[currencyType]['icon'] + '/revision/latest/scale-to-height-down/' + width;

  itemLabel.innerHTML = '<img title="' + currencyTitle + '" src="' + wikiaImageURL + '">&nbsp;' + currencyAmount;
}

/**
 * Creates a span with the given cost information.
 */

function createDropLabel(
  costType: string,
  amount: string | null = null
) : HTMLSpanElement {

  var span = document.createElement('span');
  span.classList.add('di');

  if (amount) {
    span.textContent = new Intl.NumberFormat('en-US').format(parseInt(amount)) + ' ' + costType;
  }
  else {
    span.textContent = costType;
  }

  updateDropLabelWithIcon(span, 16);

  return span;
}

/**
 * Add a filter to make it easier to find specific suits.
 */

function addDropsHelper() {
  new FilterableAccordion('a.witem', 'Filter items by name');

  var itemLabels = <Array<HTMLElement>> Array.from(document.querySelectorAll('.witem .di'));

  for (var i = 0; i < itemLabels.length; i++) {
    updateDropLabelWithIcon(itemLabels[i], 20)
  }
}