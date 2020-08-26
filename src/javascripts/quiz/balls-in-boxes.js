var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/balls-in-boxes.styl');
var core = require('../core');

$(function () {
    var Balls = function (targetName, id, successCount, cb) {
        this.inputs = $(targetName + ' input');
        this.result = $('.result' + id);
        this.counters = [];

        this._id = id;
        this.successCount = successCount;

        this._cb = cb || function () {};

        this.inputs.on('keyup', this.onKeyupHandler.bind(this))
    };

    Balls.prototype.onKeyupHandler = function () {
        this.counters = [];

        this.inputs.removeClass('error');

        this.inputs.each(function(i, input) {
            if (input.value !== '') {
                var value = Number(input.value);
                var index = this.counters.indexOf(value);

                if (index !== -1) {
                    $(this.inputs[index]).addClass('error');
                    $(input).addClass('error')
                }
                if (value > this.successCount || value < 0) {
                    $(input).addClass('error')
                }

                this.counters.push(value);
            } else {
                this.counters.push(false);
            }
        }.bind(this));

        var filtered = this.counters.filter(function (item) { return item !== false });
        var sum = this.counters.reduce(function(r, i) { return r + Number(i); }, 0);

        this.result.html(sum);

        if (filtered.length !== this.counters.length) {
            return;
        }

        if (sum === this.successCount && !this.inputs.closest('.balls').find('input.error').length) {
            this._cb(this._id);
        }
    };

    var triggered = false;
    var data = [60, 45, 30];

    var balls = data.reduce(function(result, item, i) {
        result.push(new Balls(
            '#balls' + (i + 1),
            i + 1,
            item,
            function () {
                window.q.successCb(i, data);
            })
        );
        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;

        balls[id].inputs.each(function(i, input) {
           $(input).val('').removeClass('error');
        });
        balls[id].result.text('0');
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');
            if (level == 3) {
                window.q.successCb(level - 1, data);
            }
        }
    });
});
