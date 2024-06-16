import { CommonUtils } from "../../utils/CommonUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import CasinoPanel from "./CasinoPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import YbwlPanel from "../ybwl/YbwlPanel";
import DigOrePanel from "../digOre/DigOrePanel";
import AntiquePanel from "../antique/AntiquePanel";
import TigerMachinePanel from "../tigerMachine/TigerMachinePanel";
import { QuestProxy } from "../../quest/QuestProxy";
import { QuestManager } from "../../quest/QuestManager";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class CasinoWelcomePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property(cc.Button)
    gotoBtn: cc.Button = null;

    @property(cc.Node)
    blockNode: cc.Node = null;

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.gotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.goto.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    async goto() {
        let index = CommonUtils.getCheckedIndex(this.container);
        switch (index) {
            case 0: // 长乐坊
                if (PlayerData.getInstance().playerLevel < 35) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/casino/casinoPanel', CasinoPanel);
                break;
            case 1: // 一本万利
                if (PlayerData.getInstance().playerLevel < 35) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/ybwl/ybwlPanel', YbwlPanel);
                break;
            case 2: // 挖矿
                if (PlayerData.getInstance().playerLevel < 35) {           
                    TipsManager.showMsgFromConfig(1195);
                    return;
                }
                this.openPanel('gameplay/digOre/DigOrePanel', DigOrePanel);
                break;
            case 3: // 古董
                if (PlayerData.getInstance().playerLevel < 35) {
                    TipsManager.showMessage('35级以上才能鉴宝，先去完成主线任务吧');
                    return;
                }
                this.openPanel('gameplay/antique/AntiquePanel', AntiquePanel);
                break;
            case 4: // 老虎机
                if (PlayerData.getInstance().playerLevel < 35) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/tigerMachine/TigerMachinePanel', TigerMachinePanel);
                break;
        }
    }

    async openPanel (url, klass) {
        this.closePanel();
        let panel = await CommonUtils.getPanel(url, klass);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}