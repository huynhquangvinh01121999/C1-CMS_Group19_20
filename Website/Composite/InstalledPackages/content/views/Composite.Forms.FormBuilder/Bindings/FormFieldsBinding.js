FormFieldsBinding.prototype = new DataBinding;
FormFieldsBinding.prototype.constructor = FormFieldsBinding;
FormFieldsBinding.superclass = DataBinding.prototype;

FormFieldsBinding.EMPTY = "empty";

/**
* @class
*/
function FormFieldsBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("FormFieldsBinding");


	/**
	* @type {Boolean}
	*/
	this.isSelectEvent = false;

	/**
	* @type {ComponentItemBinding}
	*/
	this.selectedFieldBinding = null;

	/**
	* @type (IEventListener)
	*/
	this.afterUpdateHandler = null;

	/**
	* @type (Object)
	*/
	this.overflowOffset = null;

	/**
	* @type (Object)
	*/
	this.scrollParent = null;

}

/**
* Identifies binding.
*/
FormFieldsBinding.prototype.toString = function () {

	return "[FormFieldsBinding]";
};

/**
* @overloads {Binding#onBindingAttach}
*/
FormFieldsBinding.prototype.onBindingAttach = function () {

	FormFieldsBinding.superclass.onBindingAttach.call(this);
	this.addEventListener(DOMEvents.MOUSEUP);
	this.addEventListener(DOMEvents.MOUSEDOWN);
};

/**
* Register databinding.
* @overloads {Binding#onBindingRegister}.
*/
FormFieldsBinding.prototype.onBindingRegister = function () {

	FormFieldsBinding.superclass.onBindingRegister.call(this);

	var self = this;
	this.scrollParent = $(this.bindingElement).parent();
	$(this.bindingElement).sortable({
		axis: "y",
		scroll: false,
		start: function (event, ui) {
			self.scrollParent[0].scrollTop = self.scrollParent[0].scrollTop + ui.placeholder[0].offsetTop - ui.originalPosition.top;
			self.isSelectEvent = false;
			if (!ui.item.hasClass("blankfield")) {
				$(this).attr('data-previndex', ui.item.index());
			}
			self.overflowOffset = self.scrollParent.offset();
		},
		stop: function (event, ui) {
			if (ui.item.hasClass("blankfield")) {
				var markup = ui.item.attr("markup");
				var fieldBinding = FormFieldItemBinding.newInstance(self.bindingDocument);
				ui.item.replaceWith(fieldBinding.bindingElement);
				fieldBinding.setMarkup(markup);
				fieldBinding.attach();

				//Preview
				var preview = FormBuilder.Service.GetPageBrowserDefaultUrl([markup]);
				fieldBinding.setPreview(preview[0]);

				//Select
				self.select(fieldBinding, {
					onSuccess: self.selectFirstProperty
				});


			} else {
				var newIndex = ui.item.index();
				var oldIndex = $(this).attr('data-previndex');
				$(this).removeAttr('data-previndex');

				// Seleting the field, if it has be dropped to the same position
				if (newIndex == oldIndex) {
					var binding = UserInterface.getBinding(ui.item.context);
					self.select(binding, {
						onSuccess: function (pagebinding) {
							pagebinding.dispatchAction(FocusBinding.ACTION_FOCUS);
						}
					});
				}
			}
		},
		sort: function (event, ui) {
			var item = ui.placeholder[0];
			if ((self.overflowOffset.top + self.scrollParent[0].offsetHeight) - event.pageY < 50){
				if (item.offsetTop + item.offsetHeight + 75 > self.scrollParent[0].scrollTop + self.scrollParent[0].offsetHeight
					|| item.nextElementSibling && item.nextElementSibling.offsetHeight > 50
					) {
					self.scrollParent[0].scrollTop = self.scrollParent[0].scrollTop + 10;
				}
			} else if (event.pageY - self.overflowOffset.top < 20) {
				
				self.scrollParent[0].scrollTop= self.scrollParent[0].scrollTop - 10;
			}
		},

		over: function (event, ui) {
			$('#emptyplaceholder').addClass('active');
		},

		out: function (event, ui) {
			$('#emptyplaceholder').removeClass('active');
		},

		receive: function (event, ui) {
			self.detachClassName(FormFieldsBinding.EMPTY);
		},


		items: "> .field"
	});
	$(this.bindingElement).disableSelection();
};

/**
* @overloads {Binding#onBindingInitialize}.
*/
FormFieldsBinding.prototype.onBindingInitialize = function () {

	FormFieldsBinding.superclass.onBindingInitialize.call(this);
	this.bindingElement.style.display = "block";
	if (!this.hasFields()) {
		this.attachClassName(FormFieldsBinding.EMPTY);
	}
};

FormFieldsBinding.prototype.selectFirstProperty = function (pageBinding) {
	var list = pageBinding.getDescendantBindingsByType(DataInputBinding);
	if (list != null && list.hasEntries()) {
		list.getFirst().shadowTree.input.select();
	}
};

