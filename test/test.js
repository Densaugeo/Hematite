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
  {id: 'instant'  , faClass    : 'fa-university',                            description: 'Instant for testing'},
  {id: 'toggle_1' , faClass    : 'fa-flask'     , faClassAlt: 'fa-fire'    , description: 'Toggle for testing'},
  {id: 'toggle_2' , text       : 'T'            , textAlt   : 'U'          , description: 'This toggle uses char icons'},
  {id: 'toggle_m1', faClass    : 'fa-flask'     , faClassAlt: 'fa-fire'    , description: 'This toggle is not auto', manual: true},
  {id: 'toggle_m2', text       : 'V'            , textAlt   : 'W'          , description: 'This toggle is not auto', manual: true},
  {id: 'select_1' , textContent: '4'            ,                            description: 'For testing selects'},
  {id: 'select_2' , textContent: '5'            ,                            description: 'For testing selects'},
  {id: 'select_3' , textContent: '6'            ,                            description: 'For testing selects'},
  {id: 'contrast' , faClass    : 'fa-adjust'    , faClassAlt: 'fa-circle-o', description: 'Flip contrast'},
  {id: 'clear'    , faClass    : 'fa-recycle'   ,                            description: 'Clear local storage'},
  {id: 'filler_1' , faClass    : 'fa-sun-o'     ,                            description: 'Filling past the keycut slots'},
  {id: 'filler_2' , faClass    : 'fa-gear'},
  {id: 'filler_3' , faClass    : 'fa-gears'     ,                            description: 'Filling past the keycut slots'}
];

expectedButtons.forEach(function(v) {
  if(v.text) {
    v.textContent = v.text;
  }
});

var defaultClassName = 'ht_button fa';

var sidebarDefaultKeycuts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

