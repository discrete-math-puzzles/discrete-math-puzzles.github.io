var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/split-weights.styl');
var core = require('../core');

$(function () {
    var $modal = $('#congratulations_modal');
    var levels = [1, 2];

    $('.tab-pane').on('click', 'input[type="checkbox"]', function () {
        var $pane = $('.tab-pane.active');
        var $result = $pane.find('#result');
        var $checkboxes = $pane.find('input[type="checkbox"]');
        var data = $pane.attr('id') === 'level1' ? [1,2,3,4,5,7] : [1,2,3,4,5,6];

        var result = $checkboxes.toArray().reduce(function (result, checkbox, i) {
            var multiplicator = $(checkbox).prop('checked') ? 1 : -1;

            return result + (multiplicator * data[i]);
        }, 0);

        if (!result) {
            var item = $pane.attr('id');

            window.q.successCb(item, levels);
        }

        $result.text(result);
    });

    $('.tab-pane').on('click', '.reset', function () {
        var $pane = $('.tab-pane.active');
        var $result = $pane.find('#result');
        var $checkboxes = $pane.find('input[type="checkbox"]');
        var result = $pane.attr('id') === 'level1' ? 22 : 21;

        $checkboxes.each(function(){ this.checked = true; });
        $result.text(result);
    });

    $('.impossible').on('click', function (e) {
        var id = $(e.target).data('id');

        if (id == 1) {
            window.q.successCb(id, levels);
        } else {
            $('#possible_modal').modal('show');
        }
    });
});
