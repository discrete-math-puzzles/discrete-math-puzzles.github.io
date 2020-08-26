var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/job-assignment.styl');
var core = require('../core');

$(function () {
    var Messages = {
        rowEmpty: {
            1: 'Try to hire a %%.',
            2: 'Pick someone for %%?',
            3: 'Choose a room for %%.'
        },
        rowMoreThanOne: {
            1: 'There must be only one %%.',
            2: 'Only one person should do %%.',
            3: '%% should get just one room.'
        },
        colMoreThanOne: {
            1: '%% cannot have two jobs!',
            2: '%% cannot do two tasks!',
            3: '%% is a single room!'
        }
    };

    var SCHEMES = {
        1: {
            rows: ['Administrator', 'Programmer', 'Librarian', 'Professor'],
            columns: ['Alice', 'Ben', 'Chris', 'Diana'],
            possibilities: {
                'Administrator': [0, 2],
                'Programmer': [1, 2],
                'Librarian': [0, 1],
                'Professor': [3],
            },
            isPossible: true
        },
        2: {
            rows: ['Balloons', 'Pie', 'Drinks', 'Music', 'Games'],
            columns: ['Amy', 'Brayan', 'Chloe', 'Daniel', 'Emma', 'Fred'],
            possibilities: {
                'Balloons': [0, 1, 2],
                'Pie': [0],
                'Drinks': [1],
                'Music': [1, 2, 3, 4, 5],
                'Games': [4, 5]
            },
            isPossible: true
        },
        3: {
            rows: ['Aaron', 'Bianca', 'Carol', 'Dana', 'Elvis', 'Francis'],
            columns: ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6'],
            possibilities: {
                'Aaron': [0, 1],
                'Bianca': [0, 1, 2],
                'Carol': [3, 4],
                'Dana': [1, 2, 3, 5],
                'Elvis': [3, 4],
                'Francis': [3, 4]
            },
            isPossible: false
        }
    };

    var Assignment = function (targetName, id, cb) {
        this.$content = $(targetName + ' .content');
        this.id = id;

        this._cb = cb || function () {};

        return this;
    };

    Assignment.prototype.initState = function () {
        var blankState = Array
            .apply(null, Array(this.scheme.rows.length))
            .map(function () {
                return Array
                .apply(null, Array(this.scheme.columns.length))
                .map(Number.prototype.valueOf, 0)
            }.bind(this));

        for (var i = 0; i < blankState.length; i++) {
            var row = blankState[i];

            for (var j = 0; j < row.length; j++) {
                var key = this.scheme.rows[j];

                if (key && this.scheme.possibilities[key].indexOf(i) !== -1) {
                    blankState[j][i] = 1;
                }
            }
        }

        return blankState;
    };

    Assignment.prototype.initVars = function () {
        this.scheme = SCHEMES[this.id] || {};
        this.state = this.initState();

        return this;
    };

    Assignment.prototype.init = function () {
        this.initVars();
        this.drawTable();

        return this;
    };

    Assignment.prototype.drawTable = function () {
        var theTable = document.createElement('table');
        theTable.classList.add('table');
        theTable.classList.add('table-bordered');
        theTable.classList.add('table-striped');

        var cols = this.scheme.columns.slice(0);
            cols.unshift('');
        var rows = this.scheme.rows.slice(0);
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var tr = document.createElement('tr');
        for (var i = 0; i < cols.length; i++) {
            var th = document.createElement('th');

            th.appendChild(document.createTextNode(cols[i]));
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        theTable.appendChild(thead);

        for (var i = 0; i < rows.length; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < cols.length; j++) {
                var td = document.createElement('td');
                var th = document.createElement('th');

                if (j === 0) {
                    th.appendChild(document.createTextNode(rows[i]));
                    tr.appendChild(th);
                } else {
                    if (this.state[i][j - 1]) {
                        var checkbox = document.createElement('input');
                        checkbox.setAttribute('type', 'checkbox');
                        checkbox.setAttribute('data-id', [i,j - 1]);
                        if (this.state[i][j - 1] === 2) {
                            checkbox.setAttribute('checked', 'checked');
                        }
                        checkbox.onclick = this.onClickHandler.bind(this);

                        td.appendChild(checkbox);
                    }

                    tr.appendChild(td);
                }
            }
            tbody.appendChild(tr);
        }
        theTable.appendChild(tbody);

        this.$content.html(theTable);
    };

    Assignment.prototype.onClickHandler = function (e) {
        if (e.target) {
            var position = $(e.target).data('id').split(',');

            this.state[position[0]][position[1]] = this.state[position[0]][position[1]] === 2 ? 1 : 2;

            this.drawTable();
        }
    };

    Assignment.prototype.getTransponedState = function () {
        var transponedState = Array
            .apply(null, Array(this.scheme.columns.length))
            .map(function () {
                return Array
                .apply(null, Array(this.scheme.rows.length))
                .map(Number.prototype.valueOf, 0)
            }.bind(this));

        for (var i = 0; i < this.state.length; i++) {
            for (var j = 0; j < this.state[i].length; j++) {
                transponedState[j][i] = this.state[i][j];
            }
        }

        return transponedState;
    };

    Assignment.prototype.findMoreThanOne = function (state) {
        return state.map(
            function (row, i) {
                return row.filter(function (item) { return item === 2; }).length > 1 && i
            })
            .filter(function(item) { return item !== false });
    };

    Assignment.prototype.findEmptyRows = function (state) {
        return state
            .map(function (row, i) {return row.indexOf(2) === -1 && i })
            .filter(function(item) { return item !== false });
    };

    var assignments = Object.keys(SCHEMES).map(function (id) {
        return new Assignment(
            '#level' + id,
            id,
            function () {
                window.q.successCb(id - 1, Object.keys(SCHEMES));
            }
        ).init();
    });

    $('.reset').on('click', function (e) {
        var id = $(e.target ? e.target : e.currentTarget).data('id');
        assignments[id - 1] && assignments[id - 1].init();
    });

    $('.check').on('click', function (e) {
        var $modal = $('.job-assignment__modal');
        var id = $(e.target ? e.target : e.currentTarget).data('id');
        var assignment = assignments[id - 1];

        if (assignment) {
            var state = assignment.state;
            var scheme = assignment.scheme;

            var colMoreThanOne = assignment.findMoreThanOne(assignment.getTransponedState());
            var rowMoreThanOne = assignment.findMoreThanOne(state);
            var rowEmpty = assignment.findEmptyRows(state);

            if (colMoreThanOne.length + rowEmpty.length + rowMoreThanOne.length === 0) {
                window.q.successCb(id - 1, Object.keys(SCHEMES));
            } else {
                var colMoreThanOneErrors = colMoreThanOne.reduce(function (result, item) {
                    result.push(Messages.colMoreThanOne[id].replace('%%', assignment.scheme.columns[item]));
                    return result;
                }, []);
                var rowMoreThanOneErrors = rowMoreThanOne.reduce(function (result, item) {
                    result.push(Messages.rowMoreThanOne[id].replace('%%', assignment.scheme.rows[item]));
                    return result;
                }, []);
                var rowEmptyErrors = rowEmpty.reduce(function (result, item) {
                    result.push(Messages.rowEmpty[id].replace('%%', assignment.scheme.rows[item]));
                    return result;
                }, []);

                var allErrors = [].concat(colMoreThanOneErrors, rowMoreThanOneErrors, rowEmptyErrors);

                $modal.find('.modal-body h4').text(allErrors[0]);
                $modal.modal('show');
            }
        }
    });

    $('.impossible').on('click', function (e) {
        if (e.currentTarget) {
            var level = $(e.currentTarget).data('id');

            if (!SCHEMES[level].isPossible) {
                window.q.successCb(level - 1, Object.keys(SCHEMES));
            } else {
                $('#possible_modal').modal('show');
            }
        }
    });
});
