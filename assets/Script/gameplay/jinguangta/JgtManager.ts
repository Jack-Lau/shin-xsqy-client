import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { NetUtils } from "../../net/NetUtils";
import { GoldTowerChallengeEntity, GoldTowerRoomEntity, GoldTowerRecord, CurrencyStack } from "../../net/Protocol";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";
import Optional from "../../cocosExtend/Optional";
import JgtMiniStatus from "./JgtMiniStatusPanel";
import SweepJGTPanel from "./sweep/SweepJGTPanel";

enum RoomState { Challenging, Finished }

export default class JgtManager {
    private static _instance = null;
    roomId = 0;
    roomPrototypeId: number = 0;
    battleSessionId: number = 0;
    treasureNumber: number = 0;
    level: number = 0;
    wayPoints: Array<Optional<number>> = [];
    wayPointColors: Array<Optional<number>> = [];
    wipeoutPointColor = 1;
    wipeoutAwards: Array<CurrencyStack> = [];
    wayPointIds = [9010, 9011, 9012, 9013];
    floor51WayId = 9036;
    floor1WayId = 9037;
    param1: string = "";
    param2: string = "";
    param3: string = "";


    statusPanel: JgtMiniStatus = null;

    state: RoomState = RoomState.Challenging;

    roomConfig = null;

    private constructor() {
        EventDispatcher.on(Notify.MAP_CHANGED, this.onMapChanged.bind(this));
    }

    public static getInstance(): JgtManager {
        if (!this._instance) {
            this._instance = new JgtManager();
        }
        return this._instance;
    }

    isEntering = false;
    async enterJgt(tryWipeOut = false) {
        if (this.isEntering) return;
        this.isEntering = true;
        if (!this.roomConfig) {
            this.roomConfig = await ConfigUtils.getConfigJson('GoldTowerRooms');
        }
        let result1 = await NetUtils.get<GoldTowerChallengeEntity>('/goldTower/getGoldTowerChallenge', []);
        if (result1.isRight) {
            this.roomId = result1.right.currentRoomId;
            if (!result1.right.inChallenge) {
                let result2 = await NetUtils.post<GoldTowerChallengeEntity>('/goldTower/startOrReturnGoldTowerChallenge', []);
                if (result2.isRight) {
                    result1 = result2;
                } else {
                    this.isEntering = false;
                    return;
                }
            }

            let result3 = await NetUtils.get<GoldTowerRecord>('/goldTower/getGoldTowerRecord', []);
            let result4 = await NetUtils.get<GoldTowerRoomEntity>('/goldTower/getGoldTowerRoom', [result1.right.currentRoomId]);
            if (result4.isRight) {
                let maxFinishFloor = result3.fmap(x => x.maxFinishFloor).getOrElse(0);
                let wipeOutBattleWin = result3.fmap(x => x.wipeOutBattleWin).getOrElse(false);
                let taken = result3.fmap(x => x.takenWipeOutAward).getOrElse(true);
                if (maxFinishFloor >= 50
                    && result1.right.lastFloorCount == 0
                    && result1.right.availableChallengeCount > 0
                    && tryWipeOut) {
                    // 进入第0层
                    let roomInfo = result4.right;
                    this.roomId = 9999;
                    this.roomPrototypeId = 9999;
                    this.state = wipeOutBattleWin ? RoomState.Finished : RoomState.Challenging;
                    this.battleSessionId = null;
                    this.treasureNumber = 0;
                    this.wayPoints = [
                        new Optional<number>(),
                        new Optional<number>(),
                        new Optional<number>(),
                        new Optional<number>(),
                    ]; 
                    this.wayPointColors = [
                        new Optional<number>(),
                        new Optional<number>(),
                        new Optional<number>(),
                        new Optional<number>(),
                    ];
                    this.level = 0;
                    this.param1 = "1040047";
                    this.param2 = null;
                    this.param3 = null;
                    if (wipeOutBattleWin) {
                        await this.initRoom();
                        await this.finishWipeOutChallenge(true);
                    } else {
                        this.initRoom();
                    }
                } else if (result1.right.availableChallengeCount == 0) {
                    this.isEntering = false;
                    TipsManager.showMessage('今日挑战次数已耗尽，请明日再战');
                    return;
                } else {
                    let roomInfo = result4.right;
                    this.roomId = result1.right.currentRoomId;
                    this.roomPrototypeId = roomInfo.prototypeId;
                    this.state = result1.right.currentRoomChallengeSuccess ? RoomState.Finished : RoomState.Challenging;
                    this.battleSessionId = result1.right.currentBattleSessionId;
                    this.treasureNumber = result1.right.availableTreasureCount;
                    this.wayPoints = [
                        new Optional<number>(roomInfo.waypoint_1),
                        new Optional<number>(roomInfo.waypoint_2),
                        new Optional<number>(roomInfo.waypoint_3),
                        new Optional<number>(roomInfo.waypoint_4),
                    ]; 
                    this.wayPointColors = [
                        new Optional<number>(roomInfo.waypointColor_1),
                        new Optional<number>(roomInfo.waypointColor_2),
                        new Optional<number>(roomInfo.waypointColor_3),
                        new Optional<number>(roomInfo.waypointColor_4),
                    ];
                    this.level = roomInfo.floorId;
                    this.param1 = roomInfo.challengeParam_1;
                    this.param2 = roomInfo.challengeParam_2;
                    this.param3 = roomInfo.challengeParam_3;
                    
                    if (wipeOutBattleWin && !taken && this.wipeoutAwards.length == 0) {   // 如果扫荡奖励尚未领取 且没有缓存用于显示
                        await NetUtils.post<GoldTowerChallengeEntity>('/goldTower/takeWipeOutAward', []);
                    }

                    this.initRoom();
                }
            }
        }
        await this.tryShowWipeoutRewards();
        this.isEntering = false;
    }

