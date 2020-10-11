<%@ WebHandler Language="C#" Class="Composite.Forms.FormBuilder.DownloadHandler" %>

using System;
using System.IO;
using System.Web;
using System.Xml.Serialization;
using Composite.Core.IO;

namespace Composite.Forms.FormBuilder
{
    /// <summary>
    /// Summary description for DownloadHandler
    /// </summary>
    public class DownloadHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var queryStr = context.Request.QueryString;

            string mode = queryStr["m"];
            string formFileName = queryStr["f"];
            bool cloudBased = bool.Parse(queryStr["c"]??"false");

            if (mode == "xls")
            {
                WriteExcelFile(context, formFileName);
                return;
            }

            if (mode == "xml")
            {
                context.Response.ContentType = "text/xml";
                context.Response.AddHeader("Content-Disposition", string.Format("attachment;filename=\"{0}.xml\"", formFileName));
                context.Response.BinaryWrite(CommonFileUtils.GenerateXml(formFileName));
                return;
            }


            Guid formId = new Guid(queryStr["id"]);
            string fileName = queryStr["n"];
            WritePostedFile(context, formFileName, formId, fileName, cloudBased);
        }

        private void WritePostedFile(HttpContext context, string formFileName, Guid formId, string fileName, bool cloudBased)
        {
            Verify.That(!formFileName.Contains("/") && !formFileName.Contains("\\"), "Forbidden characters in form name");
            Verify.That(!fileName.Contains("/") && !fileName.Contains("\\"), "Forbidden characters in file name");

            string extension = Path.GetExtension(fileName);
            string mimeType = MimeTypeInfo.GetCanonicalFromExtension(extension);

            if (!string.IsNullOrEmpty(mimeType))
            {
                context.Response.AddHeader("Content-Type", mimeType);
            }

            context.Response.AddHeader("content-disposition", "attachment;filename=" + fileName);

            if (cloudBased)
            {
                var stream = BlobFileUtils.GetAttachedFile(formFileName, formId, fileName);
                context.Response.BinaryWrite(stream);
            }
            else
            {
                string file = XmlFileUtils.GetAttachedFile(formFileName, formId, fileName);
                context.Response.WriteFile(file);
            }



        }

        private static void WriteExcelFile(HttpContext context, string formFileName)
        {
            context.Response.AddHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
            context.Response.AddHeader("content-disposition", "attachment;filename=" + formFileName.Replace(" ", "_") + ".xls");

            string file = CommonFileUtils.SerializeToExcelFriendlyFormat(formFileName);

            context.Response.Write(file);
        }

        public bool IsReusable
        {
            get { return true; }
        }
    }
}