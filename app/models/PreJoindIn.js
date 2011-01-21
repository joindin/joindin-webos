PreJoindIn = {};

PreJoindIn._spazJoindIn = null;

PreJoindIn._cookie = new Mojo.Model.Cookie("PreJoindInPrefs");
PreJoindIn._settings = {
    username: null,
    password: null,
    defaultEventSort: 'hot'
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

PreJoindIn.saveSettings = function() {
    this._cookie.put(this._settings);
};

PreJoindIn.loadSettings = function() {
    var newSettings = this._cookie.get();
    
    if( newSettings )
        this._settings = newSettings;
    else
        this.saveSettings();
};