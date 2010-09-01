PreJoindIn = {
    _spazJoindIn: null,
    
    getInstance: function() {
        if( !PreJoindIn._spazJoindIn )
            PreJoindIn.reloadInstance();
        
        return PreJoindIn._spazJoindIn;
    },
    
    reloadInstance: function() {
        PreJoindIn._spazJoindIn = new SpazJoindIn({});
    }
}