/**
* Add Field
* @param {ComponentItemBinding} binding
*/
FormFieldsBinding.prototype.addField = function (markup) {

	var fieldBinding = FormFieldItemBinding.newInstance(this.bindingDocument);
	fieldBinding.setMarkup(markup);
	this.add(fieldBinding);
	fieldBinding.attach();

	//Preview
	var preview = FormBuilder.Service.GetPageBrowserDefaultUrl([markup]);
	fieldBinding.setPreview(preview[0]);

	//Select
	this.select(fieldBinding, { onSuccess: this.selectFirstProperty });

	this.detachClassName(FormFieldsBinding.EMPTY);
};

/**
* Remove Field
* @param {ComponentItemBinding} binding
*/
FormFieldsBinding.prototype.removeField = function (binding) {
	if (this.selectedFieldBinding == binding) {
		var fieldeditor = this.bindingWindow.bindingMap.fieldeditor;
		this.selectedFieldBinding.unselect();
		this.selectedFieldBinding = null;
		fieldeditor.clearPostBackHandler();
		fieldeditor.doPostBack("Clear", "");
	}
	binding.dispose();

	if (!this.hasFields()) {
		this.attachClassName(FormFieldsBinding.EMPTY);
	}
};

FormFieldsBinding.prototype.release = function (nextstep) {
	if (this.selectedFieldBinding) {
		this.releaseField(this.selectedFieldBinding, nextstep);
	} else {
		if (nextstep) nextstep();
	}
};

/**
* release & save binding
* @param {ComponentItemBinding} binding
*/
FormFieldsBinding.prototype.releaseField = function (binding, nextstep) {

	var fieldeditor = this.bindingWindow.bindingMap.fieldeditor;
	var pagebinding = fieldeditor.getPageBinding();
	if (pagebinding.validateAllDataBindings()) {
		var self = this;
		fieldeditor.doPostBackHandler({
			onSuccess: function () {
				self.selectedFieldBinding.unselect();
				if (nextstep)
					nextstep();
			},
			onFailure: function () {
			}
		});
	} else {
		var tabPanelBinding = this.getAncestorBindingByType(TabPanelBinding);
		if (tabPanelBinding != null && !tabPanelBinding.isVisible) {
			var tabBoxBinding = tabPanelBinding.getAncestorBindingByType(TabBoxBinding);
			var tabBinding = tabBoxBinding.getTabBinding(tabPanelBinding);
			tabBoxBinding.select(tabBinding);
		}
	}
};

/**
* Select binding
* @param {ComponentItemBinding} binding
*/
FormFieldsBinding.prototype.select = function (binding, handler) {
	if (this.selectedFieldBinding != binding) {
		if (this.selectedFieldBinding) {
			var self = this;
			this.releaseField(this.selectedFieldBinding, function () {
				self.selectNew(binding, handler);
			});
			return;
		}
		this.selectNew(binding, handler);
	}
};

FormFieldsBinding.prototype.selectNew = function (binding, handler) {
	this.selectedFieldBinding = binding;
	this.selectedFieldBinding.select();
	var fieldeditor = this.bindingWindow.bindingMap.fieldeditor;
	fieldeditor.setPostBackHandler({
		onSuccess: function (pagebinding) {
			binding.update(pagebinding);
		},
		onFailure: function () {
		}
	});
	if (handler) {
		fieldeditor.doPostBack("FormMarkup", binding.getMarkup(), handler);
	} else {
		fieldeditor.doPostBack("FormMarkup", binding.getMarkup());
	}
};

/**
* Has fields
* @return {Boolean}
*/
FormFieldsBinding.prototype.hasFields = function () {

	return this.getDescendantBindingsByType(FormFieldItemBinding).hasEntries();
};

/**
* Get fields.
* @return {List<FormFieldItemBinding>}
*/
FormFieldsBinding.prototype.getFields = function () {

	return this.getDescendantBindingsByType(FormFieldItemBinding);
};




// IMPLEMENT IDATA ...........................................................

/**
* Validate.
* @implements {IData}
* @return {boolean}
*/
FormFieldsBinding.prototype.validate = function () {

	return true;
};

/**
* Manifest. This will write form elements into page DOM
* so that the server recieves something on form submit.
* @implements {IData}
*/
FormFieldsBinding.prototype.manifest = function () {

	$(this.bindingElement).find("input,select,textarea").each(function () {
		$(this).removeAttr("name");
	});

	if (this.isAttached) {

		if (this.shadowTree.input == null) {
			this.shadowTree.input = DOMUtil.createElementNS(Constants.NS_XHTML, "input", this.bindingDocument);
			this.shadowTree.input.type = "hidden";
			this.bindingElement.appendChild(this.shadowTree.input);
		}
		this.shadowTree.input.name = this.getName();
		this.shadowTree.input.value = this.getValue();
	}
};

/**
* Get value. This is intended for serversice processing.
* @implements {IData}
* @return {string}
*/
FormFieldsBinding.prototype.getValue = function () {
	var value = "<Fields>";
	var items = this.getFields();
	console.log(items);
	items.each(function (item) {
		value += item.getMarkup();
	});
	value += "</Fields>";
	return value;
};

/**
* Set value.
* @implements {IData}
* @param {string} value
*/
FormFieldsBinding.prototype.setValue = function () {

};

/**
* Get result. This is intended for clientside processing.
* @implements {IData}
* @return {array
*/
FormFieldsBinding.prototype.getResult = function () {

	return new Array();
};

/**
* Set result.
* @implements {IData}
* @param {array} array
*/
FormFieldsBinding.prototype.setResult = function () {

};
