PostbackWindowBinding.prototype = new WindowBinding;
PostbackWindowBinding.prototype.constructor = PostbackWindowBinding;
PostbackWindowBinding.superclass = WindowBinding.prototype;


/**
* This WindowBinding implements the DataBinding interface.
* @implements {IData}
* @class
*/
function PostbackWindowBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("PostbackWindowBinding");

	/**
	* @type {Handler}
	*/
	this.postbackHandler = null;

	/**
	* @type {Handler}
	*/
	this.singlePostbackHandler = null;

	/**
	* Is autopostback?
	* @type {boolean}
	*/
	this._isAutoPost = false;

	/**

	* @type {boolean}
	*/
	this.isSuccessPostback = false;

	/*
	* Returnable.
	*/
	return this;
}

/**
* Identifies binding.
*/
PostbackWindowBinding.prototype.toString = function () {

	return "[PostbackWindowBinding]";
};

/**
* @overloads {WindowBinding#onBindingRegister}
*/
PostbackWindowBinding.prototype.onBindingRegister = function () {

	PostbackWindowBinding.superclass.onBindingRegister.call(this);
	this.addActionListener(PageBinding.ACTION_UPDATED);
};

/**
* @overloads {DataBinding#onBindingAttach}
*/
PostbackWindowBinding.prototype.onBindingAttach = function () {

	PostbackWindowBinding.superclass.onBindingAttach.call(this);
	this._isAutoPost = this.getProperty("autopost") == true;
};

PostbackWindowBinding.prototype.enableAutoPost = function () {
	this.getPageBinding().getDescendantBindingsByType(DataInputBinding).each(
		function (inputBinding) {
			inputBinding._isAutoPost = true;
		}
	);

	this.getPageBinding().getDescendantBindingsByType(CheckBoxBinding).each(
		function (checkboxBinding) {
			checkboxBinding.oncommand = function () {
				this.dispatchAction(PageBinding.ACTION_DOPOSTBACK);
			};
		}
	);
};

PostbackWindowBinding.prototype.setPostBackHandler = function (handler) {
	this.postbackHandler = handler;
};

PostbackWindowBinding.prototype.clearPostBackHandler = function () {
	this.postbackHandler = null;
};

PostbackWindowBinding.prototype.doPostBack = function (eventTarget, eventArgument, singlePostbackHandler) {
	this.singlePostbackHandler = singlePostbackHandler;
	this.getPageBinding().bindingWindow.__doPostBack(eventTarget, eventArgument);
};

PostbackWindowBinding.prototype.doPostBackHandler = function (singlePostbackHandler) {
	this.singlePostbackHandler = singlePostbackHandler;
	this.getPageBinding().dispatchAction(PageBinding.ACTION_DOPOSTBACK);
};

/**
* @implements {IActionListener}
* @overloads {WindowBinding#handleAction}
* @param {Action} action
*/
PostbackWindowBinding.prototype.handleAction = function (action) {

	PostbackWindowBinding.superclass.handleAction.call(this, action);

	switch (action.type) {
		case PageBinding.ACTION_UPDATED:
			var success = $(this.getPageBinding().bindingElement).find("#errors").children().length == 0;
			var singlePostbackHandler = this.singlePostbackHandler;
			this.singlePostbackHandler = null;
			if (success) {
				if (this.postbackHandler && this.postbackHandler.onSuccess) {
					this.postbackHandler.onSuccess(this.getPageBinding());
				}
				if (singlePostbackHandler && singlePostbackHandler.onSuccess) {
					singlePostbackHandler.onSuccess(this.getPageBinding());
				}
			} else {
				if (this.postbackHandler && this.postbackHandler.onFailure) {
					this.postbackHandler.onFailure(this.getPageBinding());
				}
				if (singlePostbackHandler && singlePostbackHandler.onFailure) {
					singlePostbackHandler.onFailure(this.getPageBinding());
				}
			}
			if (this._isAutoPost)
				this.enableAutoPost();
			action.consume();
			break;
	}
	;
};