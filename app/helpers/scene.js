var scene_helpers = {}

scene_helpers.addCommonSceneMethods = function(assistant) {
    assistant.initAppMenu = function(opts) {

		var default_items = [
			Mojo.Menu.editItem,
            {label: $L("Settings..."), command: "do-settings"},
            {label: $L("About..."), command: "do-about"}
		];

		if (!opts) {
			opts = {
				'items':default_items
			};
		} else if (!opts.items) {
			opts.items = default_items;
		}
		
		// the initial app/scene commands set into the class's appMenuModel for the beverage:
		this.appMenuAttr  = {
			omitDefaultItems: true
		};
		
		this.appMenuModel = {
			visible: true,
			items: opts.items
		};

		// good to go, set up the almighty Application Menu:
		this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
	};
};