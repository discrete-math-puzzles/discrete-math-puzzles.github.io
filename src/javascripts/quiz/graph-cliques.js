var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/graph-cliques.styl');
var core = require('../core');

$(function(){
    var GraphCliques = function (targetName, mode, targetSelection, cb) {
        this.mode = mode || 'rect';
        this._cb = cb || function () {};
        this.targetSelection = targetSelection;
        var maxSize = 600;
        this.snap = Snap(targetName + ' svg').attr({ viewBox: '-40 -20 ' + maxSize + ' ' + (maxSize - 100) });
        this.error1 = $(targetName + ' .graph-cliques-error1');
        this.error2 = $(targetName + ' .graph-cliques-error2');
        this.active = {};
        this.rects = [];
        this.snap.selectAll('image').forEach(function (image, i) {
            var attr = image.attr();
            var rect;
            var radius = (~~attr.height + 20)/2;
            rect = this.snap.circle(
                attr.x - 10 + (~~attr.width + 20)/2,
                attr.y - 10 + (~~attr.height + 20)/2,
                radius
            ).attr('stroke-width', 3);
            this.rects.push(rect);
            rect.attr({ fill: 'transparent', id: i });

            rect.mousedown(this.imageClick.bind(this, rect, i));
        }.bind(this));
        return this;
    };

    GraphCliques.prototype.validate = function () {
        var active = [];
        for (var key in this.active) {
            if (this.active[key]) {
                active.push(key);
            }
        }
        for (var i = 0; i < active.length; i++) {
            var firstActive = active[i];
            for (var j = 0; j < active.length; j++) {
                var secondActive = active[j];
                if (i !== j) {
                    var edge = this.snap.select('path[id="' + [firstActive, secondActive].sort().join('$')+ '"]');
                    if (this.mode === 'circle') {
                        if (!edge) {
                            this.error1.show();
                            this.error2.hide();
                            return;
                        }
                    } else {
                        if (edge) {
                            this.error1.show();
                            this.error2.hide();
                            return;
                        }
                    }
                }
            }
        }

        if (active.length !== this.targetSelection.length) {
            this.error1.hide();
            this.error2.show();
            return false;
        }

        this.error1.hide();
        this.error2.hide();
        return true;
    };

    GraphCliques.prototype.imageClick = function (e, i) {
        if (!this.active[i]) {
            e.attr('stroke', this.mode === 'circle' ? 'black' : 'blue');
            this.active[i] = true;
        } else {
            e.attr('stroke', 'none');
            this.active[i] = false;
        }

        return this;
    };

    GraphCliques.prototype.reset = function () {

        this.active = {};
        this.rects.forEach(function (rect) {
            rect.attr('stroke', 'none');
        });
        return this;
    };

    var firstTarget = [4, 7, 6, 0];

    var secondTarget = [1, 3, 6, 5];

    var graphCliques1 = new GraphCliques(
        '#graphCliques0',
        'circle',
        firstTarget,
        function () {
            window.q.successCb(0, [0, 1, 2]);
        });

    var graphCliques2 = new GraphCliques(
        '#graphCliques1',
        'rect',
        secondTarget,
        function () {
            window.q.successCb(1, [0, 1, 2]);
        });

    var list = [graphCliques1, graphCliques2];

    $('.check-quiz').on('click', function() {
        var id = $(this).data('id') - 1;
        if (id < 2) {
            if (list[id].validate()) {
                list[id]._cb();
            }
        }
    });

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        if (id < 2) {
            list[id].reset();
        }
    });
});
