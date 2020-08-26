var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/arthurs-books.styl');
var core = require('../core');

$(function () {
    function BookShelf(shelfSelector, order, days, cb) {
        this.container = $(shelfSelector);
        this.books = this.container.find('.arturs-books__book');
        this.books.click(this.onclick.bind(this));
        this.order = order;
        this.limit = days;
        this.swap = null;
        this.steps = 0;
        this._cb = cb;

        return this;
    }

    BookShelf.prototype.unselect = function unswap() {
        this.swap.removeClass('active');
        this.swap = null;
    };

    BookShelf.prototype.select = function (el) {
        el.addClass('active');
        this.swap = el;
    };

    BookShelf.prototype.init = function () {
        var books = this.books;
        this.setDays(0);
        this.container.find('.arturs-books__steps-number').text(this.steps + '');

        for (var i = 0; i < books.length; i++) {
            var book = books[i];

            $(book).find('.arturs-books__number').text(this.order[i])
        }

        return this;
    };

    BookShelf.prototype.setDays = function (steps) {
        this.steps = steps;
        this.container.find('.arturs-books__steps-number').text(this.steps + '');
    };

    BookShelf.prototype.onclick = function (e) {
        if (this.steps >= this.limit) {
            return;
        }

        var $this = $(e.currentTarget);

        if (this.swap) {
            var swapText = this.swap.find('.arturs-books__number');
            var swapNumber = swapText.text();
            var $thisText = $this.find('.arturs-books__number');
            var $thisNumber = $thisText.text();
            swapText.text($thisNumber);
            $thisText.text(swapNumber);
            if (e.currentTarget !== this.swap.get(0)) {
                this.setDays(this.steps + 1);
            }
            this.unselect();

            if (this.checkOrder(this.books) && this.steps <= this.limit) {
                this.steps = Infinity;
                this._cb();
            }
        } else {
            this.select($this);
        }
    };

    BookShelf.prototype.checkOrder = function checkOrder(books) {
        for (var i = 0; i < books.length; i++) {
            var book = books[i];

            if ($(book).find('.arturs-books__number').text() != i + 1) {
                return false;
            }
        }

        return true;
    };

    BookShelf.prototype.flush = function checkOrder() {
        if (this.swap) {
            this.unselect();
        }

        return this;
    };

    var levels = [
        { order: [3, 7, 10, 5, 9, 1, 8, 4, 6, 2], limit: Infinity },
        { order: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], limit: 5 },
        { order: [3, 1, 2, 6, 4, 5, 10, 7, 8, 9], limit: 7 },
        { order: [5, 8, 7, 1, 9, 2, 10, 6, 4, 3], limit: 7 },
        { order: [6, 9, 5, 7, 10, 3, 2, 1, 8, 4], limit: 9 }
    ];

    var data = [0, 1, 2, 3, 4];
    var shelfs = data.reduce(function (result, item) {
        result.push(new BookShelf(
            '#level' + item + ' .arturs-books__container',
            levels[item].order,
            levels[item].limit,
            function () {
                window.q.successCb(item, data);
            }).init());
        return result;
    }, []);

    data.push(5);

    $('.reset').on('click', function () {
        var id = $(this).data('id');
        if (shelfs[id]) {
            shelfs[id].flush().init();
        }
    });
});
