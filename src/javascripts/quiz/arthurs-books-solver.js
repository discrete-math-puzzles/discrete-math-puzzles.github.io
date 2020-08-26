var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/arthurs-books.styl');
var core = require('../core');

$(function () {
    function BookShelfSolver(shelfSelector, cb) {
        this.container = $(shelfSelector);
        this.books = this.container.find('.arturs-books__book');
        this.displayStep = this.container.find('.arturs-books__steps-step-description');
        this.displayStart = this.container.find('.arturs-books__steps-start-description');
        this.displayRecord = $('.arturs-books__score-value');
        this.autoStepInterval = 50e3;
        this.step = 1;
        this.defaultDisplayText = 'Press solve to see the solution';
        this._cb = cb;
        return this;
    }

    BookShelfSolver.prototype.init = function () {
        this.step = 1;
        this.displayStart.text(this.defaultDisplayText);
        this.displayStep.text('');
        this.displayRecord.text(this.getRecord());
        this.setModalStatus();
        return this;
    };

    BookShelfSolver.prototype.block = function () {
        this.books.find('.arturs-books__number input').prop('disabled', true);

        return this;
    };

    BookShelfSolver.prototype.active = function (i) {
        $(this.books[i]).addClass('active');

        return this;
    };

    BookShelfSolver.prototype.unactive = function () {
        this.books.removeClass('active');

        return this;
    };

    BookShelfSolver.prototype.unblock = function () {
        this.books.find('.arturs-books__number input').prop('disabled', false);

        return this;
    };

    BookShelfSolver.prototype.isSolved = function checkOrder() {
        return this.getSwapPair() === null;
    };

    BookShelfSolver.prototype.getSwapPair = function checkOrder() {
        var values = this.getValues();

        for (var i = 0; i < values.length; i++) {
            var value = values[i];

            if (value != i + 1) {
                return [value - 1, i];
            }
        }

        return null;
    };

    BookShelfSolver.prototype.getValues = function () {
        return this.books.find('.arturs-books__number input').map(function (i, input) {
            return ~~input.value;
        });
    };

    BookShelfSolver.prototype.isValide = function () {
        var values = this.getValues();
        var used = {};

        for (var i = 0; i < values.length; i++) {
            var value = values[i];

            if (value > 10 || value <= 0 || used[value]) {
                return false;
            }
            used[value] = true;
        }

        return true;
    };

    BookShelfSolver.prototype.solve = function () {
        if (this.isSolved()) {
            return this;
        }

        this.block();
        this.displayStart.text('Press solve to see the next step');
        var swapPair = this.getSwapPair();

        this.active(swapPair[0]);
        this.active(swapPair[1]);

        if (this.timoutId) {
            this.solveStep2();
            return this;
        }

        this.displayStep.text('On day ' + this.step + ' we place volume ' + (swapPair[0] + 1) + ' on its place')
        this.timoutId = setTimeout(this.solveStep2.bind(this), this.autoStepInterval);

        return this;
    };

    BookShelfSolver.prototype.solveStep2 = function () {
        var swapPair = this.getSwapPair();

        this.timoutId = clearTimeout(this.timoutId);
        this.unactive();
        this.swap(swapPair);
        this.step++;

        if (!this.isSolved()) {
            this.solve();
        } else {
            this.displayStart.text('Press reset to start all over again');
            this.displayRecord.text(this.setRecord(this.step - 1));
            this.setModalStatus();
        }

        return this;
    };

    BookShelfSolver.prototype.setRecord = function (record) {
        var prevRecord = this.getRecord();
        window.q.setCookie('arturs-books-score', Math.max(record, prevRecord));
        return Math.max(record, prevRecord);
    };


    BookShelfSolver.prototype.getRecord = function () {
        return window.q.getCookie('arturs-books-score') || 0;
    };

    BookShelfSolver.prototype.setModalStatus = function () {
        var record = this.getRecord();
        if (record == 9) {
            this.impossibleModal();
        } else {
            this.possibleModal()
        }
    };

    BookShelfSolver.prototype.possibleModal = function () {
        $('.modal-button').attr('id', 'possible');
        $('.modal-button').data('data-target', '#possible_modal');
    };

    BookShelfSolver.prototype.impossibleModal = function () {
        $('.modal-button').attr('id', 'impossible');
        $('.modal-button').attr('data-target', '#congratulations_modal');
    };



    BookShelfSolver.prototype.swap = function (pair) {
        var bookA = this.books[pair[0]];
        var bookB = this.books[pair[1]];
        var bookANumber = this.getBookNumber(bookA);
        var bookBNumber = this.getBookNumber(bookB);

        this.setBookNumber(bookA, bookBNumber);
        this.setBookNumber(bookB, bookANumber);
    };

    BookShelfSolver.prototype.getBookNumber = function (book) {
        return $(book).find('.arturs-books__number input').val();
    };

    BookShelfSolver.prototype.setBookNumber = function (book, number) {
        return $(book).find('.arturs-books__number input').val(number);
    };

    BookShelfSolver.prototype.flush = function () {
        var books = this.books;

        for (var i = 0; i < books.length; i++) {
            var book = books[i];

            $(book).find('.arturs-books__number input').val('');
        }
        this.unactive();
        this.unblock();
        this.timoutId = clearTimeout(this.timoutId);

        return this;
    };

    var data = [0, 1, 2, 3, 4, 5];

    var bookSelfSolver = new BookShelfSolver(
        '#level5 .arturs-books__container',
        function () {
            window.q.successCb(5, data);
        }).init();

    $('.reset').on('click', function () {
        var id = $(this).data('id') - 1;

        if (id == 5) {
            bookSelfSolver.flush().init();
        }
    });

    $('.solve').on('click', function () {
        var id = $(this).data('id') - 1;

        if (id == 5) {
            if (bookSelfSolver.isValide()) {
                bookSelfSolver.solve();
            } else {
                bookSelfSolver.displayStep.text('Your input is invalid. Try to correct')
            }
        }
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            window.q.successCb(5, [0,1,2,3,4,5]);
        }
    });
});
