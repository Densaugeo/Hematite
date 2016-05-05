/**
 * @depends Draggabilliy
 * @description Shared UI elements for my apps
 */
var Draggabilly = require('draggabilly');

var Hematite = exports;

// @prop Object elements -- Key-value store of custom elements. Keys are tagnames (in all caps), values are decorator functions. Each decorator accepts an HTMLElement as its argument and returns the same element
Hematite.elements = {};

// @method HTMLElement createElement(String tagName) -- Extension of document.createElement for creating ht- elements
Hematite.createElement = function(tagName) {
  var element = document.createElement(tagName);
  var decorator = Hematite.elements[tagName.toUpperCase()];
  
  if(decorator) {
    decorator(element);
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
Hematite.elements['HT-BUTTON'] = function(element) {
  // @prop String className -- Defaults to 'ht-button fa'
  element.className = 'ht-button fa';
  
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
Hematite.elements['HT-INSTANT'] = function(element) {
  Hematite.elements['HT-BUTTON'](element);
  
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
Hematite.elements['HT-TOGGLE'] = function(element) {
  Hematite.elements['HT-BUTTON'](element);
  
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
Hematite.elements['HT-SELECT'] = function(element) {
  Hematite.elements['HT-BUTTON'](element);
  
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
Hematite.elements['HT-SIDEBAR'] = function(element) {
  // @prop String className -- Defaults to 'ht-tray'
  element.className = 'ht-tray';
  
  // @prop Number tabIndex -- Defaults to 1, to allow tab navigation
  element.tabIndex = 1;
  
  // @prop String accessKey -- Defaults to '1'
  element.accessKey = '1';
  
  // @prop String title -- Defaults to 'Key: ' + .accessKeyLabel, if available
  if(element.accessKeyLabel) {
    element.title = 'Key: ' + element.accessKeyLabel;
  }
  
  // @prop HTMLElement|null selection -- <ht-select> currently selected, if any. Setting .selection will update highlights and fire un/select
  var selection = null;
  Object.defineProperty(element, 'selection', {
    get: function() {return selection},
    set: function(v) {
      if(selection === v) {
        return;
      }
      
      if(selection) {
        selection.classList.remove('ht-selected');
        selection.dispatchEvent(new Event('unselect', {bubbles: true}));
      }
      
      if(v instanceof HTMLElement && v.tagName === 'HT-SELECT' && v.parentNode === element) {
        selection = v;
        selection.classList.add('ht-selected');
        selection.dispatchEvent(new Event('select', {bubbles: true}));
      }
      else {
        selection = null;
      }
    }
  });
  
  // @prop [Number] keyCuts -- .charCodeAt()s for each keycut. (Mostly) work with KeyboardEvent.keycode
  element.keyCuts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  element.keyCuts.forEach(function(v, i, a) {
    a[i] = v.charCodeAt(0);
  });
  
  document.addEventListener('keydown', function(e) {
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && e.keyCode === 13 && e.target.classList.contains('ht-button')) {
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
      for(var i = 0; i < mutation.addedNodes.length; ++i) {
        if(mutation.addedNodes[i].description !== undefined) {
          mutation.addedNodes[i].description = mutation.addedNodes[i].description;
        }
      }
      
      for(i = 0; i < mutation.removedNodes.length; ++i) {
        if(mutation.removedNodes[i].description !== undefined) {
          mutation.removedNodes[i].description = mutation.removedNodes[i].description;
        }
      }
    });
  }).observe(element, {childList: true});
}

/**
 * @module \<ht-panel\> inherits HTMLUnknownElement
 * @description Standard Hematite UI panel
 * 
 * @example var example_panel = Hematite.createElement('ht-panel');
 * @example example_panel.headingText = 'Here is a panel';
 * @example document.body.appendChild(example_panel);
 * @example
 * @example var content = document.createElement('div');
 * @example content.textContent = 'Stuff can go here';
 * @example example_panel.appendChild(content);
 * @example
 * @example // Or, using the forgeElement helper function:
 * @example var example_panel = Hematite.fE('ht-panel', {headingText: 'Here is a panel'}, [
 * @example   fE('div', {textContent: 'Stuff can go here'})
 * @example ]);
 * @example document.body.appendChild(example_panel);
 */
Hematite.elements['HT-PANEL'] = function(element) {
  // @prop String className -- Defaults to 'ht-panel'
  element.className = 'ht-panel';
  
  // @prop Number tabIndex -- Defaults to 0, to allow tab navigation
  element.tabIndex = 0;
  
  // @prop HTMLElement heading -- HTML element for heading
  element.heading = element.appendChild(fE('div', {className: 'ht-panel-heading', title: 'Click and drag to move panel'}));
  
  // @prop String headingText -- Corresponds to .textContent of headingText HTML element
  Object.defineProperty(element, 'headingText', {
    enumerable: true,
    get: function() {
      return this.children[0].textContent;
    },
    set: function(v) {
      this.children[0].textContent = v;
      this._setTitle();
    }
  });
  
  // @prop HTMLElement closeButton -- Reference to the close button
  element.closeButton = fE('i', {className: 'fa fa-close ht-panel-close ht-button', tabIndex: 0, title: 'Close panel'});
  element.appendChild(element.closeButton);
  
  element.closeButton.addEventListener('click', function() {
    element.open = false;
  });
  
  // @prop Boolean showCloseButton -- True if close button is displayed. Works via CSS display property. Default true
  var showCloseButton = true;
  Object.defineProperty(element, 'showCloseButton', {
    enumerable: true,
    get: function() {
      return showCloseButton;
    },
    set: function(v) {
      this.closeButton.style.display = v ? '' : 'none';
      showCloseButton = Boolean(v);
    }
  });
  
  // @prop Object keyCuts -- Key-value store of keyboard shortcuts. Keys are .keyCode numbers, values are HTMLElement references
  element.keyCuts = {};
  element.addEventListener('keydown', function(e) {
    if(!e.altKey && !e.ctrlKey && !e.shiftKey && element.keyCuts[e.keyCode]) {
      e.stopPropagation();
      
      element.keyCuts[e.keyCode].dispatchEvent(new MouseEvent('click'));
    }
  });
  
  // @prop Boolean open -- True if panel is displayed. Works via CSS display property
  // @event open {} -- Fired on panel open
  // @event close {} -- Fired on panel close
  var open = true;
  Object.defineProperty(element, 'open', {
    enumerable: true,
    get: function() {
      return open;
    },
    set: function(v) {
      this.style.display = v ? '' : 'none';
      this.dispatchEvent(new Event(v ? 'open' : 'close', {bubbles: true}));
      open = Boolean(v);
    }
  });
  element.dispatchEvent(new Event('open', {bubbles: true}));
  
  // @method undefined _setTitle() -- Updates .title, based on .headingText and .accessKey
  element._setTitle = function() {
    this.title = this.headingText + (this.headingText && this.accessKey ? '\n\n' : '') + (this.accessKey ? 'Key: ' : '') + this.accessKey.toUpperCase();
  }
  
  new MutationObserver(function() {
    element._setTitle();
  }).observe(element, {attributes: true, attributeFilter: ['accesskey']});
  
  // @prop Draggabilly _draggie -- Attachment of Draggabilly library for drag-and-drop positioning
  element._draggie = new Draggabilly(element, {handle: '.ht-panel-heading'});
  
  if(localStorage['dragger_' + element.id + '_top']) {
    element.style.top  = localStorage['dragger_' + element.id + '_top' ];
    element.style.left = localStorage['dragger_' + element.id + '_left'];
  }
  
  element._draggie.on('dragEnd', function() {
    localStorage['dragger_' + element.id + '_top' ] = element.style.top ;
    localStorage['dragger_' + element.id + '_left'] = element.style.left;
  });
}