suite('<ht-button> elements', function() {
  suiteSetup(function(done) {
    this.timeout(10000);
    
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.id + '" is visible', function(done) {
      driver.findElement(By.id(v.id)).isDisplayed().then(function(res) {
        assert.strictEqual(res, true);
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v, i) {
    test('Button "' + v.id + '" is the correct location', function(done) {
      driver.findElement(By.id(v.id)).getLocation().then(function(res) {
        assert.strictEqual(res.x, 6);
        assert.strictEqual(res.y, 6 + 36*i);
        assert.strictEqual(res.width, 36);
        assert.strictEqual(res.height, 36);
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.id + '" has the correct CSS classes', function(done) {
      driver.findElement(By.id(v.id)).getAttribute('className').then(function(res) {
        assert.strictEqual(res.trim(), defaultClassName + (v.faClass ? ' ' + v.faClass : ''));
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Button "' + v.id + '" has the correct .textContent', function(done) {
      driver.findElement(By.id(v.id)).getInnerHtml().then(function(res){
        assert.strictEqual(res, v.textContent || '');
        done();
      });
    });
  });
  
  expectedButtons.forEach(function(v, i) {
    test('Button "' + v.id + '" has the correct .title', function(done) {
      driver.findElement(By.id(v.id)).getAttribute('title').then(function(res){
        var key = sidebarDefaultKeycuts[i];
        assert.strictEqual(res, (v.description || '') + (v.description && key ? '\n\n' : '') + (key ? 'Key: ' + key : ''));
        done();
      });
    });
  });
  
  test('Stray button has the correct title', function(done) {
    driver.findElement(By.id('stray_select')).getAttribute('title').then(function(res){
      assert.strictEqual(res, 'A select button by itself');
      done();
    });
  });
});

suite('<ht-button> interaction', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  expectedButtons.forEach(function(v) {
    test('Setting .faClass on button "' + v.id + '" changes .className correctly', function(done) {
      driver.executeScript(function(id) {
        document.querySelector('#' + id).faClass = 'fa-fire';
      }, v.id);
      
      driver.findElement(By.id(v.id)).getAttribute('className').then(function(res) {
        assert.strictEqual(res.trim(), (defaultClassName + ' fa-fire'));
        done();
      });
    });
  });
});

suite('<ht-instant> interaction', function() {
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

suite('<ht-toggle> interaction', function() {
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
      assert.strictEqual(res, defaultClassName + ' fa-fire');
      done();
    });
  });
  
  test('Toggling button off changes fa icon back', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' fa-flask');
      done();
    });
  });
  
  test('Toggling button with .manual === true does not change fa icon', function(done) {
    driver.findElement(By.id('toggle_m1')).click();
    
    driver.findElement(By.id('toggle_m1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' fa-flask');
      done();
    });
  });
  
  test('Toggling button on changes .textContent', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'U');
      done();
    });
  });
  
  test('Toggling button off changes .textContent back', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'T');
      done();
    });
  });
  
  test('Toggling button with .manual === true does not change .textContent', function(done) {
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
      assert.strictEqual(res.trim(), defaultClassName + ' fa-fire');
      done();
    });
  });
  
  test('Setting .state from true to false changes fa icon back', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_1').state = true;
      document.getElementById('toggle_1').state = false;
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-flask');
      done();
    });
  });
  
  test('Setting .state from false to true changes .textContent', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_2').state = true;
    });
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'U');
      done();
    });
  });
  
  test('Setting .state from true to false changes .textContent back', function(done) {
    driver.executeScript(function() {
      document.getElementById('toggle_2').state = true;
      document.getElementById('toggle_2').state = false;
    });
    
    driver.findElement(By.id('toggle_2')).getAttribute('textContent').then(function(res) {
      assert.strictEqual(res, 'T');
      done();
    });
  });
  
  test('After changing .faClass, .className toggles correctly', function(done) {
    driver.executeScript(function() {
      document.querySelector('#toggle_1').faClass = 'fa-bolt';
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-fire');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
      done();
    });
  });
  
  test('After changing .faClassAlt, .className toggles correctly', function(done) {
    driver.executeScript(function() {
      document.querySelector('#toggle_1').faClassAlt = 'fa-bolt';
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-flask');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-flask');
      done();
    });
  });
  
  test('After changing .faClass while button is active, .className toggles correctly', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    
    driver.executeScript(function() {
      document.querySelector('#toggle_1').faClass = 'fa-bolt';
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-fire');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-fire');
      done();
    });
  });
  
  test('After changing .faClassAlt while button is active, .className toggles correctly', function(done) {
    driver.findElement(By.id('toggle_1')).click();
    
    driver.executeScript(function() {
      document.querySelector('#toggle_1').faClassAlt = 'fa-bolt';
    });
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-flask');
    });
    
    driver.findElement(By.id('toggle_1')).click();
    
    driver.findElement(By.id('toggle_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName + ' fa-bolt');
      done();
    });
  });
  
  test('After changing .text, .textContent toggles correctly', function(done) {
    driver.executeScript(function() {
      document.querySelector('#toggle_2').text = 'X';
    });
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'U');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
      done();
    });
  });
  
  test('After changing .textAlt, .textContent toggles correctly', function(done) {
    driver.executeScript(function() {
      document.querySelector('#toggle_2').textAlt = 'X';
    });
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'T');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'T');
      done();
    });
  });
  
  test('After changing .text while button is active, .textContent toggles correctly', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    
    driver.executeScript(function() {
      document.querySelector('#toggle_2').text = 'X';
    });
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'U');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'U');
      done();
    });
  });
  
  test('After changing .textAlt while button is active, .textContent toggles correctly', function(done) {
    driver.findElement(By.id('toggle_2')).click();
    
    driver.executeScript(function() {
      document.querySelector('#toggle_2').textAlt = 'X';
    });
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'T');
    });
    
    driver.findElement(By.id('toggle_2')).click();
    
    driver.findElement(By.id('toggle_2')).getInnerHtml().then(function(res) {
      assert.strictEqual(res, 'X');
      done();
    });
  });
});

