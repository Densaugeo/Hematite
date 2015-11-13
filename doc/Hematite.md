# Hematite.js

Dependencies: `AsyNTer` , `Draggabilliy` 

#### Properties

`Number` **INSTANT** -- Default button type. For buttons that take effect when pressed

`Number` **SELECT** -- Type code for buttons that require selecting a target

`Number` **TOGGLE** -- Type code for buttons that toggle

#### Methods

`HTMLElement` **forgeElement**`(String tagName, Object properties, Array children)` -- Daisy-chainable element maker

---

## Hematite.Sidebar

Inherits: `AsyNTer.Node`

Makes a sidebar. Buttons added to the sidebar can be triggered by clicks or keyboard shortcuts 1-9, 0, -, and =

Icons come from Font Awesome and are specified in the faClass option

```
var sidebar = new Hematite.Sidebar();
sidebar.addButton({name: 'do_stuff', faClass: 'fa-question', title: 'Tooltip text'});
sidebar.on('do_stuff', function() {console.log('Doing stuff')});
sidebar.on('trigger', function(e) {console.log(e.name === 'do_stuff')});
```

#### Properties

`Array` **buttonIndicesToKeyChars** -- Look up a button index and get a char for its key

`HTMLCollection` **children** -- Alias for domElement.children

`HTMLElement` **domElement** -- div tag that holds all of the Panel's HTML elements

`Object` **keyCodesToButtonIndices** -- Look up a keyCode and get a button index

`HTMLElement|null` **selection** -- Select-type button currently selected, if any

#### Methods

`undefined` **addButton**`(Object {Number type, String faClass, String faClassAlt, String textContent, String textContentAlt, String title, String name, Boolean manual})` -- Add a button. Support font-awesome icon names

#### Events

**[name]** `{HTMLElement target}` -- Fired when a button is triggered. Event name is the name defined when the corresponding button was added

**trigger** `{HTMLElement target}` -- Fired when a button is triggered

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

