AddFieldPopupBinding.prototype = new PopupBinding;
AddFieldPopupBinding.prototype.constructor = AddFieldPopupBinding;
AddFieldPopupBinding.superclass = PopupBinding.prototype;

function AddFieldPopupBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("AddFieldPopupBinding");
}

/**
* Identifies binding.
*/
AddFieldPopupBinding.prototype.toString = function () {

	return "[AddFieldPopupBinding]";
};
AddFieldPopupBinding.prototype.onBindingRegister = function () {

	AddFieldPopupBinding.superclass.onBindingRegister.call(this);

},

/**
* @overloads {Binding#onBindingRegister}
*/
AddFieldPopupBinding.prototype.onBindingRegister = function () {

	AddFieldPopupBinding.superclass.onBindingRegister.call(this);
	this.addActionListener(MenuItemBinding.ACTION_COMMAND, this);
};
/**
* @overloads {PopupBinding#onBindingAttach}
*/
AddFieldPopupBinding.prototype.onBindingAttach = function () {
	AddFieldPopupBinding.superclass.onBindingAttach.call(this);
},

/**
* @implements {IActionListener}
* @overloads {PopupBinding#handleAction}
* @param {Action} action
*/
AddFieldPopupBinding.prototype.handleAction = function (action) {

	AddFieldPopupBinding.superclass.handleAction.call(this, action);

	switch (action.type) {
		case MenuItemBinding.ACTION_COMMAND:
			var menuitemBinding = action.target;
			var markup = menuitemBinding.getProperty("markup");
			this.bindingWindow.bindingMap.formmarkup.addField(markup);
			break;
	}
};