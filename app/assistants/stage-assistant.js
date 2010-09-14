function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    PreJoindIn.loadSettingsDb(
        this.settingsLoaded.bind(this),
        this.settingsFailedToLoad.bind(this)
    );
};

StageAssistant.prototype.settingsLoaded = function(event) {
    Mojo.Log.info("Settings fully loaded, time to push the first scene");
    
    this.controller.setWindowOrientation("free");
	this.controller.pushScene("main");
};

StageAssistant.prototype.settingsFailedToLoad = function(event) {
    Mojo.Log.error("FAILED TO LOAD SETTINGS!");
    
    this.controller.setWindowOrientation("free");
	this.controller.pushScene("main");
};

StageAssistant.prototype.handleCommand = function(event) {
    var currentScene = this.controller.activeScene();
    if( event.type == Mojo.Event.command ){
        switch( event.command ) {
            case 'do-about':
                
                Mojo.Controller.stageController.pushAppSupportInfoScene();
                
                break;
            case 'do-preferences':
                
                this.controller.pushScene('preferences');
                
                break;
            
        }
    }
};