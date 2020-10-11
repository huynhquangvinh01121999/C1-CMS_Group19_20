<%@ WebService Language="C#" Class="Composite.Forms.FormBuilder.FormBuilderService" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Xml.Linq;

namespace Composite.Forms.FormBuilder
{
    [WebService(Namespace = "http://www.composite.net/ns/management")]
    [SoapDocumentService(RoutingStyle = SoapServiceRoutingStyle.RequestElement)]
    public class FormBuilderService : System.Web.Services.WebService
    {
        [WebMethod]
        public List<string> GetPageBrowserDefaultUrl(List<string> xmlElements)
        {
            var result = new List<string>();
            
            foreach (var elementStr in xmlElements)
            {
                var element = XElement.Parse(elementStr);
                
                try
                {
                    string xhtmlFragment = FormHelper.PreviewField(element);

                    result.Add(xhtmlFragment);
                }
                catch (Exception ex)
                {
                    // Preview may not be avaiable until some of the required fields are defined.
					var deepestEx = ex;
					while (deepestEx.InnerException != null) deepestEx = deepestEx.InnerException;
					result.Add("No preview available: " + deepestEx.Message);
                }
            }

            return result;
        }

		//[WebMethod]
		//public FormElementInfo[] GetFormElements()
		//{
		//    return FormBuilderConfiguration.GetFormElements()
		//        .Select(e => new FormElementInfo
		//            {
		//                Name = e.Name, 
		//                Icon = e.Icon, 
		//                Label = e.Label, 
		//                Markup = new XElement("Element", new XAttribute("name", e.Name)).ToString()
		//            })
		//        .ToArray();
		//}

        public class FormElementInfo
        {
            public string Name { get; set; }
            public string Label { get; set; }
            public string Icon { get; set; }
            public string Markup { get; set; }
        }
    }
}