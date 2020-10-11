FormBuilderPageBinding.prototype = new ResponsePageBinding;
FormBuilderPageBinding.prototype.constructor = FormBuilderPageBinding;
FormBuilderPageBinding.superclass = ResponsePageBinding.prototype;

/**
* @class
*/
function FormBuilderPageBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("FormBuilderPageBinding");
}

/**
* Identifies binding.
*/
FormBuilderPageBinding.prototype.toString = function () {

	return "[FormBuilderPageBinding]";
};

/**
* @overloads {Binding#onBindingInitialize}.
*/
FormBuilderPageBinding.prototype.onBindingInitialize = function () {

	FormBuilderPageBinding.superclass.onBindingInitialize.call(this);
};



/**
* @overloads {DialogPageBinding#handleAction}
* @param {Action} action
*/
FormBuilderPageBinding.prototype.handleAction = function (action) {

	if (action.type == PageBinding.ACTION_DOPOSTBACK) {
		if (this.validateAllDataBindings(true)) {
			//TODO make queue
			var self = this;
			this.bindingWindow.bindingMap.formmarkup.release(
				function () {
					self.bindingWindow.bindingMap.datahanldereditor.doPostBackHandler({
						onSuccess: function () {
							FormBuilderPageBinding.superclass.handleAction.call(self,
								action);
						}
					});
				});
		}
		return;
	}
	FormBuilderPageBinding.superclass.handleAction.call(this, action);
};
