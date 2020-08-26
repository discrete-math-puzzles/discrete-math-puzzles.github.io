var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/numbers-in-boxes.styl');
var core = require('../core');

$(function () {
    var inputs = $('.cell input');
    var inputArray = inputs.toArray();
    inputs.removeClass('error');

    function validateInputs(){
        inputs.removeClass('error');
        for(var i = 1; i < inputArray.length; ++i){
            var v1 = inputArray[i-1].value;
            var v2 = inputArray[i].value;

            if( v1 !== '' && v2 !== '' && Math.abs(v1-v2) > 3) {
                $(inputArray[i-1]).addClass('error');
                $(inputArray[i]).addClass('error');
            }
        }
    }

    inputs.each(function(i, input) {
        var value = Number(input.value) || 0;
        if(i == 0){
            input.value = 1;
            input.disabled = true;
        }
        if(i == inputs.length - 1) {
            input.value = 30;
            input.disabled = true;
        }
    }).on('change', validateInputs);

    $('.reset').on('click', function() {
        inputs.each(function(i, input) {
            if(i > 0 && i < inputs.length - 1)
                $(input).val('').removeClass('error');
        });
    });

    $('.impossible').on('click', function (e) {
        window.q.successCb(1, [1]);
    });

    $('input[type=number]').on('keydown', function(evt){
        if(evt.keyCode == 37 || evt.keyCode == 38) {
            $('input[data-index="' + (Number(this.dataset['index']) - 1) + '"]').focus();
            evt.preventDefault()
            return false;
        }
        else if(evt.keyCode == 39 || evt.keyCode == 40) {
            $('input[data-index="' + (Number(this.dataset['index']) + 1) + '"]').focus();
            evt.preventDefault()
            return false;
        }
    });
});
