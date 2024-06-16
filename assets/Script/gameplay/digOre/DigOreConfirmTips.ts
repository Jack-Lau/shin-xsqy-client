import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import DigOrePanel from "./DigOrePanel";
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
export default class DigOreConfirmTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    btn: cc.Button = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    vouchersLabel: cc.Label = null;
    @property(cc.Label)
    kbLabel: cc.Label = null;
    @property(cc.Label)
    mykbLabel: cc.Label = null;
    
    isStart = false;
    
    from: DigOrePanel = null;
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.btn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onBtn.bind(this)));
    }
    
    async init(price: number, isStart: boolean) {
        this.isStart = isStart;
        this.priceLabel.string = price.toString();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            this.mykbLabel.string = String(CommonUtils.toCKb(R.prop('amount', response.content)));
        }
        if (isStart) {
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${169}`, []) as any;
            if (response2.status === 0) {
                this.vouchersLabel.string = Math.min(price / 10, Math.floor(R.prop('amount', response2.content))).toString();
            }
        } else {
            this.vouchersLabel.string = '0';
        }
    
        this.kbLabel.string = Math.max(0, price - Math.floor(parseInt(this.vouchersLabel.string) * 10)).toString();
    
    }
    
    async onBtn() {
        if (parseInt(this.mykbLabel.string) < parseInt(this.kbLabel.string)) {
            TipsManager.showMsgFromConfig(1021);
            return;
        }
        let url = '';
        if (this.isStart) {
            url = '/mineExploration/start';
        } else {
            url = '/mineExploration/add';
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, url, []) as any;
        if (response.status === 0) {
            this.from.overall = response.content;
            this.from.digOre = [];         
            this.from.updateShow();    
            if (this.isStart) {
                TipsManager.showMsgFromConfig(1218);
            } else {
                TipsManager.showMsgFromConfig(1217);
            }    
        }
        this.closePanel();
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
    
    // update (dt) {}
}
