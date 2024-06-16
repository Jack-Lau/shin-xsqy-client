import { CommonUtils } from "../utils/CommonUtils";

export default class MapBlockManager {
    private static _instance: MapBlockManager = null;
    public usingBlocks: { [key: string]: cc.Node } = {};
    public availableBlocks: { [key: string]: cc.Node } = {};
    public locationFlags: { [key: string]: Boolean } = {};
    public mapBlockPoll = new cc.NodePool();

    constructor() {
    }

    public static getInstance() {
        if (this._instance == null) {
            this._instance = new MapBlockManager();
            this._instance.init();
        }
        return this._instance;
    }

    private init() {
    }


    public getMapBlockSource(id: number, i: number, j: number) {
        let stringI = "0" + i;
        let stringJ = "0" + j;
        if (i >= 10) {
            stringI = "" + i;
        }
        if (j >= 10) {
            stringJ = "" + j;
        }
        let resourceName = 'map/' + id  + "/original_map_" + id + "_" + stringI + "x" + stringJ + "";
        return resourceName;
    }
}