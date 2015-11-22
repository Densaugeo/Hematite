/**
 * @depends Draggabilliy
 */
var Draggabilly = require('draggabilly');

var Hematite = exports;

// @method HTMLElement createElement(String tagName) -- Extension of document.createElement for creating ht- elements
Hematite.createElement = function(tagName) {
  var element = document.createElement(tagName);
  
  switch(tagName) {
    case 'ht-instant':
      Hematite.instantButtonDecorator(element);
      break;
    case 'ht-toggle':
      Hematite.toggleButtonDecorator(element);
      break;
    case 'ht-select':
      Hematite.selectButtonDecorator(element);
      break;
    case 'ht-sidebar':
      Hematite.sidebarDecorator(element);
  }
  
  return element;
}

// @method HTMLElement forgeElement(String tagName, Object properties, [HTMLElement] children) -- Daisy-chainable element maker
Hematite.forgeElement = function forgeElement(tagName, properties, children) {
  var element = Hematite.createElement(tagName);
  
  if(properties) {
    for(var p in properties) {
      element[p] = properties[p];
    }
  }
  
  if(children) {
    for(var i = 0, endi = children.length; i < endi; ++i) {
      element.appendChild(children[i]);
    }
  }
  
  return element;
}
var fE = Hematite.forgeElement;

/**
 * @module \<ht-button\> inherits HTMLUnknownElement
 * @description Not an instantiable element. Only for other ht- elements to inherit from
 * @description Icons may be specified as either plain text or font-awesome text icon names
 */
Hematite.buttonDecorator = function(element) {
  // @prop String className -- Defaults to 'fa button'
  element.className = 'ht_button fa';
  
  // @prop Number tabIndex -- Defaults to 0, to allow tab navigation
  element.tabIndex = 0;
  
  // @prop String description -- Setting .description automatically sets .title
  // @prop String title -- Automatically set to [keycut from <ht-sidebar>] + ['\n\n'] + [.description]
  var description = '';
  Object.defineProperty(element, 'description', {
    get: function() {return description},
    set: function(v) {
      description = String(v);
      
      var childIndex, key;
      if(element.parentNode && element.parentNode.tagName === 'HT-SIDEBAR') {
        childIndex = Array.prototype.indexOf.call(element.parentNode.children, element);
        
        key = element.parentNode.keyCuts[childIndex];
      }
      
      element.title = description + (description && key ? '\n\n' : '') + (key ? 'Key: ' + String.fromCharCode(key) : '');
      
      return description;
    }
  });
  
  // @prop String faClass -- Name of font-awesome class for an icon
  var faClass = '';
  Object.defineProperty(element, 'faClass', {
    get: function() {return faClass},
    set: function(v) {
      if(faClass !== '' && (element.tagName !== 'HT-TOGGLE' || !element.state)) {
        element.classList.remove(faClass);
      }
      
      faClass = String(v);
      
      if(element.tagName !== 'HT-TOGGLE' || !element.state) {
        element.classList.add(faClass);
      }
      
      return faClass;
    }
  });
}

/**
 * @module \<ht-instant\> inherits <ht-button>
 * @description Instant buttons are simple buttons - click them and they fire events
 * 
 * @example var instant = Hematite.createElement('ht-instant');
 * @example instant.faClass = 'fa-gear';
 * @example instant.addEventListener('trigger', function() {console.log('Triggered!')});
 * @example document.body.appendChild(instant);
 */
Hematite.instantButtonDecorator = function(element) {
  Hematite.buttonDecorator(element);
  
  // @event trigger {Event} -- Fired when an <ht-instant> is clicked
  element.addEventListener('click', function() {
    element.dispatchEvent(new Event('trigger', {bubbles: true}));
    
    element.parentNode.selection = null;
  });
}

/**
 * @module \<ht-toggle\> inherits <ht-button>
 * @description Toggle buttons can automatically toggle their icons and fire toggleon/off events
 * 
 * @example var toggle = Hematite.createElement('ht-toggle');
 * @example toggle.faClass = 'fa-bolt';
 * @example toggle.faClassAlt = 'fa-fire';
 * @example toggle.addEventListener('toggleon', function() {console.log('Is now on')});
 * @example toggle.addEventListener('toggleoff', function() {console.log('Is now off')});
 * @example document.body.appendChild(toggle);
 */
