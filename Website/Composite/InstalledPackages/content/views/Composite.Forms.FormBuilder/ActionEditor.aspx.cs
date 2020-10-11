using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using Composite.C1Console.Forms;
using Composite.C1Console.Forms.WebChannel;
using Composite.Core.Extensions;
using Composite.Core.ResourceSystem;
using Composite.Core.Types;
using Composite.Core.WebClient;
using Composite.Core.WebClient.UiControlLib;
using Composite.Core.Xml;
using Composite.Forms.FormBuilder.Configuration;
using Composite.Functions;
using Action = Composite.Forms.FormBuilder.Configuration.Action;

namespace Composite.Forms.FormBuilder
{
    public partial class ActionEditor : System.Web.UI.Page
    {
        private static readonly string LogTitle = typeof(ActionEditor).Name;

        private XElement _actionsElement;
        private XElement _disabledActionsElement;

        protected class ActionInformation
        {
            public bool Enabled;

            public bool Initializing;

            public XElement Element;
            public Action ConfigurationElement;

            public ParameterProfile[] ParameterProfiles;
            public List<Tuple<string, object>> ParameterValues;
            public FormTreeCompiler FormTreeCompiler;
            public IWebUiControl Control;
            public PlaceHolder ControlPlaceHolder;
        }

        private List<ActionInformation> _actions;

        private bool _isInitialRequest;

        protected void Page_Load(object sender, EventArgs e)
        {
            bool isPost = Request.HttpMethod == "POST";

            bool isLoadMarkupRequest = isPost && Request["__EVENTTARGET"] == "Init";

            _isInitialRequest = !isPost || isLoadMarkupRequest;

            if (!isPost)
            {
                if (Request.Url.Query != "?test")
                {
                    return;
                }

                // For testing purposes
                _actionsElement = XElement.Parse(@"<Actions />");
                _disabledActionsElement = XElement.Parse(@"<Actions />");
            }
            else
            {
                if (isLoadMarkupRequest)
                {
                    _actionsElement = XElement.Parse(Request["__EVENTARGUMENT"]);
                    _disabledActionsElement = XElement.Parse(@"<Actions />");
                }
                else
                {
                    _actionsElement = XElement.Parse(Request[hdnDataHandlers.ID]);
                    _disabledActionsElement = XElement.Parse(Request[hdnDisabledActions.ID]);
                }
            }

            _actions = LoadActions(_actionsElement, _disabledActionsElement);

            // for new function calls we select first action by default:
            if (hdnBeenValid.Value != "1")
            {
                if (_actions.Any() && !_actions.Any(f => f.Enabled))
                {
                    _actions.First().Enabled = true;
                }
                hdnBeenValid.Value = "1";
            }

            foreach (var action in _actions)
            {
                LoadParameterProfiles(action);
                LoadParameterValues(action);
            }

            rptHandlers.DataSource = _actions;
            rptHandlers.ItemDataBound += rptHandlers_OnItemDataBound;
            rptHandlers.DataBind();
        }

