var styleElement = <HTMLStyleElement> document.createElement('style');

styleElement.textContent = `
.have-witem.safe-decompose {
  background-color: #efe !important;
}

.secondary-content div {
  text-align: right;
}

.insert-by-number {
  margin-top: 2em;
}

.transitive-dependencies,
.crafting-path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.crafting-path .needed {
  text-align: center;
}

.crafting-path .needed .arrow {
  font-size: 3em;
  line-height: 0.2em;
}

.transitive-dependencies .icon,
.crafting-path .icon {
  position: relative;
}

.transitive-dependencies .icon-room,
.crafting-path .icon-room {
  padding: 5px 26px 15px 5px;
}

.transitive-dependencies.show-path .witem {
  opacity: 0.2;
}

.transitive-dependencies.show-path .witem.active {
  opacity: 1.0;
}

.attr-metadata,
.drop-metadata,
.suit-metadata {
  font-size: 0.8rem;
  line-height: 1rem;
}

.stage-progress {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
}

.stage-progress input[type=text] {
  height: 2rem;
  width: 5rem;
  text-align: right;
}

.sitem .di img,
.witem .di img,
.drop-metadata img {
  vertical-align: text-bottom;
}

img.suit-dia.store:not(.have-suit-part) {
  border: solid 1px;
}

.base-score .new-icon {
  position: relative;
  padding: 0.2em 1em 0.2em 1em;
  width: auto;
}
`;

var head = <HTMLHeadElement> document.querySelector('head');
head.appendChild(styleElement);