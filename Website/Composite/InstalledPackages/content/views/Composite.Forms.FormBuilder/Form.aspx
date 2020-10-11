<%@ Page Language="C#" AutoEventWireup="true" Inherits="Composite_InstalledPackages_Composite_Forms_FormBuilder_FormBuilder"
	EnableEventValidation="false" ValidateRequest="false" CodeFile="Form.aspx.cs" %>

<%@ Import Namespace="Composite.Core.ResourceSystem" %>
<%@ Import Namespace="Composite.Forms.FormBuilder" %>
<%@ Import Namespace="Composite.Forms.FormBuilder.Configuration" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ui="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
	<title>Composite.Management.FunctionCallEditor</title>
	<control:styleloader runat="server" />
	<control:scriptloader type="sub" runat="server" />
	<control:httpheaders runat="server" />
	<script type="text/javascript" src="jquery-2.0.3.min.js?"></script>
	<script type="text/javascript" src="jquery-ui.min.js?"></script>
	<link rel="stylesheet" type="text/css" href="Form.css" />
    <link rel="stylesheet" type="text/css" href="icons/style.css" />
	<script type="text/javascript" src="Form.js"></script>
	<script type="text/javascript" src="Bindings/PostbackWindowBinding.js"></script>
	<script type="text/javascript" src="Bindings/ActionEditorWindowBinding.js"></script>
	<script type="text/javascript" src="Bindings/BlankFieldsBinding.js"></script>
	<script type="text/javascript" src="Bindings/FormBuilderPageBinding.js"></script>
	<script type="text/javascript" src="Bindings/FormFieldItemBinding.js"></script>
	<script type="text/javascript" src="Bindings/FormFieldsBinding.js"></script>
	<asp:Repeater runat="server" ID="rptCssFiles">
		<itemtemplate>
            <link id="lnk" rel="stylesheet" type="text/css" runat="server" href="<%# (string) GetDataItem() %>" />
        </itemtemplate>
	</asp:Repeater>