        private void rptHandlers_OnItemDataBound(object sender, RepeaterItemEventArgs repeaterItemEventArgs)
        {
            var action = (ActionInformation) repeaterItemEventArgs.Item.DataItem;
            var placeholder = (PlaceHolder) repeaterItemEventArgs.Item.FindControl("plhWidgets");

            var chkEnabled = (Composite.Core.WebClient.UiControlLib.CheckBox)repeaterItemEventArgs.Item.FindControl("chkEnabled");

            var divWidgets = (HtmlGenericControl)repeaterItemEventArgs.Item.FindControl("divWidgets");
            var divEnableAction = (HtmlGenericControl)repeaterItemEventArgs.Item.FindControl("divEnableAction");

            string eventTarget = Request.Form["__EVENTTARGET"];

            bool chkEnabledIsTarget = eventTarget != null 
                                      && eventTarget.StartsWith(chkEnabled.NamingContainer.UniqueID)
                                      && eventTarget.EndsWith(chkEnabled.ID);

            bool @checked = Request[chkEnabled.UniqueID] == "on";

            bool yesClicked = chkEnabledIsTarget && @checked;
            bool noClicked = chkEnabledIsTarget && !@checked;

            if (yesClicked)
            {
                action.Enabled = true;
                action.Initializing = true;
                action.Element = new XElement("Action", new XAttribute("name", action.ConfigurationElement.Name));
            }

            if (noClicked)
            {
                action.Enabled = false;
            }

            chkEnabled.Checked = action.Enabled;

            chkEnabled.ItemLabel = StringResourceSystemFacade.ParseString(action.ConfigurationElement.Label);

            BuildWidgets(action, placeholder, noClicked);

            if (action.Enabled && (yesClicked || _isInitialRequest))
            {
                action.Control.InitializeViewState();
            }

            if (action.Enabled)
            {
                // Moving the checkbox control inside of the box
                var checkboxContainer = (PlaceHolder)repeaterItemEventArgs.Item.FindControl("plhCheckboxContainer");
                action.ControlPlaceHolder.Controls[0].Controls[0].Controls.AddAt(0, checkboxContainer);
            }

            divWidgets.Attributes["style"] = "display: " + (action.Enabled ? "block" : "none") + ";";
            divEnableAction.Attributes["style"] = "display: " + (!action.Enabled ? "block" : "none") + ";";
        }

        static List<ActionInformation> LoadActions(XElement actionsElement, XElement disabledActionsElement)
        {
            var result = new List<ActionInformation>();

            var definedActions = actionsElement.Elements().ToDictionary(
                handlerElement => (string) handlerElement.Attribute("name"),
                handlerElement => handlerElement);

            var disabledActions = disabledActionsElement.Elements().ToDictionary(
                handlerElement => (string)handlerElement.Attribute("name"),
                handlerElement => handlerElement);

            foreach (var action in FormBuilderConfiguration.GetActions())
            {
                var info = new ActionInformation {ConfigurationElement = action};

                if (definedActions.ContainsKey(action.Name))
                {
                    info.Enabled = true;
                    info.Element = definedActions[action.Name];

                    definedActions.Remove(action.Name);
                }
                else if (disabledActions.ContainsKey(action.Name))
                {
                    info.Element = disabledActions[action.Name];

                    disabledActions.Remove(action.Name);
                }

                result.Add(info);
            }

            if (definedActions.Count > 0)
            {
                throw new InvalidOperationException("Action '{0}' is not defined in the FormBuilder configuration file".FormatWith(definedActions.Keys.First()));
            }

            return result;
        }

        protected void Page_PreRender(object sender, EventArgs e)
        {
            if (_actions == null)
            {
                return;
            }

            var actionsXml = new XElement("Actions");
            var disabledActionsXml = new XElement("Actions");

            bool validationFailed = false;

            foreach (var action in _actions)
            {
                if (!action.Enabled)
                {
                    if (action.Control != null)
                    {
                        BindStateAndValidate(action, false);

                        action.ControlPlaceHolder.Controls.Clear();
                    }

                    disabledActionsXml.Add(SerializeAction(action));
                    continue;
                }

                bool validationPassed = BindStateAndValidate(action, true);
                
                if (validationPassed)
                {
                    actionsXml.Add(SerializeAction(action));
                }
                else
                {
                    validationFailed = true;
                }
            }

            if (!validationFailed)
            {
                _actionsElement = actionsXml;
                _disabledActionsElement = disabledActionsXml;
            }

            hdnDataHandlers.Value = _actionsElement.ToString();
            hdnDisabledActions.Value = _disabledActionsElement.ToString();
        }

