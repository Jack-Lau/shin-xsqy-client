import { CommonUtils } from "../../utils/CommonUtils";
import ShareDetailPanel from "./ShareDetailPanel";
import { NetUtils } from "../../net/NetUtils";
import { Notify } from "../../config/Notify";
import { TipsManager } from "../../base/TipsManager";
import PlayerData from "../../data/PlayerData";
import SnapshotShare from "./SnapshotShare";
import SecondConfirmBox from "../../base/SecondConfirmBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SharePanel extends cc.Component {
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    addInviteSlot: cc.Button = null;

    @property(cc.Button)
    copyBtn: cc.Button = null;

    @property(cc.Label)
    kbLabel: cc.Label = null;

    @property(cc.Label)
    eneryLabel: cc.Label = null;

    @property(cc.Button)
    getAwardBtn: cc.Button = null;

    @property(cc.Button)
    showDetailBtn: cc.Button = null;



    @property(cc.Label)
    codeLabel: cc.Label = null;

    @property(cc.Label)
    inviteLabel: cc.Label = null;

    @property(cc.Sprite)
    fifthImage: cc.Sprite = null;

    @property(cc.SpriteFrame)
    fifthSf1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    fifthSf2: cc.SpriteFrame = null;

    @property(cc.Label)
    playerNumLabel: cc.Label = null;

    url: string = 'http://www.kxiyou.com/kxy?invite_code='
    record: any = null;

    async start() {
        await this.init();
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.copyBtn.node.on(cc.Node.EventType.TOUCH_END, this.share.bind(this));
        this.showDetailBtn.node.on(cc.Node.EventType.TOUCH_END, this.showDetailPanel.bind(this));
        this.getAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.getAward.bind(this));
        this.kbLabel.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage("仙石<img src='currency_icon_151'/> 有钱男子汉, 没钱汉子难!");
        });
        this.eneryLabel.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage("元宝<img src='currency_icon_150'/> 好汉, 就是好浪费钱的汉!");
        });
        this.addInviteSlot.node.on(cc.Node.EventType.TOUCH_END, this.openSecondConfirmBox(this.inviteSlotExtend.bind(this)).bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/invitation/view/myself', []) as any;
        if (response.content) {
            let inviteInfo = response.content;
            this.codeLabel.string = inviteInfo.inviterRecord.invitationCode + '';
            this.inviteLabel.string = inviteInfo.invitationCount + '/' + inviteInfo.inviterRecord.invitationLimit;
        }

        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/invitation/resolveInvitationReward', []) as any;
        if (response2.status == 0 && response2.content != undefined) {
            let inviteInfo = response2.content;
            this.eneryLabel.string = inviteInfo.todayKbdzpEnergyReward;
            this.kbLabel.string = CommonUtils.toCKb(inviteInfo.todayKuaibiReward) + '';
            this.record = inviteInfo;
        }

        this.playerNumLabel.node.active = false;
        if (PlayerData.getInstance().genesis) {
            let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/count', []) as any;
            if (response3.status == 0) {
                this.playerNumLabel.string = response3.content + '/9999';
                if (response3.content >= 9999) {
                    this.fifthImage.spriteFrame = this.fifthSf2;
                } else {
                    this.fifthImage.spriteFrame = this.fifthSf1;
                }
            }
        } else {
            this.fifthImage.spriteFrame = this.fifthSf2;
        }
    }

    closePanel() {
        this.node.parent.removeChild(this.node);
    }

    openSecondConfirmBox(cb) {
        return async function() {
            let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
            let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
            [scb.node.x, scb.node.y] = [0, 0];
            scb.node.height = CommonUtils.getViewHeight();
            scb.init(CommonUtils.textToRichText(`是否消耗 [900404]10[ffffff]<img src='currency_icon_151'/> 开通一个邀请位？`), cb);
            scb.from = this.node;
            scb.node.parent = this.node.parent;
        }.bind(this);
    }

    async inviteSlotExtend() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/invitation/extendInvitationLimit', []) as any;
        if (response.status === 0) {
            TipsManager.showMessage('开通成功');
            this.init();
        }
    }

    async share() {
        this.node.active = false;
        let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
        let prefab = await CommonUtils.getPanelPrefab('share/snapshotShare') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(SnapshotShare);
        panel.from = this.node;
        panel.init(this.codeLabel.string);
        event.detail = {
            panel: panel
        }
        this.node.dispatchEvent(event);
    }

    async showDetailPanel() {
        this.node.active = false;
        let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
        let prefab = await CommonUtils.getPanelPrefab('share/shareDetail') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(ShareDetailPanel);
        panel.from = this.node;
        event.detail = {
            panel: panel
        }
        this.node.dispatchEvent(event);
    }

    async getAward() {
        if (this.record && this.record.todayRewardDelivered == true) {
            TipsManager.showMsgFromConfig(1484);
            return;
        }
        // we send the request any way
        let result = await CommonUtils.getCaptchaResponse();
        let response = await NetUtils.sendHttpRequest(
            NetUtils.RequestType.POST, 
            '/invitation/obtainInvitationReward', 
            [],
            {},
            {
                ticket: result.ticket,
                randStr: result.randstr
            }
        ) as any;
        if (response.status == 0 && response.content) {
            this.record = response.content;
            let energyNum = response.content.todayKbdzpEnergyReward;
            let kbNum = CommonUtils.toCKb(response.content.todayKuaibiReward);
            TipsManager.showMsgFromConfig(1483);
            TipsManager.showMessage("获得 " + kbNum + "<img src='currency_icon_151'/>");
            TipsManager.showMessage("获得 " + energyNum + "<img src='icon_nengliang'/>");
        }
    }

    // update (dt) {}
}
