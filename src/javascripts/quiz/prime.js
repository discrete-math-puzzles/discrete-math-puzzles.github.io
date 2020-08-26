var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/prime.styl');
var core = require('../core');

$(function () {
    var $prime = $('.prime');
    var $reset = $('.reset');
    var $check = $('.check');
    var $impossible = $('.impossible');
    var $modal = $('#prime_modal');

    var errors = {
        empty: 'You should fill field with correct number in the range. Try again!',
        nonPrime: 'Unfortunately, number is prime.',
        possible: 'Actually, it is not always prime. Try again!'
    };

    function calculate (n) {
        n = Number(n);
        return n * n + n + 41;
    };

    function isPrime (x) {
        if ((x % 2 == 0) && (x != 2)) {
            return false;
        } else if (x == 2) {
            return true;
        } else {
            var k = Math.ceil(Math.sqrt(x));
            var flag = false;

            for(i = 2; i < k + 1; i++) {
                if (x % i == 0) {
                    flag = true;
                    break;
                }
            }

            return !flag;
        }
    };

    $prime.on('keydown', 'input', function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    $prime.on('keyup', 'input', function (e) {
        e.preventDefault();
        var $target = $(e.target);

        var value = $target.val();
        var valueInt = parseInt(value, 10);

        if (valueInt <= 1 || valueInt >= 1000000) {
            $target.addClass('error');
        } else {
            $target.removeClass('error');
        }
    });

    $impossible.on('click', function () {
        $modal.find('.modal-body h4').text(errors.possible);
        $modal.modal('show');
    });

    $reset.on('click', function (e) {
        $prime.find('input').val('').removeClass('error');
    });

    $check.on('click', function (e) {
        var $input = $prime.find('input');

        if ($input.hasClass('error') || !$input.val()) {
            $modal.find('.modal-body h4').text(errors.empty);
            $modal.modal('show');
        } else {
            var n = $input.val();
            var x = calculate(n);

            if (!isPrime(x)) {
                window.q.successCb(1, [1]);
            } else {
                $modal.find('.modal-body h4').text(errors.nonPrime);
                $modal.modal('show');
            }
        }
    });
})
