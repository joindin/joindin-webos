function EventDetailAssistant(event_data) {
    scene_helpers.addCommonSceneMethods(this);
    
    this.event_data = event_data;
}

EventDetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
    
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	$('#eventDetailHeader').html(
	    Mojo.View.render({
	        object: this.event_data,
	        template: 'event-detail/event-detail-headerTemplate'
	    })
	);
	
	$('#eventDescriptionDrawer').html(
	    Mojo.View.render({
	        object: this.event_data,
	        template: 'event-detail/event-detail-descriptionTemplate',
	        formatters: {
	            event_desc: function(value, model) {
	                if( value )
	                    model.event_desc = Mojo.Format.runTextIndexer(value);
	            }
	        }
	    })
	);
	
	/* setup widgets here */
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.commandMenuAttributes = {
            
        },
        this.commandMenuModel = {
            visible: true,
            items: [
                { command: null },
                { label: (this.event_data.user_attending ? "Attending!" : "Not Attending"), command: "do-toggle-attend" }
            ]
        }
    );
    
    this.initAppMenu();
    
	this.controller.setupWidget("eventTalksDrawer",
	    this.eventTalksDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventTalksDrawerModel = {
	        open: true
	    }
	);
	
    this.controller.setupWidget("eventDescriptionDrawer",
	    this.eventTalksDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventTalksDrawerModel = {
	        open: true
	    }
	);
	
	this.controller.setupWidget("eventCommentsDrawer",
	    this.eventCommentsDrawerAttributes = {
	        modelProperty: 'open',
	        unstyled: true
	    },
	    this.eventCommentsDrawerModel = {
	        open: false
	    }
	);
	
	this.controller.setupWidget("talksProgressSpinner",
	    this.talksProgressSpinnerAttributes = {
	        spinnerSize: 'small'
	    },
	    this.talksProgressSpinnerModel = {
	        spinning: false
	    }
	);
	
	this.controller.setupWidget("commentsProgressSpinner",
	    this.eventCommentsProgressSpinnerAttributes = {
	        spinnerSize: 'small'
	    },
	    this.eventCommentsProgressSpinnerModel = {
	        spinning: false
	    }
	);
	
	this.controller.setupWidget("eventTalksList",
	    this.eventTalksListAttributes = {
	        itemTemplate: "event-detail/eventTalksList-item",
	        emptyTemplate: "event-detail/eventTalksList-empty",
	        formatters: {
	            tcid: function(value, model) {
	                if( value )
	                    model.tcid = value.replace(/[^\w]+/i, '-').toLowerCase();
	                else
	                    model.tcid = "none";
	            }.bind(this)
	        }
	    },
	    this.eventTalksListModel = {items: []}
	);
	
 	/*this.controller.setupWidget("commentButton",
	    this.commentButtonAttributes = {
	    },
	    this.commentButtonModel = {
	        label: 'Add Comment',
	        disabled: false
	    }
	);*/
	
	this.controller.setupWidget("eventCommentsList",
	    this.eventCommentsListAttributes = {
	        itemTemplate: "event-detail/eventCommentsList-item",
	        emptyTemplate: "event-detail/eventCommentsList-empty",
	        formatters: {
	            cname: function(value, model) {
	                if( !value )
	                    model.uname = 'anonymous';
	            }
	        }
	    },
	    this.eventCommentsListModel = {
	        items: [],
	        disabled: true
	    }
	);
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen(
	    "eventTalksDivider",
	    Mojo.Event.tap,
	    this.toggleDrawer.bindAsEventListener(this, 'eventTalksDivider', 'eventTalksDrawer')
	);
	
   	this.controller.listen(
        "eventDescriptionDivider",
	    Mojo.Event.tap,
	    this.toggleDrawer.bindAsEventListener(this, 'eventDescriptionDivider', 'eventDescriptionDrawer')
	);

   	this.controller.listen(
	    "eventCommentsDivider",
	    Mojo.Event.tap,
	    this.toggleCommentsDrawer.bindAsEventListener(this, 'eventCommentsDivider', 'eventCommentsDrawer')
	);
    
    this.controller.listen(
        "eventTalksList", 
        Mojo.Event.listTap, 
        this.viewTalkDetails.bindAsEventListener(this)
    );
    
    /*this.controller.listen(
        "commentButton",
        Mojo.Event.tap,
        this.addComment.bindAsEventListener(this)
    );*/
    
    this.refreshTalks();
};

EventDetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
    if(!PreJoindIn.getSetting('username')) {
        this.commandMenuModel.visible = false;
	    this.commentButtonModel.disabled = true;
    } else {
        this.commandMenuModel.visible = true;
	    this.commentButtonModel.disabled = false;
    }
    
    if( this.event_data.allow_comments != 1 ) {
        if( this.event_data.num_comments == 0 ) {
            $('#comments').hide();
        } else {
            $('#commentButton').hide();
        }
    } else {
        $('#commentButton').show();
    }
    
    this.controller.modelChanged(this.commandMenuModel);
    this.controller.modelChanged(this.commentButtonModel);
};

EventDetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

EventDetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


EventDetailAssistant.prototype.handleCommand = function(event) {
    if( event.type == Mojo.Event.command ){
        switch( event.command ) {
            case 'do-toggle-attend':
                if( this.event_data.user_attending ) {
                    this.event_data.user_attending = 0;
                } else {
                    this.event_data.user_attending = 1;
                }
                
                PreJoindIn.getInstance().attendEvent({
                    eid: this.event_data.ID,
                    onSuccess: this.attendEventSuccess.bind(this),
                    onFailure: this.attendEventFailure.bind(this)
                });
            break;
        }
    }
};

