   �         Ghttp://localhost:36859/Frontend/Scripts/ie10-viewport-bug-workaround.js     %� m�      %���
          
     O K           �      Cache-Control   max-age=2592000   Content-Type   application/javascript   Content-Encoding   gzip   Last-Modified   Sun, 11 Oct 2020 07:33:20 GMT   Accept-Ranges   bytes   ETag   "cc847cba09fd61:0"   Vary   Accept-Encoding   Server   Microsoft-IIS/10.0   X-SourceFiles   �=?UTF-8?B?QzpcVXNlcnNcREVMTFxEZXNrdG9wXEMxX0NNU19UTcSQVFxDMS1DTVNfR3JvdXAxOV8yMFxXZWJzaXRlXEZyb250ZW5kXFNjcmlwdHNcaWUxMC12aWV3cG9ydC1idWctd29ya2Fyb3VuZC5qcw==?=   X-Powered-By   C1 CMS, ASP.NET   Date   Sun, 11 Oct 2020 07:34:15 GMT /*!
 * IE10 viewport hack for Surface/desktop Windows 8 bug
 * Copyright 2014 Twitter, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License. For
 * details, see http://creativecommons.org/licenses/by/3.0/.
 */

// See the Getting Started docs for more information:
// http://getbootstrap.com/getting-started/#support-ie10-width

(function () {
  'use strict';
  if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }
})();
