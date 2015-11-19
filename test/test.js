var assert = require('assert');
var webdriver = require('selenium-webdriver'),
    By = webdriver.By;

var driver = new webdriver.Builder().forBrowser('firefox').build();

var testURL = 'file:///' + process.cwd() + '/test.html';

var checkRecords = function(test) {
  driver.executeScript(function() {
    return JSON.stringify(records);
  }).then(function(res) {
    test(JSON.parse(res));
  });
}

var Hematite = {};

var expectedButtons = [
  {name: 'instant'  ,                        faClass: 'fa-university',                            title: 'Instant for testing'        },
  {name: 'toggle_1' , type: Hematite.TOGGLE, faClass: 'fa-flask'     , faClassAlt: 'fa-fire'    , title: 'Toggle for testing'         },
  {name: 'toggle_2' , type: Hematite.TOGGLE, char   : 'T'            , charAlt   : 'U'          , title: 'This toggle uses char icons'},
  {name: 'toggle_m1', type: Hematite.TOGGLE, faClass: 'fa-flask'     , faClassAlt: 'fa-fire'    , title: 'This toggle is not auto'    , manual: true},
  {name: 'toggle_m2', type: Hematite.TOGGLE, char   : 'V'            , charAlt   : 'W'          , title: 'This toggle is not auto'    , manual: true},
  {name: 'select_1' , type: Hematite.SELECT, char   : '4'            ,                            title: 'For testing selects'        },
  {name: 'select_2' , type: Hematite.SELECT, char   : '5'            ,                            title: 'For testing selects'        },
  {name: 'select_3' , type: Hematite.SELECT, char   : '6'            ,                            title: 'For testing selects'        },
  {name: 'contrast' , type: Hematite.TOGGLE, faClass: 'fa-adjust'    , faClassAlt: 'fa-circle-o', title: 'Flip contrast'              },
  {name: 'clear'    ,                        faClass: 'fa-recycle'   ,                            title: 'Clear local storage'        },
];

expectedButtons.forEach(function(v) {
  v.id = v.name;
});

