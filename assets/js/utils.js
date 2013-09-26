var utils = {
    addPrettify: function () {
        $('pre').each(function() {
            var $this = $(this);
            if (!$this.hasClass('noprettyprint')) {
                $this.addClass('prettyprint');
            }
        });
          
        $.getScript(window.BASE_URL + 'bower_components/google-code-prettify/src/prettify.js', function() {
            prettyPrint();
        });
    }
}

$(document).ready(function () {
    utils.addPrettify();

    // livereload stuff
    var hostname = (location.host || 'localhost').split(':')[0];
    if (hostname == 'localhost') {
        $.getScript('http://' + hostname + ':12345/livereload.js', function() {
            if (window.hasOwnProperty('LiveReload')) {
                console.log('Livereload enabled');
            }
        });
    }
});


