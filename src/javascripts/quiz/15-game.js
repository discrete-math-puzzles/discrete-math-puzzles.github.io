var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/15-game.styl');
var core = require('../core');

$(function () {
    var SUCCESS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, '*']];
    var SCHEMES = {
        1: {
            data: [[5, 1, 4, 8], [9, 6, 3, 11], [10, 2, 15, 7], [13, 14, 12, '*']],
            isPossible: true
        },
        2: {
            data: [[2, 6, 3, 4], [9, 11, 7, 8], [1, 13, 14, 12], [5, 10, 15, '*']],
            isPossible: true
        },
        3: {
            data: [[5, 1, 8, 4], [9, 6, 3, 11], [10, 2, 15, 7], [13, 14, 12, '*']],
            isPossible: false
        },
        4: {
            data: [[2, 6, 4, 3], [9, 11, 7, 8], [1, 13, 14, 12], [5, 10, 15, '*']],
            isPossible: false
        },
        5: {
            data: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [14, 15, 13, '*']],
            isPossible: true,
        },
        6: {
            data: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [15, 14, 13, '*']],
            isPossible: false,
        }
    };

    var Game = function (targetName, id, cb) {
        this.$content = $(targetName + ' .content');
        this.id = id;

        this._cb = cb || function () {};

        return this;
    };

    Game.prototype.initVars = function () {
        this.scheme = SCHEMES[this.id] || {};
        this.state = this.scheme.data.map(function (arr) {
            return arr.slice(0);
        });

        return this;
    };

    Game.prototype.init = function () {
        this.initVars();
        this.drawTable();

        return this;
    };

    Game.prototype.drawTable = function () {
        var theTable = document.createElement('table');
        var tableData = this.state;

        for (var i = 0; i < tableData.length; i++) {
            var rowData = tableData[i];
            var tr = document.createElement('tr');

            for (var j = 0; j < rowData.length; j++) {
                var td = document.createElement('td');

                if (tableData[i - 1] && tableData[i - 1][j] === '*' ||
                    tableData[i + 1] && tableData[i + 1][j] === '*' ||
                    tableData[i] && tableData[i][j - 1] === '*' ||
                    tableData[i] && tableData[i][j + 1] === '*') {
                    td.classList.add('clickable');
                    td.onclick = this.onChangeHandler.bind(this);
                }

                if (tableData[i - 1] && tableData[i - 1][j] === '*') {
                    td.dataset.y = '-1';
                }

                if (tableData[i + 1] && tableData[i + 1][j] === '*') {
                    td.dataset.y = '1';
                }

                if (tableData[i] && tableData[i][j - 1] === '*') {
                    td.dataset.x = '-1';
                }

                if (tableData[i] && tableData[i][j + 1] === '*') {
                    td.dataset.x = '1';
                }

                if (rowData[j] === '*') {
                    td.classList.add('blank');
                } else {
                    td.appendChild(document.createTextNode(rowData[j]));
                }

                td.dataset.position = [i, j];

                tr.appendChild(td);
            }

            theTable.appendChild(tr);
        }

        this.$content.html(theTable);
    };

    Game.prototype.onChangeHandler = function (e) {
        var $currentCell = $(e.currentTarget);
        var x = Number($currentCell.data('x')) || 0;
        var y = Number($currentCell.data('y')) || 0;
        var position = $currentCell.data('position').split(',').map(Number);
        var swap = this.state[position[0]][position[1]];

        if (x === -1 || x === 1) {
            this.state[position[0]][position[1]] = this.state[position[0]][position[1] + x];
            this.state[position[0]][position[1] + x] = swap;
        } else if (y === -1 || y === 1) {
            this.state[position[0]][position[1]] = this.state[position[0] + y][position[1]];
            this.state[position[0] + y][position[1]] = swap;
        }

        this.drawTable();
        this.checkValidation();
    };

    Game.prototype.checkValidation = function () {
        if ('' + SUCCESS === '' + this.state) {
            this._cb(this.id - 1);
        }
    };

    var games = Object.keys(SCHEMES).map(function (id) {
        return new Game(
            '#level' + id,
            id,
            function () {
                window.q.successCb(id, Object.keys(SCHEMES));
            }
        ).init();
    })

    $('.reset').on('click', function (e) {
        var id = $(e.currentTarget).data('id');
        games[id - 1] && games[id - 1].init();
    });

    $('.impossible').on('click', function (e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data('id');

            if (!SCHEMES[level].isPossible) {
                window.q.successCb(level, Object.keys(SCHEMES));
            } else {
                $('#possible_modal').modal('show');
            }
        }
    });
});
