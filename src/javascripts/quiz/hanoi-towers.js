var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/hanoi-towers.styl');
var core = require('../core');

$(function () {
    var Towers = function (targetName, count, cb) {
        var self = this;

        this.holding = [];
        this.moves = 0;
        this.disksNum = count;
        this.$canvas = $(targetName);
        this.$tower = this.$canvas.find('.tower');
        this._cb = cb || function () {};

        this.$canvas.on('click', '.tower', function() {
		    self.tower($(this));
	    });

        this.init();
    };

    Towers.prototype.init = function () {
        this.$tower.html('');
		this.moves = 0;
		this.holding = [];

		for (var i = 1; i <= this.disksNum; i++) {
			this.$tower.eq(0).prepend('<li class="disk disk-' + i + '" data-value="' + i + '"></li>');
		}

        return this;
    }

    Towers.prototype.countMove = function () {
        this.moves++;

		if (this.moves > 0) {
			if (this.$tower.eq(1).children().length === this.disksNum || this.$tower.eq(2).children().length === this.disksNum) {
				this._cb();
			}
		}

        return this;
    }

    Towers.prototype.tower = function (tower) {
        var $disks = tower.children(),
			$topDisk = tower.find(':last-child'),
			topDiskValue = $topDisk.data('value'),
			$holdingDisk = this.$canvas.find('.hold');

		if ($holdingDisk.length !== 0) {
			if (topDiskValue === this.holding[0]) {
				$holdingDisk.removeClass('hold');
			} else if (topDiskValue === undefined || topDiskValue > this.holding[0]) {
				$holdingDisk.remove();
				tower.append($('<li class="disk disk-' + this.holding[0] + '" data-value="' + this.holding[0] + '"></li>'));
				this.countMove();
			}
		} else if ($topDisk.length !== 0) {
			$topDisk.addClass('hold');
			this.holding[0] = topDiskValue;
		}

        return this;
    }

    var data = [2, 3, 4];
    var towers = data.reduce(function(result, item) {
        result.push(
            new Towers(
                '#tower' + (item - 1),
                item,
                function () {
                    window.q.successCb(item, data);
                }
            ).init()
        );

        return result;
    }, []);

    $('.reset').on('click', function() {
        var id = $(this).data('id') - 1;
        towers[id].init();
    });
});
