var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/largest-number.styl');
var core = require('../core');

$(function() {
    var levels = {
        1: { i: [2, 3, 9],                       s: [9, 3, 2] },
        2: { i: [6, 61, 68],                     s: [68, 6, 61] },
        3: { i: [4, 42, 46, 427, 465],           s: [465, 46, 4, 427, 42] },
        4: { i: [5, 52, 57, 517, 532, 569, 581], s: [581, 57, 569, 5, 532, 52, 517] }
    }

    Object.keys(levels).forEach(initLevel);

    function initLevel(id) {
        var items = levels[id].i.reduce(function (acc, value) {
            return acc + '<div class="sortable-item">' + value + '</div>';
        }, '');

        $('#level' + id + ' .content')
            .html(items)
            .sortable({
                stop: function(event, ui) {
                    var $activePane = $('.tab-pane.active');
                    var level = $activePane.attr('id').replace('level', '');
                    var currentValues = $activePane
                        .find('.sortable-item')
                        .map(function(id, item) {
                            return Number(item.innerText);
                        });
                    var targetValues = levels[level].s;

                    var success = true;

                    for (var i = 0; i < targetValues.length; i++) {
                        if (targetValues[i] !== currentValues[i]) {
                            success = false;
                        }
                    }

                    if (success) {
                        window.q.successCb(level, Object.keys(levels));
                    }
                }
            })
            .disableSelection();
    }

    $('.reset').click(function() {
        var $activePane = $('.tab-pane.active');
        var level = $activePane.attr('id').replace('level', '');

        initLevel(level);
    })
});
