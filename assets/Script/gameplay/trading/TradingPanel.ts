import { CommonUtils } from "../../utils/CommonUtils";
import TradeLinePanel from "./TradeLinePanel";
import TradingMyPanel from "./TradingMyPanel";
import TradingRecordPanel from "./TradingRecordPanel";

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

enum Type {
    TradeLine = 0, Warehouse = 1, Record = 2
}

@ccclass
export default class TradingPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Node)
    contentNodes: cc.Node[] = [];
    @property(cc.Toggle)
    toggles: cc.Toggle[] = [];
    @property(cc.Node)
    bottomNodes: cc.Node[] = [];
    @property(TradeLinePanel)
    line: TradeLinePanel = null
    @property(TradingMyPanel)
    my: TradingMyPanel = null
    @property(TradingRecordPanel)
    record: TradingRecordPanel = null

    selected = Type.TradeLine;

    helpType = [22, 23, 24];

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    async start() {
        await this.init();
        this.initEvents();
    }

    async init() {
        this.onToggle();
    }

    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, this.onHelpBtn.bind(this));
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.onToggle.bind(this, index));
        });
    }

    onToggle(index = 0) {
        this.selected = index;
        this.updateShow();
    }

    onHelpBtn() {
        CommonUtils.showInfoPanel(null, 30)();
    }

    updateShow() {
        this.contentNodes.forEach((item, index) => {
            if (index == this.selected) {
                item.active = true;
                this.bottomNodes[index].active = true;
            } else {
                item.active = false;
                this.bottomNodes[index].active = false;
            }
        });
        if (this.selected == 0) {
            this.line.adjustPage();
        } else if (this.selected == 1) {
            this.my.adjustPage();
        } else if (this.selected == 2) {
            this.record.adjustPage();
        }
    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
