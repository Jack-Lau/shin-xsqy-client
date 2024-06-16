import { Notify } from "../config/Notify";
import MapConfig from "../config/MapConfig";
import MapManager from "./MapManager";
import CommonTips from "../base/CommonTips";
import { CommonUtils } from "../utils/CommonUtils";
import { ResUtils } from "../utils/ResUtils";
import PlayerData from "../data/PlayerData";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import CasinoWelcomePanel from "../gameplay/casino/CasinoWelcomePanel";
import { TipsManager } from "../base/TipsManager";

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
export default class WorldMap extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    map1: cc.Button = null;

    @property(cc.Button)
    map2: cc.Button = null;

    @property(cc.Button)
    map3: cc.Button = null;

    @property(cc.Button)
    map4: cc.Button = null;

    @property(cc.Button)
    map5: cc.Button = null;

    @property(cc.Button)
    map6: cc.Button = null;

    @property(cc.Button)
    map7: cc.Button = null;

    @property(cc.Button)
    map8: cc.Button = null;

    @property(cc.Button)
    map9: cc.Button = null;
    @property(cc.Button)
    map10: cc.Button = null;

    @property(cc.Button)
    map11: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;

    @property(cc.Sprite)
    playerHead: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.map1.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(1).bind(this));
        this.map2.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(2).bind(this));
        this.map3.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(3).bind(this));
        this.map4.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(4).bind(this));
        this.map5.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(5).bind(this));
        this.map6.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(6).bind(this));
        this.map7.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(7).bind(this));
        this.map8.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(8).bind(this));
        this.map9.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(9).bind(this));
        this.map10.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(10).bind(this));
        this.map11.node.on(cc.Node.EventType.TOUCH_END, this.switchToMap(11).bind(this));

        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.close.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });

        this.init();
        this.node.height = CommonUtils.getViewHeight();
    }

    async init() {
        this.playerHead.spriteFrame = await ResUtils.loadSpriteFromAltas("original/icon/icon_model", "icon_model-head_rect_" + PlayerData.getInstance().prefabId) as cc.SpriteFrame;
        let mapBtns = [this.map1, this.map2, this.map3,
        this.map4, this.map5, this.map6,
        this.map7, this.map8, this.map9,
        this.map10, this.map11];
        let mapId = MapManager.getInstance().currentMapId;
        if (mapBtns[mapId - 1]) {
            let x =  mapBtns[mapId - 1].node.x;
            let y = mapBtns[mapId - 1].node.y + 150;
            this.playerIcon.node.x = x;
            this.playerIcon.node.y = y;
            let seq = cc.repeatForever(
                cc.sequence(
                    cc.moveTo(1, x, y - 30),
                    cc.moveTo(1, x, y)
                ));
            this.playerIcon.node.runAction(seq);
        }
    }

    switchToMap(mapId) {
        let _this = this;
        return function () {
            let event = new EventDispatcher.NotifyEvent(Notify.SWITCH_TO_MAP);
            event.detail = {
                mapId: mapId
            };
            EventDispatcher.dispatchEvent(event);
            _this.close();

			/*
            if (mapId == 11) {
                _this.openCasinoGuide();
            }
			*/

            // let notShowGuide = cc.sys.localStorage.getItem(Notify.SHOW_CASINO_GUIDE_PANEL);
            // if (notShowGuide != 'true') {
            //     cc.sys.localStorage.setItem(Notify.SHOW_CASINO_GUIDE_PANEL, 'true');
            //     _this.openCasinoGuide();
            // }
        }
    }

    async openCasinoGuide () {
        let panel = await CommonUtils.getPanel('gameplay/casino/casinoWelcomePanel', CasinoWelcomePanel);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    close() {
        this.node.parent.removeChild(this.node);
    }

    // update (dt) {}
}
