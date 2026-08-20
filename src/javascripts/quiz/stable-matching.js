var css = require('../../stylesheets/stable-matching.styl');

function createRank(preferences) {
    return preferences.map(function (list) {
        var rank = {};
        list.forEach(function (val, idx) {
            rank[val] = idx;
        });
        return rank;
    });
}

function isFiniteNumber(x) {
    return typeof x === 'number' && Number.isFinite(x);
}

function findBlockingPair(instance, matchL, matchR) {
    var n = instance.n;
    var rankL = createRank(instance.leftPrefs);
    var rankR = createRank(instance.rightPrefs);

    for (var li = 0; li < n; li++) {
        for (var rj = 0; rj < n; rj++) {
            if (matchL[li] === rj) {
                continue;
            }

            var currentR = matchL[li];
            var currentL = matchR[rj];

            var leftBetter =
                !isFiniteNumber(currentR) ||
                rankL[li][rj] < rankL[li][currentR];

            var rightBetter =
                !isFiniteNumber(currentL) ||
                rankR[rj][li] < rankR[rj][currentL];

            if (leftBetter && rightBetter) {
                return {
                    li: li,
                    rj: rj,
                    liCurrent: currentR,
                    rjCurrent: currentL,
                };
            }
        }
    }

    return null;
}

function isPerfectMatching(n, matchL, matchR) {
    for (var i = 0; i < n; i++) {
        if (!isFiniteNumber(matchL[i]) || !isFiniteNumber(matchR[i])) {
            return false;
        }
    }
    return true;
}

function StableMatchingLevel($root, instance) {
    this.$root = $root;
    this.instance = instance;
    this.n = instance.n;

    this.$graph = $root.find('[data-role="graph"]');
    this.$edges = $root.find('[data-role="edges"]');
    this.$left = $root.find('[data-role="side-left"]');
    this.$right = $root.find('[data-role="side-right"]');

    this.selected = null; // { side: 'L'|'R', i: number }
    this.matchL = Array.from({ length: this.n }, function () { return null; });
    this.matchR = Array.from({ length: this.n }, function () { return null; });

    this._onResize = this.renderEdges.bind(this);
}

StableMatchingLevel.prototype.init = function () {
    this.$left.empty();
    this.$right.empty();
    this.$edges.empty();
    this.clearSelection();
    this.clearMarkers();

    var i;
    for (i = 0; i < this.n; i++) {
        this.$left.append(this.renderVertex('L', i));
        this.$right.append(this.renderVertex('R', i));
    }

    this.bindHandlers();
    this.renderEdges();

    $(window).on('resize', this._onResize);
};

StableMatchingLevel.prototype.destroy = function () {
    $(window).off('resize', this._onResize);
};

StableMatchingLevel.prototype.renderVertex = function (side, idx) {
    var prefs = side === 'L' ? this.instance.leftPrefs[idx] : this.instance.rightPrefs[idx];
    var label = side === 'L' ? this.instance.leftLabels[idx] : this.instance.rightLabels[idx];

    var $row = $('<div class="stable-matching__row"></div>');
    $row.addClass(side === 'L' ? 'stable-matching__row--left' : 'stable-matching__row--right');
    var $vertex = $('<button type="button" class="stable-matching__vertex" data-role="vertex"></button>');
    $vertex.attr('data-side', side);
    $vertex.attr('data-idx', String(idx));
    $vertex.text(label);

    var $prefs = $('<div class="stable-matching__prefs" data-role="prefs"></div>');
    var $line = $('<div class="stable-matching__prefs-line"></div>');

    var otherLabels = side === 'L' ? this.instance.rightLabels : this.instance.leftLabels;
    prefs.forEach(function (p, j) {
        var $item = $('<span class="stable-matching__pref-item"></span>');
        $item.attr('data-pref', otherLabels[p]);
        $item.text(otherLabels[p]);
        $line.append($item);
        if (j !== prefs.length - 1) {
            $line.append(document.createTextNode('>'));
            $line.append(document.createElement('wbr'));
        }
    });

    $prefs.append($line);

    if (side === 'L') {
        $row.append($prefs, $vertex);
    } else {
        $row.append($vertex, $prefs);
    }

    return $row;
};

StableMatchingLevel.prototype.bindHandlers = function () {
    var self = this;

    this.$root.find('[data-role="vertex"]').off('click').on('click', function () {
        var $v = $(this);
        var side = $v.data('side');
        var idx = Number($v.data('idx'));
        self.onVertexClick({ side: side, i: idx });
    });
};