suite('<ht-select> interaction', function() {
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
      assert.strictEqual(res, defaultClassName + ' ht_selected');
      done();
    });
  });
  
  test('When a stray button is selected, it is not highlighted', function(done) {
    driver.findElement(By.id('stray_select')).click();
    
    driver.findElement(By.id('stray_select')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' fa-space-shuttle');
      done();
    });
  });
  
  test('Selecting one button and then another highlights second button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.findElement(By.id('select_2')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' ht_selected');
      done();
    });
  });
  
  test('Selecting one button and then a stray leaves highlight on first button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('stray_select')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' ht_selected');
    });
    
    driver.findElement(By.id('stray_select')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' fa-space-shuttle');
      done();
    });
  });
  
  test('Selecting one button and then another removes highlight from first button', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName);
      done();
    });
  });
  
  test('When a button is unselected, its highlight is removed', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_1')).click();
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName);
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
      return sidebar.selection.id;
    }).then(function(res) {
      assert.strictEqual(res, 'select_1');
      done();
    });
  });
  
  test('When another button is selected, .selection is changed to the new selection', function(done) {
    driver.findElement(By.id('select_1')).click();
    driver.findElement(By.id('select_2')).click();
    
    driver.executeScript(function() {
      return sidebar.selection.id;
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
  
  test('Setting .selection from null to an <ht-select> fires select (not unselect)', function(done) {
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
  
  test('Setting .selection to its current value does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#select_1');
      sidebar.selection = sidebar.selection;
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 1);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Attempting to set .selection to an invalid HTMLElement sets it to null', function(done) {
    driver.executeScript(function() {
      sidebar.selection = 'foo';
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Attempting to set .selection to an <ht-instant> sets it to null', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#instant');
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Attempting to set .selection to an <ht-toggle> sets it to null', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#toggle_1');
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Attempting to set .selection to an <ht-select> that is not its child sets it to null', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#stray_select');
      return sidebar.selection;
    }).then(function(res) {
      assert.strictEqual(res, null);
      done();
    });
  });
  
  test('Attempting to set .selection from null to an invalid HTMLElement does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = 'foo';
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Attempting to set .selection from null to an <ht-instant> does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#instant');
    });
    
    checkRecords(function(records) {
      assert.strictEqual(records.selectCount, 0);
      assert.strictEqual(records.unselectCount, 0);
      done();
    });
  });
  
  test('Attempting to set .selection from null to an <ht-select> that is not its child does not fire un/select', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.querySelector('#stray_select');
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
      assert.strictEqual(res, defaultClassName + ' ht_selected');
      done();
    });
  });
  
  test('Attempting to set .selection to an <ht-instant> does not add highlight', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('instant');
    });
    
    driver.findElement(By.id('instant')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' fa-university');
      done();
    });
  });
  
  test('Changing .selection from one button to another highlights new button', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.getElementById('select_2');
    });
    
    driver.findElement(By.id('select_2')).getAttribute('className').then(function(res) {
      assert.strictEqual(res, defaultClassName + ' ht_selected');
      done();
    });
  });
  
  test('Changing .selection from one button to another removes highlight from old button', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = document.getElementById('select_2');
    });
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName);
      done();
    });
  });
  
  test('Setting .selection from a button to null removes highlight', function(done) {
    driver.executeScript(function() {
      sidebar.selection = document.getElementById('select_1');
      sidebar.selection = null;
    });
    
    driver.findElement(By.id('select_1')).getAttribute('className').then(function(res) {
      assert.strictEqual(res.trim(), defaultClassName);
      done();
    });
  });
});

suite('<ht-sidebar>', function() {
  setup(function(done) {
    driver.get(testURL).then(function() {
      done();
    });
  });
  
  expectedButtons.forEach(function(v, i) {
    if(sidebarDefaultKeycuts[i]) {
      test('Keyboard shortcut "' + sidebarDefaultKeycuts[i] + '" activates button on <ht-sidebar>', function(done) {
        driver.findElement(By.tagName('body')).sendKeys(sidebarDefaultKeycuts[i]);
        
        checkRecords(function(records) {
          assert.strictEqual(records.lastClick, v.id);
          assert.strictEqual(records.clickCount, 1);
          done();
        });
      });
    }
  });
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
      assert.strictEqual(res, 'ht_panel');
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
