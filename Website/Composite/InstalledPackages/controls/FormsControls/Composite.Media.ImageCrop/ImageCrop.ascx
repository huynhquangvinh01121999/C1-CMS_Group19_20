<%@ Control Language="C#" Inherits="Composite.Plugins.Forms.WebChannel.UiControlFactories.UserControlBasedUiControl, Composite" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Drawing" %>
<%@ Import Namespace="System.Globalization" %>
<%@ Import Namespace="Composite" %>
<%@ Import Namespace="Composite.C1Console.Forms" %>
<%@ Import Namespace="Composite.Core.ResourceSystem" %>
<%@ Import Namespace="Composite.Core.WebClient" %>
<%@ Import Namespace="Composite.Data.Types" %>
<%@ Import Namespace="Composite.Media.ImageCrop" %>

<%-- control:StyleLoader adminRelativePath="InstalledPackages/controls/FormsControls/Composite.Media.ImageCrop/ImageCrop.css" runat="server" /--%>


<script runat="server" language="C#">
    
    private static Size ViewPortSize = new Size(400, 400);
    protected Size _originalImageSize;
    protected Size _shownImageSize;
    protected string _imageSrc;

    [BindableProperty]
    [FormsProperty]
    public IMediaFile MediaFile { get; set; }

    [BindableProperty]
    [FormsProperty]
    public Rectangle Selection { get; set; }

    [BindableProperty]
    [FormsProperty]
    public bool Overwrite { get; set; }

    [BindableProperty]
    [FormsProperty]
    public Composite.Media.ImageCrop.AspectRatio AspectRatio { get; set; }

    
 public override void BindStateToControlProperties()
 {
    Initialize();

     var form = Request.Form;

     var selection = new Rectangle(
        Int32.Parse(form["fldCropLeft"]), 
        Int32.Parse(form["fldCropTop"]),
        Int32.Parse(form["fldCropWidth"]), 
        Int32.Parse(form["fldCropHeight"]));

     Selection = ScalingCalculations.GetSelectedAreaOnUnscaledImage(_originalImageSize, _shownImageSize, selection, null);

     Overwrite = form["fldOverwrite"] == "1";

     string aspectRatio = form["fldAspectRatio"];

     AspectRatio = null;
     if(!string.IsNullOrEmpty(aspectRatio))
     {
         string[] aspects = aspectRatio.Split(':');
         AspectRatio = new AspectRatio("", Int32.Parse(aspects[0]), Int32.Parse(aspects[1]));
     }
 }

 void Initialize()
 {  
    Size? imageSize = ImageUtil.GetSize(MediaFile);
    Verify.IsNotNull(imageSize, "Failed to get image proportions. Check that image is not corrupt.");

    _originalImageSize = imageSize.Value;
    _shownImageSize = ScalingCalculations.GetFittingSize(ViewPortSize, _originalImageSize);
 }

	public override void InitializeViewState()
 {
        Initialize();

         _imageSrc = string.Format(CultureInfo.InvariantCulture, 
                UrlUtils.PublicRootPath + "/media({0})?mw={1}&amp;mh={2}", 
                MediaFile.KeyPath, 
                ViewPortSize.Width, 
                ViewPortSize.Height);


     }

    protected string BaseUrl = UrlUtils.PublicRootPath + "/Composite/InstalledPackages/controls/FormsControls/Composite.Media.ImageCrop/";

    string GetText(string key)
    {
        return StringResourceSystemFacade.GetString("Composite.Media.ImageCrop", key);
    }
    
    int DivideAndCeil(int dividend, int divisor)
    {
        Verify.ArgumentCondition(dividend > 0, "dividend", "Positive value expected");
        Verify.ArgumentCondition(divisor > 0, "divisor", "Positive value expected");
        
        int result = dividend / divisor;
        return (dividend == result*divisor) ? result : result + 1;
    }

</script>

<input type="hidden" name="fldCropLeft" id="fldCropLeft" />
<input type="hidden" name="fldCropTop" id="fldCropTop" />
<input type="hidden" name="fldCropWidth" id="fldCropWidth" />
<input type="hidden" name="fldCropHeight" id="fldCropHeight" />

<input type="hidden" name="fldAspectRatio" id="fldAspectRatio" />
<input type="hidden" name="fldOverwrite" id="fldOverwrite" />


