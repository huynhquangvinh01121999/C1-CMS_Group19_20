using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml;
using System.Xml.Linq;

using Composite.C1Console.Events;
using Composite.Core.ResourceSystem;
using Composite.Core.WebClient;
using Composite.Core.Xml;
using Composite.Forms.FormBuilder;
using Composite.Forms.FormBuilder.Configuration;
using Composite.Functions;
using Composite.Functions.Foundation;

public partial class Composite_InstalledPackages_Composite_Forms_FormBuilder_FormBuilder : System.Web.UI.Page
{
    protected string FormName;
    protected string SubmitButtonLabel;
    protected string SecurityHandler;
    protected XElement Actions;
    protected XhtmlDocument Receipt;
    protected bool UseCaptcha;
    protected bool _preselectFieldsTabs;

    private const string FailureMessage_ViewStateKey = "FailureMessage";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (Request.Form["functionMarkup"] == null)
        {
            Actions = new XElement("Actions");
            Receipt = new XhtmlDocument();

            if (IsPostBack)
            {
                FormName = Request["txtName"];
                SubmitButtonLabel = Request["txtSubmitButtonLabel"];
                SecurityHandler = Request["txtSecurityHandler"];
                UseCaptcha = Request["chkUseCaptcha"] == "1";
            }
            else
            {
                FormName = "";
                SubmitButtonLabel = "";
                SecurityHandler = "Default";
            }
            
            return;
        }

        string functionMarkup = Request.Form["functionMarkup"];
        var functionElement = XElement.Parse(functionMarkup);

        var fieldsElements = GetParamElement(functionElement, "Fields");
        if (fieldsElements != null && fieldsElements.Elements().Any())
        {
            var fieldElements = fieldsElements.Elements().Single().Elements();

            //var elements = XElement.Parse(form);
            var i = 0;
			try
			{
				Elements.DataSource = fieldElements.Select(d => new
				{
					Markup = HttpUtility.HtmlEncode(d.ToString()),
					Preview = FormHelper.PreviewField(d),
					Name = (string)d.Attribute("name"),
					IndexName = "Element" + i++,
					Fields = d.Elements(Namespaces.Function10 + "param").ToDictionary(p => p.Attribute("name").Value, p => p.Attribute("value").Value)
				});
				Elements.DataBind();
			}
			catch (Exception ex)
			{
				phDropHere.Visible = false;
				phLicenseNotValid.Text = ex.Message;
				phLicenseNotValid.Visible = true;
			}
		}

        _preselectFieldsTabs = true;

        XElement actionParameter = GetParamElement(functionElement, "Actions");
        if (actionParameter != null && actionParameter.Elements().Any())
        {
            Actions = actionParameter.Elements().Single();
        }
        else
        {
            Actions = new XElement("Actions");
        }

        XElement receiptParameter = GetParamElement(functionElement, "Receipt");
        if (receiptParameter != null && receiptParameter.Elements().Any())
        {
            Receipt = new XhtmlDocument(receiptParameter.Elements().Single());
        }
        else
        {
            Receipt = new XhtmlDocument();

            Receipt.Body.Add(
                new XElement( Namespaces.Xhtml + "p",
                    Localization.Editor_Receipt_DefaultText
                ));
        }

        XElement failureMessageParameter = GetParamElement(functionElement, "FailureMessage");
        if (failureMessageParameter != null && failureMessageParameter.Elements().Any())
        {
            ViewState[FailureMessage_ViewStateKey] = new XhtmlDocument(failureMessageParameter.Elements().Single()).ToString();
        }

        XElement formNameParameter = GetParamElement(functionElement, "Name");
        FormName = formNameParameter != null ? (string)formNameParameter.Attribute("value") : "";

        XElement submitButtonLabelParameter = GetParamElement(functionElement, "SubmitButtonLabel");
        SubmitButtonLabel = submitButtonLabelParameter != null ? (string)submitButtonLabelParameter.Attribute("value") : "Send";

        XElement securityHandlerParameter = GetParamElement(functionElement, "SecurityHandler");
        SecurityHandler = securityHandlerParameter != null ? (string)securityHandlerParameter.Attribute("value") : "Default";

