jQuery(function() {
    var cc = jQuery('#jlcookie_controlSettings');
    var ga = jQuery('#analyticsGACode');
    if(cc.length < 1 && ga.length > 0){
        var GACode = ga.attr('data-analyticsGACode');

        var url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

        jQuery.getScript(url, function(){
            var GATracker = _gat._createTracker(GACode);
            GATracker._trackPageview();
        });
    }
});