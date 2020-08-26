var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/touch-all-segments.styl');
var core = require('../core');

$(function() {
    var $modal = $('.touch-all-segments__modal');

    var TOTAL_COL_COUNT = 26;
    var SELECTED_IDS = {
        0: [],
        1: [],
        2: []
    };
    var LEVELS = [
        {
            items: {
                10: [2, 15],
                8: [7, 24],
                6: [1, 8]
            },
            answer: 1
        },
        {
            items: {
                11: [15, 20],
                10: [3, 15],
                9: [7, 16],
                8: [1, 6],
                7: [17, 21],
                6: [4, 19],
                5: [2, 5]
            },
            answer: 3
        },
        {
            items: {
                13: [2, 18],
                12: [5, 10],
                11: [2, 6],
                10: [21, 23],
                9: [5, 7],
                8: [13, 15],
                7: [9, 13],
                6: [9, 21],
                5: [4, 10],
                4: [8, 11],
                3: [17, 20],
                2: [8, 17]
            },
            answer: 5
        }
    ];

    function sort(items, type) {
        var items = Object.assign({}, items);
        var keys = Object.keys(items);

        for (var i = 0; i < keys.length - 1; i++) {
            for (var j = 0; j < keys.length - 1 - i; j++) {
                var iIndex = keys[j];
                var jIndex = keys[j + 1];
                var tempItem;

                switch(type) {
                    case 'left':
                        if (items[iIndex][0] < items[jIndex][0]) {
                            tempItem = [].concat(items[iIndex]);

                            items[iIndex] = [].concat(items[jIndex]);
                            items[jIndex] = tempItem;
                        }
                        break;
                    case 'right':
                        if (items[iIndex][1] < items[jIndex][1]) {
                            tempItem = [].concat(items[iIndex]);

                            items[iIndex] = [].concat(items[jIndex]);
                            items[jIndex] = tempItem;
                        }
                        break;
                    case 'length':
                        if ((items[iIndex][1] - items[iIndex][0]) < (items[jIndex][1] - items[jIndex][0])) {
                            tempItem = [].concat(items[iIndex]);

                            items[iIndex] = [].concat(items[jIndex]);
                            items[jIndex] = tempItem;
                        }
                }
            }
        }

        return items;
    }

    function processLevels() {
        var levels = [].concat(LEVELS);

        return levels.reduce(function (result, level, key) {
            var items = {
                default: level.items,
                left: sort(level.items, 'left'),
                right: sort(level.items, 'right'),
                length: sort(level.items, 'length')
            }

            result[key] = {
                items: items,
                answer: level.answer,
                currentState: 'default'
            }

            return result;
        }, []);
    }

    function init () {
        var width = $('.tab-pane.active .lines').width() / TOTAL_COL_COUNT;

        LEVELS.forEach(function (level, i) {
            var $lines = $('#level' + i + ' .lines');
            var currentState = level.currentState;
            var lines = Object.keys(level.items[currentState]);

            lines.forEach(function (line) {
                var $line = $lines.find('[data-id=' + line + ']');
                var segment = '<div class="line" style="margin-left: ' + width * level.items[currentState][line][0] + 'px; width: ' + width * (level.items[currentState][line][1] - level.items[currentState][line][0]) + 'px"></div>';

                $line.html(segment);
            });
        });
    }

    LEVELS = processLevels();

    init();

    $(window).resize(function () {
        init();
    });

    function setActive(level, activeIds) {
        var $activePane = $('.tab-pane.active');
        var currentState = LEVELS[level].currentState;

        $activePane.find('.line-wrap').removeClass('active');

        activeIds.forEach(function (id) {
            Object.keys(LEVELS[level].items[currentState]).forEach(function (line) {
                var length = LEVELS[level].items[currentState][line];

                if (length[0] <= Number(id) && length[1] >= Number(id)) {
                    var $line = $activePane.find('.line-wrap[data-id=' + line + ']');
                    if (!$line.hasClass('active')) {
                        $line.addClass('active');
                    }
                }
            });
        });

        checkSuccess(level);
    }

    function checkSuccess(level) {
        var $activePane = $('.tab-pane.active');
        var levelsCount = Object.keys(LEVELS[level].items[LEVELS[level].currentState]).length;

        if (levelsCount === $activePane.find('.line-wrap.active').length) {
            if ($activePane.find('.divider.active').length === LEVELS[level].answer) {
                window.q.successCb(level, LEVELS.length);
            } else {
            //    $modal.modal('show');  Show dialog with "better solution"
            }
        }
    }

    $('.divider').click(function (el) {
        $(this).toggleClass('active');

        var id = $(this).data('id');
        var level = $('.tab-pane.active').attr('id').replace('level', '');
        var isEnabled = $(this).hasClass('active');

        if (isEnabled) {
            SELECTED_IDS[level].push(id);
        } else {
            var i = SELECTED_IDS[level].indexOf(id);

            SELECTED_IDS[level] = [].concat(SELECTED_IDS[level].slice(0, i), SELECTED_IDS[level].slice(i + 1));
        }

        setActive(level, SELECTED_IDS[level]);
    });

    function reset() {
        var $activePane = $('.tab-pane.active');

        $activePane.find('.line-wrap.active').removeClass('active');
        $activePane.find('.divider.active').removeClass('active');

        init();
    }

    $('.sortLength').click(function () {
        var $activePane = $('.tab-pane.active');
        var level = $activePane.attr('id').replace('level', '');

        LEVELS[level].currentState = 'length';
        SELECTED_IDS[level] = [];

        reset();
    });

    $('.sortLeft').click(function () {
        var $activePane = $('.tab-pane.active');
        var level = $activePane.attr('id').replace('level', '');

        LEVELS[level].currentState = 'left';
        SELECTED_IDS[level] = [];

        reset();
    });

    $('.sortRight').click(function () {
        var $activePane = $('.tab-pane.active');
        var level = $activePane.attr('id').replace('level', '');

        LEVELS[level].currentState = 'right';
        SELECTED_IDS[level] = [];

        reset();
    });

    $('.reset').click(function () {
        var $activePane = $('.tab-pane.active');
        var level = $activePane.attr('id').replace('level', '');

        LEVELS[level].currentState = 'default';
        SELECTED_IDS[level] = [];

        reset();
    });
})
