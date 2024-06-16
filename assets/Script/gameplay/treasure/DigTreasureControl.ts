import { NetUtils } from "../../net/NetUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import CompassControl from "./CompassControl";
import DigTaoTips from "./DigTaoTips";
import { ShowAward } from "../activity/ActivityData";
import Optional from "../../cocosExtend/Optional";
import PlayerData from "../../data/PlayerData";
import MapManager from "../../map/MapManager";
import { ResUtils } from "../../utils/ResUtils";
import TreasureData, { TreasurePlace } from "./TreasureData";
import MapConfig from "../../config/MapConfig";
import ItemConfig from "../../bag/ItemConfig";
import { TipsManager } from "../../base/TipsManager";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class DigTreasureControl extends cc.Component {
    /**人物节点 */
    playerPoint: cc.Node = null;
    /**藏宝节点 */
    targetPoint: cc.Node = null;
    /**罗盘控制组件 */
    compassComm: CompassControl = null;
    /**是否开启挖宝 */
    isOpen: boolean;
    /**挖宝地图 */
    targetMap: Optional<TreasurePlace>;

    difference = 0;

    onLoad() {
        this.stopTreasure();
    }

    async start() {
        this.playerPoint = this.node.parent.getComponentInChildren('PlayerPrefab').node;
        await TreasureData.getInstance().initConfig();
        this.updateTarget();
        EventDispatcher.on(Notify.OPEN_DIG_TREASURE, CommonUtils.aloneFunction(this.showTreasure.bind(this)));
    }

    updateTarget() {
        this.targetMap = TreasureData.getInstance().randomTreasureMap();
    }

    update() {
        if (this.isOpen && this.targetMap.isValid()) {
            if (this.targetMap.getValue().mapId != MapManager.getInstance().currentMapId) {
                this.stopTreasure();
                return;
            }
            this.adjustAngle();
            if (this.playerByTreasure()) {
				this.targetPoint.opacity = 255;
                this.compassComm.showBtn();
            } else {
                this.compassComm.stopBtn();
            }
        }
    }

    async showTreasure() {
        if(this.isOpen){
            TipsManager.showMessage('在藏宝地图中，赶快去找找吧!');
        }else if (this.targetMap.isValid()) {
            let mapId = this.targetMap.fmap(x => x.mapId).getOrElse(1);
            if (mapId != MapManager.getInstance().currentMapId) {
                // 传送地图
                let event = new EventDispatcher.NotifyEvent(Notify.SWITCH_TO_MAP);
                event.detail = {
                    mapId: mapId
                };
                EventDispatcher.dispatchEvent(event);
            }
            await this.showCompass();
            // 添加宝藏点           
            await this.showPoint();
            this.difference = this.targetPoint.width / 2 - 15;
            await CommonUtils.wait(this.adjustAngle(true));
            this.isOpen = true;
        }

    }

    async showCompass() {
        //显示罗盘
        if (this.compassComm == null) {
            this.compassComm = await CommonUtils.getPanel('gameplay/treasure/CompassPanel', CompassControl) as CompassControl;
            this.compassComm.init(this);
            EventDispatcher.dispatch(Notify.MAIN_UI_ADD_RIGHT_DOWN_PANEL, { panel: this.compassComm, panelName: 'TRASURE' });
        } else {
            EventDispatcher.dispatch(Notify.MAIN_UI_ADD_RIGHT_DOWN_PANEL, { panel: this.compassComm, panelName: 'TRASURE' });
        }
    }

    async showPoint() {
        await CommonUtils.wait(0.5);
        if (this.targetPoint == null) {
            let node = new cc.Node('Sprite');
            let sprite = node.addComponent(cc.Sprite);
            if (this.targetMap.isValid()) {
                let mapId = MapManager.getInstance().currentMapId;
                let config = MapConfig.getInstance().mapInfo[mapId];
                node.x = this.targetMap.getValue().initialX - config.width / 2;
                node.y = config.height / 2 - this.targetMap.getValue().initialY;
                node.anchorY = 0.2;
                node.anchorX = 0.5;
				node.opacity = 0;
            }
            sprite.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/treasure/wabaoPanel', 'bg_tishibiaozhi');
            this.targetPoint = node;
            EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, { component: node });
        }
    }

    stopTreasure() {
        this.isOpen = false;
        if (this.targetPoint != null) {
            this.targetPoint.destroy();
            this.targetPoint = null;
        }
        if (this.compassComm != null) {
            EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_RIGHT_DOWN_PANEL, { panelName: 'TRASURE' });
            this.compassComm = null;
        }
    }

    /**计算罗盘角度 */
    adjustAngle(isInit = false) {
        let posSub = this.targetPoint.position.sub(this.playerPoint.position);
        const angle = cc.v2(1, 0).signAngle(cc.v2(posSub.x, posSub.y)) / Math.PI * 180;
        return this.compassComm.adjustAngle(angle, isInit);
    }

    /**人物与藏宝位置是否重合 */
    playerByTreasure() {
        if (
            this.playerPoint.x > this.targetPoint.x - this.difference && this.playerPoint.x < this.targetPoint.x + this.difference
            && this.playerPoint.y > this.targetPoint.y - 40 && this.playerPoint.y < this.targetPoint.y + 40
        ) {
            return true;
        }
        return false;
    }

    async useTrasureByServer() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/treasure/obtainTreasure', []) as any;
        if (response.status === 0) {
            this.stopTreasure();
            //打开奖励界面
            let panel = await CommonUtils.getPanel('gameplay/treasure/digTaoJiangliTips', DigTaoTips) as DigTaoTips;
            let data = {} as ShowAward;
            data.id = R.prop('currencyId', response.content);
            data.amount = R.prop('amount', response.content);
			if (data.id == 151) {
				data.amount = data.amount / 1000;
			}
            let config = ItemConfig.getInstance().getItemDisplayById(data.id, PlayerData.getInstance().prefabId);
            if (config.isValid()) {
                data.name = config.getValue().name;
            }
            panel.init(data);
            this.updateTarget();
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    onDestroy() {
        EventDispatcher.off(Notify.OPEN_DIG_TREASURE, this.showTreasure.bind(this));
    }
}