suite('Hematite.Button elements', function() {
  suiteSetup(function(done) {
    this.timeout(10000);
    
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.name + '" is visible', function(done) {
      driver.findElement(By.id(v.id)).isDisplayed().then(function(res) {
        assert.strictEqual(res, true);
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v, i) {
    test('Button "' + v.name + '" is the correct location', function(done) {
      driver.findElement(By.id(v.id)).getLocation().then(function(res) {
        assert.strictEqual(res.x, 12);
        assert.strictEqual(res.y, 12 + 36*i);
        assert.strictEqual(res.width, 24);
        assert.strictEqual(res.height, 24);
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.name + '" has the correct CSS classes', function(done) {
      driver.findElement(By.id(v.id)).getAttribute('className').then(function(res) {
        assert.strictEqual(res.trim(), ('fa button ' + (v.faClass || '')).trim());
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.name + '" has the correct .textContent', function(done) {
      driver.findElement(By.id(v.id)).getInnerHtml().then(function(res){
        assert.strictEqual(res, v.char || '');
        done();
      });
    });
  });
});

suite('Hematite.Button interaction', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.name + '" fires its named event', function(done) {
      driver.findElement(By.id(v.id)).click();
      
      checkRecords(function(records) {
        assert.strictEqual(records.lastName, v.name);
        assert.strictEqual(records.nameCount, 1);
        done();
      });
    });
  });
});

suite('Hematite.InstantButton interaction', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  test('Instant buttons fire trigger', function(done) {
    driver.findElement(By.id('instant')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastTrigger, 'instant');
      assert.strictEqual(records.triggerCount, 1);
      done();
    });
  });
  
  test('Instant buttons do not fire toggle events', function(done) {
    driver.findElement(By.id('instant')).click();
    driver.findElement(By.id('instant')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.toggleonCount, 0);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Instant buttons do not fire un/select ', function(done) {
    driver.findElement(By.id('instant')).click();
    driver.findElement(By.id('instant')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
});

suite('Hematite.ToggleButton interaction', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  test('Toggle buttons fire toggleon when first pressed (not toggleoff)', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastToggleon, 'toggle_1');
      assert.strictEqual(records.toggleonCount, 1);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Toggle buttons fire toggleoff when pressed again (not toggleon)', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastToggleon, 'toggle_1');
      assert.strictEqual(records.toggleonCount, 1);
      assert.strictEqual(records.lastToggleoff, 'toggle_1');
      assert.strictEqual(records.toggleoffCount, 1);
      done();
    });
  });
  
  test('Toggle buttons with .manual === true do not fire toggle events', function(done) {
    driver.findElement(By.id('toggle_m1')).click();
    driver.findElement(By.id('toggle_m1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.toggleonCount, 0);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Toggle buttons do not fire trigger', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.triggerCount, 0);
      done();
    });
  });
  
  test('Toggle buttons do not fire un/select', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Toggling button on changes fa icon', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button fa-fire');
      done();
    });
  });
  
  test('Toggling button off changes fa icon back', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button fa-flask');
      done();
    });
  });
  
  test('Toggling button with .manual === true does not change fa icon', function(done) {
    driver.findElement(By.id('toggle_m1')).click();
    
    driver.findElement(By.id('toggle_m1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button fa-flask');
      done();
    });
  });
  
  test('Toggling button on changes char icon', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'U');
      done();
    });
  });
  
  test('Toggling button off changes char icon back', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'T');
      done();
    });
  });
  
  test('Toggling button with .manual === true does not change char icon', function(done) {
    driver.findElement(By.id('toggle_m2')).click();
    
    driver.findElement(By.id('toggle_m2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'V');
      done();
    });
  });
  
  test('Toggle button .state defaults to false', function(done) {
    driver.findElement(By.id('toggle_1')).getAttribute('state').then(function(res) {
      assert.strictEqual(res, 'false');
      done();
    });
  });
  
  test('Toggling button on sets .state to true', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('state').then(function(res) {
      assert.strictEqual(res, 'true');
      done();
    });
  });
  
  test('Toggling button off sets .state back to false', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('state').then(function(res) {
      assert.strictEqual(res, 'false');
      done();
    });
  });
  
  test('Toggling button with .manual === true does not set .state to true', function(done) {
    driver.findElement(By.id('toggle_m1')).click();
    
    driver.findElement(By.id('toggle_m1')).getAttribute('state').then(function(res) {
      assert.strictEqual(res, 'false');
      done();
    });
  });
  
  test('Toggling active button with .manual === true does not set .state to false', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_m1').state = true;
    });
    
    driver.findElement(By.id('toggle_m1')).click();
    
    driver.findElement(By.id('toggle_m1')).getAttribute('state').then(function(res) {
      assert.strictEqual(res, 'true');
      done();
    });
  });
  
  test('Setting .state from false to true fires toggleon (not toggleoff)', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastToggleon, 'toggle_1');
      assert.strictEqual(records.toggleonCount, 1);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Setting .state from true to true does not fire toggle events', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = true;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastToggleon, 'toggle_1');
      assert.strictEqual(records.toggleonCount, 1);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Setting .state from true to false fires toggleoff (not toggleon)', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastToggleon, 'toggle_1');
      assert.strictEqual(records.toggleonCount, 1);
      assert.strictEqual(records.lastToggleoff, 'toggle_1');
      assert.strictEqual(records.toggleoffCount, 1);
      done();
    });
  });
  
  test('Setting .state from false to false does not fire toggle events', function(done) {
    checkRecords(function(records) {
      assert.strictEqual(records.toggleonCount, 0);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Setting .state does not fire name events', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.nameCount, 0);
      done();
    });
  });
  
  test('Setting .state does not fire trigger', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.triggerCount, 0);
      done();
    });
  });
  
  test('Setting .state does not fire un/select', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Setting .state from false to true changes fa icon', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), ('fa button fa-fire'));
      done();
    });
  });
  
  test('Setting .state from true to false changes fa icon back', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), ('fa button fa-flask'));
      done();
    });
  });
  
  test('Setting .state from false to true changes char icon', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_2').state = true;
    });
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'U');
      done();
    });
  });
  
  test('Setting .state from true to false changes char icon back', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_2').state = true;
      document.getElementById('toggle_2').state = false;
    });
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'T');
      done();
    });
  });
});

