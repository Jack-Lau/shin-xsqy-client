export default class PathNode {
    public f: number;
    public g: number;
    public h: number;
    public x: number;
    public y: number;
    public isPassable: boolean;
    public fatherNode: PathNode = null;
    public isVisited: boolean;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.isPassable = true;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.isVisited = false;
    }
    public equalsTo(node: PathNode): boolean {
        if (this.x == node.x && this.y == node.y) {
            return true;
        }
        return false;
    }
    public isIn(nodeArray: Array<PathNode>): boolean {
        for (var i = 0; i < nodeArray.length; ++i) {
            if (this.equalsTo(nodeArray[i])) return true;
        }
        return false;
    }
}