Hematite.toggleButtonDecorator = function(element) {
  Hematite.buttonDecorator(element);
  
  // @prop String faClassAlt -- Sets alternative of .faClass to be used while button is toggled on
  var faClassAlt = '';
  Object.defineProperty(element, 'faClassAlt', {
    get: function() {return faClassAlt},
    set: function(v) {
      if(faClassAlt !== '' && element.state) {
        element.classList.remove(faClassAlt);
      }
      
      faClassAlt = String(v);
      
      if(element.state) {
        element.classList.add(faClassAlt);
      }
      
      return faClassAlt;
    }
  });
  
  // @prop String textContent -- Overwritten by .text and .textAlt when toggled
  // @prop String text -- Value assigned to .textContent when button is toggled off
  var text = '';
  Object.defineProperty(element, 'text', {
    get: function() {return text},
    set: function(v) {
      text = String(v);
      
      if(!element.state) {
        element.textContent = text;
      }
      
      return text;
    }
  });
  
  // @prop String textAlt -- Value assigned to .textContent when button is toggled on
  var textAlt = '';
  Object.defineProperty(element, 'textAlt', {
    get: function() {return textAlt},
    set: function(v) {
      textAlt = String(v);
      
      if(element.state) {
        element.textContent = textAlt;
      }
      
      return textAlt;
    }
  });
  
  // @prop Boolean state -- Toggle state. Assigned values to .state will toggle button normally
  // @event toggleon {Event} -- Fired when an <ht-toggle> is toggled on
  // @event toggleoff {Event} -- Fired when an <ht-toggle> is toggled off
  var state = false;
  Object.defineProperty(element, 'state', {
    get: function() {return state},
    set: function(v) {
      if(state === Boolean(v)) {
        return;
      }
      
      state = Boolean(v);
      
      element.textContent = state ? textAlt : text;
      
      if(element.faClass !== '') {
        element.classList.toggle(element.faClass);
      }
      if(element.faClassAlt !== '') {
        element.classList.toggle(element.faClassAlt);
      }
      
      element.dispatchEvent(new Event(state ? 'toggleon' : 'toggleoff', {bubbles: true}));
    }
  });
  
  // @prop Boolean manual -- If set to true, button will not change state when clicked, only when .state is explicitly set
  element.manual = false;
  
  element.addEventListener('click', function() {
    if(!element.manual) {
      element.state = !element.state;
    }
    
    element.parentNode.selection = null;
  });
}

/**
 * @module \<ht-select\> inherits <ht-button>
 * @description Select buttons automaticlly highlight and set .selection on an <ht-sidebar> they are appended to
 * 
 * @example var select1 = Hematite.createElement('ht-select');
 * @example select1.faClass = 'fa-gear';
 * @example select1.addEventListener('select', function() {console.log('1 is selected')});
 * @example
 * @example var select2 = Hematite.createElement('ht-select');
 * @example select2.faClass = 'fa-gears';
 * @example select2.addEventListener('select', function() {console.log('Now 2 is selected')});
 * @example
 * @example var sidebar = Hematite.createElement('ht-sidebar');
 * @example sidebar.appendChild(select1);
 * @example sidebar.appendChild(select2);
 * @example document.body.appendChild(sidebar);
 */
Hematite.selectButtonDecorator = function(element) {
  Hematite.buttonDecorator(element);
  
  // @event select {Event} -- Fired when an <ht-select> is selected
  // @event unselect {Event} -- Fired when an <ht-select> is unselected
  element.addEventListener('click', function() {
    if(element.parentNode.tagName === 'HT-SIDEBAR') {
      if(element !== element.parentNode.selection) {
        element.parentNode.selection = element;
      }
      else {
        element.parentNode.selection = null;
      }
    }
  });
}

/**
 * @module \<ht-sidebar\> inherits HTMLUnknownElement
 * @description Makes a sidebar. Buttons added to the sidebar can be triggered by clicks or keyboard shortcuts 1-9, 0, -, and =
 * 
 * @example var toggle = Hematite.createElement('ht-toggle');
 * @example toggle.faClass = 'fa-flask';
 * @example toggle.faClassAlt = 'fa-fire';
 * @example toggle.title = 'Tooltip text';
 * @example toggle.addEventListener('toggleoff', function() {console.log('Toggled off!')});
 * @example
 * @example var sidebar = Hematite.createElement('ht-sidebar');
 * @example sidebar.addEventListener('toggleon', function(e) {if(e.target === toggle) console.log('Toggle on!')});
 * @example
 * @example sidebar.appendChild(toggle);
 * @example document.body.appendChild(sidebar);
 */
