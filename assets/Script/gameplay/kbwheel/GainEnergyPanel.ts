import { CommonUtils } from "../../utils/CommonUtils";
import SharePanel from "../share/SharePanel";
import PlayerData from "../../data/PlayerData";
import FollowAndJoin from "../share/FollowAndJoin";
import { NetUtils } from "../../net/NetUtils";
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

const {ccclass, property} = cc._decorator;

@ccclass
export default class GainEnergyPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    
    @property(cc.Button)
    shareGotoBtn: cc.Button = null;

    @property(cc.Button)
    wxGotoBtn: cc.Button = null;

    @property(cc.Button)
    qqGotoBtn: cc.Button = null;

    @property(cc.Sprite)
    wxComplete: cc.Sprite = null;

    @property(cc.Sprite)
    qqComplete: cc.Sprite = null;

    @property(cc.Button)
    questGoto: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    share: cc.Sprite = null;

    @property(cc.Sprite)
    wxFollow: cc.Sprite = null;

    @property(cc.Sprite)
    qqGroup: cc.Sprite = null;

    @property(cc.Sprite)
    kbQuest: cc.Sprite = null;

    from: cc.Node = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.shareGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSharePanel.bind(this));
        this.wxGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.followWx.bind(this));
        this.qqGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.joinQQGroup.bind(this));
        this.questGoto.node.on(cc.Node.EventType.TOUCH_END, this.unlockQuest.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.init();
    }

    async init () {
        await PlayerData.getInstance().updateKbRecord();
        let record = PlayerData.getInstance().kbRecord;
        if (record) {
            this.qqComplete.node.active = record.booster1;
            this.qqGotoBtn.node.active = !record.booster1;

            this.wxComplete.node.active = record.booster2;
            this.wxGotoBtn.node.active = !record.booster2;

            let qqGroupIndex = record.booster1 ? 20 : 2;
            let wxFollowIndex = record.booster2 ? 30 : 3;
            let shareIndex = 4;
            let kbQuestIndex = 1;

            this.qqGroup.node.zIndex = qqGroupIndex;
            this.wxFollow.node.zIndex = wxFollowIndex
            this.share.node.zIndex = shareIndex
            this.kbQuest.node.zIndex = kbQuestIndex
        }
    }

    async openSharePanel() {
        await CommonUtils.openPanel('share/sharePanel', SharePanel, this)();
        if (this.from && this.from.parent) {
            this.from.parent.removeChild(this.from);
        }
        this.node.parent.removeChild(this.node);
    }

    async joinQQGroup() {
        let panel = await CommonUtils.openPanel('share/joinQQGroup', FollowAndJoin, this)() as FollowAndJoin;
        panel.from = this.node;
        this.node.active = false;
    }

    async followWx() {
        let panel = await CommonUtils.openPanel('share/followWeixin', FollowAndJoin, this)() as FollowAndJoin;
        panel.from = this.node;
        this.node.active = false;
    }

    async unlockQuest() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/start', [730000]) as any;
        if (response.status == 0) {
            TipsManager.showMessage('转盘任务领取成功，快去完成吧~');
            if (this.from) {
                CommonUtils.safeRemove(this.from);
                this.from = null;
            }
            this.closePanel();
        }
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        this.node.parent.removeChild(this.node);
    }

    // update (dt) {}
}
