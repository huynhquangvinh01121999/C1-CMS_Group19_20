FormFieldItemBinding.prototype = new Binding;
FormFieldItemBinding.prototype.constructor = FormFieldItemBinding;
FormFieldItemBinding.superclass = Binding.prototype;

/**
* @class
*/
function FormFieldItemBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("FormFieldItemBinding");

	/**
	* @type {boolean}
	*/
	this.isSelected = false;

	/**
	* Type {ComponentsBinding}
	*/
	this.formFieldsBinding = null;

	/**
	* Type {string}
	*/
	this.markup = null;

}

/**
* Identifies binding.
*/
FormFieldItemBinding.prototype.toString = function() {

	return "[FormFieldItemBinding]";
};

/**
*
*/
FormFieldItemBinding.prototype.onBindingRegister = function() {

	FormFieldItemBinding.superclass.onBindingRegister.call(this);

	// markup
	var markup = this.getProperty("markup");
	if (markup) {
		this.setMarkup(markup);
	}

};

/**
* Build DOM content.
*/
FormFieldItemBinding.prototype.buildDOMContent = function() {

	this.formFieldsBinding = this.getAncestorBindingByType(FormFieldsBinding);

	this.attachClassName("field");

	this.shadowTree.preview = DOMUtil.createElementNS(Constants.NS_XHTML, "div", this.bindingDocument);
	while (this.bindingElement.firstChild) {
		this.shadowTree.preview.appendChild(this.bindingElement.firstChild);
	}
	this.bindingElement.appendChild(this.shadowTree.preview);

	var deleteButton = this.add(ToolBarButtonBinding.newInstance(this.bindingDocument));
	deleteButton.setProperty("image", "${icon:delete-disabled}");
	deleteButton.setProperty("image-hover", "${icon:delete}");
	deleteButton.attach();
	deleteButton.attachClassName("delete");
	var self = this;
	deleteButton.oncommand = function() {
		self.formFieldsBinding.isSelectEvent = false;
		self.formFieldsBinding.removeField(self);
	};
};

/**
* @overloads {Binding#onBindingAttach}
*/
FormFieldItemBinding.prototype.onBindingAttach = function() {

	FormFieldItemBinding.superclass.onBindingAttach.call(this);
	this.addEventListener(DOMEvents.MOUSEUP);
	this.addEventListener(DOMEvents.MOUSEDOWN);
	this.buildDOMContent();
};

/**
* @implements {IEventListener}
* @overloads {Binding#handleEvent}
* @param {MouseEvent} e
*/
FormFieldItemBinding.prototype.handleEvent = function (e) {

	FormFieldItemBinding.superclass.handleEvent.call(this, e);

	switch (e.type) {
		case DOMEvents.MOUSEUP:
			if (this.formFieldsBinding.isSelectEvent) {
				this.formFieldsBinding.select(this, {
					onSuccess: function (pagebinding) {
						pagebinding.dispatchAction(FocusBinding.ACTION_FOCUS);
					}
				});
			}
			this.formFieldsBinding.isSelectEvent = false;
			break;
		case DOMEvents.MOUSEDOWN:
			this.formFieldsBinding.isSelectEvent = true;
			break;
	}

};

FormFieldItemBinding.prototype.update = function (binding) {
	this.setMarkup(binding.bindingDocument.getElementById("hdnElement").value);
	this.setPreview(binding.bindingDocument.getElementById("hdnPreview").value);
};

FormFieldItemBinding.prototype.setMarkup = function (markup) {
	this.markup = markup;
};

FormFieldItemBinding.prototype.getMarkup = function () {
	return this.markup;
};

FormFieldItemBinding.prototype.setPreview = function (html) {
	this.shadowTree.preview.innerHTML = "<div class=\'overlay'>&#160;</div>" + html;
};

FormFieldItemBinding.prototype.select = function (fit) {
	this.attachClassName("selectedfield");
	$(this.bindingElement).zIndex(2);
	this.scrollTo();
};

FormFieldItemBinding.prototype.scrollTo = function () {
	var top = $(this.bindingElement).position().top;
	var offsetTop = this.bindingElement.offsetTop
	var offsetHeight = this.bindingElement.offsetHeight;
	var container = $(this.bindingElement).parent().parent();
	var padding = 0;
	if (!this.bindingElement.nextElementSibling) {
		padding= $(this.bindingElement).parent().outerHeight() - $(this.bindingElement).parent().height();
	}

	if (top < 0) {
		container.scrollTop(offsetTop);
	}
	else if (top + offsetHeight + padding > container.height()) {
		container.scrollTop(offsetTop + offsetHeight + padding - container.height());
	}
}


FormFieldItemBinding.prototype.unselect = function () {
	this.detachClassName("selectedfield");
	$(this.bindingElement).zIndex(1);
};

/**
* FormFieldItemBinding factory.
* @param {DOMDocument} ownerDocument
* @return {CheckBoxBinding}
*/
FormFieldItemBinding.newInstance = function (ownerDocument) {

	var element = ownerDocument.createElement("div");
	return UserInterface.registerBinding(element, FormFieldItemBinding);
};
