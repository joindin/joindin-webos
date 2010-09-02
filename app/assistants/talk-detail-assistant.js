function TalkDetailAssistant(talk_data) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.talk_data = talk_data;
}

TalkDetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
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
	
	/* add event handlers to listen to events from widgets */
   	this.controller.listen(
	    this.controller.get('talkDescriptionDivider'),
	    Mojo.Event.tap,
	    this.toggleDrawer.bindAsEventListener(this, 'talkDescriptionDivider', 'talkDescriptionDrawer')
	);
	
   	this.controller.listen(
	    this.controller.get('talkCommentsDivider'),
	    Mojo.Event.tap,
	    this.toggleDrawer.bindAsEventListener(this, 'talkCommentsDivider', 'talkCommentsDrawer')
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
    var eventTalksDrawer = this.controller.get(drawerId);
    eventTalksDrawer.mojo.setOpenState(!eventTalksDrawer.mojo.getOpenState());
    
    if( eventTalksDrawer.mojo.getOpenState() == true ) {
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
