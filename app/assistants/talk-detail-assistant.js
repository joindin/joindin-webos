function TalkDetailAssistant(talk_data) {
	scene_helpers.addCommonSceneMethods(this);
	this.talk_data = talk_data;
	this.comments_data = null;
}

TalkDetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	$('#talkDetailWrapper').html(
	    Mojo.View.render({
	        object: this.talk_data,
	        template: 'talk-detail/talk-detail-headerTemplate'
	    })
	);
	
	$('#talkDescriptionDrawer').html(
	    Mojo.View.render({
	        object: this.talk_data,
	        template: 'talk-detail/talk-detail-descriptionTemplate'
	    })
	);
	
	/* setup widgets here */
    this.initAppMenu();
	
    this.controller.setupWidget("talkDescriptionDrawer",
	    this.eventTalksDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventTalksDrawerModel = {
	        open: true
	    }
	);
	
    this.controller.setupWidget("talkCommentsDrawer",
	    this.eventTalksDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventTalksDrawerModel = {
	        open: false
	    }
	);
	
	if( this.talk_data.slides_link ) {
    	this.controller.setupWidget('slidesButton',
    	    this.slidesButtonAttributes = {
    	    },
    	    this.slidesButtonModel = {
    	        label: 'Slides',
    	        disabled: false
    	    }
    	);
    	
    	/*if( this.talk_data.slides_link.match(/slideshare\.(net|com)/i) ) {
    	    $('#slidesButton').addClass('slideShare');
    	    
    	    this.slidesButtonModel.label = 'View SlideShare Slides';
    	    
    	    this.controller.modelChanged(this.slidesButtonModel);
    	}*/

    	this.controller.listen(
    	    this.controller.get('slidesButton'),
    	    Mojo.Event.tap,
    	    this.slidesButtonTap.bindAsEventListener(this)
    	);
	}
	else {
	    $('#slides').remove();
	}
	
	this.controller.setupWidget("commentsProgressSpinner",
	    this.commentsProgressSpinnerAttributes = {
	        spinnerSize: 'small'
	    },
	    this.commentsProgressSpinnerModel = {
	        spinning: false
	    }
	);
	
	this.controller.setupWidget("talkCommentsList",
	    this.talkCommentsListAttributes = {
	        itemTemplate: "talk-detail/talkCommentsList-item",
	        emptyTemplate: "talk-detail/talkCommentsList-empty",
	        formatters: {
	            uname: function(value, model) {
	                if( !value )
	                    model.uname = 'anonymous';
	            }
	        }
	    },
	    this.talkCommentsListModel = {
	        items: [],
	        disabled: true
	    }
	);
	
	/* add event handlers to listen to events from widgets */
   	this.controller.listen(
	    this.controller.get('talkDescriptionDivider'),
	    Mojo.Event.tap,
	    this.toggleDrawer.bindAsEventListener(this, 'talkDescriptionDivider', 'talkDescriptionDrawer')
	);
	
   	this.controller.listen(
	    this.controller.get('talkCommentsDivider'),
	    Mojo.Event.tap,
	    this.toggleCommentsDrawer.bindAsEventListener(this, 'talkCommentsDivider', 'talkCommentsDrawer')
	);
};

TalkDetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

TalkDetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TalkDetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

TalkDetailAssistant.prototype.slidesButtonTap = function(event) {
    var url = this.talk_data.slides_link;
    
    if( this.talk_data.slides_link.match(/slideshare\.(net|com)/i) ) {
        url = url.replace(/slideshare\.(net|com)(\/|\\)/i, "slideshare.net/mobile/");
    }
    
    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            target: url
        },
        onFailure: function() {
            Mojo.Controller.errorDialog("Failed to launch browser...");
        }
    });
};

TalkDetailAssistant.prototype.toggleDrawer = function(event, dividerId, drawerId) {
    var drawer = this.controller.get(drawerId);
    drawer.mojo.setOpenState(!drawer.mojo.getOpenState());
    
    if( drawer.mojo.getOpenState() == true ) {
        this.controller.get(dividerId + 'Arrow')
            .removeClassName('palm-arrow-closed')
            .addClassName('palm-arrow-expanded');
    }
    else {
        this.controller.get(dividerId + 'Arrow')
            .removeClassName('palm-arrow-expanded')
            .addClassName('palm-arrow-closed');
    }
};

TalkDetailAssistant.prototype.toggleCommentsDrawer = function(event, dividerId, drawerId) {
    var drawer = this.controller.get(drawerId);
    
    if( drawer.mojo.getOpenState() == false && !this.comments_data ) {
        this.refreshComments();
    }
    
    this.toggleDrawer(event, dividerId, drawerId);
};

TalkDetailAssistant.prototype.refreshComments = function() {
    this.showCommentsProgressSpinner();
    
    PreJoindIn.getInstance().getTalkComments({
        talk_id: this.talk_data.ID,
        onSuccess: this.fetchTalkCommentsSuccess.bind(this),
        onFailure: this.fetchTalkCommentsFailure.bind(this)
    });
};

TalkDetailAssistant.prototype.fetchTalkCommentsSuccess = function(data) {
    this.hideCommentsProgressSpinner();
    
    this.talkCommentsListModel.items = [];
    
    if( data.msg ) {
        Mojo.Controller.errorDialog(data.msg);
        return;
    }
    
    var that = this;
    data.each(function(comment) {
        that.talkCommentsListModel.items.push(comment);
    });
    
    this.comments_data = this.talkCommentsListModel.items;
    
    this.controller.modelChanged(this.talkCommentsListModel);
};

TalkDetailAssistant.prototype.fetchTalkCommentsFailure = function(xhr, msg, exec) {
    this.hideCommentsProgressSpinner();
    
    Mojo.Controller.errorDialog(msg);
};



TalkDetailAssistant.prototype.showCommentsProgressSpinner = function() {
    this.commentsProgressSpinnerModel.spinning = true;
    this.controller.modelChanged(this.commentsProgressSpinnerModel);
    $('#commentsProgressSpinnerWrapper').show();
};

TalkDetailAssistant.prototype.hideCommentsProgressSpinner = function () {
    this.commentsProgressSpinnerModel.spinning = false;
    this.controller.modelChanged(this.commentsProgressSpinnerModel);
    $('#commentsProgressSpinnerWrapper').hide();
};