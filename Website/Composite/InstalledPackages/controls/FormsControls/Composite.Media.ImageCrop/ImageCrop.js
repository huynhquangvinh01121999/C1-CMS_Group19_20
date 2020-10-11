// Testing setup
if (typeof (boxCoords) == "undefined") {
    var boxCoords = coords(50, 200);
    var boxSize = coords(300, 170);
    var maxBoxSize = coords(800, 600);
}
// End of setup

var box = document.getElementById("box");
var source = document.getElementById("source");
var mouseDownClicked = 0;

var minBoxSize = coords(0, 0);

var resizerDownClicked = 0;

var resizing_horizontal = 0;  /* -1 - left border dragged, 0: none; 1: right border dragged*/
var resizing_vertical = 0;  /* -1 - top border dragged, 0: none; 1: bottom border dragged */

var proportionalResize = 0; /* 0 - freehand, 1 - proportional resizing */

/* Setting proportion 16:9 */
var aspectRatioX = 16;
var aspectRatioY = 9;



var dragStartMousePos;
var dragStartBoxPos;
var dragStartBoxSize;

document.onmousemove = mouseMove;
box.onmousedown = mouseDown;
document.body.onmouseup = mouseUp;
document.body.onmouseleave = mouseUp;

var resizerTop = document.getElementById("resizerTop");
var resizerLeft = document.getElementById("resizerLeft");
var resizerBottom = document.getElementById("resizerBottom");
var resizerRight = document.getElementById("resizerRight");
var resizerBottomRight = document.getElementById("resizerBottomRight");
var resizerTopLeft = document.getElementById("resizerTopLeft");
var resizerTopRight = document.getElementById("resizerTopRight");
var resizerBottomLeft = document.getElementById("resizerBottomLeft");


source.style.width = maxBoxSize.x + "px";
source.style.height = maxBoxSize.y + "px";
positionBox();

function resizerOnDown(ev) {
    resizerDownClicked = 1;
}

/**/
resizerTop.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_horizontal = 0;
    resizing_vertical = -1;
};
resizerBottom.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_horizontal = 0;
    resizing_vertical = 1;
};
resizerLeft.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_horizontal = -1;
    resizing_vertical = 0;
};
resizerRight.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_horizontal = 1;
    resizing_vertical = 0;
};
resizerBottomRight.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_horizontal = 1;
    resizing_vertical = 1;
};
resizerTopLeft.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_vertical = -1; 
    resizing_horizontal = -1;
};
resizerTopRight.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_vertical = -1; 
    resizing_horizontal = 1;
};
resizerBottomLeft.onmousedown = function (ev) {
    resizerOnDown(ev);
    resizing_vertical = 1; 
    resizing_horizontal = -1;
};

/* commands */
function turnOffAspectRatio() {
    proportionalResize = 0;
    minBoxSize.x = 0;
    minBoxSize.y = 0;
}

function setAspectRatio(widthAspect, heightAspect, minimalWidth, minimalHeight) {
    proportionalResize = 1;

    minBoxSize.x = minimalWidth;
    minBoxSize.y = minimalHeight;

    aspectRatioX = widthAspect;
    aspectRatioY = heightAspect;

    boxCoords.x = 0;
    boxCoords.y = 0;

    boxSize.x = maxBoxSize.x;
    boxSize.y = maxBoxSize.y;

    EnforceProportion();

    // Aligning selection to center
    boxCoords.x = Math.round((maxBoxSize.x - boxSize.x) / 2);
    boxCoords.y = Math.round((maxBoxSize.y - boxSize.y) / 2);

    positionBox();
}

function setOverwrite(value) {
    document.getElementById("fldOverwrite").value = value;
}


/* events */
function mouseDown(ev) {
    if(typeof(ev) == "undefined") {
        ev = window.event;
    }

    mouseDownClicked = 1;
    setDragStartVars(ev);
}
function mouseUp(ev) {
    mouseDownClicked = 0;
    resizerDownClicked = 0;
}



