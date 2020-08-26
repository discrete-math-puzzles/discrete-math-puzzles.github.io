var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/arrange-apples.styl');
var core = require('../core');

var LEVELS = [1, 2];
var STATES = [true, false];

function checkMatchingAnswer(firstSelect, secondSelect) {
    if( $(firstSelect).attr('data-answer') == $(secondSelect).attr('data-answer')) {
        $(firstSelect).addClass('empty');
        $(secondSelect).addClass('correct');

        $(firstSelect).draggable({
            revert: false,
            disabled: true
        });

        $(secondSelect).droppable({
            disabled: true
        });

        $(firstSelect).removeClass('selected').addClass('disabled');
        firstSelect = undefined;
    } else {
        $(secondSelect).addClass('incorrect').unbind('click');

        $(firstSelect).removeClass('selected');
        $(secondSelect).removeClass('incorrect');
        firstSelect = undefined;
    }
}

$(document).ready(function(){
    $('.apple').draggable({
        stack: '.apple',
        snap: '.target',
        snapMode: 'inner',
        snapTolerance: 20,
        helper: 'clone',
        zIndex: 99,
        refreshPositions: true,
        revert: true,
    }).click(function(){
        var firstSelect = $(this);
        $(firstSelect).addClass('selected');
        $('.target').bind('click');
        $('.target').click(function(){
            var secondSelect = $(this);
            $('.target').unbind('click');
            checkMatchingAnswer(firstSelect, secondSelect);
       });
    });

    $('.target').droppable({
        hoverClass: 'drop-hover',
        drop: function( event, ui ) {
            if ($('#level1.active').length) {
                var filledTargets = $('.target.ui-droppable-disabled');

                if (filledTargets.length === 15) {
                    var matrix = {};

                    filledTargets.each(function(i, el) {
                        var xy = String($(el).data('xy'));

                        if (matrix[xy[0]]) {
                            matrix[xy[0]].push(xy[1]);
                        } else {
                            matrix[xy[0]] = [xy[1]];
                        }
                    })

                    var matrixKeys = Object.keys(matrix);
                    var matrixLength = matrixKeys.length;
                    var isValid = true;

                    if (matrixLength === 3 || matrixLength === 5) {
                        for(var i = 0, l = matrixLength; i < l; i++) {
                            var rl = matrix[matrixKeys[i]].length;

                            if ((matrixLength === 3 && rl === 5) || (matrixLength === 5 && rl === 3)) {
                                for(var j = 0; j < (rl - 1); j++) {
                                    if (Math.abs(matrix[matrixKeys[i]][j] - matrix[matrixKeys[i]][j + 1]) !== 1) {
                                        isValid = false;
                                    }
                                }
                            } else {
                                isValid = false;
                            }
                        }
                    } else {
                        isValid = false;
                    }

                    if (isValid) {
                        window.q.successCb(0, LEVELS);
                    } else {
                        $('#possible_modal').modal('show');
                    }
                }
            }
          }
    });

    $('.apple').on('dragstart', function () {
        $('.card').addClass('dragstart');
        $(this).addClass('empty');
        setTimeout(function() {
            $('.card').addClass('dragging');
        }, 100 );
    });

    $('.apple').on('dragstop', function(){
        $(this).removeClass('empty');
        $('.card').removeClass('dragging').removeClass('dragstart');
    });

    $('.target').on('drop', function(event, ui){
        var firstSelect = $(ui.draggable);
        var secondSelect = $(this);
        checkMatchingAnswer(firstSelect, secondSelect);
    });

    $('.reset').on('click', function (e) {
        $('.tab-pane.active .target.correct.ui-droppable-disabled').removeClass('correct').removeClass('ui-droppable-disabled').droppable({
            disabled: false
        });
        $('.tab-pane.active .apple.ui-draggable-disabled.disabled').removeClass('disabled').removeClass('ui-draggable-disabled').draggable({
            revert: true,
            disabled: false
        });
    });

    $('.impossible').on('click', function (e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data('id');

            if (!STATES[level - 1]) {
                console.log(level - 1, LEVELS);

                window.q.successCb(level - 1, LEVELS);
            } else {
                $('#possible_modal').modal('show');
            }
        }
    });
});
