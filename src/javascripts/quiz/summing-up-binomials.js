var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/summing-up-digits.styl');
var core = require('../core');

$(function () {
    var targetSum = [128, 0, 64, 0];

    function SummingUpBinomials(selector, targetSum, cb) {
        this._cb = cb;
        this.targetSum = targetSum;
        this.signs = $(selector).find('input[type="checkbox"]');
        this.signs.click(this.recalculate.bind(this));
        this.display = $(selector).find('#result');
    }

    SummingUpBinomials.prototype.init = function () {
        this.signs.toArray().forEach(function (checkbox, i) {
            var value = ~~$(checkbox).attr('data-value');
            checkbox.checked = value > 0;
        });
        this.recalculate();
        return this;
    };

    SummingUpBinomials.prototype.recalculate = function () {
        var sum = this.signs.toArray().reduce(function (sum, checkbox, i) {
            var value = Math.abs(~~$(checkbox).attr('data-value'));
            return sum + ~~(checkbox.checked ? value : -(value))
        }, 0);
        if (sum == this.targetSum) {
            this._cb();
        }
        this.display.text(sum);
    };

    SummingUpBinomials.prototype.flush = function () {
        return this;
    };

    var data = [1,2,3,4];
    var summing = data.reduce(function (result, item) {
        result.push(new SummingUpBinomials(
            '#level' + item,
            targetSum[item-1],
            function () {
                window.q.successCb(item - 1, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        summing[id].flush().init();
    });
});
