$(function () {
    // Add toggling to the subtitle for levels
    $('.nav a').click(function () {
        var $link = $(this);
        var target = $link.data('target').replace('#', '.');

        $('.container .subtitle').removeClass('active');
        $(target).addClass('active');
    });

    // helper for getting value from cookies without libraries
    var getCookie = function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // helper for setting value to cookies without library
    var setCookie = function (name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
            updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }

    // default success callback for all quizzes
    var results = {};
    var successCb = function (n, data) {
        results[n] = true;
        data = data || [];

        $('.nav-tabs .active').addClass('success');

        $('#congratulations_modal').modal('show');
    };

    // adding core exportable methods to the namespace
    window.q = {
        getCookie: getCookie,
        setCookie: setCookie,
        successCb: successCb
    };
});
