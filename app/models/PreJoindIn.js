PreJoindIn = {};

PreJoindIn._spazJoindIn = null;
    
PreJoindIn._settingsDb = null;
PreJoindIn._settingsDbLoaded = false;
PreJoindIn._settings = {
    username: null,
    password: null,
    defaultEventsort: 'hot'
};
    
PreJoindIn.getInstance = function() {
    if( !this._spazJoindIn )
        this.reloadInstance();
    
    return this._spazJoindIn;
};
    
PreJoindIn.reloadInstance = function() {
    this._spazJoindIn = new SpazJoindIn({
        baseURL: 'http://joind.in/api',
        username: this.getSetting('username'),
        password: this.getSetting('password')
    });
};

PreJoindIn.setSetting = function(key, value) {
    this._settings[key] = value;
};

PreJoindIn.setSettings = function(object) {
    this._settings = object;
};

PreJoindIn.getSetting = function(key, defaultReturn) {
    if( key in this._settings )
        return this._settings[key];
    else
        return defaultReturn;
};

PreJoindIn.getSettings = function() {
    return this._settings;
};

PreJoindIn.saveSettings = function(successCallback, failureCallback, noReload) {
    if( !this._settingsDbLoaded && !noReload ) {
        Mojo.Log.info("Settings not loaded, attempting reload...");
        this.loadSettingsDb(
            function() {
                Mojo.Log.info("Settings reloaded!");
                this.saveSettings(successCallback, failureCallback, true);
            }.bind(this), 
            function() {
                Mojo.Log.error("Settings DB Not Loaded, Not Saving...");
            }.bind(this)
        );
        return;
    } else if( !this._settingsDbLoaded && noReload ) {
        Mojo.Log.error("Settings not loaded, refusing to save.");
        return false;
    }
        
    this._settingsDb.add(
        'settings', 
        this.getSettings(), 
        function(event) {
            if( successCallback )
                successCallback(event);
            
            this._saveSettingsDbSuccess(event);
        }.bind(this),
        function(event) {
            if( failureCallback )
                failureCallback(event);
                
            this._saveSettingsDbFailure(event);
        }.bind(this)   
    );
};

PreJoindIn._saveSettingsDbSuccess = function(event) {
    Mojo.Log.info("Settings Saved!");
};

PreJoindIn._saveSettingsDbFailure = function(event) {
    Mojo.Log.info("Failed to save settings %j", event);
};

PreJoindIn.loadSettingsDb = function(onSuccess, onFailure) {
    if( !this._settingsDb ) {
        this._settingsDb = new Mojo.Depot(
            {
                name: Mojo.appInfo.id + ".prefs",
                version: '0.1.5', //Mojo.appInfo.version,
                displayName: Mojo.appInfo.title + " prefs DB"
            }, 
            function(event) {
                this._loadSettingsDbSuccess(event, onSuccess, onFailure);
            }.bind(this),
            function(event) {
                this._loadSettingsFailure(event, onFailure);
            }.bind(this)
        );
    }
    
    return this._settingsDb;
};

PreJoindIn._loadSettingsDbSuccess = function(event, onSuccess, onFailure) {
    this._settingsDbLoaded = true;
    
    this.loadSettingsDb().get(
        'settings', 
        function(event) {
            this._loadSettingsSuccess(event, onSuccess);
        }.bind(this), 
        function(event) {
            this._loadSettingsFailure(event, onFailure);
        }.bind(this)
    );
};

PreJoindIn._loadSettingsFailure = function(event, callback) {
    Mojo.Log.error("Settings DB Failed %j", event);
    
    this._settingsDbLoaded = false;
    this._settingsDb = null;
    
    if( typeof callback == 'function')
        callback(event);
};

PreJoindIn._loadSettingsSuccess = function(args, callback) {
    if( args ) {
        for( key in args ) {
            this.setSetting(key, args[key]);
        }
    }
    
    Mojo.Log.info("Loaded Preferences...");
    
    if( typeof callback == 'function' )
        callback(args);
};