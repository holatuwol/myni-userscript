declare var tag_data: {[s: string] : {[s: string]: Array<string>}};
declare function filterTags(initialLoad: boolean): void;

function exportItemAsCSVRow(
  container : HTMLDivElement
) : string {

  var wid = <string> container.getAttribute('wid');

  var metadata = window.tag_data[wid];

  var name = metadata.name;
  var type = metadata.type;

  var tags = metadata.tags;
  var rarity = tags.filter(x => x.indexOf('rare ') == 0)[0];
  var style = tags.filter(x => styleTagSet.has(x)).sort(styleTagComparator);

  return [wid, name, type, rarity].concat(style).join(',');
}

/**
 * Export the visible items as a CSV file
 */

function exportAsCSV() {
  var csvHeader = 'id,name,type,rarity,style,style,style,style,style'
  var csvContent = Array.from(document.querySelectorAll('#item-list div[wid]')).map(exportItemAsCSVRow).join('\n');

  var blob = new Blob([csvHeader + '\n' + csvContent], { type: 'text/csv' });

  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  var hash = document.location.hash || '#';

  link.download = hash.substring(1) + '.csv';

  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Update auto complete with the new set of autocomplete options.
 */

function updateAutocomplete(
  autocompletes: Set<string>
) : void {

  var hash = document.location.hash || '#';

  var autoCompleteOptionsData =
    Array.from(autocompletes).reduce(function(options, x) {
      options[x] = null;
      return options;
    }, <{[s: string]: string | null}> {});

  var chipData = hash.substring(1).split(/\+|\%20/gi).filter(x => x).map(function(x) {
    return { 'tag': x.replace(/_/gi, ' ').trim() };
  });

  jQuery('.chips-autocomplete').material_chip({
    autocompleteOptions: {
      data: autoCompleteOptionsData,
      limit: Infinity,
      minLength: 1,
    },
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+tag',
    data: chipData
  });

  window.filterTags(true);
}

/**
 * Add drop metadata to the visible items.
 */

function addDropMetadata() : void {
  var items = window.tag_data;
  var keys = Object.keys(items);

  var containers = document.querySelectorAll('div[wid]');

  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];

    var key = <string> container.getAttribute('wid');

    if (!(key in items)) {
      continue;
    }

    var dropMetadataElement = document.createElement('span');

    dropMetadataElement.classList.add('drop-metadata');
    dropMetadataElement.classList.add('grey-text');
    dropMetadataElement.classList.add('text-darken1');

    if (items[key].drop_metadata) {
      for (var j = 0; j < items[key].drop_metadata.length; j++) {
        dropMetadataElement.appendChild(createDropLabel(items[key].drop_metadata[j]));
      }
    }

    var annotation = container.querySelector('span.item-annot');

    if (!annotation) {
      annotation = document.createElement('span');
      annotation.classList.add('item-annot');
      container.appendChild(annotation);
    }

    annotation.appendChild(dropMetadataElement);
  }
}

/**
 * Add additional tags to use for search.
 */

function addTagsHelper() {
  var items = window.tag_data;
  var metadataKeys = Object.keys(itemMetadata);

  for (var i = 0; i < metadataKeys.length; i++) {
    var wid = metadataKeys[i];

    if (!(wid in items)) {
      continue;
    }

    Array.prototype.push.apply(items[wid].tags, itemMetadata[wid]['drop_tags']);

    items[wid]['drop_metadata'] = itemMetadata[wid].drops || [];
  }

  var tagKeys = Object.keys(items);
  var autocompletes = <Array<string>> [];

  for (var i = 0; i < tagKeys.length; i++) {
    var wid = tagKeys[i];

    if (items[wid].tags.indexOf('future design material') == -1) {
      items[wid].tags.push('not future design material');
    }

    Array.prototype.push.apply(autocompletes, items[wid].tags);
  }

  setTimeout(updateAutocomplete.bind(null, new Set(autocompletes)), 1000);

  var exportButton = createButton('Export as CSV', exportAsCSV);

  var itemList = <HTMLElement> document.getElementById('item-list');
  var itemListParentElement = <HTMLElement> itemList.parentElement;
  itemListParentElement.insertBefore(exportButton, itemList);
}