StableMatchingLevel.prototype.onVertexClick = function (vertex) {
    this.clearMarkers();

    if (!this.selected) {
        this.selected = vertex;
        this.updateSelectionUI();
        return;
    }

    if (this.selected.side === vertex.side) {
        this.selected = vertex;
        this.updateSelectionUI();
        return;
    }

    var left = this.selected.side === 'L' ? this.selected.i : vertex.i;
    var right = this.selected.side === 'R' ? this.selected.i : vertex.i;

    if (this.matchL[left] === right) {
        this.removeEdge(left, right);
    } else {
        this.addEdge(left, right);
    }

    this.clearSelection();
    this.renderEdges();
    this.updatePrefsHighlights();
};

StableMatchingLevel.prototype.addEdge = function (left, right) {
    var existingRight = this.matchL[left];
    if (isFiniteNumber(existingRight)) {
        this.matchR[existingRight] = null;
    }

    var existingLeft = this.matchR[right];
    if (isFiniteNumber(existingLeft)) {
        this.matchL[existingLeft] = null;
    }

    this.matchL[left] = right;
    this.matchR[right] = left;
};

StableMatchingLevel.prototype.removeEdge = function (left, right) {
    if (this.matchL[left] !== right) {
        return;
    }
    this.matchL[left] = null;
    this.matchR[right] = null;
};

StableMatchingLevel.prototype.clearSelection = function () {
    this.selected = null;
    this.updateSelectionUI();
};

StableMatchingLevel.prototype.updateSelectionUI = function () {
    this.$root.find('[data-role="vertex"]').removeClass('is-selected');
    if (!this.selected) {
        return;
    }
    this.$root
        .find('[data-role="vertex"][data-side="' + this.selected.side + '"][data-idx="' + this.selected.i + '"]')
        .addClass('is-selected');
};

StableMatchingLevel.prototype.updatePrefsHighlights = function () {
    var self = this;
    this.$root.find('.stable-matching__pref-item').removeClass('is-chosen');

    function markChosen(side, idx, otherLabel) {
        var $row = self.$root.find('[data-role="vertex"][data-side="' + side + '"][data-idx="' + idx + '"]').closest('.stable-matching__row');
        $row.find('.stable-matching__pref-item[data-pref="' + otherLabel + '"]').addClass('is-chosen');
    }

    for (var li = 0; li < this.n; li++) {
        var rj = this.matchL[li];
        if (isFiniteNumber(rj)) {
            markChosen('L', li, this.instance.rightLabels[rj]);
        }
    }

    for (var r = 0; r < this.n; r++) {
        var l = this.matchR[r];
        if (isFiniteNumber(l)) {
            markChosen('R', r, this.instance.leftLabels[l]);
        }
    }
};

StableMatchingLevel.prototype.clearMarkers = function () {
    this.$edges.find('line').removeClass('is-unstable');
    this.$root.find('[data-role="vertex"]').removeClass('is-unstable');
    this.$root.find('.stable-matching__pref-item').removeClass('is-unstable');
};

StableMatchingLevel.prototype.markUnstable = function (blocking) {
    var li = blocking.li;
    var rj = blocking.rj;
    var liCurrent = blocking.liCurrent;
    var rjCurrent = blocking.rjCurrent;

    var $liVertex = this.$root.find('[data-role="vertex"][data-side="L"][data-idx="' + li + '"]');
    var $rjVertex = this.$root.find('[data-role="vertex"][data-side="R"][data-idx="' + rj + '"]');

    $liVertex.addClass('is-unstable');
    $rjVertex.addClass('is-unstable');

    // highlight the blocking pair in preference lists
    var leftLabel = this.instance.leftLabels[li];
    var rightLabel = this.instance.rightLabels[rj];
    $liVertex.closest('.stable-matching__row').find('.stable-matching__pref-item[data-pref="' + rightLabel + '"]').addClass('is-unstable');
    $rjVertex.closest('.stable-matching__row').find('.stable-matching__pref-item[data-pref="' + leftLabel + '"]').addClass('is-unstable');

};

