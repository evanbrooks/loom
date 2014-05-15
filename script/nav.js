// ______________________________________

// Navigation object

function Nav() {

  var self = this;

  var doc, flaps, panels;

  self.current = null; // current tab
  self.tabs    = {};   // tabs where key 
  self.list    = [];   // ordered list of tabs

  self.flaps   = null; // element for bar
  self.panels  = null; // element for content wrappers

  self.setDocument = function(document) {
    doc = document;
    flaps = doc.getElementById("tab_flaps");
    panels = doc.getElementById("tab_panels");
  };

  self.addTabAndFocus = function(path, content) {
    var tab = self.addTab(path, content);
    self.setTab(tab);
  };

  self.addTab = function(path, content) {

    var newTab = new Tab(self);

    newTab.initWithFile(path, content);

    flaps.appendChild(newTab.flap);
    panels.appendChild(newTab.panel);

    self.tabs[path] = newTab; // Add to dict
    self.list.push(newTab);   // Add to ordered list

    // If nothing is focused, focus this.
    if (!self.current) self.setTab(newTab);

    self.saveState();
    return newTab;
  };

  self.removeTab = function(tab) {
    var index = self.list.indexOf(tab);
    if (self.current === tab ) {
      if (index > 0) {
        // not the first tab, so set current tab to previous tab
        self.setTab(self.list[index-1]);
      }
      else if (self.list.length > 1) {
        // first tab and more than one tab open,
        // so set current tab to next tab
        self.setTab(self.list[index+1]);
      }
      else {
        // that was the last tab
        self.setTab(null);
      }
    }
    self.list.splice(index, 1);
    delete self.tabs[tab.path];
    self.saveState();
  };

  self.setTab = function(tab) {
    if (self.current) {
      self.current.flap.classList.remove("activetab");
      self.current.panel.classList.remove("active");
    }
    self.current = tab;
    if (tab) { // We might be setting no tab for some reason
      tab.flap.classList.add("activetab");
      tab.panel.classList.add("active");
      self.current.cm.refresh();
      self.current.cm.focus();
    }
    self.saveState();
  };

  self.setTheme = function(newtheme) {
    for (var filepath in self.tabs) {
      self.tabs[filepath].cm.setOption("theme", newtheme);
    }
  };

  self.saveCurrent = function() {
    if (self.current.save) self.current.save();
  };

  // ___________________
  // Restore Nav state between opens

  self.saveState = function() {
    var pathList = self.list.map(function(val){
      return val.path;
    });
    localStorage.navState = JSON.stringify({
      list: pathList
    });
  }
  self.restoreState = function() {
    var oldStateStr = localStorage.navState;
    if (oldStateStr) {
      var oldState = JSON.parse(oldStateStr);
      console.log(oldState);
      // REOPEN FILES
      async.map(oldState.list, filer.open, function(err, files) {
        files.forEach(function(f) {
          if (f.error) return;
          self.addTab(f.path, f.content);
        });
      });
      // RESET CURRENT FILE
    }
  }


}

// module.exports = new Nav;