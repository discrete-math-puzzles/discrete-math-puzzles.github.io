var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function(){
    var gcd = function (a, b) {
        return (!b) ? a : gcd(b, a % b);
    };

    $('#btncheck').on('click', function () {
        var whiteFirst = $('#whitefirst').val() * 1;
        var whiteSecond = $('#whitesecond').val() * 1;
        var blackFirst = $('#blackfirst').val() * 1;
        var blackSecond = $('#blacksecond').val() * 1;

        if (!(whiteFirst >= 0) || !(blackFirst >= 0) || !(whiteSecond >= 0) || !(blackSecond >= 0)) {
            $('#fail_modal h4').text('The number of balls must be non-negative.');
            $('#fail_modal').modal('show');
            return;
        }

        if (whiteFirst + whiteSecond != 15) {
            $('#fail_modal h4').text('You should have all 15 white balls in both boxes.');
            $('#fail_modal').modal('show');
            return;
        }

        if (blackFirst + blackSecond != 15) {
            $('#fail_modal h4').text('You should have all 15 black balls in both boxes.');
            $('#fail_modal').modal('show');
            return;
        }

        if (whiteFirst + blackFirst == 0) {
            $('#fail_modal h4').text('First box should not be empty');
            $('#fail_modal').modal('show');
            return;
        }

        if (whiteSecond + blackSecond == 0) {
            $('#fail_modal h4').text('Second box should not be empty');
            $('#fail_modal').modal('show');
            return;
        }

        katex.render('' + (whiteFirst + blackFirst), document.getElementById('spannumballsfirstbox'));
        katex.render('' + whiteFirst, document.getElementById('spannumwhiteballsfirstbox'));
        katex.render('' + whiteSecond , document.getElementById('spannumwhiteballssecondbox'));
        katex.render('\\frac{1}{2}.', document.getElementById('spanprobfirstbox'));
        katex.render('\\frac{1}{2}.', document.getElementById('spanprobsecondbox'));
        katex.render('\\frac{1/2}{' + (whiteFirst + blackFirst) + '} = \\frac{1}{' + 2*(whiteFirst + blackFirst) + '}', document.getElementById('spanballfirstbox'));
        katex.render('\\frac{1/2}{' + (whiteSecond + blackSecond) + '} = \\frac{1}{' + 2*(whiteSecond + blackSecond) + '}', document.getElementById('spanballsecondbox'));

        var numerator = whiteFirst*(whiteSecond + blackSecond) + whiteSecond*(whiteFirst + blackFirst);
        var denominator = 2*(whiteFirst + blackFirst)*(whiteSecond + blackSecond);
        var cd = gcd(numerator, denominator);
        numerator  = Math.floor(numerator / cd);
        denominator = Math.floor(denominator / cd);
        katex.render(whiteFirst + '\\cdot \\frac{1}{' + 2*(whiteFirst + blackFirst) + '} + ' + whiteSecond + '\\cdot\\frac{1}{' + 2*(whiteSecond + blackSecond) + '} = \\frac{' + numerator + '}{' + denominator + '}', document.getElementById('spantotal'));

        if(numerator == 43 && denominator == 58) {
            $('#ultimatecomment').text('Congratulations! You’ve achieved the best possible probability!');
            window.q.successCb(1, [1]);
        }
        else {
            $('#ultimatecomment').text('In fact, one can achieve even higher probability. Keep on trying!');
            $('#check_modal').modal('show');
        }
    });
});
