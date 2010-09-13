function PreferencesAssistant() {
    scene_helpers.addCommonSceneMethods(this);
    
    this.settingsAltered = false;
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.model = {
    };
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
    this.initAppMenu({
        items: [
			Mojo.Menu.editItem,
            {label: $L("Preferences..."), command: "do-preferences", disabled: true},
            {label: $L("About..."), command: "do-about"}
		]
    });
	
	/* setup widgets here */
	this.controller.setupWidget("accountButton",
	    this.accountButtonAttributes = {
	    },
	    this.accountButtonModel = {
	        label: 'Login',
	        disabled: false
	    }
	);
	
	this.controller.setupWidget("removeAccountButton",
	    this.removeAccountButtonAttributes = {
	    },
	    this.removeAccountButtonModel = {
	        label: 'Clear Account',
	        disabled: false,
	        buttonClass: 'negative'
	    }
	);
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen(
	    "accountButton",
	    Mojo.Event.tap,
	    this.accountButtonTap.bindAsEventListener(this)
	);
    
    this.controller.listen(
	    "removeAccountButton",
	    Mojo.Event.tap,
	    this.logoutAccountButtonTap.bindAsEventListener(this)
	);
	
	this.reflectCurrentSettings();
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
    Mojo.Event.send(document, 'settingsChanged');
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

PreferencesAssistant.prototype.reflectCurrentSettings = function() {
	if( !PreJoindIn.getSetting('username') ) {
	    this.accountButtonModel.label = 'Login';
	    this.controller.modelChanged(this.accountButtonModel);
   	    
   	    $('#removeAccountButton').hide();
	    $('#accountButton').show();
	} else {
	    this.removeAccountButtonModel.label = 'Logout "' + PreJoindIn.getSetting('username') + '"';
	    this.controller.modelChanged(this.removeAccountButtonModel);
  	    
  	    $('#removeAccountButton').show();
	    $('#accountButton').hide();
	}
};

PreferencesAssistant.prototype.triggerSave = function() {
    for( key in this.model ) {
        PreJoindIn.setSetting(key, this.model[key]);
    }
    
    this.settingsAltered = true;
    
    PreJoindIn.saveSettings(
        function(event) {
            //Success
            this.reflectCurrentSettings();
        }.bind(this),
        function(event) {
            Mojo.Controller.errorDialog("Error Saving Settings...");
        }.bind(this)
    );
};

PreferencesAssistant.prototype.accountButtonTap = function() {
    this.controller.showDialog({
		template: "preferences/preferences-accountDialogTemplate",
		assistant: new Preferences_AccountDialogAssistant(this),//, data, this.updateDate.bind(this)),
		title: this.model.username ? 'Manage Account' : 'Setup Account',
	});
};

PreferencesAssistant.prototype.logoutAccountButtonTap = function() {
    this.controller.showAlertDialog({
        onChoose: function(remove) {
            if( remove ) {
                this.model.username = null;
                this.model.password = null;
                
                this.triggerSave();
                
                $('#removeAccountButton').hide();
                
                this.accountButtonModel.label = 'Setup Account';
                this.controller.modelChanged(this.accountButtonModel);
            } else {
                //Do Nothing
            }
        }.bind(this),
        title: $L("Confirm Account Logout"),
        message: $L("Are you sure you wish to logout of your account?"),
        choices: [
            {label: $L('Logout'), value: true, type: 'affirmative'},
            {label: $L('Cancel'), value: false, type: 'negative'}
        ]
    })
};


// ACCOUNT DIALOG ////////////////////////////////////////////////////////////////////////////////////////////////

function Preferences_AccountDialogAssistant(sceneAssistant, data, callBackFunc) {
	this.sceneAssistant = sceneAssistant;
	this.callBackFunc = callBackFunc;
}

Preferences_AccountDialogAssistant.prototype.setup = function(widget) {
    this.widget = widget;
    this.model = {
	    username: PreJoindIn.getSetting('username'),
	    password: PreJoindIn.getSetting('password') ? '******' : null
    };
    
	this.sceneAssistant.controller.setupWidget("accountDialogSaveButton",
	    this.saveButtonAttributes = {
	    },
	    this.saveButtonModel = {
	        label: 'Save',
	        disabled: true,
	        buttonClass: 'affirmative'
	    }
	);
	
	this.sceneAssistant.controller.setupWidget("accountDialogCancelButton",
	    this.cancelButtonAttributes = {
	    },
	    this.cancelButtonModel = {
	        label: 'Cancel',
	        disabled: false,
	        buttonClass: 'negative'
	    }
	);
	
	this.sceneAssistant.controller.setupWidget("accountDialogInputUserName",
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

    this.sceneAssistant.controller.setupWidget("accountDialogInputPassword",
        this.inputPasswordAttributes = {
            hintText: $L("Password"),
            enterSubmits: false,
            autoFocus: false,
            modelProperty: 'password'
        },
        this.model
    );
	
	
	this.sceneAssistant.controller.listen(
	    "accountDialogSaveButton",
	    Mojo.Event.tap,
	    this.saveButtonTap.bindAsEventListener(this)
	);
	
	this.sceneAssistant.controller.listen(
	    "accountDialogCancelButton",
	    Mojo.Event.tap,
	    this.cancelButtonTap.bindAsEventListener(this)
	);
	
	this.sceneAssistant.controller.listen(
	    "accountDialogInputUserName",
	    Mojo.Event.propertyChange,
	    this.enableSaveButton.bindAsEventListener(this)
	);
	
	this.sceneAssistant.controller.listen(
	    "accountDialogInputPassword",
	    Mojo.Event.propertyChange,
	    this.enableSaveButton.bindAsEventListener(this)
	);
};

Preferences_AccountDialogAssistant.prototype.cleanup = function() {
    this.sceneAssistant.controller.stopListening(
	    "accountDialogSaveButton",
	    Mojo.Event.tap,
	    this.saveButtonTap.bindAsEventListener(this)
	);
	
	this.sceneAssistant.controller.stopListening(
	    "accountDialogCancelButton",
	    Mojo.Event.tap,
	    this.cancelButtonTap.bindAsEventListener(this)
	);
    
    this.stopListeningForChanges();
};

Preferences_AccountDialogAssistant.prototype.enableSaveButton = function() {
    this.saveButtonModel.disabled = false;
    this.sceneAssistant.controller.modelChanged(this.saveButtonModel);
    
    this.stopListeningForChanges();
};

Preferences_AccountDialogAssistant.prototype.stopListeningForChanges = function() {
	this.sceneAssistant.controller.stopListening(
	    "accountDialogInputUserName",
	    Mojo.Event.propertyChange,
	    this.enableSaveButton.bindAsEventListener(this)
	);
	
	this.sceneAssistant.controller.stopListening(
	    "accountDialogInputPassword",
	    Mojo.Event.propertyChange,
	    this.enableSaveButton.bindAsEventListener(this)
	);
};

Preferences_AccountDialogAssistant.prototype.saveCredentials = function() {
    if( this.model.username || this.model.password ) {
        PreJoindIn.setSetting('username', this.model.username);
        if( this.model.password != '******' )
            PreJoindIn.setSetting('password', sc.helpers.MD5(this.model.password));
    } else {
        PreJoindIn.setSetting('username', null);
        PreJoindIn.setSetting('password', null);
    }
    PreJoindIn.saveSettings();
    PreJoindIn.reloadInstance();
};

Preferences_AccountDialogAssistant.prototype.saveButtonTap = function() {
    PreJoindIn.getInstance().validateUser({
        uid: this.model.username,
        pass: sc.helpers.MD5(this.model.password ? this.model.password : ''),
        onSuccess: function(data) {
            
            if( data.msg == 'success' ) {
                this.saveCredentials();
                this.closeDialog();
            } else {
                this.sceneAssistant.controller.showAlertDialog({
                    title: $L("Invalid User Credentials"),
                    message: $L("The user credentials you provided were invalid"),
                    choices: [
                        {label: $L("OK"), value: true}
                    ]
                });
            }
            
        }.bind(this),
        onFailure: function(url, xhr, msg) {
            Mojo.Controller.errorDialog("ERROR: " + msg);
        }.bind(this)
    })
    
    this.closeDialog();
};

Preferences_AccountDialogAssistant.prototype.cancelButtonTap = function() {
    this.closeDialog();
};

Preferences_AccountDialogAssistant.prototype.closeDialog = function() {
    //this.callBackFunc();
    this.sceneAssistant.reflectCurrentSettings();
	this.widget.mojo.close();
};