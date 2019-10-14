/**
 * Helper to load all crafting and drop metadata, so we don't have to crawl MyNI pages,
 * before calling a function.
 */

function fetchMetadata(
  callback: () => void
) : void {

  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://holatuwol.s3-us-west-2.amazonaws.com/crafting.json');
  xhr.onload = function() {
    itemMetadata = JSON.parse(xhr.responseText);

    callback();
  };

  xhr.send(null);
}

/**
 * Figure out which helper to add to the page.
 */

function addHelper() {
  if (pathParts[1] == 'drops') {
    addDropsHelper();
  }
  else if (pathParts[1] == 'stages') {
    if ((pathParts.length >= 4) && (pathParts[3] != '')) {
      addStageHelper();
    }
    else if (pathParts[2] == 'commission') {
      addCommissionStageHelper();
    }
    else if (pathParts[2] == 'custom') {
      addCustomStageHelper();
    }
  }
  else if (pathParts[2] == 'suit') {
    if (pathParts[3]) {
      fetchMetadata(addSuitHelper);
    }
    else {
      fetchMetadata(addSuitsHelper);
    }
  }
  else if (pathParts[1] == 'tags') {
    fetchMetadata(addTagsHelper);
  }
  else if (pathParts[1] == 'wardrobe') {
    if (((pathParts.length == 3) && (pathParts[2] != '')) || ((pathParts.length == 4) && (pathParts[3] == ''))) {
      fetchMetadata(addWardrobeHelper);
    }
    else if (pathParts.length >= 4) {
      fetchMetadata(addWardrobeItemHelper);
    }
  }
}

addHelper();