        XElement useCaptchaParameter = GetParamElement(functionElement, "UseCaptcha");
        UseCaptcha = useCaptchaParameter != null && (string)useCaptchaParameter.Attribute("value") == "True";
    }

    public XElement GetDefaultMarkup(Field field)
    {
        var result = new XElement("Field", new XAttribute("name", field.Name));

        string functionName = (string) field.FunctionNode.Attribute("name");

        IFunction function;

        if (functionName != null 
            && FunctionFacade.TryGetFunction(out function, functionName))
        {
            if (function.ParameterProfiles.Any(p => p.Name == "Name" && p.IsRequired))
            {
                result.Add(new XElement(Namespaces.Function10 + "param",
                                new XAttribute("name", "Name"),
                                new XAttribute("value", StringResourceSystemFacade.ParseString(field.Label))));
            }
            if (function.ParameterProfiles.Any(p => p.Name == "Label"))
            {
                result.Add(new XElement(Namespaces.Function10 + "param",
                                new XAttribute("name", "Label"),
                                new XAttribute("value", StringResourceSystemFacade.ParseString(field.Label))));
            }
        }
        return result;
    }

    XElement GetParamElement(XElement functionElement, string parameterName)
    {
        return functionElement.Elements(Namespaces.Function10 + "param").SingleOrDefault(d => d.Attribute("name").Value == parameterName);
    }

    protected void OnClick(object sender, EventArgs e)
    {
        XElement fieldsElement = XElement.Parse(Request["FormMarkup"]);
        XElement actionsElement = XElement.Parse(Server.UrlDecode(Request["Actions"]));
        XElement receiptElement = XElement.Parse(Server.UrlDecode(Request["confirmation"]));

        if (FormBuilderConfiguration.GetActions().Any() && !actionsElement.Elements().Any())
        {
            Alert(Localization.Editor_SaveError_AlertTitle, Localization.Editor_SaveError_NoActionSelected);
            ctlFeedback.SetStatus(false);
            return;
        }

        string name = Request["txtName"];
        string submitButtonLabel = Request["txtSubmitButtonLabel"];
        string securityHandler = Request["txtSecurityHandler"];
        bool useCaptcha = Request["chkUseCaptcha"] == "1";

        var functionElement = XElement.Parse(string.Format(@"<f:{0} xmlns:f=""{1}"" />", FunctionTreeConfigurationNames.FunctionTagName, FunctionTreeConfigurationNames.NamespaceName));

        functionElement.Add(new XAttribute("name", "Composite.Forms.FormBuilder.Form"));

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
                    new XAttribute("name", "Name"),
                    new XAttribute("value", name)));

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "SubmitButtonLabel"),
            new XAttribute("value", submitButtonLabel)));

        if (securityHandler != null)
        {
            functionElement.Add(new XElement(Namespaces.Function10 + "param",
                new XAttribute("name", "SecurityHandler"),
                new XAttribute("value", securityHandler)));
        }

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "Fields"),
            FixFieldNames(fieldsElement)));

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "Actions"),
            actionsElement));

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "Receipt"),
            receiptElement));

        functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "UseCaptcha"),
            new XAttribute("value", useCaptcha.ToString())));

        string failureMessage = ViewState[FailureMessage_ViewStateKey] as string;
        if (failureMessage != null)
        {
            functionElement.Add(new XElement(Namespaces.Function10 + "param",
            new XAttribute("name", "FailureMessage"), XElement.Parse(failureMessage)));
        }

        __FunctionMarkup.InnerText = functionElement.ToString();

        ctlFeedback.SetStatus(true);
    }

    private XElement FixFieldNames(XElement fieldsElement)
    {
        var usedNames = new HashSet<string>();

        var nameLessFields = fieldsElement.Descendants().Where(e => e.Name.LocalName == "param" && (string)e.Attribute("name") == "Name" && (string)e.Attribute("value") == "").ToList();

        foreach (var field in nameLessFields)
        {
            string label = field.Parent.Elements(Namespaces.Function10 + "param").Where(f => (string)f.Attribute("name") == "Label").Select(f=>(string)f.Attribute("value")).FirstOrDefault();
            if (!string.IsNullOrEmpty(label))
            {
                field.Attribute("value").Value = BuildNameFromLabel(label);
            }
        }

        foreach (var nameParam in fieldsElement.Descendants().Where(e => e.Name.LocalName == "param" && (string)e.Attribute("name") == "Name").ToList())
        {
            var valueAttribute = nameParam.Attribute("value");
            valueAttribute.Value = GenerateUniqueName(valueAttribute.Value, usedNames);
        }

        return fieldsElement;
    }


    public string BuildNameFromLabel(string label)
    {
        StringBuilder sb = new StringBuilder();

        foreach (var nameChar in label.ToCharArray())
        {
            if (nameChar == ' ' || XmlConvert.IsNCNameChar(nameChar))
            {
                sb.Append(nameChar);
            }
        }

        return sb.ToString();
    }


    private string GenerateUniqueName(string name, HashSet<string> usedNames)
    {
        if (!usedNames.Contains(name))
        {
            usedNames.Add(name);

            return name;
        }

        string nameWithoutIndex = name;
        while (nameWithoutIndex.Length > 0 && char.IsDigit(nameWithoutIndex[nameWithoutIndex.Length - 1]))
        {
            nameWithoutIndex = nameWithoutIndex.Substring(0, nameWithoutIndex.Length - 1);
        }

        for (int i = 1; i < 1000; i++)
        {
            string newName = nameWithoutIndex + i;
            if (!usedNames.Contains(newName))
            {
                usedNames.Add(newName);

                return newName;
            }
        }

        throw new InvalidOperationException("This line should not be reachable.");
    }

    protected void Page_PreRender(object sender, EventArgs e)
    {
        rptCssFiles.DataSource = FormBuilderConfiguration.GetFieldEditorConfiguration().CssFiles.Select(UrlUtils.ResolvePublicUrl);
        rptCssFiles.DataBind();
    }

    private void Alert(string title, string message)
    {
        ConsoleMessageQueueFacade.Enqueue(
            new MessageBoxMessageQueueItem
            {
                DialogType = DialogType.Error,
                Message = message,
                Title = title
            }, ConsoleId);
    }

    protected string ConsoleId
    {
        get { return Request["consoleId"]; }
    }
}