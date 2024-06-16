import { ConfigUtils } from "../utils/ConfigUtil";
import MapManager from "../map/MapManager";
import { mapConfigData } from "../map/MapConfigData";
import { CommonUtils } from "../utils/CommonUtils";
import PathFinder from "../map/PathFinder";
import PathNode from "../map/PathNode";
import { PathStep, StepDirection } from "../map/PathStep";
import PlayerData from "../data/PlayerData";

export default class MapConfig {
    private static _instance: MapConfig = null;
    public mapInfo = {};
    public worldMapInfo = {};
    public idleMineInfo = {};
    public mapPath = {};
    public mapMask = {};
    public mapPathFinder = {};
    public pathFinder = null;

    constructor() {
    }

    async init() {
        [this.mapInfo, this.worldMapInfo, this.idleMineInfo] = await Promise.all([
            ConfigUtils.getConfigJson("MapInfo"),
            ConfigUtils.getConfigJson("WorldMapInfo"),
            ConfigUtils.getConfigJson('MapProductionInfo')
        ]);

        for (let key in this.mapInfo) {
            let value = this.mapInfo[key];
            if (value["MovingTarget"]) {
                let targetString: string = value["MovingTarget"];
                let movingTargetArray = [];
                (targetString.slice(1, targetString.length - 1)).split("),(").map(
                    (value, index, arr) => {
                        let point = this.parsePoint(value);
                        movingTargetArray.push(point);
                    }, this
                );
                this.mapInfo[key]["movingTargetArray"] = movingTargetArray;
            }
        }

        this.initMaskAndPath();
    }

    initMaskAndPath() {
        for (let key in mapConfigData) {
            let value = mapConfigData[key];
            this.mapPath[key] = CommonUtils.decodeMatrix(value.path);
            this.mapMask[key] = CommonUtils.decodeMatrix(value.mask);
            let map = [];
            for (let i = 0; i < this.mapPath[key].length; ++i) {
                let tempArray: Array<PathNode> = [];
                for (let j = 0; j < this.mapPath[key][i].length; ++j) {
                    let node: PathNode = new PathNode(i, j);
                    node.isPassable = this.mapPath[key][i][j];
                    tempArray.push(node);
                }
                map.push(tempArray);
            }
            this.mapPathFinder[key] = map;
        }
    }

    public static getInstance(): MapConfig {
        if (this._instance == null) {
            this._instance = new MapConfig();
        }
        return this._instance;
    }

    public parsePoint(str: string): cc.Vec2 {
        let arr = str.split(",");
        if (arr.length != 2) {
            console.error("CONFIG ERROR: ", str);
            return new cc.Vec2();
        } else {
            return new cc.Vec2(parseInt(arr[0]), parseInt(arr[1]));
        }
    }

    toPitch(x) {
        return Math.floor(x / 50);
    }

    public checkMask(x: number, y: number): boolean {
        let mapId = MapManager.getInstance().currentMapId;
        mapId = MapConfig.getInstance().mapInfo[mapId].resId;
        if (this.mapMask && this.mapMask[mapId] && this.mapMask[mapId][this.toPitch(x)]) {
            return this.mapMask[mapId][this.toPitch(x)][this.toPitch(y)];
        } else {
            return false;
        }
    }

    public autoFindPath(mapId: number, startPoint: cc.Vec2, endPoint: cc.Vec2, speed: number): Array<PathStep> {
        mapId = MapConfig.getInstance().mapInfo[mapId].resId;
        let pitchSizeX: number = 50;
        let pitchSizeY: number = 50;

        let startX: number = this.toPitch(startPoint.x);
        let startY: number = this.toPitch(startPoint.y);
        let endX: number = this.toPitch(endPoint.x);
        let endY: number = this.toPitch(endPoint.y);

        let map = this.mapPathFinder[mapId];

        if (!map || !map[startX] || !map[startX][startY] || !map[endX] || !map[endX][endY]) {
            return [];
        }
        if (this.pathFinder) {
            this.pathFinder.init(map, map[startX][startY], map[endX][endY]);
        } else {
            this.pathFinder = new PathFinder(map, map[startX][startY], map[endX][endY]);
        }
        this.pathFinder.findPath();

        let path: Array<cc.Vec2> = [];
        let node: PathNode = this.pathFinder.endNode;

        while (node != null) {
            path.push(new cc.Vec2(node.x * pitchSizeX, node.y * pitchSizeY));
            node = node.fatherNode;
        }
        this.clearMap(mapId);
        let result: Array<PathStep> = [];
        for (let i = path.length - 1; i >= 1; --i) {
            let deltaX: number = Math.floor(path[i].x - path[i - 1].x);
            let deltaY: number = Math.floor(path[i].y - path[i - 1].y);
            let direction = this.getStepDirection(deltaX, deltaY);

            let stepSize = speed;
            for (let j = 0; j < pitchSizeX; j += stepSize) {
                let x = 0;
                if (deltaX > 0) {
                    if (deltaX > stepSize) { x = stepSize; deltaX -= stepSize; }
                    else x = deltaX
                } else if (deltaX < 0) {
                    if (deltaX < -stepSize) { x = -stepSize; deltaX += stepSize; }
                    else x = deltaX;
                }
                let y = 0;
                if (deltaY > 0) {
                    if (deltaY > stepSize) { y = stepSize; deltaY -= stepSize; }
                    else y = deltaY
                } else if (deltaY < 0) {
                    if (deltaY < -stepSize) { y = -stepSize; deltaY += stepSize; }
                    else y = deltaY;
                }
                result.push(new PathStep(direction, x, y));
            }
        }
        path = null;
        return result;
    }

    public getStepDirection(deltaX, deltaY): StepDirection {
        var ret: StepDirection = StepDirection.Center;
        if (deltaX < 0) {
            if (deltaY < 0) ret = StepDirection.RightDown;
            else if (deltaY == 0) ret = StepDirection.Right;
            else ret = StepDirection.RightUp;
        } else if (deltaX == 0) {
            if (deltaY < 0) ret = StepDirection.Down;
            else if (deltaY == 0) ret = StepDirection.Center;
            else ret = StepDirection.Up;
        }
        else {
            if (deltaY < 0) ret = StepDirection.LeftDown;
            else if (deltaY == 0) ret = StepDirection.Left;
            else ret = StepDirection.LeftUp;
        }
        return ret;
    }

    clearMap(mapId: number) {
        let map = this.mapPathFinder[mapId];
        for (let i = 0; i < map.length; ++i) {
            for (let j = 0; j < map[i].length; ++j) {
                if (!map[i][j]) {
                    continue;
                }
                map[i][j].fatherNode = null;
                map[i][j].isVisited = false;
                map[i][j].f = map[i][j].g = map[i][j].h = 0;
            }
        }
    }

    getMapName(mapId: number) {
        return this.mapInfo[mapId].name
    }
}