    async tryShowWipeoutRewards () {
        if (this.wipeoutAwards.length > 0) {
            // 显示奖励动画
            let panel = await CommonUtils.getPanel('gameplay/jinguangta/sweep/SweepJGTPanel', SweepJGTPanel) as SweepJGTPanel;
            panel.init(() => {})
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            let start = Math.max(0, this.wipeoutAwards.length - 50);
            
            let amount156 = 0;
            let amount153 = 0;
            this.wipeoutAwards.forEach(ele => {
                if (ele.currencyId == 156) {
                    amount156 += ele.amount;
                } else if (ele.currencyId == 153) {
                    amount153 += ele.amount;
                }
            })
            panel.playTween(R.slice(start, this.wipeoutAwards.length - 1, this.wipeoutAwards), amount156, amount153);
        }
        this.wipeoutAwards = [];
    }

    async finishChallenge() {
        let config = R.prop(this.roomPrototypeId, this.roomConfig);
        R.prop('challengeNpcId', config).toString().split(',').forEach(ele => {
            EventDispatcher.dispatch(Notify.REMOVE_NPC_BY_ID, { npcId: ele });
        });
        this.state = RoomState.Finished;
        if (this.statusPanel) {
            this.statusPanel.init();
        }
        for (let i = 0; i < this.treasureNumber; ++i) {
            let sprite = await CommonUtils.generateSprite('ui/gameplay/jinguangta/jgt_box');
            sprite.node.x = CommonUtils.randomInt(-300, 150);
            sprite.node.y = CommonUtils.randomInt(-384, 0);
            EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, { component: sprite.node });
            sprite.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(async function () {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/openTreasure', []);
                if (response.status === 0) {
                    CommonUtils.safeRemove(sprite.node);
                }
            }));
        }
        this.wayPoints.forEach((ele, index) => {
            if (ele.isValid()) {
                EventDispatcher.dispatch(Notify.ADD_NPC_BY_ID, { npcId: this.wayPointIds[index] });
            }
        });
    }

    async finishWipeOutChallenge(goto51: boolean) {
        let config = R.prop(this.roomPrototypeId, this.roomConfig);
        R.prop('challengeNpcId', config).toString().split(',').forEach(ele => {
            EventDispatcher.dispatch(Notify.REMOVE_NPC_BY_ID, { npcId: ele });
        });
        this.state = RoomState.Finished;
        if (this.statusPanel) {
            this.statusPanel.init();
        }
        if (goto51) {
            this.wipeoutPointColor = 7;
            EventDispatcher.dispatch(Notify.ADD_NPC_BY_ID, { npcId: this.floor51WayId });
        } else {
            this.wipeoutPointColor = 6;
            EventDispatcher.dispatch(Notify.ADD_NPC_BY_ID, { npcId: this.floor1WayId });
        }
    }

    isIniting = false;
    async initRoom() {
        if (this.isIniting) return;
        this.isIniting = true;
        EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 200 });
        await CommonUtils.wait(0.5);

        let config = R.prop(this.roomPrototypeId, this.roomConfig);
        // 显示柱子
        this.addColumnSprite(R.prop('color', config));

        if (this.state === RoomState.Challenging) {
            // 显示NPC
            R.prop('challengeNpcId', config).toString().split(',').forEach(ele => {
                EventDispatcher.dispatch(Notify.ADD_NPC_BY_ID, { npcId: ele });
            });
        } else {
            // 显示宝箱和传送阵
            for (let i = 0; i < this.treasureNumber; ++i) {
                let sprite = await CommonUtils.generateSprite('ui/gameplay/jinguangta/jgt_box');
                sprite.node.x = CommonUtils.randomInt(-300, 150);
                sprite.node.y = CommonUtils.randomInt(-384, 0);
                EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, { component: sprite.node });
                sprite.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(async function () {
                    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/openTreasure', []);
                    if (response.status === 0) {
                        CommonUtils.safeRemove(sprite.node);
                    }
                }));
            }
            this.wayPoints.forEach((ele, index) => {
                if (ele.isValid()) {
                    EventDispatcher.dispatch(Notify.ADD_NPC_BY_ID, { npcId: this.wayPointIds[index] });
                }
            });
        }
        this.isIniting = false;
    }

    /**
     * 为金光塔添加装饰的柱子
     * @param id (1 ~ 7)
     */
    async addColumnSprite(id) {
        let w = 1280;
        let h = 1536;

        let node = new cc.Node('Sprite');
        let sprite = node.addComponent(cc.Sprite);
        node.x = 109 - 1280 / 2;
        node.y = 1536 / 2 - 1112;
        let spriteFrame = await ResUtils.loadSprite('ui/gameplay/jinguangta/jgt_zhu_' + id);
        sprite.spriteFrame = spriteFrame;
        EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, { component: node });

        let node2 = new cc.Node('Sprite');
        let sprite2 = node2.addComponent(cc.Sprite);
        node2.x = 336 - 1280 / 2;
        node2.y = 1536 / 2 - 1220;
        sprite2.spriteFrame = spriteFrame;
        EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, { component: node2 });
    }

    getCurrentRoomNpcId() {
        return R.path([this.roomPrototypeId, 'challengeNpcId'], this.roomConfig);
    }

    isComplete() {
        return this.state === RoomState.Finished;
    }

    async onMapChanged(event) {
        let mapId = R.prop('mapId', event.detail);
        if (mapId && mapId == 200) {
            if (!this.statusPanel) {
                this.statusPanel = await CommonUtils.getPanel('gameplay/jinguangta/jgtMiniStatusPanel', JgtMiniStatus) as JgtMiniStatus;
            }
            this.statusPanel.init();
            EventDispatcher.dispatch(Notify.MAIN_UI_ADD_RIGHT_DOWN_PANEL, {panel: this.statusPanel, panelName: "JGT"});
        }
    }
}