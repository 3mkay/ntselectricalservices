//Must have jQuery on page

var $jlcookie_control = jQuery.noConflict();

$jlcookie_control(document).ready(function(){

    gjlcookie_control = new jlcookie_control($jlcookie_control);
    gjlcookie_control.init();

});

/*
 * JS for JLCookieControl
 *
 * RSTO Copyright 2012
 *
 * Author: Russ McKay
 * V1.4 - 9 Nov 12
 *
 * 6 Jul 12 - Russ McKay - 8098056 - Changed cookie name from RSTO_CookieControl to JL_CookieControl
 * 9 November 12 - Bodie Ho - 21712388 - Change cookie control to inferred agreement
 * 11 February 13 - Bodie Ho - 24627325 - Change wording on initial Cookie Control display
 *
 */

function jlcookie_control($j){

    //Private properties
    var $ = $j;
    var COOKIE_NAME = "JL_CookieControl"; //name of permission cookie
    var COOKIE_EXPIRES = "90"; //how many days should permission cookie persist
    var GA_CODE_DIV = "analyticsGACode";
    var DELETE_ON_BLOCK = true; //Delete blocked cookies when user selects block or not
    //Will not delete HttpOnly flag cookies via JS!
    var COOKIES_BLOCKED = ["__atuvc", "__utma", "__utmb", "__utmc", "__utmz"]; //cookies to block
    var FB_ELEMENT = "#jlfacebook"; //FB element selector
    var AT_ELEMENT = ".addthis_toolbox"; //AddThis element selector
    var SHOWING_COOKIE_ELEMENTS = true; //Keeps track of whether the cookies elements are visible or not

    var POS = 'tl';
    var TIMEOUT = 0;
    var MSG_TIMEOUT = 0;
    var OPT = 'in'; //in or out
    var INFO_URL = '';

    var CORNER_SIZE_MIN = "150" //width/height of minimised corner in pixels
    var CORNER_SIZE_MAX = "200" //width/height of maximised corner in pixels
    var CLOSED_ON_OPEN = true; //opens when page loads if true

    var cookiesAllowed = false; //Default - cookies allowed or not

    var radAngle = 0;
    var rotateDirection = 1; //1 = open, 0 = close
    var rotateTimeout;

    var tmsgTimeout;
    var showMsg = true;

    //Public methods
    this.init = init;

    function init(){
        //Get Settings
        POS = $('#jlcookie_controlSettings').attr('data-jlcookie_controlPos');
        TIMEOUT = $('#jlcookie_controlSettings').attr('data-jlcookie_controlTimeout');
        MSG_TIMEOUT = $('#jlcookie_controlSettings').attr('data-jlcookie_controlMsgTimeout');
        OPT = $('#jlcookie_controlSettings').attr('data-jlcookie_controlOpt');
        INFO_URL = $('#jlcookie_controlSettings').attr('data-jlcookie_controlInfoURL');

        //deleteCookie(COOKIE_NAME);
        if(cookiesEnabled()){
            if(getPermissionCookie() != undefined){
                //Enable features requiring cookies
                showMsg = false;
                if(cookiesAllowed){
                    addGoogleAnalytics();
                    showControl();
                }
                else{
                    showControl();
                    hideCookieElements();
                }
            }
            else{
                //User hasn't made choice yet
                showMsg = true;
                if(OPT == 'out'){
                    allow();
                    addGoogleAnalytics();
                    showMsg = true;
                    showControl();
                }
                else{
                    showControl();
                    hideCookieElements();
                }
            }
        }
        else{
            //Hide cookie control
        }

        //alert($('#'+GA_CODE_DIV).attr('data-analyticsGACode'));
    }

    function showControl(){
        //Get settings
        var pos = $('#jlcookie_controlSettings').attr('data-jlcookie_controlPos');

        $('body').append('<div id="jlcookie_controlContainer"><div id="jlcookie_controlCorner"></div></div>');
        $('body').append('<div id="jlcookie_controlContent"><div id="jlcookie_controlOpen"></div></div>');
        $('body').append('<div id="jlcookie_controlMsg"><div class="jlcookie_controlClose"></div><strong>Cookie Control</strong><br /><br /><p>This website is enhanced by the use of cookies. Most cookies are currently blocked. Click the button below to allow their use on this website.</p><span class="jlcookie_controlMoreInfo"><a target="_blank" href="' + INFO_URL + '">More info</a></span><br /><p><span class="jlcookie_controlAllow">Allow Cookies</span></p></div>');
        $('body').append('<div id="jlcookie_controlMsgFirst"><div class="jlcookie_controlClose"></div><strong>Cookie Control</strong><br /><br /><p>This website is enhanced by the use of cookies. Most cookies are currently blocked. Click the button below to allow their use on this website.</p><span class="jlcookie_controlMoreInfo"><a target="_blank" href="' + INFO_URL + '">More info</a></span><br /><p><span class="jlcookie_controlDeny" style="float:left;">Block Cookies</span><span class="jlcookie_controlAllow">Allow Cookies</span></p></div>');
        $('body').append('<div id="jlcookie_controlMsgDeny"><div class="jlcookie_controlClose"></div><strong>Cookie Control</strong><br /><br /><p>The cookie settings on this website are set to \'allow cookies\' to give you the very best experience. If you continue without changing these settings, you consent to this - but if you want, you can change your settings at any time using the button below.</p><span class="jlcookie_controlMoreInfo"><a target="_blank" href="' + INFO_URL + '">More info</a></span><br /><p><span class="jlcookie_controlDeny">Block Cookies</span></p></div>');

        if(showMsg){ //User hasn't made choice yet
            if(cookiesAllowed){
                $('#jlcookie_controlMsgDeny').css({
                    'display': 'block'
                });
            }
            else{
                $('#jlcookie_controlMsgFirst').css({
                    'display': 'block'
                });
            }
        }

        $('#jlcookie_controlOpen').click(function(){
            if(cookiesAllowed){
                $('#jlcookie_controlMsgDeny').show('fast');
            }
            else{
                if(showMsg){ //User hasn't made choice yet
                    $('#jlcookie_controlMsgFirst').show('fast');
                }
                else{
                    $('#jlcookie_controlMsg').show('fast');
                }
            }
            clearTimeout(tmsgTimeout);
        });

        $('.jlcookie_controlClose').click(function(){
            $('#jlcookie_controlMsg').hide('fast');
            $('#jlcookie_controlMsgFirst').hide('fast');
            $('#jlcookie_controlMsgDeny').hide('fast');
        });

        $('.jlcookie_controlAllow').click(function(){
            allow();
            addGoogleAnalytics();
            $('#jlcookie_controlMsg').hide('fast');
            $('#jlcookie_controlMsgFirst').hide('fast');

        });

        $('.jlcookie_controlDeny').click(function(){
            deny();
            $('#jlcookie_controlMsgFirst').hide('fast');
            $('#jlcookie_controlMsgDeny').hide('fast');
        });

        //Set timeouts
        if(!isNaN(MSG_TIMEOUT) && MSG_TIMEOUT > 0){
            tmsgTimeout = setTimeout(function(){
                $('#jlcookie_controlMsg').hide('fast');
                $('#jlcookie_controlMsgFirst').hide('fast');
                if(OPT == 'out') $('#jlcookie_controlMsgDeny').hide('fast');
            }, MSG_TIMEOUT * 1000);
        }

        if(cookiesAllowed){
            $('#jlcookie_controlContent').css({
                'background-image': 'url("/modules/mod_jlcookie_control/tmpl/images/cookie-green.png")'
            });
        }
        else{
            $('#jlcookie_controlContent').css({
                'background-image': 'url("/modules/mod_jlcookie_control/tmpl/images/cookie.png")'
            });
        }

        switch(pos){
            case 'tl':
                $('#jlcookie_controlContainer').css({
                    'position': 'fixed',
                    'width': '70px',
                    'height': '70px',
                    'border': 'none',
                    'top': '0',
                    'left': '0',
                    'margin': '0',
                    'z-index': '1000'
                });
                $('#jlcookie_controlContent').css({
                    'position': 'fixed',
                    'width': '40px',
                    'height': '40px',
                    'border': 'none',
                    'top': '0',
                    'left': '0',
                    'z-index': '1001',
                    'background-repeat': 'no-repeat',
                    'background-position': '5px 5px'
                });
                $('#jlcookie_controlCorner').css({
                    'position': 'absolute',
                    'width': '0',
                    'height': '0',
                    'border': 'none',
                    'bottom': '0',
                    'left': '0',
                    'border-left': '0px solid transparent',
                    'border-right': '70px solid transparent',
                    'border-top': '70px solid #000',
                    'border-bottom': '0',
                    'z-index': '1000',
                    'opacity': '0.7', /* Chrome 4+, FF2+, Saf3.1+, Opera 9+, IE9, iOS 3.2+, Android 2.1+ */
                    'filter': 'alpha(opacity=70)' /* IE6-IE8 */
                });
                $('#jlcookie_controlMsg').css({
                    'top': '30px',
                    'left': '30px'
                });
                $('#jlcookie_controlMsgFirst').css({
                    'top': '30px',
                    'left': '30px'
                });
                $('#jlcookie_controlMsgDeny').css({
                    'top': '30px',
                    'left': '30px'
                });
                break;
            case 'tr':
                $('#jlcookie_controlContainer').css({
                    'position': 'fixed',
                    'width': '70px',
                    'height': '70px',
                    'border': 'none',
                    'top': '0',
                    'right': '0',
                    'margin': '0',
                    'z-index': '1000'
                });
                $('#jlcookie_controlContent').css({
                    'position': 'fixed',
                    'width': '40px',
                    'height': '40px',
                    'border': 'none',
                    'top': '0',
                    'right': '0',
                    'z-index': '1001',
                    'background-repeat': 'no-repeat',
                    'background-position': '5px 5px'
                });
                $('#jlcookie_controlCorner').css({
                    'position': 'absolute',
                    'width': '0',
                    'height': '0',
                    'border': 'none',
                    'top': '0',
                    'right': '0',
                    'border-left': '70px solid transparent',
                    'border-right': '0px solid transparent',
                    'border-top': '70px solid #000',
                    'border-bottom': '0',
                    'z-index': '1000',
                    'opacity': '0.7', /* Chrome 4+, FF2+, Saf3.1+, Opera 9+, IE9, iOS 3.2+, Android 2.1+ */
                    'filter': 'alpha(opacity=70)' /* IE6-IE8 */
                });
                $('#jlcookie_controlMsg').css({
                    'top': '30px',
                    'right': '36px'
                });
                $('#jlcookie_controlMsgFirst').css({
                    'top': '30px',
                    'right': '36px'
                });
                $('#jlcookie_controlMsgDeny').css({
                    'top': '30px',
                    'right': '36px'
                });
                break;
            case 'br':
                $('#jlcookie_controlContainer').css({
                    'position': 'fixed',
                    'width': '70px',
                    'height': '70px',
                    'border': 'none',
                    'bottom': '0',
                    'right': '0',
                    'margin': '0',
                    'z-index': '1000'
                });
                $('#jlcookie_controlContent').css({
                    'position': 'fixed',
                    'width': '40px',
                    'height': '40px',
                    'border': 'none',
                    'bottom': '0',
                    'right': '0',
                    'z-index': '1001',
                    'background-repeat': 'no-repeat',
                    'background-position': '5px 5px'
                });
                $('#jlcookie_controlCorner').css({
                    'position': 'absolute',
                    'width': '0',
                    'height': '0',
                    'border': 'none',
                    'bottom': '0',
                    'right': '0',
                    'border-left': '70px solid transparent',
                    'border-right': '0px solid transparent',
                    'border-top': '0',
                    'border-bottom': '70px solid #000',
                    'z-index': '1000',
                    'opacity': '0.7', /* Chrome 4+, FF2+, Saf3.1+, Opera 9+, IE9, iOS 3.2+, Android 2.1+ */
                    'filter': 'alpha(opacity=70)' /* IE6-IE8 */
                });
                $('#jlcookie_controlMsg').css({
                    'bottom': '30px',
                    'right': '36px'
                });
                $('#jlcookie_controlMsgFirst').css({
                    'bottom': '30px',
                    'right': '36px'
                });
                $('#jlcookie_controlMsgDeny').css({
                    'bottom': '30px',
                    'right': '36px'
                });
                break;
            case 'bl':
            default:
                $('#jlcookie_controlContainer').css({
                    'position': 'fixed',
                    'width': '70px',
                    'height': '70px',
                    'border': 'none',
                    'bottom': '0',
                    'margin': '0',
                    'z-index': '1000'
                });
                $('#jlcookie_controlContent').css({
                    'position': 'fixed',
                    'width': '40px',
                    'height': '40px',
                    'border': 'none',
                    'bottom': '0',
                    'left': '0',
                    'z-index': '1001',
                    'background-repeat': 'no-repeat',
                    'background-position': '5px 5px'
                });
                $('#jlcookie_controlCorner').css({
                    'position': 'absolute',
                    'width': '0',
                    'height': '0',
                    'border': 'none',
                    'bottom': '0',
                    'left': '0',
                    'border-left': '0px solid transparent',
                    'border-right': '70px solid transparent',
                    'border-top': '0',
                    'border-bottom': '70px solid #000',
                    'z-index': '1000',
                    'opacity': '0.7', /* Chrome 4+, FF2+, Saf3.1+, Opera 9+, IE9, iOS 3.2+, Android 2.1+ */
                    'filter': 'alpha(opacity=70)' /* IE6-IE8 */
                });
                $('#jlcookie_controlMsg').css({
                    'bottom': '30px',
                    'left': '36px'
                });
                $('#jlcookie_controlMsgFirst').css({
                    'bottom': '30px',
                    'left': '36px'
                });
                $('#jlcookie_controlMsgDeny').css({
                    'bottom': '30px',
                    'left': '36px'
                });
                break;
        }
    }


    function allow(){
        //Set permission cookie
        setCookie(COOKIE_NAME, "1", COOKIE_EXPIRES);
        cookiesAllowed = true;
        $('#jlcookie_controlContent').css({
            'background-image': 'url("/modules/mod_jlcookie_control/tmpl/images/cookie-green.png")'
        });
        if(!SHOWING_COOKIE_ELEMENTS){
            toggleFadeCookieElements();
        }
        showMsg = false;
    }

    function deny(){
        //Set permission cookie
        setCookie(COOKIE_NAME, "0", COOKIE_EXPIRES);
        cookiesAllowed = false;
        $('#jlcookie_controlContent').css({
            'background-image': 'url("/modules/mod_jlcookie_control/tmpl/images/cookie.png")'
        });
        if(SHOWING_COOKIE_ELEMENTS){
            toggleFadeCookieElements();
        }
        showMsg = false;

        if(DELETE_ON_BLOCK){
            for(i=0; i < COOKIES_BLOCKED.length; i++){
                deleteCookie(COOKIES_BLOCKED[i]);
            }
        }
    }

    function getPermissionCookie(){
        var cookieVal = getCookie(COOKIE_NAME);
        if(cookieVal == 1) cookiesAllowed = true;
        else cookiesAllowed = false;
        return cookieVal;
    }

    function addGoogleAnalytics(){
        //Get tracker code
        var GACode = $('#'+GA_CODE_DIV).attr('data-analyticsGACode');

        var url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

        $.getScript(url, function(){
            var GATracker = _gat._createTracker(GACode);
            GATracker._trackPageview();
        });

    }

    function toggleFadeCookieElements(){
        $(FB_ELEMENT).fadeToggle('fast');
        $(AT_ELEMENT).fadeToggle('fast');
        if(SHOWING_COOKIE_ELEMENTS){
            SHOWING_COOKIE_ELEMENTS = false;
        }
        else{
            SHOWING_COOKIE_ELEMENTS = true;
        }
    }

    function showCookieElements(){
        $(FB_ELEMENT).show();
        $(AT_ELEMENT).show();
        SHOWING_COOKIE_ELEMENTS = true;
    }

    function hideCookieElements(){
        $(FB_ELEMENT).hide();
        $(AT_ELEMENT).hide();
        SHOWING_COOKIE_ELEMENTS = false;
    }

    //Cookie Functions
    function cookiesEnabled(){
        return navigator.cookieEnabled;
    }

    function setCookie(c_name, value, exdays){
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    function getCookie(c_name){
        var i, x, y, ARRcookies = document.cookie.split(";");
        for(i = 0; i < ARRcookies.length; i++){
            x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if(x == c_name){
                return unescape(y);
            }
        }
    }

    function deleteCookie(c_name){
        //Delete on domain with and without www. and without being specified for bug?
        var hostnameWWW = window.location.hostname;
        var hostname = hostnameWWW.replace(/^www./gi, '');
        if(hostnameWWW == hostname) hostnameWWW = 'www.' + hostname;
        document.cookie = c_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; domain=' + hostname;
        document.cookie = c_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; domain=' + hostnameWWW;
        document.cookie = c_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT';
    }

}