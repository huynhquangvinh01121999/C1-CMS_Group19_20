using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using Composite.C1Console.Forms;
using Composite.C1Console.Forms.WebChannel;
using Composite.Core;
using Composite.Core.Extensions;
using Composite.Core.ResourceSystem;
using Composite.Core.Types;
using Composite.Core.WebClient;
using Composite.Core.WebClient.UiControlLib;
using Composite.Core.Xml;
using Composite.Forms.FormBuilder.Configuration;
using Composite.Functions;

namespace Composite.Forms.FormBuilder
{
    public partial class FieldEditor : System.Web.UI.Page
    {
        private static readonly string LogTitle = typeof(FieldEditor).Name;

        private XElement _fieldXml;
        private Field _fieldConfiguration;
        private ParameterProfile[] _parameterProfiles;
        private List<Tuple<string, object>> _parameterValues;

        private bool _isInitialRequest;

        private class ParameterGroup
        {
            public ParameterProfile[] ParameterProfiles;
            public FormTreeCompiler FormTreeCompiler;
            public IWebUiControl Widgets;
        }

        private ParameterGroup _standardParameters = new ParameterGroup();
        private ParameterGroup _descriptionParameters = new ParameterGroup();
        private ParameterGroup _validationParameters = new ParameterGroup();
        private ParameterGroup _advancedParameters = new ParameterGroup();

