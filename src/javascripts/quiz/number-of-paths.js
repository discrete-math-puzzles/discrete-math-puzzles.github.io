var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function () {
    var NumberOfPaths = function (targetName, prev, fontSize, targetValue, cb) {
        this.snap = Snap($(targetName + ' svg')[0]);
        this.targetValue = targetValue;
        this.input = $(targetName + ' input');
        this.input.keyup(this.onInput.bind(this));
        this.prev = prev;
        this.textGroup = this.snap.g();
        this.circleGroup = this.snap.g();
        this.circles = [];
        this.texsts = [];
        this.active = null;
        this.backCircles = [];
        this.snap.selectAll('ellipse').forEach(function (el, i) {
            var attr = el.attr();
            this.backCircles.push(el);
            var text = this.snap.text(~~attr.cx - fontSize/ 2, ~~attr.cy + fontSize / 4, this.isStart(i) ? '1' : '')
                .attr('font-size', fontSize)
                .prepend(this.group);
            text.attr({
                'data-cx': attr.cx,
                'data-cy': attr.cy,
                x: (~~attr.cx - fontSize / 4 ),
                y: (~~attr.cy + fontSize / 4)
            });
            this.texsts.push(text);
            var circle = this.snap.circle(
                attr.cx,
                attr.cy,
                attr.rx
            )
                .attr({ fill: 'transparent', stroke: 'none' })
                .click(this.handleClick.bind(this, i))
                .prepend(this.circleGroup);

            this.circles.push(circle);

        }.bind(this));

        this._cb = cb || function () {};
    };

    NumberOfPaths.prototype.setText = function (i, value) {
        var text = this.texsts[i];
        var attr = text.attr();
        var cx = attr['data-cx'];
        var cy = attr['data-cy'];
        text.attr({ text: (value + '').slice(0,2) });
        var bBox = text.getBBox();
        text.attr({
            x: (~~cx - bBox.width / 2 ),
            y: (~~cy + bBox.height / 4),
        });

    };

    NumberOfPaths.prototype.isStart = function (i) {
        return !this.prev(i).length;
    };

    NumberOfPaths.prototype.onInput = function (e) {
        var value = ~~e.target.value || '';
        if (this.active != null) {
            this.setText(this.active, value > 0 ? value : '');
        }
    };

    NumberOfPaths.prototype.activate = function (i) {
        this.backCircles[i].attr('fill', 'green');

        this.input.val($(this.texsts[i].node).text());
        this.input.attr({ disabled: false });
        this.input.focus().select();
        this.active = i;
    };

    NumberOfPaths.prototype.invalidate = function (i) {
        this.backCircles[i].attr('fill', 'red');
    };

    NumberOfPaths.prototype.isValid = function (i) {
        var text = this.texsts[i];
        var value = ~~$(text.node).text();
        var actialValue = 0;
        var prevs = this.prev(i);
        for (var j = 0; j < prevs.length; j++) {
            var prevId = prevs[j];
            var prevValue = ~~$(this.texsts[prevId].node).text();
            actialValue += prevValue
        }
        return actialValue && actialValue == value;
    };

    NumberOfPaths.prototype.check = function () {
        this.diactivate();
        if (this.targetValue) {
            var targetText = this.texsts[this.targetValue.id];
            var value = ~~$(targetText.node).text();
            if (value == this.targetValue.value) {
                return true;
            }
        }

        var result = true;
        for (var j = 0; j < this.texsts.length; j++) {
            if (!this.isStart(j)) {
                if (!this.isValid(j)) {
                    this.invalidate(j);
                    result = false
                }
            }
        }
        return result;
    };

    NumberOfPaths.prototype.diactivate = function () {
        this.input.attr({ disabled: true })
        this.input.val('');
        if (this.active != null) {
            this.backCircles[this.active].attr('fill', 'white');
            this.active = null;
        }
    };

    NumberOfPaths.prototype.handleClick = function (i) {
        if (!this.prev(i).length) {
            return;
        }
        this.diactivate();
        this.activate(i);
    };

    NumberOfPaths.prototype.init = function () {
        return this;
    };

    NumberOfPaths.prototype.flush = function () {
        this.texsts.forEach(function (text, i) {
            if (!this.isStart(i)) {
                this.setText(i, '');
                this.diactivate();
                this.backCircles.forEach(function (back) {
                    back.attr('fill', 'white');
                })
            }
        }.bind(this));
        return this;
    };

    var data = [0, 1, 2, 3];
    var fontSizes = [60, 40, 60, 55];
    var answers = [undefined, { id: 4, value: 35 }, { id: 3, value: 40 }, { id: 5, value: 16 }];
    var prevs = [function (i) {
        var prev = {
            0: [],
            1: [0],
            2: [0],
            3: [0,2],
            4: [1, 3],
            5: [2],
            6: [4, 5],
            7: [4],
            8: [5, 6],
            9: [6, 7, 8],
        };
        return prev[i];
    }, function (i) {
        var prevs = [];
        var prevA = Math.max(0, i-1);
        if (prevA >= 0 && (i % 5 > 0)) {
            prevs.push(prevA);
        }
        var prevB = i + 5;
        if (prevB < 20) {
            prevs.push(prevB)
        }
        return prevs;
    }, function (i) {
        var prev = {
            0: [],
            1: [0,0,0,0],
            2: [1,1],
            3: [2,2,2,2,2]
        };
        return prev[i];
    }, function (i) {
        var prev = [];
        for (var j = 0; j < i; j++) {
            prev.push(j);
        }
        return prev;
    }];
    var queens = data.reduce(function (result, item) {
        result.push(new NumberOfPaths(
            '#numberOfPaths' + item,
            prevs[item],
            fontSizes[item],
            answers[item],
            function () {
                window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;
        queens[id].flush().init();
    });

    $('.submit-map').on('click', function () {
        var id = $(this).data('id') - 1;
        if (queens[id].check()) {
            window.q.successCb(id, data);
        }
    });
});
