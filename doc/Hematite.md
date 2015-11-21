# Hematite.js

Dependencies: `Draggabilliy` 

#### Methods

`HTMLElement` **createElement**`(String tagName)` -- Extension of document.createElement for creating ht- elements

`HTMLElement` **forgeElement**`(String tagName, Object properties, [HTMLElement] children)` -- Daisy-chainable element maker

---

## \<ht-button\>

Inherits: `HTMLUnknownElement`

Not an instantiable element. Only for other ht- elements to inherit from

Icons may be specified as either plain text or font-awesome text icon names

#### Properties

`String` **className** -- Defaults to 'fa button'

`String` **description** -- Setting .description automatically sets .title

`String` **faClass** -- Name of font-awesome class for an icon

`Number` **tabIndex** -- Defaults to 0, to allow tab navigation

`String` **title** -- Automatically set to [keycut from <ht-sidebar>] + ['\n\n'] + [.description]

---

## \<ht-instant\>

Inherits: `<ht-button>`

Instant buttons are simple buttons - click them and they fire events

```
var instant = Hematite.createElement('ht-instant');
instant.faClass = 'fa-gear';
instant.addEventListener('trigger', function() {console.log('Triggered!')});
document.body.appendChild(instant);
```

#### Events

**trigger** `{Event}` -- Fired when an <ht-instant> is clicked

---

## \<ht-toggle\>

Inherits: `<ht-button>`

Toggle buttons can automatically toggle their icons and fire toggleon/off events

```
var toggle = Hematite.createElement('ht-toggle');
toggle.faClass = 'fa-bolt';
toggle.faClassAlt = 'fa-fire';
toggle.addEventListener('toggleon', function() {console.log('Is now on')});
toggle.addEventListener('toggleoff', function() {console.log('Is now off')});
document.body.appendChild(toggle);
```

#### Properties

`String` **faClassAlt** -- Sets alternative of .faClass to be used while button is toggled on

`Boolean` **manual** -- If set to true, button will not change state when clicked, only when .state is explicitly set

`Boolean` **state** -- Toggle state. Assigned values to .state will toggle button normally

`String` **text** -- Value assigned to .textContent when button is toggled off

`String` **textAlt** -- Value assigned to .textContent when button is toggled on

`String` **textContent** -- Overwritten by .text and .textAlt when toggled

#### Events

**toggleoff** `{Event}` -- Fired when an <ht-toggle> is toggled off

**toggleon** `{Event}` -- Fired when an <ht-toggle> is toggled on

---

## \<ht-select\>

Inherits: `<ht-button>`

Select buttons automaticlly highlight and set .selection on an <ht-sidebar> they are appended to

```
var select1 = Hematite.createElement('ht-select');
select1.faClass = 'fa-gear';
select1.addEventListener('select', function() {console.log('1 is selected')});

var select2 = Hematite.createElement('ht-select');
select2.faClass = 'fa-gears';
select2.addEventListener('select', function() {console.log('Now 2 is selected')});

var sidebar = Hematite.createElement('ht-sidebar');
sidebar.appendChild(select1);
sidebar.appendChild(select2);
document.body.appendChild(sidebar);
```

#### Events

**select** `{Event}` -- Fired when an <ht-select> is selected

**unselect** `{Event}` -- Fired when an <ht-select> is unselected

---

## \<ht-sidebar\>

Inherits: `HTMLUnknownElement`

Makes a sidebar. Buttons added to the sidebar can be triggered by clicks or keyboard shortcuts 1-9, 0, -, and =

```
var toggle = Hematite.createElement('ht-toggle');
toggle.faClass = 'fa-flask';
toggle.faClassAlt = 'fa-fire';
toggle.title = 'Tooltip text';
toggle.addEventListener('toggleoff', function() {console.log('Toggled off!')});

var sidebar = Hematite.createElement('ht-sidebar');
sidebar.addEventListener('toggleon', function(e) {if(e.target === toggle) console.log('Toggle on!')});

sidebar.appendChild(toggle);
document.body.appendChild(sidebar);
```

#### Properties

`String` **accessKey** -- Defaults to '1'

`String` **id** -- Defaults to 'sidebar'

`[Number]` **keyCuts** -- .charCodeAt()s for each keycut. (Mostly) work with KeyboardEvent.keycode

`HTMLElement|null` **selection** -- <ht-select> currently selected, if any. Setting .selection will update highlights and fire un/select

`Number` **tabIndex** -- Defaults to 1, to allow tab navigation

`String` **title** -- Defaults to 'Key: ' + .accessKeyLabel

---

## Hematite.Panel

Inherits: `AsyNTer.Node`

Makes a panel. Includes draggability and close button

```
var panel = new Hematite.Panel({id: 'css_id', heading: 'Your heading here', closeButton: true, accessKey: 'a'});
panel.open();
```

#### Options

`String` **accessKey** -- Browser accesskey

`Boolean` **closeButton** -- Show a close button?

`String` **heading** -- Heading text

`String` **id** -- CSS ID

#### Properties

`HTMLElement` **closeButton** -- Reference to the close button (may not exist, depending on options)

`HTMLElement` **domElement** -- div tag that holds all of the Panel's HTML elements

`Draggabilly` **draggie** -- Attachment of Draggabilly library for drag-and-drop positioning

`Object` **keyCuts** -- Key-value store of keyboard shortcuts. Keys are .keyCode numbers, values are HTMLElement references

#### Methods

`undefined` proto **close**`()` -- Removes Panel's domElement from the document

`Boolean` proto **isOpen**`()` -- Returns whether panel is currently open (attached to document)

`undefined` proto **open**`(Boolean focus)` -- Adds Panel's domElement to the document. If focus is set, also focuses .domElement

`undefined` proto **toggleOpen**`(Boolean focus)` -- Toggle .domElement on and off of document.body

#### Events

**close** `{}` -- Fired on panel close

