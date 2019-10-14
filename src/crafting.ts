var itemMetadata: {[s: string]: CraftingMetadata} = {};

/**
 * Look up the item metadata using the wardrobe ID.
 */

function getCraftingIngredient(
  wid: string
) : CraftingIngredient | null {

  if (wid == 'future') {
    return new CraftingIngredient(wid, '#', 'Future Item', 's-future-item', null);
  }

  if (!(wid in itemMetadata)) {
    return null;
  }

  return new CraftingIngredient(
    wid,
    '/wardrobe/' + itemMetadata[wid]['href'],
    itemMetadata[wid]['name'],
    's-' + itemMetadata[wid]['href'].replace('/', '-'),
    null);
}

class CraftingMetadata {
  href: string;
  name: string;
  crafting: {[s: string]: number} | null;
  crafting_tags: Array<string> | null;
  drop_tags: Array<string> | null;
  drops: Array<string> | null;
}

/**
 * Add a new prototype to describe a crafting path.
 */

class CraftingPath {
  pathElements: Array<CraftingIngredient>;
  reversed: boolean;

  constructor(pathElements: Array<CraftingIngredient> = []) {
    this.pathElements = [];
    this.reversed = false;

    if (!pathElements || (pathElements.length == 0)) {
      return;
    }

    for (var i = 0; i < pathElements.length; i++) {
      var pathElement = pathElements[i];
      this.pathElements.push(new CraftingIngredient(pathElement.wid, pathElement.href, pathElement.name, pathElement.icon, pathElement.needed));
    }
  };

  add(needed: number, next: string) : CraftingPath {
    var newPath = new CraftingPath(this.pathElements);
    var pathElements = newPath.pathElements;

    if (pathElements.length > 0) {
      pathElements[pathElements.length - 1].needed = needed;
    }

    var ingredient = getCraftingIngredient(next);

    if (ingredient) {
      pathElements.push(ingredient);
    }

    return newPath;
  };

  item() : CraftingIngredient {
    return this.reversed ? this.pathElements[0] : this.pathElements[this.pathElements.length - 1];
  };

  wid() : string {
    return this.item().wid;
  };

  reverse() : CraftingPath {
    var pathElements = this.pathElements;

    pathElements.reverse();

    for (var i = 0; i < pathElements.length - 1; i++) {
      pathElements[i].needed = pathElements[i + 1].needed;
    }

    pathElements[pathElements.length - 1].needed = null;

    this.reversed = true;

    return this;
  };
}

function pathCompare(
  a: CraftingPath,
  b: CraftingPath
) : number {

  var aId = a.wid();
  var bId = b.wid();

  var aType = aId.charAt(0);
  var bType = bId.charAt(0);

  if (aType != bType) {
    return aType > bType ? 1 : -1;
  }

  var aNumber = parseInt(aId.substring(1));
  var bNumber = parseInt(bId.substring(1));

  return aNumber - bNumber;
}

class CraftingIngredient {
  wid: string;
  href: string;
  name: string;
  icon: string;
  needed: number | null;

  constructor(wid: string, href: string, name: string, icon: string, needed: number | null) {
    this.wid = wid;
    this.href = href;
    this.name = name;
    this.icon = icon;
    this.needed = needed;
  };

  getCraftedFromPaths() : Array<CraftingPath> {
    var root = new CraftingPath();
    var graph = new CraftingGraph();
    var reversePaths = [root.add(0, this.wid)];

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
  };

  getUsedToCraftPaths() : Array<CraftingPath> {
    var root = new CraftingPath();
    var paths = [root.add(0, this.wid)];

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

    var futureDesignMaterial = paths
      .map(x => itemMetadata[x.wid()]['crafting_tags'])
      .filter(x => x && new Set(x).has('future_design_material')).length != 0;

    if (futureDesignMaterial) {
      paths.push(root.add(0, 'future'));
    }

    return paths;
  };
}

class CraftingDrop {
  material: Array<string>;
  other: Array<string>;

