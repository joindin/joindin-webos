function SettingsAssistant() {
    scene_helpers.addCommonSceneMethods(this);
}

SettingsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.model = {
	    username: PreJoindIn.getSetting('username'),
	    password: PreJoindIn.getSetting('password') ? '******' : ''
	};
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
    this.initAppMenu();
    
    this.controller.setupWidget("inputUserName",
        this.inputUserNameAttributes = {
            hintText: $L("User Name"),
            multiline: false,
            enterSubmits: false,
            textCase: Mojo.Widget.steModeLowerCase,
            autoFocus: false,
            modelProperty: 'username'
        },
        this.model
    );

    this.controller.setupWidget("inputPassword",
        this.inputPasswordAttributes = {
            hintText: $L("Password"),
            enterSubmits: false,
            autoFocus: false,
            modelProperty: 'password'
        },
        this.model
    );
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen('inputUserName', Mojo.Event.propertyChange, this.saveSettings.bindAsEventListener(this));
	this.controller.listen('inputPassword', Mojo.Event.propertyChange, this.saveSettings.bindAsEventListener(this));
    
};

SettingsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

SettingsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SettingsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
    PreJoindIn.getInstance().setCredentials(this.model.username, this.model.password);
    
    Mojo.Event.send(document, 'settingsChanged');
};

SettingsAssistant.prototype.saveSettings = function(event) {
    for( key in this.model ) {
        if( key == 'password' ) {
            if( this.model[key] == '******' )
                continue;
            
            PreJoindIn.setSetting(key, sc.helpers.MD5(this.model[key]));
        }
        else
            PreJoindIn.setSetting(key, this.model[key]);
    }
    
    PreJoindIn.saveSettings();
};
