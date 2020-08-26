var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/tossing-coins.styl');
var core = require('../core');

var fn = function () {
    var TossingCoinsLevel = function (solution, id, successCb) {
        var levelNode = document.getElementById(id);

        this.buttonNodes = levelNode.querySelectorAll('.tossing-coins__button');
        this.probabilityTextNode = levelNode.querySelector('.tossing-coins__probability-text');

        this._successCb = successCb;
        this._initialState = [true, false, false, false, false, false, false, false];
        this.state = this._initialState.slice();
        this.solution = solution;

        this.init();
        this.render();
    };

    TossingCoinsLevel.prototype.changeState = function (buttonIndex) {
        this.state[buttonIndex] = !this.state[buttonIndex];
    };

    TossingCoinsLevel.prototype.render = function () {
        var activeClassName = 'btn-primary';

        this.state.forEach(function(isButtonActive, buttonIndex)  {
            var buttonNode = this.buttonNodes.item(buttonIndex);
            if (isButtonActive) buttonNode.classList.add(activeClassName);
            else buttonNode.classList.remove(activeClassName);
        }, this);

        this.updateProbabilityText();
    };

    TossingCoinsLevel.prototype.updateProbabilityText = function () {
        var probability = this.state.reduce(
            function (p, isActive) {
                 if (isActive) return p + 1;
                 return p;
            },
            0
        );
        this.probabilityTextNode.innerText = 'Probability = ' + (probability / 8);
    };

    TossingCoinsLevel.prototype.checkIfSolved = function () {
        var isSolved = true
        this.state.forEach(function (isActive, buttonIndex) {
            var shouldBeActive = Boolean(~this.solution.indexOf(buttonIndex));
            if ((isActive && !shouldBeActive) || (!isActive && shouldBeActive)) isSolved = false;
        }, this);

        if (isSolved) this._successCb();
    };

    TossingCoinsLevel.prototype.init = function () {
        var self = this;
        var createClickHandler = function (buttonIndex) {
            return function () {
                self.changeState(buttonIndex);
                self.render();
                self.checkIfSolved();
            };
        };

        for (var i = 0; i < this.buttonNodes.length; i++) {
            this.buttonNodes.item(i).addEventListener('click', createClickHandler(i))
        }
    };

    TossingCoinsLevel.prototype.reset = function () {
        this.state = this._initialState.slice();
        this.render();
    };

    // HHH, HHT, HTH, HTT, THH, THT, TTH, TTT
    var levelsData = [
        [0, 1, 2, 4],
        [1, 2, 3, 4, 5, 6, 7],
        [],
        [0, 3, 5, 6],
        [7]
    ];

    var levels = levelsData.map(function (solution, i) {
        var id = i + 1;
        var level = new TossingCoinsLevel(
            solution,
            'level' + id,
            function () {
                window.q.successCb(id, [1, 2, 3, 4, 5]);
            }
        );
        return level;
    });


    $('.reset').on('click', function (event) {
        var i = event.target.dataset.id - 1
        levels[i].reset();
    });
};

document.addEventListener('DOMContentLoaded', fn);
