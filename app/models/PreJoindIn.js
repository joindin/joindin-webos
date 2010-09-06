PreJoindIn = {
    _spazJoindIn: null,
    
    getInstance: function() {
        if( !PreJoindIn._spazJoindIn )
            PreJoindIn.reloadInstance();
        
        return PreJoindIn._spazJoindIn;
    },
    
    reloadInstance: function() {
        PreJoindIn._spazJoindIn = new SpazJoindIn({});
    },
    
    appMenuAttributes: {
        omitDefaultItems: true
    },
    
    appMenuModel: {
        visible: true,
        items: [
            Mojo.Menu.editItem,
            {label: "Settings...", command: "do-settings"},
            {label: "About...", command: "do-about"}
        ]
    }
}