var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/maximum-advertisement-revenue.styl');
var core = require('../core');

var results = [31, 230, 350];
var prices = [[2, 3], [5, 3, 2], [7, 5, 2, 6]];
var counters = [[0, 7, 5], [0, 20, 10, 30], [0, 17, 6, 23, 15]];
var positions = [[0, 0], [0, 0, 0], [0, 0, 0, 0]];

var selectedAdv = false;

function check(level) {
    var sum = positions[level].reduce(function(result, val, i) {
        return result + prices[level][i] * counters[level][val];
    }, 0);

    $(".tab-pane.active .revenue").text(sum);

    return sum == results[level];
}

$(document).ready(function() {
    $(".advertise").draggable({
        stack: ".advertise",
        snap: ".slot",
        snapMode: "inner",
        snapTolerance: 20,
        refreshPositions: true
    });

    $(".advertisers .advertise").click(function() {
        if ($(this).css("top") !== "0px" || $(this).css("left") !== "0px") {
            return;
        }

        selectedAdv = $(this);
    });

    function updateAndCheck(priceI, countI) {
        if ($("#level1.active").length) {
            positions[0][priceI] = countI;
            if (check(0)) {
                window.q.successCb(0, prices.length);
            }
        }

        if ($("#level2.active").length) {
            positions[1][priceI] = countI;
            if (check(1)) {
                window.q.successCb(1, prices.length);
            }
        }

        if ($("#level3.active").length) {
            positions[2][priceI] = countI;
            if (check(2)) {
                window.q.successCb(2, prices.length);
            }
        }
    }

    $(".slot")
        .droppable({ hoverClass: "drop-hover" })
        .on("drop", function(_, ui) {
            var priceI = $(ui.draggable)
                .eq(0)
                .data("item");
            var countI = $(this)
                .eq(0)
                .data("item");

            updateAndCheck(priceI, countI);
        });

    $(".slots .slot").click(function() {
        if (selectedAdv) {
            var priceI = selectedAdv.data("item");
            var countI = $(this)
                .eq(0)
                .data("item");

            selectedAdv.css({
                top: $(this).offset().top - selectedAdv.offset().top,
                left: $(this).offset().left - selectedAdv.offset().left
            });

            updateAndCheck(priceI, countI);

            selectedAdv = false;
        }
    });

    $(".reset").on("click", function(e) {
        $(".tab-pane.active .slot, .tab-pane.active .advertise").css({
            top: 0,
            left: 0
        });

        if ($("#level1.active").length) {
            positions[0] = [0, 0];
        }

        if ($("#level2.active").length) {
            positions[1] = [0, 0, 0];
        }

        if ($("#level3.active").length) {
            positions[2] = [0, 0, 0, 0];
        }

        $(".tab-pane.active .revenue").text(0);
    });
});
