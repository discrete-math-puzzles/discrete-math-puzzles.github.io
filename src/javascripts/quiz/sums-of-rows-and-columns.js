var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/sums-of-rows-and-columns.styl');
var core = require('../core');

$(function () {
    $(document).ready(function() {
        var $table = $('.sums-table');
        var $td = $('.sums-table td');
        var $reset = $('.reset');
        var $impossible =  $('.impossible');

        function checkValidChar (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                 return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }

        function jumpBetweenCellsByArrows (e) {
            if (e) {
                var $target = $(e.target);
                var id = String($target.data('id'));
                var x = Number(id[0]);
                var y = Number(id[1]);
                var nextId;

                switch (e.keyCode) {
                    case 38: // up
                        if (x > 1) { nextId = [x - 1, y].join(''); }
                        break;
                    case 40: // down
                        if (x < 3) { nextId = [x + 1, y].join(''); }
                        break;
                    case 37: // left
                        if (y > 1) { nextId = [x, y - 1].join(''); }
                        break;
                    case 39: // right
                        if (y < 5) { nextId = [x, y + 1].join(''); }
                        break;
                }

                if (nextId) {
                    $('input[data-id^=' + nextId + ']').focus();
                }
            }
        };

        $td.on('keydown', 'input', function (e) {
            checkValidChar(e);
            jumpBetweenCellsByArrows(e);
        });

        $td.on('keyup', 'input', function (e) {
            if (parseInt($(this).val())) {
                $(this).removeClass('error');
            } else {
                $(this).addClass('error');
            }

            var id = String($(this).data('id'));
            var row = id[0];
            var col = id[1];

            var rowSum = 0;
            var colSum = 0;
            var isRowEmpty = true;
            var isColEmpty = true;

            $('input[data-id^=' + row + ']').each(function(input) {
                var value = Number($(this).val());

                if (value <= 0) { isRowEmpty = false; }
                rowSum += value;
            });
            $('input[data-id$=' + col + ']').each(function(input) {
                var value = Number($(this).val());

                if (value <= 0) { isColEmpty = false; }
                colSum += value;
            });

            var $col = $('span').filter(function () { return $(this).data('id') === 'x' + col });
            var $row = $('span').filter(function () { return $(this).data('id') === row + 'x' });

            $col.text(colSum);
            if (isColEmpty) {
                colSum !== 10 ? $col.addClass('error') : $col.removeClass('error');
            }
            $row.text(rowSum);
            if (isRowEmpty) {
                rowSum !== 20 ? $row.addClass('error') : $row.removeClass('error');
            }
        });

        $reset.on('click', function () {
            $td.find('input').val('');
            $td.find('span').text(0);
        });

        $impossible.on('click', function (e) {
            window.q.successCb(1, [1]);
        });
    });
});
