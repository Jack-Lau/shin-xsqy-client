import RobotPrefab from "./RobotPrefab";
import { CommonUtils } from "../utils/CommonUtils";
import { NetUtils } from "../net/NetUtils";
import { PlayerOnlineStatus } from "../net/Protocol";
import MapManager from "../map/MapManager";
import { TimerUtils } from "../utils/TimerUtils";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import MapConfig from "../config/MapConfig";
import { GameConfig } from "../config/GameConfig";
import { Setting } from "../base/Global";


export default class RobotManager {
    private static _instance: RobotManager = null;
    public robots : Array<RobotPrefab> = [];
    
    private constructor() {
        Setting.robotMcVisible.subscribe(this.refreshRobotExhibit.bind(this))
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new RobotManager();
            TimerUtils.startTimer(3000, -1, this._instance.refreshRobots.bind(this._instance), () => {})
        }
        return this._instance;
    }

    setPath(robotId, path) {
        if (RobotManager.getInstance().robots[robotId]) {
            RobotManager.getInstance().robots[robotId].path = path;
            RobotManager.getInstance().robots[robotId].startWalk();
        }
    }

    async addRobot(player, parent: cc.Node) {
        let registerBoxPrefab = await CommonUtils.getPanelPrefab('robotPrefab') as cc.Prefab;
        let robot = cc.instantiate(registerBoxPrefab).getComponent(RobotPrefab);
        robot.init(player);
        // robot.stateChange();
        robot.node.parent = parent;
        robot.node.opacity = 0;
        robot.node.runAction(cc.fadeTo(1, 255));
        await CommonUtils.wait(1);
        this.robots.push(robot);
    }

    clearRobots() {
        for (let robot of this.robots) {
            robot.path = [];
            robot.removed = true;
            CommonUtils.safeRemove(robot.node)
            robot = null;
        }
        this.robots = [];
    }

    refreshRobotExhibit(visible: boolean) {
        if (visible) {
            this.robots.forEach(robot => robot.initMcOrFashion())
        } else {
            this.robots.forEach(robot => robot.cleanMcOrFashion())
        }
    }

    async refreshRobots() {
        let mapId = MapManager.getInstance().currentMapId;
        let accountIds = this.robots.map(x => x.player.accountId).join(',')
        if (accountIds == "") {
            return;
        }
        if (GameConfig.isInBattle) {
            return;
        }
        let robotInfo = await NetUtils.post<Array<PlayerOnlineStatus>>('/player/getOnlineStatusByIdList', [accountIds]);
        if (mapId != MapManager.getInstance().currentMapId) {
            return;
        }
        if (robotInfo.isRight) {
            let arr = robotInfo.right;
            // 刷新玩家状态
            let infoObj = R.mergeAll(arr.map(x => {
                let result = {};
                result[x.playerLocation.accountId] = x
                return result;
            }));
            this.robots.forEach(ele => {
                let info = infoObj[ele.player.accountId];
                if (info == undefined) {
                    return;
                }
                if (info.playerLocation.mapId == mapId) {
                    ele.refreshState(info);
                } else {
                    ele.removeFromMap();
                }
            })
            this.robots = this.robots.filter(x => !x.removed);

            let mapConfig = MapConfig.getInstance().mapInfo[mapId];

            if (this.robots.length < mapConfig.maxPlayerMirror) {
                EventDispatcher.dispatch(Notify.GET_SOME_PLAYER_IN_THIS_MAP, {amount: this.robots.length, excludeIds: this.robots.map(x => x.player.accountId).join(',')})
            }
        }
    }
}