var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/one-stroke.styl');

$(function () {
    var shapes = {
        'square-diagonal': {points: [[30,30],[270,30],[270,190],[30,190]], edges: [[0,1],[1,2],[2,3],[3,0],[3,1]]},
        'square-split': {points: [[30,30],[150,30],[270,30],[30,190],[150,190],[270,190]], edges: [[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]]},
        'grid': {points: [[30,30],[150,30],[270,30],[30,110],[150,110],[270,110],[30,190],[150,190],[270,190]], edges: [[0,1],[1,2],[3,4],[4,5],[6,7],[7,8],[0,3],[3,6],[1,4],[4,7],[2,5],[5,8]]},
        'house-split': {points: [[30,30],[270,30],[270,190],[30,190],[150,30],[150,190]], edges: [[0,4],[4,1],[1,2],[2,5],[5,3],[3,0],[4,5],[3,4]]},
        'house': {points: [[30,190],[30,110],[30,30],[150,30],[270,30],[270,110],[270,190],[150,190]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[3,7],[1,3],[3,5]]},
        'triangle-square': {points: [[30,30],[150,30],[270,30],[30,190],[270,190],[30,110],[270,110]], edges: [[0,1],[1,2],[2,6],[6,4],[4,3],[3,5],[5,0],[5,6],[5,1],[1,6]]}
    };

    function draw(board) {
        var shape = shapes[board.attr('data-shape')];
        var state = {edges: {}, active: false, current: null};
        var svgNS = 'http://www.w3.org/2000/svg';
        board.empty();
        shape.edges.forEach(function (edge, i) {
            var line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', shape.points[edge[0]][0]);
            line.setAttribute('y1', shape.points[edge[0]][1]);
            line.setAttribute('x2', shape.points[edge[1]][0]);
            line.setAttribute('y2', shape.points[edge[1]][1]);
            line.setAttribute('data-edge', i);
            board[0].appendChild(line);
        });
        shape.points.forEach(function (point) {
            var circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', point[0]);
            circle.setAttribute('cy', point[1]);
            circle.setAttribute('r', 7);
            circle.setAttribute('data-point', shape.points.indexOf(point));
            board[0].appendChild(circle);
        });
        function highlight(point) {
            board.find('circle').removeClass('current');
            if (point !== null) board.find('circle[data-point="' + point + '"]').addClass('current');
        }
        function nearest(event) {
            var svgPoint = board[0].createSVGPoint();
            svgPoint.x = event.clientX;
            svgPoint.y = event.clientY;
            var pointInViewBox = svgPoint.matrixTransform(board[0].getScreenCTM().inverse());
            var x = pointInViewBox.x;
            var y = pointInViewBox.y;
            var best = null, distance = 23;
            shape.points.forEach(function (point, i) { var d = Math.hypot(point[0] - x, point[1] - y); if (d < distance) { distance = d; best = i; } });
            return best;
        }
        function edgeBetween(a, b) {
            for (var i = 0; i < shape.edges.length; i++) { var e = shape.edges[i]; if (!state.edges[i] && ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) return i; }
            return -1;
        }
        function moveTo(point) {
            if (state.current === null || point === null || point === state.current) return;
            var edge = edgeBetween(state.current, point);
            if (edge !== -1) {
                state.edges[edge] = true;
                board.find('line[data-edge="' + edge + '"]').addClass('used');
                state.current = point;
                highlight(point);
                if (Object.keys(state.edges).length === shape.edges.length) {
                    var levelId = board.closest('.one-stroke-level').attr('data-level');
                    $('a[href="#one-stroke-level-' + levelId + '"]').closest('li').addClass('solved');
                    $('#congratulations_modal').modal('show');
                }
            }
        }
        board.on('pointerdown', function (event) { var point = nearest(event); if (point !== null && (state.current === null || point === state.current)) { state.active = true; if (state.current === null) { state.current = point; highlight(point); } board[0].setPointerCapture(event.pointerId); event.preventDefault(); } });
        board.on('pointermove', function (event) { if (state.active) moveTo(nearest(event)); });
        board.on('pointerup pointercancel', function () { state.active = false; });
        board.on('click', function (event) { if (!state.active) moveTo(nearest(event)); });
        board.data('reset', function () { draw(board); });
    }
    $('.one-stroke-board').each(function () { draw($(this)); });
    $('.one-stroke-level .reset').on('click', function () { $(this).closest('.one-stroke-level').find('.one-stroke-board').data('reset')(); });
    $('.one-stroke-level .impossible').on('click', function () { var level = $(this).closest('.one-stroke-level'); var impossible = level.is('[data-impossible]'); if (impossible) { var levelId = level.attr('data-level'); $('a[href="#one-stroke-level-' + levelId + '"]').closest('li').addClass('solved'); } else { $('#possible_modal h4').text("In fact, it's possible."); } $('#' + (impossible ? 'congratulations_modal' : 'possible_modal')).modal('show'); });
});
