var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/summing-up-digits.styl');
var core = require('../core');

$(function () {
    var targetSum = [0, 1, 2, 100];

    function SummingUpDigits(selector, targetSum, cb) {
        this._cb = cb;
        this.targetSum = targetSum;
        this.signs = $(selector).find('input[type="checkbox"]');
        this.signs.click(this.recalculate.bind(this));
        this.display = $(selector).find('#result');
    }

    SummingUpDigits.prototype.init = function () {
        this.signs.toArray().forEach(function (checkbox, i) {
            checkbox.checked = !(i % 2)
        });
        this.recalculate();
        return this;
    };

    SummingUpDigits.prototype.recalculate = function () {
        var sum = this.signs.toArray().reduce(function (sum, checkbox, i) {
            return sum + ~~(checkbox.checked ? i + 1 : -(i + 1))
        }, 0);
        if (sum == this.targetSum) {
            this._cb();
        }
        this.display.text(sum);
    };

    SummingUpDigits.prototype.flush = function () {
        return this;
    };

    var data = [1,2,3,4];
    var summing = data.reduce(function (result, item) {
        result.push(new SummingUpDigits(
            '#level' + item,
            targetSum[item - 1],
            function () {
                window.q.successCb(item - 1, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        summing[id].flush().init();
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');

            if (level != 1) {
                window.q.successCb(level, data);
            }
        }
    });
});
