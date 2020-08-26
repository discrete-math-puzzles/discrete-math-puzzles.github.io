var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/find-number.styl');
var core = require('../core');

$(function () {
    var Numbers = function (wrapperSelector, isChecked, successCb) {
        successCb = successCb || function () {};
        isChecked = isChecked || function () { return true; };

        this.inputField = $(wrapperSelector + ' .numberField');
        this.checkButton = $(wrapperSelector + ' .check');
        this.resetButton = $(wrapperSelector + ' .reset');

        this.check = function () {
            if (isChecked(this.inputField.val())) {
                this.inputField.removeClass('error');
                $('#congratulations_modal').modal('show');
                successCb();
            } else {
                this.inputField.addClass('error');
                $('#fail_modal').modal('show');
            }
        };

        this.resetButton.on('click', function() {
            this.inputField.val('').removeClass('error');
        }.bind(this));
        this.checkButton.on('click', this.check.bind(this));
        this.inputField.on('keyup', function (e) {
            if (!Number(e.currentTarget.value)) {
                 this.inputField.addClass('error');
            } else {
                 this.inputField.removeClass('error');
            }
        }.bind(this));
    }

    var data = [0];
    var numbers = data.reduce(function(result, item, i) {
        result.push(new Numbers(
            '#number' + (i + 1),
            function (value) {
                // PLACE YOUR NEW CHECK HERE >>
                if (String(value * value).slice(0, 5) === '31415') {
                    return true;
                }

                return false;
                // << PLACE YOUR NEW CHECK HERE
            },
            function () {
                window.q.successCb(i + 1, data);
            }
        ));

        return result;
    }, []);
});