  constructor(material: Array<string>, other: Array<string>) {
    this.material = material;
    this.other = Array.from(new Set(other));

    if ((material.length == 0) && (other.length == 0)) {
      this.other.push('unknown');
    }
  }

  getTotalMaterialCost() : {[s: string]: number} {
    var totalMaterialCost = <{[s: string]: number}> {};

    for (var j = 0; j < this.material.length; j++) {
      var dropItem = this.material[j];
      var cost = dropItem.split(' ');

      var costAmount = cost[0];
      var costType = cost[1];

      totalMaterialCost[costType] = (totalMaterialCost[costType] || 0) + parseInt(costAmount);
    }

    return totalMaterialCost;
  }
}

class CraftingGraph {
  edges: {[s: string] : {[s: string] : number | null} | null};

  constructor() {
    this.edges = <{[s: string] : {[s: string] : number}}> {};
    var keys1 = Object.keys(itemMetadata);

    for (var i = 0; i < keys1.length; i++) {
      var wid1 = keys1[i];
      var crafting = itemMetadata[wid1]['crafting'];

      if (!crafting) {
        continue;
      }

      var keys2 = Object.keys(crafting);

      for (var j = 0; j < keys2.length; j++) {
        var wid2 = keys2[j];
        var needed = crafting[wid2];
        var innerEdge = this.edges[wid2];

        if (!innerEdge) {
          this.edges[wid2] = innerEdge = {};
        }

        innerEdge[wid1] = needed;
      }
    }
  }

  topologicalOrdering(wid: string, visited: Set<string>) : Array<string> {
    visited.add(wid);

    var ordering = <Array<string>> [];

    var crafting = this.edges[wid] || {};
    var keys = Object.keys(crafting);

    for (var i = 0; i < keys.length; i++) {
      if (!visited.has(keys[i])) {
        Array.prototype.push.apply(ordering, this.topologicalOrdering(keys[i], visited));
      }
    }

    ordering.push(wid);

    return ordering;
  }

  getCraftingDrops(
    wid: string
  ) : CraftingDrop {

    var ordering = this.topologicalOrdering(wid, new Set());
    var visited = <{[s: string]: CraftingDrop}> {};

    for (var i = 0; i < ordering.length; i++) {
      var outerWid = ordering[i];

      var metadata = itemMetadata[outerWid];
      var dropInfo = metadata['drops'] || [];

      var materialCost = dropInfo.filter(x => /^[0-9]* [A-Z]*$/.exec(x));
      var materialCostSet = new Set(materialCost);
      var dropLocations = dropInfo.filter(x => !materialCostSet.has(x));

      var maiden = dropLocations.filter(x => x.indexOf('maiden') == 0).length > 0;
      var princess = dropLocations.filter(x => x.indexOf('princess') == 0).length > 0;
      var goldCost = materialCost.filter(x => x.indexOf(' G') != -1);

      var otherCost = <Array<string>> [];

      if (goldCost.length == 0) {
        if (maiden) {
          otherCost.push('maiden');
          materialCost = [];
        }
        else if (princess) {
          otherCost.push('princess');
          materialCost = [];
        }
        else {
          otherCost = dropLocations;
        }
      }
      else {
        materialCost = goldCost;
      }

      var crafting = this.edges[outerWid] || {};
      var innerKeys = Object.keys(crafting);

      for (var j = 0; j < innerKeys.length; j++) {
        var innerWid = innerKeys[j];

        var subcost = visited[innerWid];
        var multiplier = crafting[innerWid] || 0;

        var subcostRecipe = subcost.material.filter(x => x.indexOf(' SC') != -1);
        var subcostNonRecipe = subcost.material.filter(x => x.indexOf(' SC') == -1);

        Array.prototype.push.apply(materialCost, subcostRecipe);

        for (var k = 0; k < multiplier; k++) {
          Array.prototype.push.apply(materialCost, subcostNonRecipe);
        }

        Array.prototype.push.apply(otherCost, subcost.other);
      }

      visited[outerWid] = new CraftingDrop(materialCost, otherCost)
    }

    return visited[wid];
  }
}