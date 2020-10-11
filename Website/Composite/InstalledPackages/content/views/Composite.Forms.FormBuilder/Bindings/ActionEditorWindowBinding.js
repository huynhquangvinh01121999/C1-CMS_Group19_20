DataHandlerWindowBinding.prototype = new PostbackWindowBinding;
DataHandlerWindowBinding.prototype.constructor = DataHandlerWindowBinding;
DataHandlerWindowBinding.superclass = PostbackWindowBinding.prototype;

/**
* This WindowBinding implements the DataBinding interface.
* @implements {IData}
* @class
*/
function DataHandlerWindowBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("DataHandlerWindowBinding");

	/**
	* @implements {IFocusable}
	* @type {boolean}
	*/
	this.isFocusable = false;

	/**
	* @type {boolean}
	*/
	this.isDirty = false;


	/**
	* @type {string}
	*/
	this.value = false;

	/*
	* Returnable.
	*/
	return this;
}

/**
* Identifies binding.
*/
DataHandlerWindowBinding.prototype.toString = function () {

	return "[DataHandlerWindowBinding]";
};

/**
* @overloads {WindowBinding#onBindingRegister}
* @overloads {DataBinding#onBindingRegister}
*/
DataHandlerWindowBinding.prototype.onBindingRegister = function () {

	DataHandlerWindowBinding.superclass.onBindingRegister.call(this);
	DataBinding.prototype.onBindingRegister.call(this);

	this.addActionListener(WindowBinding.ACTION_LOADED);
};

/**
* @overloads {DataBinding#onBindingAttach}
*/
DataHandlerWindowBinding.prototype.onBindingAttach = function () {

	DataHandlerWindowBinding.superclass.onBindingAttach.call(this);
	this.addActionListener(Binding.ACTION_DIRTY);

	this.value = this.getProperty("value");
	var input = DOMUtil.createElementNS(Constants.NS_XHTML, "input", this.bindingDocument);
	input.type = "hidden";
	input.id = this.getName();
	input.name = this.getName();
	input.value = this.value;
	this.bindingElement.appendChild(input);
	this.shadowTree.input = input;
};

/**
* @overloads {WindowBinding#_onPageInitialize}
* @param {PageBinding} binding
*/
DataHandlerWindowBinding.prototype._onPageInitialize = function (binding) {

	DataHandlerWindowBinding.superclass._onPageInitialize.call(this, binding);
	var self = this;
	this.setPostBackHandler({
		onSuccess: function (pagebinding) {
			self.value = pagebinding.bindingDocument.getElementById("hdnDataHandlers").value;
		},
		onFailure: function () {
		}
	});
	this.doPostBack("Init", this.getValue());
};

///**
//* Save binding
//* @param {ComponentItemBinding} binding
//* @param {IResponseHanler} handler
//*/
//DataHandlerWindowBinding.prototype.postback = function(responseHandler) {

//	var pageBinding = this.getPageBinding();
//	if (pageBinding.validateAllDataBindings()) {
//		var target = pageBinding.bindingDocument.documentElement;
//		var self = this;
//		var handler = {
//			handleEvent: function(e) {
//				if (target == e.target) {
//					DOMEvents.removeEventListener(target, UpdateManager.EVENT_AFTERUPDATE, handler);
//					self.value = pageBinding.bindingDocument.getElementById("hdnDataHandlers").value;
//					if (responseHandler) {
//						responseHandler(pageBinding);
//					}
//				}
//			}
//		};
//		DOMEvents.addEventListener(
//			target,
//			UpdateManager.EVENT_AFTERUPDATE,
//			handler
//		);
//		pageBinding.dispatchAction(PageBinding.ACTION_DOPOSTBACK);
//		return true;
//	}
//	return false;
//};


/**
* @param {String} name
*/
DataHandlerWindowBinding.prototype.setName = DataBinding.prototype.setName;



// IMPLEMENT IDATA ...........................................................

/**
* Validate.
* @implements {IData}
* @return {boolean}
*/
DataHandlerWindowBinding.prototype.validate = function () {

	return this._pageBinding.validateAllDataBindings();
};

/**
* @overloads {WindowBinding#handleAction}
* @implements {IActionListener}
* @param {Action} action
*/
DataHandlerWindowBinding.prototype.handleAction = function (action) {

	DataHandlerWindowBinding.superclass.handleAction.call(this, action);

	/*
	* Collect dirty actions and assign them to myself.
	*/
	switch (action.type) {
		case Binding.ACTION_DIRTY:
			if (action.target != this) {
				if (!this.isDirty) {
					this.dirty();
				}
				action.consume();
			}
			break;
	}
};

/**
* @see {PageBinding#_setupDotNet}
* @overloads {DataBinding#manifest}
* @implements {IData}
* @return {DataHandlerWindowBinding}
*/
DataHandlerWindowBinding.prototype.manifest = function() {
	this.shadowTree.input.value = encodeURIComponent(this.getValue());
};

/**
* Pollute dirty flag. Note that the local DataManager is NOT informed about this
* since the dirty event should not count as a real update to this.contextDocument.
* This way, we know how to save only frames that were really updated...
* @implements {IData}
*/
DataHandlerWindowBinding.prototype.dirty = function() {

	if (!this.isDirty) {
		this.isDirty = true;
		this.dispatchAction(Binding.ACTION_DIRTY);
	}
};

/**
* Clean dirty flag.
* @implements {IData}
*/
DataHandlerWindowBinding.prototype.clean = function() {

	this._pageBinding.cleanAllDataBindings();
	DataBinding.prototype.clean.call(this);
};

/**
* Focus.
* @implements {IFocusable}
*/
DataHandlerWindowBinding.prototype.focus = function () { };

/**
* Blur.
* @implements {IFocusable}
*/
DataHandlerWindowBinding.prototype.blur = function () { };


/**
* Get name.
* @return {string}
*/
DataHandlerWindowBinding.prototype.getName = function () {
	return this.getProperty("name");
};

/**
* Get value. This is intended for serversice processing.
* @implements {IData}
* @return {string}
*/
DataHandlerWindowBinding.prototype.getValue = function () { return this.value; };

/**
* Set value.
* @implements {IData}
* @param {string} value
*/
DataHandlerWindowBinding.prototype.setValue = function () { };

/**
* Get result. This is intended for clientside processing.
* @implements {IData}
* @return {object}
*/
DataHandlerWindowBinding.prototype.getResult = function () {

	return null;
};

/**
* Set result.
* @implements {IData}
* @param {object} result
*/
DataHandlerWindowBinding.prototype.setResult = function () { };