Hematite.sidebarDecorator = function(element) {
  // @prop String id -- Defaults to 'sidebar'
  element.id = 'ht_sidebar';
  
  // @prop Number tabIndex -- Defaults to 1, to allow tab navigation
  element.tabIndex = 1;
  
  // @prop String accessKey -- Defaults to '1'
  element.accessKey = '1';
  
  // @prop String title -- Defaults to 'Key: ' + .accessKeyLabel
  element.title = 'Key: ' + element.accessKeyLabel;
  
  // @prop HTMLElement|null selection -- <ht-select> currently selected, if any. Setting .selection will update highlights and fire un/select
  var selection = null;
  Object.defineProperty(element, 'selection', {
    get: function() {return selection},
    set: function(v) {
      if(selection === v) {
        return;
      }
      
      if(selection) {
        selection.classList.remove('ht_selected');
        selection.dispatchEvent(new Event('unselect', {bubbles: true}));
      }
      
      if(v instanceof HTMLElement && v.tagName === 'HT-SELECT' && v.parentNode === element) {
        selection = v;
        selection.classList.add('ht_selected');
        selection.dispatchEvent(new Event('select', {bubbles: true}));
      }
      else {
        selection = null;
      }
    }
  });
  
  // @prop [Number] keyCuts -- .charCodeAt()s for each keycut. (Mostly) work with KeyboardEvent.keycode
  element.keyCuts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  element.keyCuts.forEach(function(v, i, a) {
    a[i] = v.charCodeAt(0);
  });
  
  document.addEventListener('keydown', function(e) {
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && e.keyCode === 13 && e.target.classList.contains('ht_button')) {
      e.target.dispatchEvent(new MouseEvent('click'));
    }
  });
  
  document.addEventListener('keydown', function(e) {
    var index = element.keyCuts.indexOf(e.keyCode);
    
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && element.children[index]) {
      element.children[index].dispatchEvent(new MouseEvent('click'));
    }
  });
  
  // When a button is added or removed its .title must be updated
  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      Array.forEach(mutation.addedNodes, function(node) {
        if(node.description !== undefined) {
          node.description = node.description;
        }
      });
      
      Array.forEach(mutation.removedNodes, function(node) {
        if(node.description !== undefined) {
          node.description = node.description;
        }
      });
    });
  }).observe(element, {childList: true});
}

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
  //AsyNTer.Node.call(this);
  
  var self = this;
  
  // @prop HTMLElement domElement -- div tag that holds all of the Panel's HTML elements
  this.domElement = fE('div', {id: options.id || '', className: 'ht_panel', tabIndex: 0, accessKey: options.accessKey || ''}, [
    fE('div', {className: 'ht_panel_heading', textContent: options.heading || 'Heading', title: 'Click and drag to move panel'}),
  ]);
  
  this.domElement.title = (options.heading || 'Heading') + (options.accessKey ? '\n\nAccess Key: ' + options.accessKey.toUpperCase() : '');
  
  // @prop Object keyCuts -- Key-value store of keyboard shortcuts. Keys are .keyCode numbers, values are HTMLElement references
  this.keyCuts = {};
  
  // @prop HTMLElement closeButton -- Reference to the close button (may not exist, depending on options)
  this.closeButton = null;
  if(Boolean(options.closeButton) !== false) {
    this.domElement.appendChild(
      this.closeButton = fE('i', {className: 'fa fa-close ht_panel_close ht_button', tabIndex: 0, title: 'Close panel\n\nKey: Q'})
    );
    
    this.keyCuts[81] = this.closeButton; // Q is for quit
  }
  
  // @prop Draggabilly draggie -- Attachment of Draggabilly library for drag-and-drop positioning
  this.draggie = new Draggabilly(this.domElement, {handle: '.ht_panel_heading'});
  
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
//Hematite.Panel.prototype = Object.create(AsyNTer.Node.prototype);
//Hematite.Panel.prototype.constructor = Hematite.Panel;

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
  
  this.domElement.dispatchEvent(new Event('close', {bubbles: true}));
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