suite('Hematite.SelectButton interaction', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  test('Clicking inactive select button fires select (not unselect)', function(done) {
    driver.findElement(By.id('select_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Clicking active select button fires unselect (not select)', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_1')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('Changing selection fires select on new button, unselect on old button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_2');
      assert.strictEqual(records.selectCount, 2);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('Clicking non-select button while one is active fires unselect (not select)', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('instant')).click();
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('When a button is selected, it is highlighted', function(done) {
    driver.findElement(By.id('select_1')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button selected');
      done();
    });
  });
  
  test('Selecting one button and then another highlights second button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.findElement(By.id('select_2')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button selected');
      done();
    });
  });
  
  test('Selecting one button and then another removes highlight from first button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), 'fa button');
      done();
    });
  });
  
  test('When a button is unselected, its highlight is removed', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_1')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), 'fa button');
      done();
    });
  });
  
  test('.selection is initially null', function(done) {
    driver.executeScript(function() {
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('When a button is selected, .selection is set to the button', function(done) {
    driver.findElement(By.id('select_1')).click();
    
    driver.executeScript(function() {
      return sidebar.selection.name;
    }).then(function(res) {
      assert.strictEqual(res, 'select_1');
      done();
    });
  });
  
  test('When another button is selected, .selection is changed to the new selection', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.executeScript(function() {
      return sidebar.selection.name;
    }).then(function(res) {
      assert.strictEqual(res, 'select_2');
      done();
    });
  });
  
  test('When selection is cleared, .selection is set to null', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_1')).click();
    
    driver.executeScript(function() {
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Setting .selection from null to a button fires select (not unselect)', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Setting .selection to an invalid value results in .select === null', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.body;
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Setting .selection from null to an invalid value does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.body;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Changing .selection from one button to another fires select on new button and unselect on old', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.getElementById('select_2');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_2');
      assert.strictEqual(records.selectCount, 2);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('Setting .selection from a button to null fires unselect (not select)', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = null;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('Setting .selection from a button to an invalid value fires unselect (not select)', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.body;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.lastSelect, 'select_1');
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.lastUnselect, 'select_1');
      assert.strictEqual(records.unselectCount, 1);
      done();
    });
  });
  
  test('Setting .selection from null to null does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = null;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Setting .selection does not fire name events', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.nameCount, 0);
      done();
    });
  });
  
  test('Setting .selection does not fire trigger events', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.triggerCount, 0);
      done();
    });
  });
  
  test('Setting .selection does not fire toggle events', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.toggleonCount, 0);
      assert.strictEqual(records.toggleoffCount, 0);
      done();
    });
  });
  
  test('Setting .selection from null highlights button', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
    });
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button selected');
      done();
    });
  });
  
  test('Changing .selection from one button to another highlights new button', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.getElementById('select_2');
    });
    
    driver.findElement(By.id('select_2')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'fa button selected');
      done();
    });
  });
  
  test('Changing .selection from one button to another removes highlight from old button', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.getElementById('select_2');
    });
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), 'fa button');
      done();
    });
  });
  
  test('Setting .selection from a button to null removes highlight', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = null;
    });
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), 'fa button');
      done();
    });
  });
});

suite('Hematite.Sidebar', function() {
  test('Hotkeys?');
});

suite('Hematite.Panel', function() {
  test('Panel is visible', function(done) {
    driver.findElement(By.id('panel_test')).isDisplayed().then(function(res) {
      assert.strictEqual(res, true);
      done();
    });
  });
  
  test('Panel has correct CSS classes', function(done) {
    driver.findElement(By.id('panel_test')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, 'panel');
      done();
    });
  });
  
  test('Heading has correct .textContent');
  
  test('Heading has correct CSS classes');
  
  test('Dragging heading moves Panel');
  
  test('Panel position is saved across refreshes');
  
  test('Close button closes panel');
});

suite('Extras', function() {
  test('Default contrast is light on dark');
  
  test('Contrast swap button changes body to correct CSS style');
  
  test('Dark on light contrast is remembered across refreshes');
  
  test('Contrast swap button changes body back to original CSS style');
  
  test('Light on dark contrast is remembered across refreshes');
});
