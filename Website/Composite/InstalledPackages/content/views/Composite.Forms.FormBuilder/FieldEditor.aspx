<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" Inherits="Composite.Forms.FormBuilder.FieldEditor" CodeFile="FieldEditor.aspx.cs" %>

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ui="http://www.w3.org/1999/xhtml" xmlns:control="http://www.composite.net/ns/uicontrol">
<control:httpheaders runat="server" /> 
   <head id="Head1" runat="server">
      <title>Form element editor</title>

       <control:scriptloader type="sub" runat="server" />
       <control:styleloader runat="server" />
       
       <link rel="stylesheet" type="text/css" href="Form.css" />
   </head>
<body>
    <ui:page>
        <ui:scrollbox class="padded">
            <form id="editForm" runat="server" class="updateform" method="post">
                <div class="updatezone" id="hiddenFields">
                    <asp:HiddenField runat="server" ID="hdnElement" />
                    <asp:HiddenField runat="server" ID="hdnPreview" />
                </div>

                <div class="updatezone" id="fields">
                    <ui:fields>
                        <asp:PlaceHolder runat="server" ID="plhParameters"></asp:PlaceHolder>
                    </ui:fields>

                    <div class="fieldgroupseparator">&#160;</div>

                    <ui:fields>
                        <asp:PlaceHolder runat="server" ID="plhDescriptionParameters"></asp:PlaceHolder>
                    </ui:fields>    
                    
                    <div class="fieldgroupseparator">&#160;</div>

                    <ui:fields>
                        <asp:PlaceHolder runat="server" ID="plhValidationParameters"></asp:PlaceHolder>
                    </ui:fields>    
                    
                    <div class="fieldgroupseparator">&#160;</div>

                    <ui:fields>
                        <asp:PlaceHolder runat="server" ID="plhAdvancedParameters"></asp:PlaceHolder>
                    </ui:fields>
                </div>
                <div id="errors" style="display: none" class="updatezone">
                    <asp:PlaceHolder runat="server" ID="plhErrors"></asp:PlaceHolder>
                </div>
            </form>
        </ui:scrollbox>
    </ui:page>
</body>
</html>



