function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
    this.currentFilter = null;
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* COMMAND MENU */
	this.controller.setupWidget( Mojo.Menu.commandMenu,
	    this.commandMenuAttributes = {},
	    this.commandMenuModel = {items: [
	        {visable: false},
	        {
	            items: [
	                {icon: '', command: 'filter-past', label: 'Past'},
    	            {icon: '', command: 'filter-hot', label: 'Hot'},
	                {icon: '', command: 'filter-upcoming', label: 'Upcoming'}
	            ],
	            toggleCmd: 'filter-hot'
	        },
	        {visable: false}
	    ]}
	);
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.setupWidget("eventList",
	    this.eventListAttributes = {
	        itemTemplate: "main/eventList-item",
	        emptyTemplate: "main/eventList-empty",
	    },
	    this.eventListModel = {items: []}
	);
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen("eventList", Mojo.Event.listTap, this.viewEventDetails.bindAsEventListener(this));
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

MainAssistant.prototype.handleCommand = function(event) {
    if( event.type == Mojo.Event.command ) {
        var matches = event.command.match(/^filter-(.*)$/i)
        
        if( matches.length == 2 )
            this.updateEventList(matches[1]);
    }
};

MainAssistant.prototype.updateEventList = function(type, force) {
    if( this.currentFilter == type && !force )
        return;
    
    PreJoindIn.getInstance().getEventListing({
        type: type,
        
        onSuccess: function(data) {
            Mojo.Log.info("Success!");
            
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
                if( event_start.getYear() != event_end.getYear() )
                    event_range += event_start.format(', yyyy');
                
                if( event_start.format('mmmm dS, yyyy') != event_end.format('mmmm dS, yyyy') ) {
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
            
            this.currentFilter = type;
            this.controller.modelChanged(this.eventListModel);
            this.controller.getSceneScroller().mojo.revealTop();
        }.bind(this),
        
        onFailure: function(xhr, msg, exec) {
            this.controller.errorDialog(msg);
        }.bind(this)
    });
};

MainAssistant.prototype.viewEventDetails = function(event) {
    var item = this.eventListModel.items[event.index];
    this.controller.stageController.pushScene('event-detail', item);
};