PreJoindIn = {};

PreJoindIn._spazJoindIn = null;
    
PreJoindIn._settingsDb = null;
PreJoindIn._settingsDbLoaded = false;
PreJoindIn._settings = {
    username: null,
    password: null
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
    if( this._settings[key] )
        return this._settings[key];
    else
        return defaultReturn;
};

PreJoindIn.getSettings = function() {
    return this._settings;
};

PreJoindIn.saveSettings = function(successCallback, failureCallback) {
    if( !this._settingsDbLoaded ) {
        Mojo.Log.info("Settings DB Not Loaded, Not Saving...");
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

PreJoindIn.loadSettingsDb = function() {
    if( !this._settingsDb ) {
        this._settingsDb = new Mojo.Depot(
            {
                name: Mojo.appInfo.id + ".prefs",
                version: Mojo.appInfo.version,
                displayName: Mojo.appInfo.title + " prefs DB"
            }, 
            this._loadSettingsDbSuccess.bind(this), 
            this._loadSettingsFailure.bind(this)
        );
    }
    
    return this._settingsDb;
};

PreJoindIn._loadSettingsDbSuccess = function(event) {
    this._settingsDbLoaded = true;
    
    this.loadSettingsDb().get(
        'settings', 
        this._loadSettingsSuccess.bind(this), 
        this._loadSettingsFailure.bind(this)
    );
};

PreJoindIn._loadSettingsFailure = function(event) {
    Mojo.Log.info("Settings DB Failed %j", event);
};

PreJoindIn._loadSettingsSuccess = function(args) {
    if( args ) {
        for( key in args ) {
            this.setSetting(key, args[key]);
        }
    }
    
    Mojo.Log.info("Loaded Preferences...");
};