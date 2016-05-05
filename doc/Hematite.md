# Hematite.js

Shared UI elements for my apps

Dependencies: `Draggabilliy` 

#### Properties

`Object` **elements** -- Key-value store of custom elements. Keys are tagnames (in all caps), values are decorator functions. Each decorator accepts an HTMLElement as its argument and returns the same element

#### Methods

`HTMLElement` **createElement**`(String tagName)` -- Extension of document.createElement for creating ht- elements

`HTMLElement` **forgeElement**`(String tagName, Object properties, [HTMLElement] children)` -- Daisy-chainable element maker

---

## \<ht-button\>

Inherits: `HTMLUnknownElement`

Not an instantiable element. Only for other ht- elements to inherit from

Icons may be specified as either plain text or font-awesome text icon names

#### Properties

`String` **className** -- Defaults to 'ht-button fa'

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

`String` **className** -- Defaults to 'ht-tray'

`[Number]` **keyCuts** -- .charCodeAt()s for each keycut. (Mostly) work with KeyboardEvent.keycode

`HTMLElement|null` **selection** -- <ht-select> currently selected, if any. Setting .selection will update highlights and fire un/select

`Number` **tabIndex** -- Defaults to 1, to allow tab navigation

`String` **title** -- Defaults to 'Key: ' + .accessKeyLabel, if available

---

## \<ht-panel\>

Inherits: `HTMLUnknownElement`

Standard Hematite UI panel

```
var example_panel = Hematite.createElement('ht-panel');
example_panel.headingText = 'Here is a panel';
document.body.appendChild(example_panel);

var content = document.createElement('div');
content.textContent = 'Stuff can go here';
example_panel.appendChild(content);

// Or, using the forgeElement helper function:
var example_panel = Hematite.fE('ht-panel', {headingText: 'Here is a panel'}, [
  fE('div', {textContent: 'Stuff can go here'})
]);
document.body.appendChild(example_panel);
```

#### Properties

`Draggabilly` **_draggie** -- Attachment of Draggabilly library for drag-and-drop positioning

`String` **className** -- Defaults to 'ht-panel'

`HTMLElement` **closeButton** -- Reference to the close button

`HTMLElement` **heading** -- HTML element for heading

`String` **headingText** -- Corresponds to .textContent of headingText HTML element

`Object` **keyCuts** -- Key-value store of keyboard shortcuts. Keys are .keyCode numbers, values are HTMLElement references

`Boolean` **open** -- True if panel is displayed. Works via CSS display property

`Boolean` **showCloseButton** -- True if close button is displayed. Works via CSS display property. Default true

`Number` **tabIndex** -- Defaults to 0, to allow tab navigation

#### Methods

`undefined` **_setTitle**`()` -- Updates .title, based on .headingText and .accessKey

#### Events

**close** `{}` -- Fired on panel close

**open** `{}` -- Fired on panel open

