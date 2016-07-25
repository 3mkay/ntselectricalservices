
//Must have jQuery on page

var $j = jQuery.noConflict();

$j(document).ready(function(){

    var c2c = new jliovoxC2C();
    c2c.init();

});

/*
 * C2C
 *
 * Author: Russ McKay
 * V1.4 - 19 Apr 12
 * V1.5 - 4 Dec 12
 *
 * 4 Dec 12 - Bodie Ho - 20422127 - Stopped showing email address in plain text
 * 1 July 13 - Bodie Ho - 60664793 - Stop HTML from being stripped out from IOVOX header
 *
 */

//Either bind click to c2cElementClass or insert link for click
function jliovoxC2C(){

    //Private properties
    var c2cElementClass = "jliovox-c2c";
    var replaceEmailElement = ".bt-logo-name"; //Element containing email address within bt-logo
    var replaceTelephoneElement = ".bt-logo-text"; //Element containing telephone number within bt-logo
    var POSITION = "centre"; //inherit = positioned at launching element, centre = centre of screen
    var AJAX_TIMEOUT = 20000; //20 seconds
    var Z_INDEX = "100"; //z-index to use for header
    var Z_INDEX_WINDOW = "900"; //z-index to use for c2c window
    var REPLACE_EMAIL = true; //replace email address when attach to is bt-logo?
    var MAILTO_LINK = true; //mailto link for email address?
    var MSG_TIMEOUT = 12000; //clear response message afer 12 seconds
    var FADE_TIME = 400; //time for c2c window to fade in (ms)
    var DRAG_CURSOR = "auto"; //(move) cursor displayed on drag handle
    var WIN_WIDTH = "500px";
    var WIN_HEIGHT = "auto";
    var OVERLAY = true; //display overlay
    var OVERLAY_COLOUR = "#000";
    var OVERLAY_OPACITY = "60"; //percent of opactity

    var width = null; //width of c2c window
    var height = null; //height of c2c window
    var posTop = 0; //position for c2c window being vertically centred
    var posLeft = 0; //position for c2c window being horizontally centred

    //Public methods
    this.init = init;

    function init(){
        //Check if header links should be added (add if c2cHeader div exists)
        if($j('#c2cHeader').length){
            //Get class to append to
            var headerClass = $j('#c2cHeader').attr('data-c2cClass');
            if(headerClass == "") headerClass = "N0_hEAd3r_cl4sS"; //because $j('.') doesn't work :)
            //Get method of positioning header in page
            var attachTo = $j('#c2cHeader').attr('data-c2cAttachTo');

            //If header class exists and attach to header class, append link div to it
            if($j('.'+headerClass).length && attachTo == "header"){

                $j('.'+headerClass).append($j('#c2cHeader'));

                //Get style settings
                var top = bottom = left = right = 0;
                var posOrigin = $j('#c2cHeader').attr('data-c2cPosOrigin');
                var pos = $j('#c2cHeader').attr('data-c2cPos');

                //Get anti-spoofing token
                var token = $j('#c2cHeader').attr('data-token');

                switch(posOrigin){
                    case 'tl':
                        top = pos.split(",")[0];
                        left = pos.split(",")[1];
                        $j('#c2cHeader').css({	"position": "absolute",
                            "top": top+"px",
                            "left": left+"px",
                            "display": "block",
                            "z-index": Z_INDEX
                        });
                        break;
                    case 'br':
                        bottom = pos.split(",")[0];
                        right = pos.split(",")[1];
                        $j('#c2cHeader').css({	"position": "absolute",
                            "bottom": bottom+"px",
                            "right": right+"px",
                            "display": "block",
                            "z-index": Z_INDEX
                        });
                        break;
                    case 'bl':
                        bottom = pos.split(",")[0];
                        left = pos.split(",")[1];
                        $j('#c2cHeader').css({	"position": "absolute",
                            "bottom": bottom+"px",
                            "left": left+"px",
                            "display": "block",
                            "z-index": Z_INDEX
                        });
                        break;
                    case 'tr':
                    default:
                        top = pos.split(",")[0];
                        right = pos.split(",")[1];
                        $j('#c2cHeader').css({	"position": "absolute",
                            "top": top+"px",
                            "right": right+"px",
                            "display": "block",
                            "z-index": Z_INDEX
                        });
                        break;
                }
            }
            //If bt-logo classes exist and attach method is attach to template
            else if($j('.bt-logo ' + replaceTelephoneElement).length && attachTo == "bt-logo"){
                $j('.bt-logo ' + replaceTelephoneElement).html("");
                $j('.bt-logo ' + replaceTelephoneElement).append($j('#c2cHeader'));
                $j('#c2cHeader').css({	"display": "block",
                    "cursor": "pointer",
                    "padding": "0px",
                    "margin": "0px"
                });

                if(REPLACE_EMAIL == true){
                    //Get email address
                    var emailAddress = $j('#c2cHeader').attr('data-emailAddress');
                    emailAddress = base64_decode(emailAddress);
                    var emailStr = emailAddress;
                    if(MAILTO_LINK == true){
                        emailStr = '<a href="mailto:'+emailAddress+'">'+emailAddress+'</a>';
                    }

                    //Replace in template
                    $j('.bt-logo ' + replaceEmailElement).html(emailStr);
                    // Replace [EMAIL] with actual email address
                    //$j('.c2cLink').text($j('.c2cLink').text().replace('[EMAIL]',emailAddress));
                    $j('.c2cLink').html($j('.c2cLink').html().replace('[EMAIL]',emailAddress));
                }
            }

        }

        $j('body').append('<div id="jliovox-c2c-overlay"></div>'+
        '<div id="jliovox-c2c-window">'+
        '<div id="c2c-dragHandle"></div>'+
        '<div id="c2c-btlogo"></div><div id="c2c-close"></div>'+
        '<br /><br /><br /><br /><br />'+
        '<form name="c2c-form" id="c2c-form" action="#">'+
        '<h2 class="c2ch-call">You have chosen to call for free</h2>'+
        '<label for="c2c_number">Your Number</label>'+
        '<input type="text" value="" maxlength="15" id="c2c-number" name="c2c-number" />'+
        '<button type="button" id="c2c-go">Go</button>'+
        '<br /><br /><div id="c2c-response"></div>'+
        '<br /><br />'+
        '<h2 class="c2ch-steps">3 Simple Steps to Call Free</h2>'+
        '<ol>'+
        '<li>Enter your phone number (home or mobile) and click the Go button.</li>'+
        '<li>Your phone will ring.</li>'+
        '<li>Answer the phone and we will connect you free of charge.</li>'+
        '</ol>'+
        '</form>'+
        '</div>');
        $j('#jliovox-c2c-window').hide();
        $j('#jliovox-c2c-overlay').hide();

        //Make draggable
        var dragableWindow = DragHandler.attach(document.getElementById('jliovox-c2c-window'),
            document.getElementById('c2c-dragHandle'));

        width = $j('#jliovox-c2c-window').outerWidth(false); //outer width without margin
        height = $j('#jliovox-c2c-window').outerHeight(false); //outer height without margin

        //Set event to centre on window resizing (and called on window show)
        $j(window).resize(setCentredPosition);

        $j(window).scroll(function(){
            //Move overlay
            //$j('#jliovox-c2c-overlay').css({ "top": $j(window).scrollTop(),
            //								 "left": $j(window).scrollLeft()
            //								})
        });

        //**** Set CSS ****
        $j('#jliovox-c2c-window').css({ "position": "absolute",
            "top": posTop,
            "left": posLeft,
            "width": WIN_WIDTH,
            "height": WIN_HEIGHT,
            "background-color": "#fff",
            "padding": "10px",
            "border": "4px solid #eaeaea",
            "font-family": "verdana",
            "font-size": "10pt",
            "color": "#333",
            "z-index": Z_INDEX_WINDOW,
            "-webkit-border-radius": "6px",
            "-moz-border-radius": "6px",
            "border-radius": "6px",
            "-moz-background-clip": "padding",
            "-webkit-background-clip": "padding-box",
            "background-clip": "padding-box"
        });

        $j('#jliovox-c2c-overlay').css({"position": "fixed",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "100%",
            "z-index": Z_INDEX_WINDOW-1
        });

        if(OVERLAY == true){
            $j('#jliovox-c2c-overlay').css({
                "background-color": OVERLAY_COLOUR,
                "opacity": (OVERLAY_OPACITY * 0.01),
                "filter": "alpha(opacity="+ OVERLAY_OPACITY +")"
            });
        }

        $j('#c2c-dragHandle').css({		"position": "absolute",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "50px",
            "cursor": DRAG_CURSOR,
            "z-index": Z_INDEX_WINDOW+2
        });

        $j('#jliovox-c2c-window h2').css({
            "font-size": "15pt",
            "color": "#000",
            "margin-bottom": "10px",
            "padding-top": "5px",
            "z-index": Z_INDEX_WINDOW+1
        });

        $j('#jliovox-c2c-window input, #jliovox-c2c-window button').css({
            "font-size": "11pt",
            "color": "#000066",
            "border": "2px solid #005293",
            "background-color": "#fff",
            "margin-top": "0px",
            "-webkit-border-radius": "4px",
            "-moz-border-radius": "4px",
            "border-radius": "4px",
            "padding": "3px",
            "vertical-align": "middle",
            "margin-right": "3px",
            "z-index": Z_INDEX_WINDOW+1
        });

        $j('#jliovox-c2c-window label').css({
            "font-size": "11pt",
            "margin-right": "3px",
            "z-index": Z_INDEX_WINDOW+1
        });

        $j('#c2c-close').css({  "background-image": "url('/modules/mod_jliovox/tmpl/images/close_button.png')",
            "background-repeat": "no-repeat",
            "position": "absolute",
            "display": "block",
            "width": "36px",
            "height": "34px",
            "top": "2px",
            "right": "5px",
            "z-index": Z_INDEX_WINDOW+3
        });

        $j('#c2c-btlogo').css({ "background-image": "url('/modules/mod_jliovox/tmpl/images/bt_logo.png')",
            "background-repeat": "no-repeat",
            "position": "absolute",
            "display": "block",
            "width": "118px",
            "height": "57px",
            "top": "7px",
            "left": "7px",
            "z-index": Z_INDEX_WINDOW+1
        });

        $j('.c2ch-call').css({  "background-image": "url('/modules/mod_jliovox/tmpl/images/phone.png')",
            "background-repeat": "no-repeat",
            "padding-left": "40px",
            "height": "32px",
            "z-index": Z_INDEX_WINDOW+1
        });

        $j('.c2ch-steps').css({ "background-image": "url('/modules/mod_jliovox/tmpl/images/help.gif')",
            "background-repeat": "no-repeat",
            "padding-left": "40px",
            "height": "32px",
            "z-index": Z_INDEX_WINDOW+1
        });
        //**** End CSS ****

        //Bind click
        $j("."+c2cElementClass+", .c2cLink").bind("click", function(){
            //Display C2C panel and centre
            $j('#jliovox-c2c-window').fadeIn(FADE_TIME);
            setCentredPosition();

            $j('#jliovox-c2c-overlay').show();
        });

        //Ensure pointer when over C2C element
        $j("."+c2cElementClass).css("cursor", "pointer");

        //Bind overlay click
        $j("#jliovox-c2c-overlay").bind("click", function(){
            //Dismiss c2c window
            $j('#jliovox-c2c-window').hide();
            $j('#jliovox-c2c-overlay').hide();
        });

        var responseMsgTimeout;

        $j("#c2c-go").click(function(){
            //Clear timeout, empty message and show response message
            clearTimeout(responseMsgTimeout);
            $j('#c2c-response').html("");
            $j('#c2c-response').show();

            //Set loading graphic
            $j('#c2c-response').html('<img src="/modules/mod_jliovox/tmpl/images/loader.gif" alt="" height="16" width="16" />');

            $j.ajax({
                url: "index.html?option=com_jliovox&task=ajax&client_number="+$j("#c2c-number").val()+"&"+token+"=1",
                dataType: "html", //change to html for messages when complete
                cache: false,
                timeout: AJAX_TIMEOUT,
                success: function(data){
                    var msg = "";
                    //906: Client phone number is not a valid phone number
                    switch(data){
                        case "100":
                            msg = 'Your call is being connected.';
                            break;
                        case "901":
                            msg = 'Sorry there is currently an authentication error with BT.<br />Please try again later.';
                            break;
                        case "904":
                            msg = 'Please enter a valid phone number.';
                            break;
                        case "0":
                            msg = 'Please enter a phone number.';
                            break;
                        case "C":
                            msg = 'Sorry there is currently a problem connecting to BT.<br />Please try again later.';
                            break;
                        default:
                            msg = data + ' There was an error connecting your call. Please try again.';
                            break;
                    }
                    $j('#c2c-response').html(msg);
                },
                error: function(){
                    $j('#c2c-response').html("Sorry there was a connection problem. <br />Please check your internet connection and try again.");
                }
            });

            //Set timeout
            responseMsgTimeout = setTimeout(clearResponseMessage, MSG_TIMEOUT);
        });

        //Capture enter key presses on form and trigger go button click
        $j("#c2c-form").submit(function(){
            $j("#c2c-go").trigger("click");
            return false;
        });

        //Close button
        $j("#c2c-close").hover(function(){
                $j("#c2c-close").css({
                    "background-position": "0px -32px",
                    "cursor": "pointer"
                });
            },
            function(){
                $j("#c2c-close").css({
                    "background-position": "0px 0px"
                });
            }
        );

        $j("#c2c-close").click(function(){
            //Clear form and response
            $j('#c2c-number').val("");
            $j('#c2c-response').html("");

            $j('#jliovox-c2c-window').hide();
            $j('#jliovox-c2c-overlay').hide();
        });

        //}
    }

    function clearResponseMessage(){
        $j('#c2c-response').fadeOut();
    }

    function setCentredPosition(){
        var winWidth = $j(window).width();
        var winHeight = $j(window).height();

        posTop = (winHeight - height) * 0.5;
        posLeft = (winWidth - width) * 0.5;

        $j('#jliovox-c2c-window').css({ "top": posTop,
            "left": posLeft
        });
    }

}