StableMatchingLevel.prototype.renderEdges = function () {
    var self = this;
    this.$edges.empty();

    // Make SVG cover the graph block
    var graphEl = this.$graph.get(0);
    if (!graphEl) {
        return;
    }
    var graphRect = graphEl.getBoundingClientRect();

    this.$edges
        .attr('width', graphRect.width)
        .attr('height', graphRect.height)
        .attr('viewBox', '0 0 ' + graphRect.width + ' ' + graphRect.height);

    function vertexCenter(side, idx) {
        var selector = '[data-role="vertex"][data-side="' + side + '"][data-idx="' + idx + '"]';
        var el = self.$root.find(selector).get(0);
        if (!el) {
            return null;
        }
        var rect = el.getBoundingClientRect();
        return {
            x: rect.left - graphRect.left + rect.width / 2,
            y: rect.top - graphRect.top + rect.height / 2,
            r: Math.min(rect.width, rect.height) / 2,
        };
    }

    for (var li = 0; li < this.n; li++) {
        var rj = this.matchL[li];
        if (!isFiniteNumber(rj)) {
            continue;
        }
        var a = vertexCenter('L', li);
        var b = vertexCenter('R', rj);
        if (!a || !b) {
            continue;
        }

        // Shorten the segment so it doesn't overlap the vertices.
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-6) {
            continue;
        }
        var pad = 6;
        var cutA = a.r + pad;
        var cutB = b.r + pad;
        var ux = dx / len;
        var uy = dy / len;
        var x1 = a.x + ux * cutA;
        var y1 = a.y + uy * cutA;
        var x2 = b.x - ux * cutB;
        var y2 = b.y - uy * cutB;

        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y2));
        line.setAttribute('data-left', String(li));
        line.setAttribute('data-right', String(rj));
        line.setAttribute('class', 'stable-matching__edge');

        self.$edges.append(line);
    }
};

StableMatchingLevel.prototype.reset = function () {
    this.matchL = Array.from({ length: this.n }, function () { return null; });
    this.matchR = Array.from({ length: this.n }, function () { return null; });
    this.clearSelection();
    this.clearMarkers();
    this.renderEdges();
    this.updatePrefsHighlights();
};

StableMatchingLevel.prototype.check = function () {
    this.clearMarkers();

    if (!isPerfectMatching(this.n, this.matchL, this.matchR)) {
        $('#stable_matching_not_perfect_modal').modal('show');
        return;
    }

    var blocking = findBlockingPair(this.instance, this.matchL, this.matchR);
    if (blocking) {
        this.markUnstable(blocking);
        var leftLabel = this.instance.leftLabels[blocking.li];
        var rightLabel = this.instance.rightLabels[blocking.rj];
        $('[data-role="unstable-message"]').text(
            'The pair (' + leftLabel + ', ' + rightLabel + ') is unstable: each of them prefers the other one to its current partner.'
        );
        $('#stable_matching_unstable_modal').modal('show');
        return;
    }

    var $li = $('.nav-tabs a[data-target="#level' + this.$root.data('level') + '"]').parent();
    $li.addClass('success');
    $li.children('a').addClass('success');
    $('#congratulations_modal').modal('show');
};

var INSTANCES = {
    1: {
        n: 2,
        leftLabels: ['A', 'B'],
        rightLabels: ['C', 'D'],
        leftPrefs: [
            [1, 0],
            [0, 1],
        ],
        rightPrefs: [
            [0, 1],
            [0, 1],
        ],
    },
    2: {
        n: 3,
        leftLabels: ['A', 'B', 'C'],
        rightLabels: ['D', 'E', 'F'],
        leftPrefs: [
            [1, 0, 2],
            [0, 1, 2],
            [2, 0, 1],
        ],
        rightPrefs: [
            [1, 0, 2],
            [0, 1, 2],
            [2, 0, 1],
        ],
    },
    3: {
        n: 4,
        leftLabels: ['A', 'B', 'C', 'D'],
        rightLabels: ['D', 'E', 'F', 'G'],
        leftPrefs: [
            [1, 0, 2, 3],
            [0, 1, 2, 3],
            [2, 0, 1, 3],
            [3, 2, 0, 1],
        ],
        rightPrefs: [
            [1, 0, 2, 3],
            [0, 1, 2, 3],
            [2, 0, 1, 3],
            [3, 2, 1, 0],
        ],
    },
};

$(function () {
    var levels = {};

    $('[data-role="stable-matching-level"]').each(function () {
        var $level = $(this);
        var levelId = Number($level.data('level'));
        var instance = INSTANCES[levelId];
        if (!instance) {
            return;
        }
        var level = new StableMatchingLevel($level, instance);
        level.init();
        levels[levelId] = level;
    });

    $('.impossible').on('click', function () {
        $('#possible_modal').modal('show');
    });

    $('.reset').on('click', function (e) {
        var levelId = Number($(e.currentTarget).data('level'));
        if (levels[levelId]) {
            levels[levelId].reset();
        }
    });

    $('.check').on('click', function (e) {
        var levelId = Number($(e.currentTarget).data('level'));
        if (levels[levelId]) {
            levels[levelId].check();
        }
    });

    // When switching tabs, rerender edges (layout changes).
    $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        Object.keys(levels).forEach(function (k) {
            levels[k].renderEdges();
        });
    });
});
