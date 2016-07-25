/* begin Page */

/* Created by Artisteer v3.0.0.35414 */



(function() {
    // fix ie blinking
    var m = document.uniqueID && document.compatMode && !window.XMLHttpRequest && document.execCommand;
    try { if (!!m) { m('BackgroundImageCache', false, true); } }
    catch (oh) { };
    // css helper
    var u = navigator.userAgent.toLowerCase();
    var is = function(t) { return (u.indexOf(t) != -1) };
    jQuery('html').addClass([(!(/opera|webtv/i.test(u)) && /msie (\d)/.test(u)) ? ('ie ie' + RegExp.$1)
        : is('firefox/2') ? 'gecko firefox2'
        : is('firefox/3') ? 'gecko firefox3'
        : is('gecko/') ? 'gecko'
        : is('chrome/') ? 'chrome'
        : is('opera/9') ? 'opera opera9' : /opera (\d)/.test(u) ? 'opera opera' + RegExp.$1
        : is('konqueror') ? 'konqueror'
        : is('applewebkit/') ? 'webkit safari'
        : is('mozilla/') ? 'gecko' : '',
        (is('x11') || is('linux')) ? ' linux'
            : is('mac') ? ' mac'
            : is('win') ? ' win' : ''
    ].join(' '));
})();

var _artStyleUrlCached = null;
function artGetStyleUrl() {
    if (null == _artStyleUrlCached) {
        var ns;
        _artStyleUrlCached = '';
        ns = jQuery('link');
        for (var i = 0; i < ns.length; i++) {
            var l = ns[i].href;
            if (l && /template\.ie6\.css(\?.*)?$/.test(l))
                return _artStyleUrlCached = l.replace(/template\.ie6\.css(\?.*)?$/, '');
        }
        ns = jQuery('style');
        for (var i = 0; i < ns.length; i++) {
            var matches = new RegExp('import\\s+"([^"]+\\/)template\\.ie6\\.css"').exec(ns[i].html());
            if (null != matches && matches.length > 0)
                return _artStyleUrlCached = matches[1];
        }
    }
    return _artStyleUrlCached;
}

function artFixPNG(element) {
    if (jQuery.browser.msie && parseInt(jQuery.browser.version) < 7) {
        var src;
        if (element.tagName == 'IMG') {
            if (/\.png$/.test(element.src)) {
                src = element.src;
                element.src = artGetStyleUrl() + '../images/spacer.gif';
            }
        }
        else {
            src = element.currentStyle.backgroundImage.match(/url\("(.+\.png)"\)/i);
            if (src) {
                src = src[1];
                element.runtimeStyle.backgroundImage = 'none';
            }
        }
        if (src) element.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
    }
}

jQuery(function() {
    jQuery.each(jQuery('ul.bt-menu>li:not(.bt-menu-li-separator),ul.bt-vmenu>li:not(.bt-vmenu-separator)'), function (i, val) {
        var l = jQuery(val); var s = l.children('span'); if (s.length == 0) return;
        var t = l.find('span.t').last(); l.children('a').append(t.html(t.text()));
        s.remove();
    });
});/* end Page */

/* begin Box, Sheet */

function artFluidSheetComputedWidth(percent, minval, maxval) {
    percent = parseInt(percent);
    var val = document.body.clientWidth / 100 * percent;
    return val < minval ? minval + 'px' : val > maxval ? maxval + 'px' : percent + '%';
}/* end Box, Sheet */

/* begin Layout */
jQuery(function () {
    if (!jQuery.browser.msie || parseInt(jQuery.browser.version) > 7) return;
    var c = jQuery('div.bt-content');
    if (c.length !== 1) return;
    var s = c.parent().children('.bt-layout-cell:not(.bt-content)');
    jQuery(window).bind('resize', function () {
        var w = 0; c.css('width', "100%");
        s.each(function () { w += this.clientWidth; });
        c.w = c.parent().width();c.css('width', c.w - w);
    }).trigger('resize');
    jQuery('div.bt-content-layout-row').each(function () {
        this.c = jQuery(this).children('.bt-layout-cell');
    }).bind('resize', function () {
        if (this.h == this.clientHeight) return;
        this.c.css('height', 'auto');
        this.h = this.clientHeight;
        this.c.css('height', this.h + 'px');
    }).trigger('resize');
});
/* end Layout */

/* begin VMenu */
jQuery(function() {
    jQuery('ul.bt-vmenu li').not(':first').before('<li class="bt-vsubmenu-separator"><span class="bt-vsubmenu-separator-span"> </span></li>');
    jQuery('ul.bt-vmenu > li.bt-vsubmenu-separator').removeClass('bt-vsubmenu-separator').addClass('bt-vmenu-separator').children('span').removeClass('bt-vsubmenu-separator-span').addClass('bt-vmenu-separator-span');
    jQuery('ul.bt-vmenu > li > ul > li.bt-vsubmenu-separator:first-child').removeClass('bt-vsubmenu-separator').addClass('bt-vmenu-separator').addClass('bt-vmenu-separator-first').children('span').removeClass('bt-vsubmenu-separator-span').addClass('bt-vmenu-separator-span');
});  /* end VMenu */

/* begin Button */
function artButtonSetup(className) {
    jQuery.each(jQuery("a." + className + ", button." + className + ", input." + className), function(i, val) {
        var b = jQuery(val);
        if (!b.parent().hasClass('bt-button-wrapper')) {
            if (!b.hasClass('bt-button')) b.addClass('bt-button');
            jQuery("<span class='bt-button-wrapper'><span class='bt-button-l'> </span><span class='bt-button-r'> </span></span>").insertBefore(b).append(b);
            if (b.hasClass('active')) b.parent().addClass('active');
        }
        b.mouseover(function() { jQuery(this).parent().addClass("hover"); });
        b.mouseout(function() { var b = jQuery(this); b.parent().removeClass("hover"); if (!b.hasClass('active')) b.parent().removeClass('active'); });
        b.mousedown(function() { var b = jQuery(this); b.parent().removeClass("hover"); if (!b.hasClass('active')) b.parent().addClass('active'); });
        b.mouseup(function() { var b = jQuery(this); if (!b.hasClass('active')) b.parent().removeClass('active'); });
    });
}
jQuery(function() { artButtonSetup("bt-button"); });

/* end Button */



jQuery(function() {
    artButtonSetup("button");
    artButtonSetup("readon");
    artButtonSetup("readmore");
});