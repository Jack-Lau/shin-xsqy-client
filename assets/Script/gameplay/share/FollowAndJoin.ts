import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import GainEnergyPanel from "../kbwheel/GainEnergyPanel";
import KbWheel from "../kbwheel/KbWheel";
import { GameConfig } from "../../config/GameConfig";

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
export default class FollowAndJoin extends cc.Component {

    @property(cc.EditBox)
    input: cc.EditBox = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Sprite)
    wxQrCode: cc.Sprite = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Label)
    qqGroupLabel: cc.Label = null;

    from: cc.Node = null;

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmOnClick.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });
        if (this.wxQrCode) {
            this.wxQrCode.node.on(cc.Node.EventType.TOUCH_END, this.followWx.bind(this));
        }
        if (this.qqGroupLabel) {
            this.qqGroupLabel.string = '1、加入官方Q群 （' + GameConfig.currentQQGroup + '）\n2、通过群公告获得Q群激活码\n3、在此界面输入Q群激活码即可完成'
        }
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }

    async confirmOnClick() {
        let path = '/kbdzp/enableBooster';
        if (this.wxQrCode) {
            path += '2'
        } else {
            path += '1';
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, path, [this.input.string]) as any;
        if (response.status == 0) {
            PlayerData.getInstance().kbRecord = response.content;
            TipsManager.showMsgFromConfig(1518);
            if (this.from) {
                let gainEnergyPanel = this.from.getComponent(GainEnergyPanel);
                gainEnergyPanel.init();
                if (gainEnergyPanel.from) {
                    let kbwheel = gainEnergyPanel.from.getComponent(KbWheel) as KbWheel;
                    if (kbwheel) {
                        kbwheel.init();
                    }
                }
            }
            this.closePanel();
        }
    }

    followWx() {
        let isWeixin = false;
        var ua = window.navigator.userAgent.toLowerCase();
        let match = ua.match(/MicroMessenger/i);
        if (match && match[0] == 'micromessenger') {
            isWeixin = true;
        } else {
            isWeixin = false;
        }
        if (isWeixin) {
            window.location.href = "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzUzOTg4MzcxNQ==&scene=110#wechat_redirect";
        }
    }

    // update (dt) {}
}
