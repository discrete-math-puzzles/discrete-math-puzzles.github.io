var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/list.styl');
var core = require('../core');

$(function () {
    function handleHashChange() {
        if (window.location.hash === '') {
            $('.clear-filter').addClass('disabled');
        } else {
            $('.clear-filter').removeClass('disabled');

            $('a[data-target="#tags"]').click()

            $('html, body').animate({
                scrollTop: $(window.location.hash).offset().top
            }, 2000);
        }
    }

    window.onhashchange = handleHashChange;

    handleHashChange();
});
