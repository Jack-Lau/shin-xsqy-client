import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import KbWheel from "../kbwheel/KbWheel";
import SharePanel from "../share/SharePanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import YbwlPanel from "../ybwl/YbwlPanel";
import { QuestManager } from "../../quest/QuestManager";
import JinGuangTaPanel from "../jinguangta/JinGuangTaPanel";
import PetGainPanel from "../pet/PetGainPanel";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivityEntryPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    kbGotoBtn: cc.Button = null;
    @property(cc.Button)
    shareGotoBtn: cc.Button = null;
    @property(cc.Button)
    schoolQuestGotoBtn: cc.Button = null;
    @property(cc.Button)
    ybwlGotoBtn: cc.Button = null;
    @property(cc.Button)
    jgtGotoBtn: cc.Button = null;
    @property(cc.Button)
    ndGotoBtn: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    // onLoad () {}

    start () {
        this.kbGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('kbWheel', KbWheel).bind(this));
        this.shareGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('share/sharePanel', SharePanel).bind(this));
        this.ybwlGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/ybwl/ybwlPanel', YbwlPanel).bind(this));
        this.schoolQuestGotoBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            QuestManager.findNpc(602);
            this.closePanel();
        }.bind(this));
        this.jgtGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/jinguangta/JinGuangTaPanel', JinGuangTaPanel).bind(this));
        this.ndGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/pet/petGainPanel', PetGainPanel).bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
    }

    openPanel(prefabName: string, panelType: { prototype: cc.Component }) {
        let _this = this;
        return async function () {
            let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
            let panelInstance = cc.instantiate(prefab);
            let panel = panelInstance.getComponent(panelType);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            _this.closePanel();
        }
    }

    closePanel() {
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
        }
    }

    // update (dt) {}
}
