function MainAssistant() {
	scene_helpers.addCommonSceneMethods(this);
	
    this.currentFilter = null;
    this.oldListItems = null;
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
    this.initAppMenu();
    
	this.controller.setupWidget("progressSpinner",
	    this.spinnerAttributes = {
	        spinnerSize: 'large'
	    },
	    this.spinnerModel = {
	        spinning: false
	    }
	);
	
	this.controller.setupWidget("eventList",
	    this.eventListAttributes = {
	        itemTemplate: "main/eventList-item",
	        emptyTemplate: "main/eventList-empty",
	    },
	    this.eventListModel = {items: []}
	);
	
	this.controller.setupWidget("eventFilter",
	    this.eventFilterAttributes = {
	        delay: 500
	    },
	    this.eventFilterModel = {
	        disabled: false
	    }
	);
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(document, 'settingsChanged', function() { this.updateEventList(this.currentFilter, true); }.bind(this));
	
	this.controller.listen("eventList", Mojo.Event.listTap, this.viewEventDetails.bindAsEventListener(this));
	this.controller.listen("eventFilter", Mojo.Event.filter, this.filterEventList.bindAsEventListener(this));
	
	this.controller.listen("eventTypeButton", Mojo.Event.tap, this.setEventType.bindAsEventListener(this));
	
	/* load initial data */
	this.updateEventList('hot', true);
};

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

MainAssistant.prototype.setEventTypePopupChoose = function(command) {
    if( command ) {
        this.updateEventList(command);
        $('#eventTypeButton .label').html(command);
    }
};

MainAssistant.prototype.setEventType = function(event) {
    this.controller.popupSubmenu({
        onChoose: this.setEventTypePopupChoose.bind(this),
        placeNear: this.controller.get('eventTypeButton'),
        popupClass: 'eventTypePopup',
        items: [
            {icon: '', command: 'past', label: 'Past', chosen: this.currentFilter == 'past' ? true : false},
            {icon: '', command: 'hot', label: 'Hot', chosen: this.currentFilter == 'hot' ? true : false},
            {icon: '', command: 'upcoming', label: 'Upcoming', chosen: this.currentFilter == 'upcoming' ? true : false}
        ]
    });
};

MainAssistant.prototype.updateEventList = function(type, force) {
    if( this.currentFilter == type && !force )
        return;
    
    this.showSpinner();

    this.setCurrentFilter(type);
    
    PreJoindIn.getInstance().getEventListing({
        type: type,
        onSuccess: function(data) {
            this.fetchEventListSuccess(data, type);
        }.bind(this),
        onFailure: this.fetchEventListFailure.bind(this)
    });
};

MainAssistant.prototype.fetchEventListSuccess = function(data, type) {
    this.eventListModel.items = [];
    
    var that = this;
    data.each(function(event) {
        if( parseInt(event.event_start) )
            var event_start = new Date(parseInt(event.event_start) * 1000);
            
        if( parseInt(event.event_end) ) {
            var event_end = new Date(parseInt(event.event_end) * 1000);
        }
        
        var event_range = '';
        
        event_range += event_start.format('mmmm dS');
        
        if( event_start.format('mmmm dS, yyyy') != event_end.format('mmmm dS, yyyy') ) {
            if( event_start.getYear() != event_end.getYear() )
                event_range += event_start.format(', yyyy');
            
            event_range += ' - ';
            if( event_start.format('mmmm yyyy') != event_end.format('mmmm yyyy') ) {
                event_range += event_end.format('mmmm dS');
            }
            else if( event_start.getDate() != event_end.getDate() ) {
                event_range += event_end.format('dS');
            }
        }    
            
        event_range += event_end.format(', yyyy');
        
        event.formatted = {
            event_start: event_start.format('mmmm dS, yyyy'),
            event_end: event_end.format('mmmm dS, yyyy'),
            event_range: event_range
        };
        
        that.eventListModel.items.push(event);
    });
    
    this.controller.modelChanged(this.eventListModel);
    this.controller.getSceneScroller().mojo.revealTop();
    
    this.hideSpinner();
};

MainAssistant.prototype.fetchEventListFailure = function(xhr, msg, exec) {
    this.hideSpinner();
    Mojo.Controller.errorDialog(msg);
};

MainAssistant.prototype.setCurrentFilter = function(type) {
    this.currentFilter = type;
    $('#eventTypeButton .label').html(type);
};

MainAssistant.prototype.viewEventDetails = function(event) {
    var item = this.eventListModel.items[event.index];
    this.controller.stageController.pushScene({
        name: 'event-detail', 
        templateModel: item
    }, item, this);
};

MainAssistant.prototype.showSpinner = function() {
    $('#progressScrim').show();
    this.spinnerModel.spinning = true;
    this.controller.modelChanged(this.spinnerModel);
};

MainAssistant.prototype.hideSpinner = function() {
    $('#progressScrim').hide();
    this.spinnerModel.spinning = false;
    this.controller.modelChanged(this.spinnerModel);
};

MainAssistant.prototype.filterEventList = function(event) {
    if( event.filterString ) {
        if( !this.oldListItems )
            this.oldListItems = this.eventListModel.items;
        
        var newItems = [];
        
        var filterRe = new RegExp(".*" + event.filterString.replace(/([\*\.\+\?\=\^\$\!\{\}\[\]\\])/gi, "\\$1").replace(/\s+/gi, ".*") + ".*", "i");
        
        Mojo.Log.info(filterRe, event.filterString);
        
        this.oldListItems.each(function(_event) {
            if( _event.event_name.match(filterRe) )
                newItems.push(_event);
        });
        
        this.eventListModel.items = newItems;
    }
    else if( this.oldListItems ) {
        this.eventListModel.items = this.oldListItems;
        this.oldListModel = null;
    }
    
    this.controller.modelChanged(this.eventListModel);
    
    this.controller.get('eventFilter').mojo.setCount(this.eventListModel.items.length);
    
    return true;
};