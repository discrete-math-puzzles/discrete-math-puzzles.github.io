var coreCss = require('../../stylesheets/style.styl');
var core = require('../core');

$(function () {
    var inactiveColor = '#AAAAAA';
    var nextColors = {
        '#AAAAAA': '#FF0000',
        '#FF0000': '#00FF00',
        '#00FF00': '#0000FF',
        '#0000FF': '#FFFF00',
        '#FFFF00': '#00FFFF',
        '#00FFFF': '#FF0000',
    };

    var MapColoring = function (targetName, colorsReq, cb) {

        this.snap = Snap($(targetName + ' svg')[0]);
        this.colorsReq = colorsReq;
        this.regions = {};
        this._cb = cb || function () {};
        this.flush();
    };


    MapColoring.prototype.init = function () {
        this.snap.selectAll('path').forEach(function (region) {
            this.regions[region.attr().id] = region;
            region.attr('fill', inactiveColor);
            region.mousedown(function (e) {
                e.preventDefault();
                this.onRegionClick(region)
            }.bind(this))
        }, this);

        return this;
    };

    MapColoring.prototype.onRegionClick = function (region) {
        this.resetSignal();
        var newColor = nextColors[region.attr().fill.toUpperCase()];
        region.attr('fill', newColor);
    };

    MapColoring.prototype.flush = function () {
        if (this.verticesGroup) {
            this.verticesGroup.remove()
        }
        return this;
    };

    MapColoring.prototype.resetSignal = function () {
        if (this.signalId) {
            this.signalId = clearTimeout(this.signalId);
            this.signalRegions[0].attr('fill', this.afterSignalColor);
            if (this.signalRegions[1]) {
                this.signalRegions[1].attr('fill', this.afterSignalColor);
            }
            this.signalRegions = [];
        }
    };

    MapColoring.prototype.signal = function (regionA, regionB) {
        this.resetSignal();

        this.afterSignalColor = regionA.attr().fill;
        this.signalRegions = [regionA, regionB];

        var i = 0;
        this.signalId = setInterval(function () {
            if (!this.signalId) {
                return;
            }
            if (i++ % 2) {
                regionA.attr('fill', '#FFFFFF');
                if (regionB) {
                    regionB.attr('fill', '#FFFFFF');
                }
            } else {
                regionA.attr('fill', this.afterSignalColor);
                if (regionB) {
                    regionB.attr('fill', this.afterSignalColor);
                }
            }
            if (i > 10) {
                clearTimeout(this.signalId);
                regionA.attr('fill', this.afterSignalColor);
                if (regionB) {
                    regionB.attr('fill', this.afterSignalColor);
                }
            }
        }.bind(this), 400);

        return this;
    };

    MapColoring.prototype.submit = function () {
        var regionsList = this.snap.selectAll('path');
        var usedColors = {};
        var usedColorsCount = 0;
        for (var i = 0; i < regionsList.length; i++) {
            var region = regionsList[i];
            var regionColor = region.attr().fill;
            if (regionColor.toUpperCase() === inactiveColor) {
                this.signal(region);
                return 'Please color ALL regions.'
            }
            var adj = region.attr().borderwith.split(',');
            for (var j = 1; j < adj.length; j++) {
                var id = adj[j];
                var color = this.regions[id].attr().fill;
                if (!usedColors[color]) {
                    usedColors[color] = true;
                    usedColorsCount++;
                }
                if (regionColor === color) {
                    this.signal(this.regions[id], region);
                    return 'There are two neighboring regions colored in the same color';
                }
            }
        }

        if (this.colorsReq < usedColorsCount) {
            return 'This is a good coloring, but you could use fewer colors.';
        }

        this._cb();
        return 'Great!!'
    };

    var data = [0, 1, 2];
    var colorsReq = [4, 3, 4];
    var queens = data.reduce(function (result, item) {
        result.push(new MapColoring(
            '#mapColoring' + item,
            colorsReq[item],
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
        $('.output-map' + id).text(queens[id].submit());
    });

    $('#congratulations_modal').on('show.bs.modal', function (e) {
        if (e.relatedTarget) {
            var level = e.relatedTarget.getAttribute('data-id');

            if (level == 1) {
                window.q.successCb(level - 1, data);
            }
        }
    });
});