<div id="source" style="background-image: url('<%= _imageSrc %>'); margin-left: <%= (ViewPortSize.Width - _shownImageSize.Width) / 2  %>px;">
    <div id="box">
        <div id="border">
            <div id="resizerTop" class="resizer">&#160;</div>
            <div id="resizerBottom" class="resizer">&#160;</div>
            <div id="resizerLeft" class="resizer">&#160;</div>
            <div id="resizerRight" class="resizer">&#160;</div>
            <div id="resizerBottomRight" class="resizer">&#160;</div>
            <div id="resizerTopLeft" class="resizer">&#160;</div>
            <div id="resizerTopRight" class="resizer">&#160;</div>
            <div id="resizerBottomLeft" class="resizer">&#160;</div> 
        </div>
    </div>
</div>


<ui:fieldgroup label="Options" xmlns:ui="http://www.w3.org/1999/xhtml">
    <ui:field>
	    <ui:fielddesc><%= GetText("ImageCropDialog.AspectRatio") %></ui:fielddesc>
	    <ui:fielddata>        

            <ui:radiodatagroup name="aspectRatio" >
	            <ui:radio label="<%= GetText("AspectRatio.None") %>" value="p1" ischecked="true" oncommand="turnOffAspectRatio();" />
                
<%-- 
	            <ui:radio label="<%= GetText("AspectRatio.Landscape") %>" value="p2;" oncommand="setAspectRatio(16, 9);" />
	            <ui:radio label="<%= GetText("AspectRatio.Portrait") %>" value="p3" oncommand="setAspectRatio(9, 16);" />
--%>                
                    
                    <% var aspectRatioCollection = ImageCropConfiguration.AspectRatios;
                        for(int i=0; i<aspectRatioCollection.Length; i++)
                        {
                            var aspectRatio = aspectRatioCollection[i];

                            bool aspectRatioApplicable =
                                (_originalImageSize.Width >= aspectRatio.Width &&
                                 _originalImageSize.Height >= aspectRatio.Height)
                                &&
                                (_originalImageSize.Width > aspectRatio.Width ||
                                 _originalImageSize.Height > aspectRatio.Height);
                            
                            int minimalWidth = 0;
                            int minimalHeight = 0;
                            
                            if(aspectRatioApplicable)
                            {
                                minimalWidth = DivideAndCeil(aspectRatio.Width * _shownImageSize.Width, _originalImageSize.Width);
                                minimalHeight = DivideAndCeil(aspectRatio.Height * _shownImageSize.Height, _originalImageSize.Height);
                            }
                            
                             %>
                    
                         <ui:radio label="<%= StringResourceSystemFacade.ParseString(aspectRatio.Title) %>" 
                                   value="a<%= i %>" 
                                   oncommand="setAspectRatio(<%= aspectRatio.Width %>, <%= aspectRatio.Height %>, <%= minimalWidth %>, <%= minimalHeight %>);" 
                                   isdisabled="<%= aspectRatioApplicable ?  "false" : "true" %>" />
                        
                    <% } %>
            </ui:radiodatagroup>
        </ui:fielddata>        
    </ui:field>
    
    <ui:field>
	    <ui:fielddesc><%= GetText("ImageCropDialog.SaveOptions") %></ui:fielddesc>
	    <ui:fielddata>        
                <ui:radiodatagroup name="Save">
	                <ui:radio label="<%= GetText("ImageCropDialog.SaveAsNewFile") %>" value="p1" ischecked="true" oncommand="setOverwrite(0);" />
	                <ui:radio label="<%= GetText("ImageCropDialog.Overwrite") %>" value="p2" oncommand="setOverwrite(1);" />
                </ui:radiodatagroup>
        </ui:fielddata>        
    </ui:field>
</ui:fieldgroup>



<script type="text/javascript">

    var cssId = 'imageCropCss';
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '<%= BaseUrl %>ImageCrop.css';
        link.media = 'all';
        head.appendChild(link);
    }

    var boxCoords = { "x": <%=_shownImageSize.Width / 4 %>, "y": <%= _shownImageSize.Height / 4 %> };
    var boxSize =   { "x": <%= _shownImageSize.Width / 2 %>, "y": <%= _shownImageSize.Height / 2 %> };
    var maxBoxSize = { "x": <%= _shownImageSize.Width %>, "y": <%= _shownImageSize.Height %> }; 

</script>

<script type="text/javascript" src="<%= BaseUrl %>ImageCrop.js"></script>