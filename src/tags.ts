declare var tag_data: {[s: string] : {[s: string]: Array<string>}};
declare function filterTags(initialLoad: boolean): void;

/**
 * Add drop metadata to the selected items.
 */

function addDropMetadata(
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

  var items = window.tag_data;
  var keys = Object.keys(items);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var selector = 'div[wid="' + key + '"]';
    var container = document.querySelector(selector);

    if (!container) {
      continue;
    }

    if (container.querySelector('.drop-metadata')) {
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

    if (!items[wid]) {
      continue;
    }

    Array.prototype.push.apply(items[wid].tags, itemMetadata[wid]['drop_tags']);
    items[wid]['drop_metadata'] = itemMetadata[wid].drops || [];
  }

  var autocompletes = <Array<string>> [];
  var tagKeys = Object.keys(items);

  for (var i = 0; i < tagKeys.length; i++) {
    Array.prototype.push.apply(autocompletes, items[tagKeys[i]].tags);
  }

  var delayedAddDropMetadata = function(e: MouseEvent) {
    setTimeout(addDropMetadata.bind(null, new Set(autocompletes)), 1000);
  };

  var buttons = document.querySelectorAll('a.waves-effect.waves-light.btn');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', delayedAddDropMetadata);
  }

  setTimeout(addDropMetadata.bind(null, new Set(autocompletes)), 1000);
}