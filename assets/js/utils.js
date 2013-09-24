var utils = {
  addPrettify: function () {
    $('pre').each(function() {
        var $this = $(this);
        if (!$this.hasClass('noprettyprint')) {
            $this.addClass('prettyprint');
        }
    });
      
    $.getScript(window.BASE_URL + 'assets/js/prettify.js', function() {
        prettyPrint();
    });
  }
}

$(document).ready(function () {
    utils.addPrettify();
});
