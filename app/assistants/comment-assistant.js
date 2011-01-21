function CommentAssistant(type, data) {
    scene_helpers.addCommonSceneMethods(this);
    
    this.type = type;
    this.data = data;
}

CommentAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.model = {
	    comment: null
	};
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
    this.initAppMenu();
    
    this.controller.setupWidget("commentTextField",
        this.commentTextFieldAttributes = {
            hintText: $L("Comment..."),
            multiline: true,
            enterSubmits: false,
            autoFocus: true,
            modifierState: Mojo.Widget.shiftSingle,
            modelProperty: 'comment'
        },
        this.model
    );
    
    this.controller.setupWidget("saveButton",
        this.saveButtonAttributes = {
        },
        this.saveButtonModel = {
            type: Mojo.Widget.activityButton,
            label: "Save",
            disabled: false
        }
    );
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen(
	    "saveButton",
	    Mojo.Event.tap,
	    this.saveComment.bindAsEventListener(this)
	);
};

CommentAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

CommentAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CommentAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

CommentAssistant.prototype.saveComment = function(event) {
    this.controller.get('saveButton').mojo.activate();
    
    if( this.type == 'event' ) {
        Mojo.Log.info("Saving event comment");
        PreJoindIn.getInstance().addEventComment({
            event_id: this.data.ID,
            comment: this.model.comment,
            onSuccess: this.saveCommentSuccess.bind(this),
            onFailure: this.saveCommentFailure.bind(this)
        });
    } else {
        Mojo.Log.info("Saving talk comment");
        PreJoindIn.getInstance().addTalkComment({
            talk_id: this.data.ID,
            //rating: null,
            //private: false,
            comment: this.model.comment,
            onSuccess: this.saveCommentSuccess.bind(this),
            onFailure: this.saveCommentFailure.bind(this)
        });
    }
};

CommentAssistant.prototype.saveCommentSuccess = function(data) {
    this.controller.get('saveButton').mojo.deactivate();
    
    Mojo.Log.info("SAVE COMMENT: ", data.msg);
    
    this.controller.stageController.popScene('reloadComments');
};

CommentAssistant.prototype.saveCommentFailure = function(data) {
    this.controller.get('saveButton').mojo.deactivate();
    
    Mojo.Controller.errorDialog(data.msg);
};