        private bool BindStateAndValidate(ActionInformation action, bool showWarnings)
        {
            if (_isInitialRequest || action.Initializing || !action.ParameterProfiles.Any())
            {
                return true;
            }

            action.Control.BindStateToControlProperties();

            Dictionary<string, Exception> validationErrors = action.FormTreeCompiler.SaveAndValidateControlProperties();

            if (showWarnings)
            {
                ShowServerValidationErrors(action.FormTreeCompiler, validationErrors);
            }

            foreach (var pair in action.FormTreeCompiler.BindingObjects)
            {
                var record = new Tuple<string, object>(pair.Key, pair.Value);

                var index = action.ParameterValues.FindIndex(p => p.Item1 == pair.Key);

                if (index != -1)
                {
                    action.ParameterValues[index] = record;
                }
                else
                {
                    action.ParameterValues.Add(record);
                }
            }

            return validationErrors == null || validationErrors.Count == 0;
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

        private XElement SerializeAction(ActionInformation action)
        {
            var result = new XElement("Action");

            result.Add(new XAttribute(Namespaces.XmlNs + "f", Namespaces.Function10.NamespaceName));

            result.Add(new XAttribute("name", action.ConfigurationElement.Name));

            foreach (var parameter in action.ParameterValues)
            {
                var profile = action.ParameterProfiles.Single(p => p.Name == parameter.Item1);

                object value = parameter.Item2;

                if (value == profile.GetDefaultValue())
                {
                    continue;
                }

                string serializedValue = (string) ValueTypeConverter.Convert(parameter.Item2, typeof(string));

                result.Add(new XElement(Namespaces.Function10 + "param",
                    new XAttribute("name", parameter.Item1),
                    new XAttribute("value", serializedValue)));
            }

            return result;
        }

        private void BuildWidgets(ActionInformation action, PlaceHolder placeHolder, bool createEvenIfDisabled)
        {
            if (!action.Enabled && !createEvenIfDisabled)
            {
                return;
            }

            var bindings = new Dictionary<string, object>();

            foreach (var parameterProfile in action.ParameterProfiles)
            {
                var loadedValue = action.ParameterValues.FirstOrDefault(p => p.Item1 == parameterProfile.Name);

                object parameterValue = loadedValue != null ? loadedValue.Item2 : parameterProfile.GetDefaultValue();

                bindings.Add(parameterProfile.Name, parameterValue);
            }

            action.FormTreeCompiler = FunctionUiHelper.BuildWidgetForParameters(
                    action.ParameterProfiles,
                    bindings,
                    "widgets",
                    StringResourceSystemFacade.ParseString(action.ConfigurationElement.Label),
                    WebManagementChannel.Identifier);

            action.Control = (IWebUiControl)action.FormTreeCompiler.UiControl;
            action.ControlPlaceHolder = placeHolder;

            var webControl = action.Control.BuildWebControl();

            placeHolder.Controls.Add(webControl);
        }

        private void LoadParameterProfiles(ActionInformation action)
        {
            XElement functionNode = action.ConfigurationElement.FunctionNode;

            string functionName = (string) functionNode.Attribute("name");

            IFunction function = FunctionFacade.GetFunction(functionName);
            Verify.IsNotNull(function, "Failed to get C1 function '{0}'", functionName);

            List<string> predefinedParameterNames = functionNode.Elements().Select(el => (string)el.Attribute("name")).ToList();

            action.ParameterProfiles = function.ParameterProfiles.Where(p => !predefinedParameterNames.Contains(p.Name)).ToArray();
        }

        private void LoadParameterValues(ActionInformation action)
        {
            var parameterValues = new List<Tuple<string, object>>();

            if (action.Element != null)
            {
                foreach (XElement parameterNode in action.Element.Elements())
                {
                    string parameterName = (string) parameterNode.Attribute("name");

                    var parameterProfile = action.ParameterProfiles.FirstOrDefault(p => p.Name == parameterName);

                    Verify.IsNotNull(parameterProfile, "There's no parameter named '{0}' on the function representing action '{1}'", parameterName, action.ConfigurationElement.Name);

                    // TODO: Support for <f:paramelement ... />

                    string stringValue = (string) parameterNode.Attribute("value");
                    object value = ValueTypeConverter.Convert(stringValue, parameterProfile.Type);

                    parameterValues.Add(new Tuple<string, object>(parameterName, value));
                }
            }

            action.ParameterValues = parameterValues;
        }
    }
}