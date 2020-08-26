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

    var data = [1, 2, 3, 4];
    var numbers = data.reduce(function(result, item, i) {
        result.push(new Numbers(
            '#number' + i,
            function (value) {
                if ((Number(value) / Number(String(value).slice(1))) === (i * 10 + 7)) {
                    return true;
                }

                return false;
            },
            function () {
                window.q.successCb(i, data);
            }
        ));

        return result;
    }, []);

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');
            if (level == 2 || level == 4) {
                window.q.successCb(level, data);
            }
        }
    });
});
