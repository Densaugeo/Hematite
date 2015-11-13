/**
 * @depends AsyNTer
 * @depends Draggabilliy
 */
var AsyNTer = require('asynter');
var Draggabilly = require('draggabilly');

var Hematite = exports;

// @method HTMLElement forgeElement(String tagName, Object properties, Array children) -- Daisy-chainable element maker
Hematite.forgeElement = function forgeElement(tagName, properties, children) {
  var element = document.createElement(tagName);
  
  for(var p in properties) {
    element[p] = properties[p];
  }
  
  if(children) {
    for(var i = 0, endi = children.length; i < endi; ++i) {
      element.appendChild(children[i]);
    }
  }
  
  return element;
}
var fE = Hematite.forgeElement;

// @prop Number INSTANT -- Default button type. For buttons that take effect when pressed
Hematite.INSTANT = 0;

// @prop Number TOGGLE -- Type code for buttons that toggle
Hematite.TOGGLE = 1;

// @prop Number SELECT -- Type code for buttons that require selecting a target
Hematite.SELECT = 2;

/**
 * @module Hematite.Sidebar inherits AsyNTer.Node
 * @description Makes a sidebar. Buttons added to the sidebar can be triggered by clicks or keyboard shortcuts 1-9, 0, -, and =
 * @description Icons come from Font Awesome and are specified in the faClass option
 * 
 * @example var sidebar = new Hematite.Sidebar();
 * @example sidebar.addButton({name: 'do_stuff', faClass: 'fa-question', title: 'Tooltip text'});
 * @example sidebar.on('do_stuff', function() {console.log('Doing stuff')});
 * @example sidebar.on('trigger', function(e) {console.log(e.name === 'do_stuff')});
 */
Hematite.Sidebar = function Sidebar() {
  AsyNTer.Node.call(this);
  
  var self = this;
  
  // @prop HTMLElement domElement -- div tag that holds all of the Panel's HTML elements
  this.domElement = fE('div', {id: 'sidebar', tabIndex: 1, accessKey: '1'});
  
  // @prop HTMLCollection children -- Alias for domElement.children
  this.children = this.domElement.children;
  
  // @prop HTMLElement|null selection -- Select-type button currently selected, if any
  var selection = null;
  Object.defineProperty(this, 'selection', {
    enumerable: true,
    get: function() {
      return selection;
    },
    set: function(v) {
      if(selection) {
        selection.classList.remove('selected');
        self.emit('unselect', {target: selection});
      }
      
      if(v instanceof HTMLElement && v.parentElement === self.domElement) {
        selection = v;
        selection.classList.add('selected');
        self.emit('select', {target: selection});
      }
      else {
        selection = null;
      }
    }
  });
  
  document.body.appendChild(this.domElement);
  this.domElement.title = 'Key: ' + this.domElement.accessKeyLabel;
  
  // @prop Object keyCodesToButtonIndices -- Look up a keyCode and get a button index
  this.keyCodesToButtonIndices = {49: 0, 50: 1, 51: 2, 52: 3, 53: 4, 54: 5, 55: 6, 56: 7, 57: 8, 58: 9, 48: 10, 173: 11, 61: 12};
  
  // @prop Array buttonIndicesToKeyChars -- Look up a button index and get a char for its key
  this.buttonIndicesToKeyChars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  
  // @method undefined addButton(Object {Number type, String faClass, String faClassAlt, String textContent, String textContentAlt, String title, String name, Boolean manual}) -- Add a button. Support font-awesome icon names
  // @event trigger {HTMLElement target} -- Fired when a button is triggered
  // @event [name] {HTMLElement target} -- Fired when a button is triggered. Event name is the name defined when the corresponding button was added
  this.addButton = function(options) {
    options = options || {};
    
    var element = fE('i', {
      type       : options.type || Hematite.INSTANT,
      className  : 'fa ' + 'button ' + (options.faClass || ''),
      faClasses  : [options.faClass || '', options.faClassAlt || ''],
      textContent: options.char || '',
      textContents: [options.char || '', options.charAlt || ''],
      title      : (options.title || 'Not yet described') + '\n\nKey: ' + self.buttonIndicesToKeyChars[self.children.length],
      name       : options.name || 'No_name_given',
      tabIndex   : 0,
      manual     : Boolean(options.manual),
    });
    
    var state = false;
    Object.defineProperty(element, 'state', {
      enumerable: true,
      get: function() {
        return state;
      },
      set: function(v) {
        state = Boolean(v);
        
        element.textContent = element.textContents[state + 0];
        
        if(element.faClasses[state + 0] !== '') {
          element.classList.add(element.faClasses[state + 0]);
        }
        if(element.faClasses[!state + 0] !== '') {
          element.classList.remove(element.faClasses[!state + 0]);
        }
        
        self.emit(state ? 'toggleon' : 'toggleoff', {target: element});
      }
    });
    
    element.addEventListener('click', function() {
      self.emit(element.name, {target: element});
      
      switch(element.type) {
        case Hematite.INSTANT:
          self.emit('trigger', {target: element});
          break;
        case Hematite.TOGGLE:
          if(!element.manual) {
            element.state = !element.state;
          }
          break;
      }
      
      if(element.type === Hematite.SELECT && element !== self.selection) {
        self.selection = element;
      }
      else {
        self.selection = null;
      }
    });
    
    self.domElement.appendChild(element);
    
    return element;
  }
  
  document.addEventListener('keydown', function(e) {
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && e.keyCode === 13 && e.target.classList.contains('button')) {
      e.target.dispatchEvent(new MouseEvent('click'));
    }
  });
  
  document.addEventListener('keydown', function(e) {
    var index = self.keyCodesToButtonIndices[e.keyCode];
    
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && self.children[index]) {
      self.children[index].dispatchEvent(new MouseEvent('click'));
    }
  });
}
Hematite.Sidebar.prototype = Object.create(AsyNTer.Node.prototype);
Hematite.Sidebar.prototype.constructor = Hematite.Sidebar;

