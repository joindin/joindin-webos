function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    PreJoindIn.loadSettings();
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