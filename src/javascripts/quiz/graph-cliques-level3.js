var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/graph-cliques.styl');
var core = require('../core');

$(function () {
    var left = Snap('#graphCliques2-left svg');
    var right = Snap('#graphCliques2-right svg');
    var $errorView = $('#level3 .graph-cliques-error1');

    var circles = left.selectAll('circle').items.concat(
        right.selectAll('circle').items
    );
    var allVertsList = left.selectAll('circle').items.map(function (circle) {
        return circle.attr('id');
    });

    var edges;
    var leftEdges;

    function edgeReset() {
        leftEdges = left.selectAll('path').items;
        edges = leftEdges.concat(
            right.selectAll('path').items.map(function (edgeRight) {
                edgeRight.addClass('graph-cliques-active')
                return edgeRight;
            })
        );
        leftEdges.map(function (edge) {
            edge.attr('stroke', '').removeClass('graph-cliques-active');
        });
        edges.map(function (edge) {
            edge.attr('stroke', '').addClass('graph-cliques-edge');
        });

        return edges;
    }

    edges = edgeReset();
    edges = edges.filter((x, i) => i % 2 ? void x.remove() : true);

    var activeId = null;

    function disactive() {
        activeId = null;
        circles.forEach(function (circle) {
            circle.removeClass('active')
        })
    }

    function active(id) {
        activeId = id;
        circles.forEach(function (circle) {
            if (circle.attr('id') == id) {
                circle.addClass('active');
            }
        })
    }

    function activeEdge(activeId, id) {
        edges.forEach(function (edge) {
            var edgeId = edge.attr('id');
            if (
                [activeId, id].join(',') === edgeId
                || [id, activeId].join(',') === edgeId
            ) {
                edge.toggleClass('graph-cliques-active');
                disactive();
            }
        })
    }

    function not(a) {
        return function (b) {
            return a != b;
        }
    }

    function checkWin() {
        var edges = {};

        function checkFull(verts) {
            for (var i = 0; i < verts.length; i++) {
                var idA = verts[i];
                for (var j = i + 1; j < verts.length; j++) {
                    var idB = verts[j];
                    if (!edges[[idA, idB].join(',')]) {
                        return false
                    }
                }
            }
            return true;
        }

        leftEdges.forEach(function (edge) {
            var edgeId = edge.attr('id').split(',');
            var idA = edgeId[0];
            var idB = edgeId[1];
            if (edge.hasClass('graph-cliques-active')) {

                edges[[idA, idB].join(',')] = true;
                edges[[idB, idA].join(',')] = true;
            }
        });

        for (var i = 0; i < allVertsList.length; i++) {
            var first = allVertsList[i];
            for (var j = i + 1; j < allVertsList.length; j++) {
                var second = allVertsList[j];
                var subgraph4 = allVertsList.filter(not(first)).filter(not(second))
                if (checkFull(subgraph4)) {
                    return true;
                }
            }
        }
        return false;
    }

    circles.forEach(function (circle) {
        circle.attr('r', 30);
        circle.click(function () {
            $errorView.hide();
            var id = circle.attr('id');
            if (activeId) {
                if (activeId == id) {
                    disactive();
                } else {
                    activeEdge(activeId, id);
                    checkWin();

                }
            } else {
                active(id);
                circle.addClass('active');
            }
        })
    });

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        if (id == 2) {
            disactive();
            edgeReset();
        }
    });

    $('.check-quiz').on('click', function () {
        var id = $(this).data('id') - 1;
        if (id == 2) {
            if (checkWin()) {
                $errorView.hide();
                window.q.successCb(2, [0, 1, 2]);
            } else {
                $errorView.show();
            }
        }
    });

});