        protected void Page_Load(object sender, EventArgs e)
        {
            bool isPost = Request.HttpMethod == "POST";
            bool isLoadMarkupRequest = isPost && Request["__EVENTTARGET"] == "FormMarkup";
            bool isClearRequest = isPost && Request["__EVENTTARGET"] == "Clear";

            _isInitialRequest = !isPost || isLoadMarkupRequest;

            if (!isPost || isClearRequest)
            {
                if (Request.Url.Query != "?test")
                {
                    return;
                }

                // For testing purposes
                _fieldXml = XElement.Parse(@"
                <Field name=""textbox"" xmlns:f=""http://www.composite.net/ns/function/1.0"">
                    <f:param name=""Name"" value=""FirstName"" />
                    <f:param name=""Label"" value=""First Name"" />
                </Field>");
            }
            else
            {
                if (isLoadMarkupRequest)
                {
                    _fieldXml = XElement.Parse(Request["__EVENTARGUMENT"]);
                }
                else
                {
                    _fieldXml = XElement.Parse(Request[hdnElement.ID]);
                }
            }

            LoadParameterProfiles();
            LoadParameterValues();

            BuildWidgets();
        }

        protected void Page_PreRender(object sender, EventArgs e)
        {
            if (_fieldXml == null)
            {
                return;
            }

            bool validationSucceded = true;

            if (_isInitialRequest)
            {
                InitializeViewState(_standardParameters);
                InitializeViewState(_descriptionParameters);
                InitializeViewState(_validationParameters);
                InitializeViewState(_advancedParameters);
            }
            else
            {
                bool standardParamsValid = ValidateAndLoadValues(_standardParameters);
                bool descriptionParamsValid = ValidateAndLoadValues(_descriptionParameters);
                bool validationParamsValid = ValidateAndLoadValues(_validationParameters);
                bool advancedParamsValid = ValidateAndLoadValues(_advancedParameters);

                validationSucceded = standardParamsValid && descriptionParamsValid && validationParamsValid && advancedParamsValid;
            }

            _fieldXml = SerializeFormElement();

            hdnElement.Value = _fieldXml.ToString();

            string preview = "";

            if (validationSucceded)
            {
                try
                {
                    preview = FormHelper.PreviewField(_fieldXml);
                }
                catch (Exception ex)
                {
                    var deepestEx = ex;
                    while (deepestEx.InnerException!= null) deepestEx = deepestEx.InnerException;
                    
                    preview = Localization.Editor_Fields_PreviewError + ": \n" + deepestEx.Message;

                    Log.LogWarning(LogTitle, "Error previewing element");
                    Log.LogWarning(LogTitle, ex);
                }
            }

            hdnPreview.Value = preview;
        }

        private void InitializeViewState(ParameterGroup parameterGroup)
        {
            if (parameterGroup.ParameterProfiles.Any())
            {
                parameterGroup.Widgets.InitializeViewState();
            }
        }

        private bool ValidateAndLoadValues(ParameterGroup parameterGroup)
        {
            if (!parameterGroup.ParameterProfiles.Any())
            {
                return true;
            }

            parameterGroup.Widgets.BindStateToControlProperties();

            var validationErrors = parameterGroup.FormTreeCompiler.SaveAndValidateControlProperties();

            ShowServerValidationErrors(parameterGroup.FormTreeCompiler, validationErrors);

            foreach (var pair in parameterGroup.FormTreeCompiler.BindingObjects)
            {
                var record = new Tuple<string, object>(pair.Key, pair.Value);

                var index = _parameterValues.FindIndex(p => p.Item1 == pair.Key);

                if (index != -1)
                {
                    _parameterValues[index] = record;
                }
                else
                {
                    _parameterValues.Add(record);
                }
            }

            return !validationErrors.Any();
        }

        private void ShowServerValidationErrors(FormTreeCompiler formTreeCompiler, Dictionary<string, Exception> serverValidationErrors)
        {
            foreach (var serverValidationError in serverValidationErrors)
            {
                string controlId = formTreeCompiler.GetBindingToClientIDMapping()[serverValidationError.Key];
                string message = StringResourceSystemFacade.ParseString(serverValidationError.Value.Message);

                plhErrors.Controls.Add(new FieldMessage(controlId, message));
            }
        }

        private XElement SerializeFormElement()
        {
            var result = new XElement("Field");

            result.Add(new XAttribute(Namespaces.XmlNs + "f", Namespaces.Function10.NamespaceName));

            result.Add(new XAttribute("name", (string) _fieldXml.Attribute("name")));

            foreach (var parameter in _parameterValues)
            {
                var profile = _parameterProfiles.Single(p => p.Name == parameter.Item1);

                object value = parameter.Item2;

                if (value == profile.GetDefaultValue())
                {
                    continue;
                }

                string serializedValue = (string) ValueTypeConverter.Convert(parameter.Item2, typeof(string));

                result.Add(new XElement(Namespaces.Function10 + "param",
                    new XAttribute("name", parameter.Item1),
                    serializedValue != null ? new XAttribute("value", serializedValue) : null));
            }

            return result;
        }

        private void BuildWidgets()
        {
            BuildWidgets(_standardParameters, plhParameters, _fieldConfiguration.Label);
            BuildWidgets(_descriptionParameters, plhDescriptionParameters, Localization.Editor_Fields_DescriptionFieldGroup_Label);
            BuildWidgets(_validationParameters, plhValidationParameters, Localization.Editor_Fields_ValidationFieldGroup_Label); 
            BuildWidgets(_advancedParameters, plhAdvancedParameters, Localization.Editor_Fields_AdvancedFieldGroup_Label);
        }

        private void BuildWidgets(ParameterGroup parameterGroup, PlaceHolder placeHolder, string panelLabel)
        {
            if (!parameterGroup.ParameterProfiles.Any()) return;

            var bindings = new Dictionary<string, object>();

            foreach (var parameterProfile in parameterGroup.ParameterProfiles)
            {
                var loadedValue = _parameterValues.FirstOrDefault(p => p.Item1 == parameterProfile.Name);

                object parameterValue = loadedValue != null ? loadedValue.Item2 : parameterProfile.GetDefaultValue();

                bindings.Add(parameterProfile.Name, parameterValue);
            }

            parameterGroup.FormTreeCompiler = FunctionUiHelper.BuildWidgetForParameters(
                    parameterGroup.ParameterProfiles,
                    bindings,
                    placeHolder.ID,
                    panelLabel,
                    WebManagementChannel.Identifier);

            parameterGroup.Widgets = (IWebUiControl) parameterGroup.FormTreeCompiler.UiControl;

            placeHolder.Controls.Add(parameterGroup.Widgets.BuildWebControl());
        }

        private void LoadParameterProfiles()
        {
            string elementName = (string)_fieldXml.Attribute("name");
            Verify.ArgumentNotNullOrEmpty(elementName, "Missing element name");

            var allElements = FormBuilderConfiguration.GetFieldMap();
            Verify.That(allElements.ContainsKey(elementName), "Undeclared form element 'elementName'");

            var element = allElements[elementName];

            string functionName = (string)element.FunctionNode.Attribute("name");

            IFunction function = FunctionFacade.GetFunction(functionName);
            Verify.IsNotNull(function, "Failed to get C1 function '{0}'", functionName);

            List<string> predefinedParameterNames = element.FunctionNode.Elements().Select(el => (string)el.Attribute("name")).ToList();

            _fieldConfiguration = element;
            _parameterProfiles = function.ParameterProfiles.Where(p => !predefinedParameterNames.Contains(p.Name)).ToArray();

            _standardParameters = new ParameterGroup {
                    ParameterProfiles = _parameterProfiles.Where(p =>
                        !_fieldConfiguration.DescriptionParameters.Contains(p.Name) &&
                        !_fieldConfiguration.ValidationParameters.Contains(p.Name) &&
                        !_fieldConfiguration.AdvancedParameters.Contains(p.Name)).ToArray()
            };

            _descriptionParameters = new ParameterGroup
            {
                ParameterProfiles = _parameterProfiles.Where(p => _fieldConfiguration.DescriptionParameters.Contains(p.Name)).ToArray()
            };

            _validationParameters = new ParameterGroup
            {
                ParameterProfiles = _parameterProfiles.Where(p => _fieldConfiguration.ValidationParameters.Contains(p.Name)).ToArray()
            };

            _advancedParameters = new ParameterGroup {
                    ParameterProfiles = _parameterProfiles.Where(p => _fieldConfiguration.AdvancedParameters.Contains(p.Name)).ToArray()
            };
        }

        private void LoadParameterValues()
        {
            _parameterValues = new List<Tuple<string, object>>();

            foreach (XElement parameterNode in _fieldXml.Elements())
            {
                string parameterName = (string) parameterNode.Attribute("name");

                var parameterProfile = _parameterProfiles.FirstOrDefault(p => p.Name == parameterName);

                Verify.IsNotNull(parameterProfile, "Parameter '{0}' hasn't been defined".FormatWith(parameterName));

                // TODO: Support for <f:paramelement ... />

                string stringValue = (string) parameterNode.Attribute("value");
                object value = ValueTypeConverter.Convert(stringValue, parameterProfile.Type);

                _parameterValues.Add(new Tuple<string, object>(parameterName, value));
            }

            var parametersWithDefaultValues = _parameterProfiles.Where(p => !_parameterValues.Any(pv => pv.Item1 == p.Name));

            foreach (var parameterProfile in parametersWithDefaultValues)
            {
                var defaultValue = parameterProfile.GetDefaultValue();

                _parameterValues.Add(new Tuple<string, object>(parameterProfile.Name, defaultValue));
            }
        }
    }
}