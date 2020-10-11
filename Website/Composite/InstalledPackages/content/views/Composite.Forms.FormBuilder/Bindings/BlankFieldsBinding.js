BlankFieldsBinding.prototype = new Binding;
BlankFieldsBinding.prototype.constructor = BlankFieldsBinding;
BlankFieldsBinding.superclass = Binding.prototype;

function BlankFieldsBinding() {

	/**
	* @type {SystemLogger}
	*/
	this.logger = SystemLogger.getLogger("BlankFieldsBinding");
}

/**
* Identifies binding.
*/
BlankFieldsBinding.prototype.toString = function () {

	return "[BlankFieldsBinding]";
};
BlankFieldsBinding.prototype.onBindingRegister = function() {

	BlankFieldsBinding.superclass.onBindingRegister.call(this);
};

/**
* @overloads {Binding#onBindingRegister}
*/
BlankFieldsBinding.prototype.onBindingRegister = function () {

	BlankFieldsBinding.superclass.onBindingRegister.call(this);

	var self = this;
	$(this.bindingElement).find('.blankfield').draggable({
		connectToSortable: "#formmarkup",
		helper: "clone",
		appendTo: "body",
		scroll: false
	});

	$(this.bindingElement).find('.blankfield').mousedown(function(e, s) {
	    $(e.target).closest('.blankfield').addClass('mousedown');
    }).mouseup(function (e) {
        $(e.target).closest('.blankfield').removeClass('mousedown');
    }).mouseout(function (e) {
        $(e.target).closest('.blankfield').removeClass('mousedown');
    });
    
	$(this.bindingElement).find('.blankfield').dblclick(function() {
		self.bindingWindow.bindingMap.formmarkup.addField($(this).attr("markup"));
	});
};