/**
 * @module Hematite.Panel inherits AsyNTer.Node
 * @description Makes a panel. Includes draggability and close button
 * 
 * @example var panel = new Hematite.Panel({id: 'css_id', heading: 'Your heading here', closeButton: true, accessKey: 'a'});
 * @example panel.open();
 * 
 * @option String  accessKey   -- Browser accesskey
 * @option Boolean closeButton -- Show a close button?
 * @option String  heading     -- Heading text
 * @option String  id          -- CSS ID
 */
Hematite.Panel = function Panel(options) {
  AsyNTer.Node.call(this);
  
  var self = this;
  
  // @prop HTMLElement domElement -- div tag that holds all of the Panel's HTML elements
  this.domElement = fE('div', {id: options.id || '', className: 'panel', tabIndex: 0, accessKey: options.accessKey || ''}, [
    fE('div', {className: 'panel_heading', textContent: options.heading || 'Heading', title: 'Click and drag to move panel'}),
  ]);
  
  this.domElement.title = (options.heading || 'Heading') + (options.accessKey ? '\n\nAccess Key: ' + options.accessKey.toUpperCase() : '');
  
  // @prop Object keyCuts -- Key-value store of keyboard shortcuts. Keys are .keyCode numbers, values are HTMLElement references
  this.keyCuts = {};
  
  // @prop HTMLElement closeButton -- Reference to the close button (may not exist, depending on options)
  this.closeButton = null;
  if(Boolean(options.closeButton) !== false) {
    this.domElement.appendChild(
      this.closeButton = fE('i', {className: 'fa fa-close panel_close button', tabIndex: 0, title: 'Close panel\n\nKey: Q'})
    );
    
    this.keyCuts[81] = this.closeButton; // Q is for quit
  }
  
  // @prop Draggabilly draggie -- Attachment of Draggabilly library for drag-and-drop positioning
  this.draggie = new Draggabilly(this.domElement, {handle: '.panel_heading'});
  
  if(localStorage['dragger_' + this.domElement.id + '_top']) {
    this.domElement.style.top  = localStorage['dragger_' + this.domElement.id + '_top' ];
    this.domElement.style.left = localStorage['dragger_' + this.domElement.id + '_left'];
  }
  
  this.domElement.addEventListener('keydown', function(e) {
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && self.keyCuts[e.keyCode]) {
      e.stopPropagation();
      
      self.keyCuts[e.keyCode].dispatchEvent(new MouseEvent('click'));
    }
  });
  
  if(Boolean(options.closeButton) !== false) {
    this.closeButton.addEventListener('click', function() {
      self.close();
    });
  }
  
  this.draggie.on('dragEnd', function() {
    localStorage['dragger_' + self.domElement.id + '_top' ] = self.domElement.style.top ;
    localStorage['dragger_' + self.domElement.id + '_left'] = self.domElement.style.left;
  });
}
Hematite.Panel.prototype = Object.create(AsyNTer.Node.prototype);
Hematite.Panel.prototype.constructor = Hematite.Panel;

// @method proto undefined open(Boolean focus) -- Adds Panel's domElement to the document. If focus is set, also focuses .domElement
Hematite.Panel.prototype.open = function(focus) {
  document.body.appendChild(this.domElement);
  
  if(focus) {
    this.domElement.focus();
  }
}

// @method proto undefined close() -- Removes Panel's domElement from the document
// @event close {} -- Fired on panel close
Hematite.Panel.prototype.close = function() {
  this.domElement.parentElement.removeChild(this.domElement);
  
  this.emit('close');
}

// @method proto Boolean isOpen() -- Returns whether panel is currently open (attached to document)
Hematite.Panel.prototype.isOpen = function() {
  return this.domElement.parentElement === document.body;
}

// @method proto undefined toggleOpen(Boolean focus) -- Toggle .domElement on and off of document.body
Hematite.Panel.prototype.toggleOpen = function(focus) {
  if(this.isOpen()) {
    this.close();
  } else {
    this.open(focus);
  }
}
