var URL_WSDL_FORMBUILDERSERVICE = Constants.WEBSITEROOT + "Composite/InstalledPackages/content/views/Composite.Forms.FormBuilder/FormBuilder.asmx?WSDL";

var FormBuilder = null;
FormBuilder = top.FormBuilder = new function () {
	if (top.FormBuilder)
		return top.FormBuilder;

	this.Date = new Date();
	this.Service = WebServiceProxy.createProxy(URL_WSDL_FORMBUILDERSERVICE);

	return this;
};

var FormBuilder = top.FormBuilder;