import PathNode from "./PathNode";

export default class PathFinder {
    public unvisitedList: Array<PathNode> = [];
    public startNode: PathNode = null;
    public endNode: PathNode;
    public map: Array<Array<PathNode>> = [];
    private sqrt2: number = Math.sqrt(2);
    private mostLikelyNode: PathNode;
    private isLegal: boolean = false;

    public constructor(map: Array<Array<PathNode>>, startNode: PathNode, endNode: PathNode) {
        this.init(map, startNode, endNode);
    }

    public init(map: Array<Array<PathNode>>, startNode: PathNode, endNode: PathNode) {
        if (!map || !startNode || !endNode) {
            this.isLegal = false;
            return;
        }
        this.unvisitedList = [];
        startNode.g = 0;
        startNode.f = 0;
        this.map = map;
        this.startNode = startNode;
        this.endNode = endNode;

        let deltaX = Math.abs(startNode.x - this.endNode.x);
        let deltaY = Math.abs(startNode.y - this.endNode.y);
        let factor = deltaX < deltaY ? deltaX : deltaY;
        let h = factor * this.sqrt2 + Math.abs(deltaX - deltaY);
        this.startNode.h = h;

        this.mostLikelyNode = this.startNode;
        this.unvisitedList.push(this.startNode);
        this.isLegal = true;
    }

    public getAdjacentNodes(node: PathNode): Array<PathNode> {
        let ret: Array<PathNode> = [];
        let x: number = node.x;
        let y: number = node.y;

        for (var i: number = x - 1; i <= x + 1; ++i) {
            for (var j: number = y - 1; j <= y + 1; ++j) {
                if (i > this.map.length - 1 || j > this.map[0].length - 1
                    || i < 0 || j < 0
                    || (i == x && j == y)) {
                    continue;
                }
                ret.push(this.map[i][j]);
            }
        }
        return ret;
    }

    public getMinNode(nodeArray: Array<PathNode>): PathNode {
        var minF: number = Number.MAX_VALUE;
        for (var i = 0; i < nodeArray.length; ++i) {
            if (nodeArray[i].f < minF) {
                minF = nodeArray[i].f;
            }
        }

        for (var i = 0; i < nodeArray.length; ++i) {
            if (nodeArray[i].f == minF) {
                var node: PathNode = nodeArray[i];
                if (i != nodeArray.length - 1) {
                    nodeArray[i] = nodeArray[nodeArray.length - 1];
                }
                nodeArray.pop();
                return node;
            }
        }
    }

    /**
     * A* algorithm
     */
    public findPath(): void {
        if (!this.isLegal) {
            return;
        }
        var path: Array<PathNode> = [];
        while (this.unvisitedList.length > 0) {
            var currentNode = this.getMinNode(this.unvisitedList);
            var adjacentNodes = this.getAdjacentNodes(currentNode);
            currentNode.isVisited = true;
            this.map[currentNode.x][currentNode.y].isVisited = true;
            if (currentNode.equalsTo(this.endNode)) {
                return;
            }
            for (var i: number = 0; i < adjacentNodes.length; ++i) {
                var node = adjacentNodes[i];
                if (!node || node.isVisited || !node.isPassable) continue;

                // calculate f g h for node
                var g = currentNode.g;
                if (node.x == currentNode.x || node.y == currentNode.y) {
                    g += 1;
                } else {
                    g += Math.sqrt(2);
                }
                var deltaX = Math.abs(node.x - this.endNode.x);
                var deltaY = Math.abs(node.y - this.endNode.y);
                var factor = deltaX < deltaY ? deltaX : deltaY;
                var h = factor * this.sqrt2 + Math.abs(deltaX - deltaY);
                //node.h = deltaX + deltaY;
                var f = g + h;

                if (!node.isIn(this.unvisitedList)) {
                    node.g = g;
                    node.h = h;
                    node.f = f;
                    node.fatherNode = currentNode;
                    this.unvisitedList.push(node);
                } else {
                    if (f < node.f) {
                        node.f = f;
                        node.g = g;
                        node.h = h;
                        node.fatherNode = currentNode;
                    }
                }
                if (node.h < this.mostLikelyNode.h) {
                    this.mostLikelyNode = node;
                }
            }
        }
        if (this.endNode.fatherNode == null) {
            this.endNode = this.mostLikelyNode;
        }
    }
}