function mouseMove(ev) {
    ev = ev || window.event;

    if (mouseDownClicked) {
        var mousePos = mouseCoords(ev);
        if (resizerDownClicked) {
            if (resizing_vertical == 1) 
            {
                boxSize.y = Math.min(maxBoxSize.y - boxCoords.y, Math.max(minBoxSize.y, dragStartBoxSize.y + (mousePos.y - dragStartMousePos.y)));
            }
            else if (resizing_vertical == -1) {
                // BottomY should be constant
                var bottomY = boxCoords.y + boxSize.y;

                var minY = bottomY - minBoxSize.y;
                if (minY < 0) minY = 0;

                boxCoords.y = Math.min(minY, Math.max(0, dragStartBoxPos.y + (mousePos.y - dragStartMousePos.y)));
                boxSize.y = bottomY - boxCoords.y;
            }

            if (resizing_horizontal == 1) {
                boxSize.x = Math.min(maxBoxSize.x - boxCoords.x, Math.max(minBoxSize.x, dragStartBoxSize.x + (mousePos.x - dragStartMousePos.x)));
            }
            else if (resizing_horizontal == -1) {
                // RightX should be constant
                var rightX = boxCoords.x + boxSize.x;

                var minX = rightX - minBoxSize.x;
                if (minX < 0) minX = 0;

                boxCoords.x = Math.min(minX, Math.max(0, dragStartBoxPos.x + (mousePos.x - dragStartMousePos.x)));
                boxSize.x = rightX - boxCoords.x;
            }

            if (proportionalResize == 1) {
                if (resizing_vertical == 0 && resizing_horizontal != 0) {
                    boxSize.y = maxBoxSize.y - boxCoords.y;
                }

                if (resizing_vertical != 0 && resizing_horizontal == 0) {
                    boxSize.x = maxBoxSize.x - boxCoords.x;
                }

                EnforceProportion();
            }

        } else {
            boxCoords.x = Math.min(maxBoxSize.x - boxSize.x, Math.max(0, dragStartBoxPos.x + (mousePos.x - dragStartMousePos.x)));
            boxCoords.y = Math.min(maxBoxSize.y - boxSize.y, Math.max(0, dragStartBoxPos.y + (mousePos.y - dragStartMousePos.y)));
        }
        positionBox();
    }
}

/* util */

function ResizeProportionallyByX() {
    var proportionalX = Math.round((boxSize.y * aspectRatioX) / aspectRatioY);

    if (resizing_horizontal >= 0) {
        boxSize.x = proportionalX;
    }
    else {
        var bottomX = boxCoords.x + boxSize.x;

        boxCoords.x = bottomX - proportionalX;
        boxSize.x = proportionalX;
    }
}

function ResizeProportionallyByY() {
    var proportionalY = Math.round((boxSize.x * aspectRatioY) / aspectRatioX);

    if (resizing_vertical >= 0) {
        boxSize.y = proportionalY;
    }
    else {
        var bottomY = boxCoords.y + boxSize.y;

        boxCoords.y = bottomY - proportionalY;
        boxSize.y = proportionalY;
    }
}

function EnforceProportion() {
    // Searching for the biggest rectange with needed aspect ratio that still fits the selected area
    var proportionDifference = boxSize.x * aspectRatioY - boxSize.y * aspectRatioX;

    if (Math.abs(proportionDifference) > Math.min(aspectRatioX, aspectRatioY)) {
        if (proportionDifference > 0) {

            ResizeProportionallyByX();
        }
        else {
            ResizeProportionallyByY();
        }
    }
}


function positionBox() {
    var leftBorder = boxCoords.x;
    var rightBorder = 1000;
    var topBorder = boxCoords.y;
    var bottomBorder = 1000;
    
    var ieHack = 0;
    if(navigator.appName == 'Microsoft Internet Explorer') {
        ieHack = 40;
    }

    box.style.borderWidth = topBorder + "px " + rightBorder + "px " + bottomBorder + "px " + leftBorder + "px";
    box.style.width = (boxSize.x + leftBorder + rightBorder - ieHack) + "px";
    box.style.height = (boxSize.y + topBorder + bottomBorder - ieHack) + "px";

    saveChanges();
}
function setDragStartVars(ev) {
    dragStartMousePos = mouseCoords(ev);
    dragStartBoxPos = coords(boxCoords.x, boxCoords.y);
    dragStartBoxSize = coords(boxSize.x, boxSize.y);
}
function coords(x, y) {
    return {
        x: x,
        y: y
    };
}
function mouseCoords(ev) {
    if (typeof (ev.pageX ) != "undefined" && ( ev.pageX || ev.pageY)) {
        return {
            x: ev.pageX,
            y: ev.pageY
        };
    }
    return coords(
    ev.clientX + document.body.scrollLeft - document.body.clientLeft, ev.clientY + document.body.scrollTop - document.body.clientTop);
}

function saveChanges() {
    document.getElementById("fldCropLeft").value = boxCoords.x;
    document.getElementById("fldCropTop").value = boxCoords.y;
    document.getElementById("fldCropWidth").value = boxSize.x;
    document.getElementById("fldCropHeight").value = boxSize.y;

    document.getElementById("fldAspectRatio").value = proportionalResize == 0 ? "" : (aspectRatioX + ":" + aspectRatioY);
}