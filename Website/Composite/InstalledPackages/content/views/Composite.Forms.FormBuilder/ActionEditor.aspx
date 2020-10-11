<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" Inherits="Composite.Forms.FormBuilder.ActionEditor"
	CodeFile="ActionEditor.aspx.cs" %>

<%@ Import Namespace="Composite.Core.ResourceSystem" %>
<%@ Import Namespace="Composite.Forms.FormBuilder" %>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ui="http://www.w3.org/1999/xhtml"
xmlns:control="http://www.composite.net/ns/uicontrol">
<control:httpheaders runat="server" />
<head id="Head1" runat="server">
	<title>Form element editor</title>
	<control:scriptloader type="sub" runat="server" class="updateform" />
	<control:styleloader runat="server" />
	<link rel="stylesheet" type="text/css" href="Form.css" />
</head>
<body>
	<ui:page>
		<ui:scrollbox>
			<form id="editDataHandlers" runat="server" class="updateform" method="post">
			<!--  class="updateform" -->
			<div id="divHiddenFields" class="updatezone">
				<asp:HiddenField runat="server" ID="hdnDataHandlers" />
				<asp:HiddenField runat="server" ID="hdnDisabledActions" />
				<asp:HiddenField runat="server" ID="hdnBeenValid" />
			</div>
			<ui:fields id="fields" class="padded updatezone">
				<asp:Repeater runat="server" ID="rptHandlers">
					<ItemTemplate>
						<div runat="server" id="divEnableAction">
							<ui:fields>
								<ui:fieldgroup label="<%# StringResourceSystemFacade.ParseString((GetDataItem() as ActionInformation).ConfigurationElement.Label) %>">
									<asp:PlaceHolder runat="server" ID="plhCheckboxContainer">
										<ui:field>
											<ui:fielddesc label="<%# Localization.ActionEditor_EnableLabel %>" />
											<ui:fieldhelp>
												<%# StringResourceSystemFacade.ParseString((GetDataItem() as ActionInformation).ConfigurationElement.Help) %>
											</ui:fieldhelp>
											<ui:fielddata>
												<ui:checkboxgroup>
													<aspui:checkbox runat="server" id="chkEnabled" autopostback="true" />
												</ui:checkboxgroup>
											</ui:fielddata>
										</ui:field>
									</asp:PlaceHolder>
								</ui:fieldgroup>
							</ui:fields>
						</div>
						<div runat="server" id="divWidgets">
							<asp:PlaceHolder runat="server" ID="plhWidgets"></asp:PlaceHolder>
						</div>
					</ItemTemplate>
				</asp:Repeater>
			</ui:fields>
			<div id="errors" style="display: none" class="updatezone">
				<asp:PlaceHolder runat="server" ID="plhErrors"></asp:PlaceHolder>
			</div>
			</form>
		</ui:scrollbox>
	</ui:page>
</body>
</html>
