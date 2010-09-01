function EventDetailAssistant(event_data) {
	   this.event_data = event_data;
}

EventDetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.setupWidget("eventTalksDrawer",
	    this.eventTalksDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventTalksDrawerModel = {
	        open: false
	    }
	);
	
	$('#eventDetailHeader').html(
	    Mojo.View.render({
	        object: this.event_data,
	        template: 'event-detail/event-detail-headerTemplate'
	    })
	);
	
	$('#eventDetailDescription').html(
	    Mojo.View.render({
	        object: this.event_data,
	        template: 'event-detail/event-detail-descriptionTemplate'
	    })
	);
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen(
	    this.controller.get('eventTalksDivider'),
	    Mojo.Event.tap,
	    this.toggleEventTalksDrawer.bindAsEventListener(this)
	);
};

EventDetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

EventDetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

EventDetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

EventDetailAssistant.prototype.toggleEventTalksDrawer = function() {
    var eventTalksDrawer = this.controller.get('eventTalksDrawer');
    eventTalksDrawer.mojo.setOpenState(!eventTalksDrawer.mojo.getOpenState());
    
    if( eventTalksDrawer.mojo.getOpenState() == true ) {
        this.controller.get('eventTalksDividerArrow')
            .removeClassName('palm-arrow-closed')
            .addClassName('palm-arrow-expanded');
    }
    else {
        this.controller.get('eventTalksDividerArrow')
            .removeClassName('palm-arrow-expanded')
            .addClassName('palm-arrow-closed');
    }
};
