var coreCss = require('../../stylesheets/style.styl');
var css = require('../../stylesheets/make-a-tree.styl');
var core = require('../core');

var fn = function () {
    // Graph
    var Graph = function (adjacencyLists) {
        this.adjacencyListsStash = adjacencyLists;
        this.adjacencyLists = JSON.parse(JSON.stringify(adjacencyLists));
    };

    Graph.prototype.checkIfConnected = function () {
        var adjacencyLists = this.adjacencyLists;

        var traversedVertices = [];
        var traverseVertex = function (vertex) {
            if (~traversedVertices.indexOf(vertex)) return;
            traversedVertices.push(vertex);
            adjacencyLists[vertex].forEach(traverseVertex, this);
        };

        traverseVertex(0);
        return adjacencyLists.length === traversedVertices.length;
    };

    Graph.prototype.countEdges = function () {
        return this.adjacencyLists.reduce(function (count, adjacentVertices) {
            return count + adjacentVertices.length;
        }, 0) / 2;
    };

    Graph.prototype.removeEdge = function (edge) {
        var adjacencyLists = this.adjacencyLists;

        if (!adjacencyLists[edge[0]]) throw new Error('Vertex ' + edge[0] + ' doesn\'t exist.');
        if (!adjacencyLists[edge[1]]) throw new Error('Vertex ' + edge[1] + ' doesn\'t exist.');

        var untie = function (v0, v1) {
            var index = adjacencyLists[v0].indexOf(v1);
            if (~index) adjacencyLists[v0].splice(index, 1);
        };

        untie(edge[0], edge[1]);
        untie(edge[1], edge[0]);
    };

    // GraphProjection
    var GraphProjection = function (adjacencyLists, mapVertexToCoords, svgElementId, svgDimensions, successCb) {
        Graph.call(this, adjacencyLists);

        var viewBoxWidth = svgDimensions[0];
        var viewBoxheight = svgDimensions[1];

        this._vertexRadius = 30;
        this._colorBase = '#5bc0de';
        this._colorActive = '#d9534f';
        this._colorLabel = '#fff';
        this._successCb = successCb;

        this.mapVertexToCoords = mapVertexToCoords;

        this.paper = Snap(svgElementId).attr({ viewBox: '0 0 ' + viewBoxWidth + ' ' + viewBoxheight });
        this.assemble();
    };
    GraphProjection.prototype = Object.create(Graph.prototype);
    GraphProjection.prototype.constructor = GraphProjection;

    GraphProjection.prototype.checkValid = function () {
        var verticesCount = this.adjacencyLists.length;

        var isConnected = this.checkIfConnected();
        var hasCorrectVerticesCount = this.countEdges() === verticesCount - 1;
        var isValid = isConnected && hasCorrectVerticesCount;

        if (isValid) this._successCb();
        else if (!isConnected) this.showMessage('Not all vertices are connected');
        else if (!hasCorrectVerticesCount) this.showMessage('Try to remove more edges!');
    };

    GraphProjection.prototype.renderVertexEdges = function (vertex, adjacentVertices) {
        var graph = this;
        var handleEdgeMouseIn = function () {
            this.attr({ stroke: graph._colorActive });
        };
        var handleEdgeMouseOut = function () {
            this.attr({ stroke: graph._colorBase });
        };

        adjacentVertices.forEach(function (adjVertex) {
            if (vertex < adjVertex) {
                var edge = [vertex, adjVertex];

                var handleEdgeClick = function () {
                    graph.removeEdge(edge);
                    graph.assemble();
                };

                var line = this.renderEdge(edge)
                    .hover(handleEdgeMouseIn, handleEdgeMouseOut)
                    .node.addEventListener('click', handleEdgeClick);
            };
        }, this);
    };

    GraphProjection.prototype.renderEdge = function (edge) {
        var coords0 = this.mapVertexToCoords(edge[0]);
        var coords1 = this.mapVertexToCoords(edge[1]);
        var line = this.paper
            .line(coords0[0], coords0[1], coords1[0], coords1[1])
            .attr({
                class: 'make-a-tree__edge',
                stroke: this._colorBase,
                strokeWidth: 16
            });
        return line;
    };

    GraphProjection.prototype.renderVertex = function (vertex) {
        var coords = this.mapVertexToCoords(vertex);
        var circle = this.paper
            .circle(coords[0], coords[1], this._vertexRadius)
            .attr({
                fill: this._colorBase,
                strokeWidth: 0
            });
        return circle;
    };

    GraphProjection.prototype.renderLabel = function (vertex) {
        var xOffset = -10;
        var yOffset = 12;
        var coords = this.mapVertexToCoords(vertex);
        var label = this.paper
            .text(coords[0] + xOffset, coords[1] + yOffset, (vertex + 1).toString())
            .attr({ 'font-size': 36, 'fill': this._colorLabel });
        return label;
    };

    GraphProjection.prototype.showMessage = function (text) {
        var $modal = $('.make-a-tree__modal');
        $modal.find('h4').text(text);
        $modal.modal('show');
    };

    GraphProjection.prototype.assemble = function () {
        this.paper.clear();

        this.adjacencyLists.forEach(function (adjacentVertices, vertex) {
            this.renderVertexEdges(vertex, adjacentVertices);
            this.renderVertex(vertex);
            this.renderLabel(vertex);
        }, this);
    };

    GraphProjection.prototype.reset = function () {
        this.adjacencyLists = JSON.parse(JSON.stringify(this.adjacencyListsStash));
        this.assemble();
    };


    // fn
    var graphsData = [
        {
            adjacencyLists: [[1, 4], [0, 2, 4], [1, 3], [2, 4, 5], [0, 1, 3], [3]],
            mapVertexToCoords: function (vertex) {
                return [[560, 126.67], [386.67, 40], [213.34, 40], [213.34, 213.34], [386.67, 213.34], [40, 300]][vertex];
            },
            svgDimensions: [600, 340]
        },
        {
            adjacencyLists: [[1, 2, 6], [0, 2, 6], [0, 1, 3, 4, 5], [2, 4, 5], [2, 3, 5], [2, 3, 4, 6], [0, 1, 5]],
            mapVertexToCoords: function (vertex) {
                return [[40, 360], [170, 222], [300, 360], [560, 196], [390, 196], [300, 40], [40, 40]][vertex];
            },
            svgDimensions: [600, 400]
        },
        {
            adjacencyLists: [[1, 2, 3, 4], [0, 2, 3, 4], [0, 1, 3, 4], [0, 1, 2, 4], [0, 1, 2, 3]],
            mapVertexToCoords: function (vertex) {
                var angle = (360 / 5) * (Math.PI / 180);
                var radius = 260;
                var offset = 300;
                var x = Math.cos(vertex * angle) * radius + offset;
                var y = Math.sin(vertex * angle) * radius + offset;
                return [x, y]
            },
            svgDimensions: [600, 600]
        }
    ];

    var graphs = graphsData.map(function (data, i) {
        var graph = new GraphProjection(
            data.adjacencyLists,
            data.mapVertexToCoords,
            '#graph' + (i + 1),
            data.svgDimensions,
            function () {
                window.q.successCb(i + 1, [1, 2, 3]);
            }
        );
        return graph
    });

    $('.reset').on('click', function (event) {
        var i = event.target.dataset.id - 1
        graphs[i].reset();
    });

    $('.check').on('click', function() {
        var id = $(this).data('id') - 1;
        graphs[id].checkValid();
    });

    $('.impossible').on('click', function() {
        $('#possible_modal').modal('show');
    });
};

document.addEventListener('DOMContentLoaded', fn);
