var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/antimagic-square.styl');
var core = require('../core');

$(function () {
    var AntimagicSquare = function () {
        this.element = document.querySelector('[data-antimagic-square]');
        this.cellClickListeners = [[], [], []];
        this.flush();
    };

    AntimagicSquare.prototype.flush = function () {
        this.cells = this.initCells();
        this.sumElements = this.initSumElements();
        // [row0, row1, row2, col0, col1, col2, dia0, dia1]
        // null means that there is unfilled cell in the row, col or dia.
        this.sums = [null, null, null, null, null, null, null, null];
        this.matches = [];
        this.paintSquare();
        this.printSums();
    };

    AntimagicSquare.prototype.initCells = function () {
        return [0, 1, 2].map(function (i) {
            return [0, 1, 2].map(function (j) {
                var cellElement = this.element.querySelector(this._produceCellSelector(i, j));

                var eventListener = this.handleCellClick.bind(this, i, j);
                cellElement.removeEventListener('click', this.cellClickListeners[i][j]);
                cellElement.addEventListener('click', eventListener);
                this.cellClickListeners[i][j] = eventListener;

                var textElement = cellElement.querySelector(this._textSelector);
                textElement.innerText = '';

                return null;
            }, this);
        }, this);
    };

    AntimagicSquare.prototype.initSumElements = function () {
        return this._sumsToSelectorsMappings.map(function (selector) {
            return this.element.querySelector(selector);
        }, this);
    };

    AntimagicSquare.prototype.handleCellClick = function (i, j, event) {
        var prevValue = this.cells[i][j];
        var nextValue = (prevValue === null) ? -1 : (prevValue + 2) % 3 - 1;
        this.cells[i][j] = nextValue;

        var textElement = event.target.querySelector(this._textSelector);
        textElement.innerText = nextValue;

        this.calcSums();
        this.checkSums();
        this.paintSquare();
        this.printSums();
    };

    AntimagicSquare.prototype.calcSums = function () {
        var sums = [[], [], [], [], [], [], [], []];
        // First we collect cell values for rows, columns and diagonals.
        this.cells.forEach(function(row, i) {
            row.forEach(function(value, j) {
                sums[i].push(value);
                sums[j+3].push(value);
                if (i === j) sums[6].push(value);
                if (i + j === 2) sums[7].push(value);
            });
        });
        // Then we calculate their sums.
        this.sums = sums.map(function(values) {
            return values.reduce(function(sum, value) {
                if (value === null || sum === null) return null;
                return sum + value;
            });
        });
    };

    AntimagicSquare.prototype.checkSums = function () {
        this.matches = [];
        this.sums.forEach(function(sum, k) {
            if (sum === null) return;
            var dupIndex = this.sums.indexOf(sum, k + 1);
            if (~dupIndex) this.matches.push(k, dupIndex);
        }, this);

        this.matches = this.matches.filter(function (sum, k) {
            return this.matches.indexOf(sum) === k;
        }, this);
    };

    AntimagicSquare.prototype.paintSquare = function () {
        var cl = this.element.classList;
        cl.remove.apply(cl, this._matchesToClassNamesMappings);
        cl.add.apply(cl, this.matches.map(this._mapMatchesToClassNames, this));
    };

    AntimagicSquare.prototype.printSums = function () {
        this.sumElements.forEach(function (element, k) {
            element.innerText = this.sums[k];
        }, this);
    };

    AntimagicSquare.prototype._mapMatchesToClassNames = function (key) {
        return this._matchesToClassNamesMappings[key];
    };

    AntimagicSquare.prototype._produceCellSelector = function (i, j) {
        return '[data-ij="' + i + j + '"]';
    };
    AntimagicSquare.prototype._textSelector = '[data-text]';

    AntimagicSquare.prototype._sumsToSelectorsMappings = [
        '[data-sum-row="0"]',
        '[data-sum-row="1"]',
        '[data-sum-row="2"]',
        '[data-sum-col="0"]',
        '[data-sum-col="1"]',
        '[data-sum-col="2"]',
        '[data-sum-dia="0"]',
        '[data-sum-dia="1"]'
    ];

    AntimagicSquare.prototype._matchesToClassNamesMappings = [
        'antimagic-square_warn-row0',
        'antimagic-square_warn-row1',
        'antimagic-square_warn-row2',
        'antimagic-square_warn-col0',
        'antimagic-square_warn-col1',
        'antimagic-square_warn-col2',
        'antimagic-square_warn-dia0',
        'antimagic-square_warn-dia1'
    ];

    var antimagicSquare = new AntimagicSquare();

    document.querySelector('.reset').addEventListener('click', antimagicSquare.flush.bind(antimagicSquare));

    $('.impossible').on('click', function () {
        window.q.successCb(1, [1]);
    });
});