EventDetailAssistant.prototype.addComment = function(event) {
    var templateModel = {
        title: this.event_data.event_name,
        subtitle: this.event_data.event_loc + "<br />" + this.event_data.formatted.event_range
    };

    this.controller.stageController.pushScene({
        name: 'comment', 
        templateModel: templateModel,
        transition: Mojo.Transition.crossFade
    }, 'event', this.event_data);
};

/**
 * Generic helper function to toggle a drawer associated with a divider
 */
EventDetailAssistant.prototype.toggleDrawer = function(event, dividerId, drawerId) {
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

/**
 * Custom helper function to load comments the first time the comments drawer is opened
 */
EventDetailAssistant.prototype.toggleCommentsDrawer = function(event, dividerId, drawerId) {
    var drawer = this.controller.get(drawerId);
    
    if( drawer.mojo.getOpenState() == false && !this.comments_data ) {
        this.refreshComments();
    }
    
    this.toggleDrawer(event, dividerId, drawerId);
};

EventDetailAssistant.prototype.showTalksProgressSpinner = function() {
    this.talksProgressSpinnerModel.spinning = true;
    this.controller.modelChanged(this.talksProgressSpinnerModel);
    $('#talksProgressSpinnerWrapper').fadeIn('fast', function() { $(this).show(); });
};

EventDetailAssistant.prototype.hideTalksProgressSpinner = function () {
    this.talksProgressSpinnerModel.spinning = false;
    this.controller.modelChanged(this.talksProgressSpinnerModel);
    $('#talksProgressSpinnerWrapper').fadeOut('fast', function() { $(this).hide(); });
};

EventDetailAssistant.prototype.showCommentsProgressSpinner = function() {
    this.eventCommentsProgressSpinnerModel.spinning = true;
    this.controller.modelChanged(this.eventCommentsProgressSpinnerModel);
    $('#commentsProgressSpinnerWrapper').fadeIn('fast', function() { $(this).show(); });
};

EventDetailAssistant.prototype.hideCommentsProgressSpinner = function () {
    this.eventCommentsProgressSpinnerModel.spinning = false;
    this.controller.modelChanged(this.eventCommentsProgressSpinnerModel);
    $('#commentsProgressSpinnerWrapper').fadeOut('fast', function() { $(this).hide(); });
};

EventDetailAssistant.prototype.refreshTalks = function() {
    this.showTalksProgressSpinner();
    
    PreJoindIn.getInstance().getEventTalks({
        event_id: this.event_data.ID,
        onSuccess: this.fetchEventTalksSuccess.bind(this),
        onFailure: this.fetchEventTalksFailure.bind(this)
    });
};

EventDetailAssistant.prototype.attendEventSuccess = function(data) {
    //this.hideTalksProgressSpinner();
    
    if(this.event_data.user_attending)
        this.commandMenuModel.items[1].label = "Attending!";
    else
        this.commandMenuModel.items[1].label = "Not Attending";
    
    this.controller.modelChanged(this.commandMenuModel);
};

EventDetailAssistant.prototype.attendEventFailure = function(xhr, msg, exec) {
    //this.hideTalksProgressSpinner();

    Mojo.Controller.errorDialog(msg);
};

EventDetailAssistant.prototype.fetchEventTalksSuccess = function(data) {
    this.hideTalksProgressSpinner();
    
    this.eventTalksListModel.items = [];
    
    if( data.msg ) {
        Mojo.Controller.errorDialog(data.msg);
        return;
    }
    
    var that = this;
    data.each(function(talk) {
        that.eventTalksListModel.items.push(talk);
    });
    
    this.controller.modelChanged(this.eventTalksListModel);
};

EventDetailAssistant.prototype.fetchEventTalksFailure = function(xhr, msg, exec) {
    this.hideTalksProgressSpinner();
    
    Mojo.Controller.errorDialog(msg);
};

EventDetailAssistant.prototype.refreshComments = function() {
    this.showCommentsProgressSpinner();
    
    PreJoindIn.getInstance().getEventComments({
        event_id: this.event_data.ID,
        onSuccess: this.fetchEventCommentsSuccess.bind(this),
        onFailure: this.fetchEventCommentsFailure.bind(this)
    });
};

EventDetailAssistant.prototype.fetchEventCommentsSuccess = function(data) {
    this.hideCommentsProgressSpinner();
    
    this.eventCommentsListModel.items = [];
    
    if( data.msg ) {
        Mojo.Controller.errorDialog(data.msg);
        return;
    }
    
    var that = this;
    data.each(function(comment) {
        that.eventCommentsListModel.items.push(comment);
    });
    
    this.comments_data = this.eventCommentsListModel.items;
    
    this.controller.modelChanged(this.eventCommentsListModel);
};

EventDetailAssistant.prototype.fetchEventCommentsFailure = function(xhr, msg, exec) {
    this.hideCommentsProgressSpinner();
    
    Mojo.Controller.errorDialog(msg);
};

EventDetailAssistant.prototype.viewTalkDetails = function(talk) {
    var item = this.eventTalksListModel.items[talk.index];
    this.controller.stageController.pushScene({
        name: 'talk-detail', 
        templateModel: item
    }, item);
};