/**
 *
 *  Crossbrowser Drag Handler
 *  http://www.webtoolkit.info/
 *
 *  Adapted by Russ McKay for handle
 **/

var DragHandler = {


    // private properties
    dragElem: null,
    handleElem: null,

    gDragElem: null,
    gHandleElem: null,

    // public method. Attach drag handler to an element.
    attach: function(dragElem, handleElem){
        DragHandler.dragElem = dragElem;
        DragHandler.handleElem = handleElem;

        handleElem.onmousedown = DragHandler.dragBegin;

        DragHandler.gDragElem = dragElem;
        DragHandler.gHandleElem = handleElem; //after onmousedown set to persist this event

        // callbacks
        dragElem.dragBegin = new Function();
        dragElem.drag = new Function();
        dragElem.dragEnd = new Function();

        handleElem.dragBegin = new Function();
        handleElem.drag = new Function();
        handleElem.dragEnd = new Function();

        return dragElem;
    },


    // private method. Begin drag process.
    dragBegin: function(e){
        var dragElem = DragHandler.dragElem = DragHandler.gDragElem;
        var handleElem = DragHandler.handleElem = DragHandler.gHandleElem;

        if(isNaN(parseInt(dragElem.style.left))) { dragElem.style.left = '0px'; }
        if(isNaN(parseInt(dragElem.style.top))) { dragElem.style.top = '0px'; }

        var x = parseInt(dragElem.style.left);
        var y = parseInt(dragElem.style.top);

        e = e ? e : window.event;
        handleElem.mouseX = e.clientX;
        handleElem.mouseY = e.clientY;

        handleElem.dragBegin(dragElem, x, y);

        document.onmousemove = DragHandler.drag;
        document.onmouseup = DragHandler.dragEnd;
        return false;
    },


    // private method. Drag (move) element.
    drag: function(e){
        var dragElem = DragHandler.dragElem;
        var handleElem = DragHandler.handleElem;

        var x = parseInt(dragElem.style.left);
        var y = parseInt(dragElem.style.top);

        e = e ? e : window.event;
        dragElem.style.left = x + (e.clientX - handleElem.mouseX) + 'px';
        dragElem.style.top = y + (e.clientY - handleElem.mouseY) + 'px';

        handleElem.mouseX = e.clientX;
        handleElem.mouseY = e.clientY;

        dragElem.drag(dragElem, x, y);

        return false;
    },


    // private method. Stop drag process.
    dragEnd: function(){
        var dragElem = DragHandler.dragElem;
        var handleElem = DragHandler.handleElem;

        var x = parseInt(dragElem.style.left);
        var y = parseInt(dragElem.style.top);

        dragElem.dragEnd(dragElem, x, y);
        handleElem.dragEnd(handleElem, x, y);

        document.onmousemove = null;
        document.onmouseup = null;

        DragHandler.dragElem = null;
        DragHandler.handleElem = null;
    }

}

function base64_decode (data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['atob'] == 'function') {
    //    return atob(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data += '';

    do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec;
}