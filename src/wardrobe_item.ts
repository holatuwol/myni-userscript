/**
 * Convert crafting item metadata into an HTML list.
 */

function showCraftingPath(
  link: HTMLAnchorElement,
  list: HTMLUListElement,
  item: CraftingIngredient,
  path: CraftingPath,
  e: MouseEvent
) : boolean {

  if (link.classList.contains('active')) {
    return true;
  }

  if (!list.classList.contains('show-path')) {
    list.classList.add('show-path');
  }

  var actives = list.querySelectorAll('.active');

  for (var i = 0; i < actives.length; i++) {
    actives[i].classList.remove('active');
  }

  link.classList.add('active');

  var listParentElement = <HTMLElement> list.parentElement;
  var placeholder = <HTMLElement> listParentElement.querySelector('.crafting-path');

  var container = <HTMLDivElement> document.createElement('div');
  container.classList.add('crafting-path');

  var pathElements = path.pathElements;

  for (var i = 0; i < pathElements.length; i++) {
    if (i > 0) {
      var span = <HTMLSpanElement> document.createElement('span');
      span.classList.add('needed');

      var needed = pathElements[i-1].needed;
      span.innerHTML = '× ' + needed + '<br/><span class="arrow">&rarr;</span>';
      container.appendChild(span);
    }

    var item = pathElements[i];
    container.appendChild(createItemLink(item.href, item.name, item.wid, item.icon, false));
  }

  var placeHolderParentElement = <HTMLElement> placeholder.parentElement;
  placeHolderParentElement.replaceChild(container, placeholder);

  e.stopPropagation();

  return false;
}


/**
 * Generates a link for the given item.
 */

function createItemLink(
  href: string,
  name: string,
  wid: string,
  icon: string,
  hasOnClick: boolean
) : HTMLAnchorElement {

  var link = <HTMLAnchorElement> document.createElement('a');
  link.classList.add('witem');
  link.classList.add('icon-room');

  if (hasOnClick) {
    link.setAttribute('href', '#!');
    link.setAttribute('data-href', href);
  }
  else {
    link.setAttribute('href', href);
  }
  link.setAttribute('title', name);
  link.setAttribute('alt', name);
  link.setAttribute('wid', wid);

  var outerIcon = document.createElement('div');
  outerIcon.classList.add('icon');

  var innerIcon = document.createElement('div');
  innerIcon.classList.add('inner-icon');
  innerIcon.classList.add(icon);

  outerIcon.appendChild(innerIcon);
  link.appendChild(outerIcon);

  return link;
}

/**
 * Convert crafting item metadata into an HTML list.
 */

function formatCraftingMetadata(
  list: HTMLElement,
  path: CraftingPath,
  wardrobeSet: Set<string>
) : void {

  var item = path.item();
  var link = createItemLink(item.href, item.name, item.wid, item.icon, true);

  if (wardrobeSet.has(item.wid)) {
    link.classList.add('have-witem');
  }

  link.onclick = showCraftingPath.bind(null, link, list, item, path);
  list.appendChild(link);
}

/**
 * Add a helper to the page to search the crafting tree in the forward
 * direction (everything this item can be used to craft).
 */

function addWardrobeItemCraftingSection(
  sectionName: string,
  item: CraftingIngredient,
  pathGenerator: () => Array<CraftingPath>
) : void {

  var referenceElement = getSection(document.documentElement, 'Obtained from');

  if (!referenceElement) {
    referenceElement = <HTMLElement> document.querySelector('.fixed-action-btn');
  }

  var section = <HTMLElement> getSection(document.documentElement, sectionName, referenceElement);

  var checkDependenciesButton = createButton('Identify All', function() {
    var container = <HTMLDivElement> document.createElement('div');
    container.classList.add('crafting-tree');

    var loading = <HTMLDivElement> document.createElement('div');
    loading.textContent = 'Identifying...';
    container.appendChild(loading);

    section.replaceChild(container, checkDependenciesButton);

    for (var i = section.childNodes.length - 1; i >= 0; i--) {
      var childNode = section.childNodes[i];

      if (childNode.nodeType == 3) {
        childNode.remove();
        continue;
      }

      if (childNode.nodeType != 1) {
      	continue;
      }

      var childElement = <HTMLElement> childNode;

      if (childElement.classList.contains('crafting-tree')) {
        continue;
      }
      else if ('H5' == childElement.tagName.toUpperCase()) {
        continue;
      }
      else {
        childElement.style.display = 'none';
      }
    }

    var placeholder1 = <HTMLDivElement> document.createElement('div');
    placeholder1.classList.add('transitive-dependencies');
    container.appendChild(placeholder1);

    var placeholder2 = <HTMLDivElement> document.createElement('div');
    placeholder2.classList.add('crafting-path');
    container.appendChild(placeholder2);

    getWardrobe(function(wardrobe) {
      var wardrobeSet = new Set(wardrobe);

      var list = <HTMLDivElement> document.createElement('div');
      list.classList.add('transitive-dependencies');

      var paths = pathGenerator();

      for (var i = 0; i < paths.length; i++) {
        if (paths[i].wid() != item.wid) {
          formatCraftingMetadata(list, paths[i], wardrobeSet);
        }
      }

      if (list.childNodes.length == 0) {
        loading.innerHTML = 'Nothing';
      }
      else {
        var descriptor = null;

        if (sectionName == 'Used to craft') {
          loading.innerHTML = 'Touch an item below to see the crafting path, which will show why <strong>' + item.name + '</strong> is needed to make it!';
        }
        else {
          loading.innerHTML = 'Touch an item below to see the crafting path, which will show how it is used to make <strong>' + item.name + '</strong>!'
        }
      }

      container.replaceChild(list, placeholder1);
    });
  });

  var collection = section.querySelector('.collection');

  if (collection) {
    section.insertBefore(checkDependenciesButton, collection);
  }
  else {
    section.appendChild(checkDependenciesButton);
  }
}