</head>
<body>
	<form id="Form1" runat="server" class="updateform updatezone">
	<ui:dialogpage height="990" binding="FormBuilderPageBinding" responseid="__FunctionMarkup"
		label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Title) %>" class="tabboxed">
		<div style="display: none;">
			<textarea runat="server" id="__FunctionMarkup"></textarea>
			<input type="hidden" runat="server" id="DataHandler" />
		</div>
		<aspui:feedback runat="server" id="ctlFeedback" />
		<ui:tabbox>
			<ui:tabs>
				<ui:tab label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Tabs_Settings) %>"
					selected="<%= _preselectFieldsTabs ? "false" : "true" %>" />
				<ui:tab label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Tabs_Designer) %>"
					selected="<%= _preselectFieldsTabs ? "true" : "false" %>" />
				<ui:tab label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Tabs_Actions) %>" />
				<ui:tab label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Tabs_Receipt) %>" />
			</ui:tabs>
			<ui:tabpanels>
				<ui:tabpanel class="padded Panel" flex="false">
					<ui:fields>
						<ui:fieldgroup label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Tabs_Settings) %>">
							<ui:field>
								<ui:fielddesc>
									<%= Server.HtmlEncode(Localization.Editor_Settings_Name_Label) %>
								</ui:fielddesc>
								<ui:fieldhelp>
									<%= Server.HtmlEncode(Localization.Editor_Settings_Name_Help) %>
								</ui:fieldhelp>
								<ui:fielddata>
									<ui:datainput name="txtName" value="<%= HttpUtility.HtmlAttributeEncode(FormName) %>" required="true" />
								</ui:fielddata>
							</ui:field>
							<ui:field>
								<ui:fielddesc>
									<%= Server.HtmlEncode(Localization.Editor_Settings_SubmitButtonLabel_Label) %>
								</ui:fielddesc>
								<ui:fieldhelp>
									<%= Server.HtmlEncode(Localization.Editor_Settings_SubmitButtonLabel_Help) %>
								</ui:fieldhelp>
								<ui:fielddata>
									<ui:datainput name="txtSubmitButtonLabel" value="<%= HttpUtility.HtmlAttributeEncode(SubmitButtonLabel) %>" required="true" />
								</ui:fielddata>
							</ui:field>
							<ui:field>
								<ui:fielddesc>
									<%= Server.HtmlEncode(Localization.Editor_Settings_Security_Label) %>
								</ui:fielddesc>
								<ui:fieldhelp>
									<%= Server.HtmlEncode(Localization.Editor_Settings_Security_Help) %>
								</ui:fieldhelp>
								<ui:fielddata>
									<ui:selector name="txtSecurityHandler" isdisabled="<%= FormBuilderConfiguration.GetSecurityHandlers().Count == 1 ? "true" : "false" %>">
										<% foreach (var securityHandler in FormBuilderConfiguration.GetSecurityHandlers())
			 { %>
										<ui:selection 
                                            label="<%= HttpUtility.HtmlAttributeEncode(StringResourceSystemFacade.ParseString(securityHandler.Label)) %>" 
                                            value="<%= securityHandler.Name %>"
											selected="<%= securityHandler.Name == this.SecurityHandler ? "true" : "false" %>" />
										<% } %>
									</ui:selector>
								</ui:fielddata>
							</ui:field>
							<ui:field>
								<ui:fielddesc>
									<%= Server.HtmlEncode(Localization.Editor_Settings_CAPTCHA_Label1) %>
								</ui:fielddesc>
								<ui:fieldhelp>
									<%= Server.HtmlEncode(Localization.Editor_Settings_CAPTCHA_Help) %>
								</ui:fieldhelp>
								<ui:fielddata>
									<ui:checkboxgroup>
										<ui:checkbox label="<%= HttpUtility.HtmlAttributeEncode(Localization.Editor_Settings_CAPTCHA_Label2) %>"
											name="chkUseCaptcha" value="1" ischecked="<%= UseCaptcha ? "true" : "false" %>" />
									</ui:checkboxgroup>
								</ui:fielddata>
							</ui:field>
						</ui:fieldgroup>
					</ui:fields>
				</ui:tabpanel>
				<ui:tabpanel flex="false" class="Panel">
					<ui:splitbox orient="horizontal" layout="5:11:10">
						<ui:splitpanel class="blankfieldsbox">
							<ui:scrollbox class="no_hor_scroll">
								<div binding="BlankFieldsBinding">
									<% foreach (FieldGroup group in FormBuilderConfiguration.GetFieldGroups())
			{
									%>
									<div class="group">
										<h4><%= Server.HtmlEncode(StringResourceSystemFacade.ParseString(group.Label)) %></h4>
										<% foreach (Field field in group.Fields)
			 {
										%>
										<a href="javascript://" class="blankfield" markup="<%= HttpUtility.HtmlEncode(GetDefaultMarkup(field).ToString())%>">
										    
										    <span class="icon <%= field.Icon %>" aria-hidden="true"> </span>
                                             <span class="label">
											    <%= Server.HtmlEncode(StringResourceSystemFacade.ParseString(field.Label)) %>
                                             </span>
										</a>
										<%
						   } %>
									</div>
									<%
										   
									   } %>
								</div>
							</ui:scrollbox>
						</ui:splitpanel>
						<ui:splitter />
						<ui:splitpanel>
							<ui:scrollbox class="no_hor_scroll">
								<div id="formmarkup" name="FormMarkup" binding="FormFieldsBinding">
									<div id="emptyplaceholder">
										<div class="inner">
											<asp:PlaceHolder ID="phDropHere" runat="server">
												<div class="icon icon-redo-2" aria-hidden="true"></div>
												<br />
												<%= HttpUtility.HtmlEncode(Localization.Editor_Fields_DropComponentsHere) %>
											</asp:PlaceHolder>
											<asp:Literal ID="phLicenseNotValid" Visible="False"  runat="server"></asp:Literal>
										</div>
									</div>
									<asp:Repeater runat="server" ID="Elements" ViewStateMode="Disabled">
										<ItemTemplate>
											<div binding="FormFieldItemBinding" markup="<%# Eval("Markup")%>">
												<div class="overlay">
													&#160;</div>
												<%# Eval("Preview") %>
											</div>
										</ItemTemplate>
									</asp:Repeater>
								</div>
							</ui:scrollbox>
						</ui:splitpanel>
						<ui:splitter />
						<ui:splitpanel>
							<ui:window id="fieldeditor" url="FieldEditor.aspx?consoleId=<%= ConsoleId %>" binding="PostbackWindowBinding" autopost="true" />
						</ui:splitpanel>
					</ui:splitbox>
				</ui:tabpanel>
				<ui:tabpanel class="Panel">
					<ui:window id="datahanldereditor" name="Actions" url="ActionEditor.aspx?consoleId=<%= ConsoleId %>" binding="DataHandlerWindowBinding"
						value="<%= HttpUtility.HtmlEncode(Actions.ToString())%>" />
				</ui:tabpanel>
				<ui:tabpanel class="Panel">
					<ui:visualeditor id="confirmation" name="Confirmation" formattingconfiguration="common"
						elementclassconfiguration="common" callbackid="confirmation" value="<%= HttpUtility.HtmlEncode(Receipt.ToString()) %>">
					</ui:visualeditor>
				</ui:tabpanel>
			</ui:tabpanels>
		</ui:tabbox>
		<ui:dialogtoolbar>
			<ui:toolbarbody align="right" equalsize="true">
				<ui:toolbargroup>
					<aspui:clickbutton id="ClickButton1" customclientid="buttonAccept" client_focusable="true"
						onclick="OnClick" runat="server" text="${string:Website.Dialogs.LabelAccept}" />
					<ui:clickbutton label="${string:Website.Dialogs.LabelCancel}" response="cancel" focusable="true" />
				</ui:toolbargroup>
			</ui:toolbarbody>
		</ui:dialogtoolbar>
	</ui:dialogpage>
	</form>
</body>
</html>