/**
 * Add a helper to the page to search the crafting tree.
 */

function addWardrobeItemHelper() : void {
  var itemElement = <HTMLElement> document.querySelector('.collection .witem');
  var wid = <string> itemElement.getAttribute('wid');

  var title = itemElement.querySelector('.title');
  var href = null, name = null;

  if (title) {
    href = title.getAttribute('href') || '';
    name = (title.textContent || '').trim();
  }
  else {
    href = document.location.pathname;

    var headerContainer = <HTMLElement> itemElement.closest('.container');
    var header = <HTMLHeadingElement> headerContainer.querySelector('h4');

    name = (header.childNodes[0].textContent || '').trim();
  }

  var iconElement = <HTMLElement> itemElement.querySelector('.inner-icon');
  var icon = Array.from(iconElement.classList).filter(x => x.indexOf('s-') == 0)[0];

  var metadata = itemMetadata[wid];

  if (!metadata) {
    return;
  }

  var item = new CraftingIngredient(wid, href, name, icon, 1);

  var section = getSection(document.documentElement, 'Tags');

  if (section) {
    var dropTags = metadata['drop_tags'] || [];

    for (var i = 0; i < dropTags.length; i++) {
      var anchor = <HTMLAnchorElement> document.createElement('a');
      anchor.classList.add('chip');

      anchor.setAttribute('href', '/tags/#' + dropTags[i].replace(' ', '_'));
      anchor.textContent = dropTags[i];
      section.appendChild(anchor)
    }
  }

  section = getSection(document.documentElement, 'Obtained from');

  var collectionItems = section ? section.querySelectorAll('.collection-item') : [];

  for (var i = 0; i < collectionItems.length; i++) {
    var collectionItem = collectionItems[i];

    var obtainType = (collectionItem.textContent || '').trim().toLowerCase();

    if (obtainType == 'clothes shop') {
      var container = <HTMLDivElement> document.createElement('div');
      container.classList.add('secondary-content');

      var drops = metadata['drops'] || [];
      container.appendChild(createDropLabel(drops.filter(x => x.endsWith(' G') || x.endsWith(' D'))[0]));
      collectionItem.appendChild(container);
    }
  }

  var root = new CraftingPath();

  addWardrobeItemCraftingSection('Used to craft', item, function() {
    var paths = [root.add(0, wid)];

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var wid1 = path.wid();
      var crafting = itemMetadata[wid1]['crafting'];

      if (!crafting) {
        continue;
      }

      var keys2 = Object.keys(crafting);

      for (var j = 0; j < keys2.length; j++) {
        var wid2 = keys2[j];
        var needed = crafting[wid2];

        paths.push(path.add(needed, wid2));
      }
    }

    paths.sort(pathCompare);

    return paths;
  });

  addWardrobeItemCraftingSection('Crafted from', item, function() {
    var graph = new CraftingGraph();
    var reversePaths = [root.add(0, item.wid)];

    for (var i = 0; i < reversePaths.length; i++) {
      var path = reversePaths[i];

      var wid1 = path.wid();
      var crafting = graph.edges[wid1];

      if (!crafting) {
        continue;
      }

      var keys2 = Object.keys(crafting);

      for (var j = 0; j < keys2.length; j++) {
        var wid2 = keys2[j];
        var needed = crafting[wid2] || 0;

        reversePaths.push(path.add(needed, wid2));
      }
    }

    reversePaths.sort(pathCompare);

    return reversePaths.map(x => x.reverse());
  });
}
