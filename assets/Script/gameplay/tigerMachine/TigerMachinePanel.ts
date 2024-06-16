import { CommonUtils } from "../../utils/CommonUtils";
import TigerCardItem, { TigerCardType } from "./TigerCardItem";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { SlotsRecord, SlotsOverall } from "../../net/Protocol";
import TigerMFriendPanel from "./TigerMFriendPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
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
export default class TigerMachinePanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    friendBtn: cc.Button = null;
    @property(cc.Button)
    shakeBtn: cc.Button = null;
    @property(cc.Button)
    unRewardBtn: cc.Button = null;
    @property(cc.Button)
    serverRewardBtn: cc.Button = null;

    @property(TigerCardItem)
    cardItems: TigerCardItem[] = [];
    @property(cc.Toggle)
    rewardToggle: cc.Toggle[] = [];

    @property(cc.Label)
    shakeLabel: cc.Label = null;
    @property(cc.Label)
    myLabel: cc.Label = null;

    @property(cc.Node)
    redNode: cc.Node = null;

    currentReward = 0;
    myCurrency = 0;

    isruning = false;
    countdown = 0;
    lastLock = 0;

    data: SlotsOverall = null;
    costs = [25, 20, 40, 225];
    // onLoad () {}

    async start() {
        GameConfig.startGambling();
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        await this.init();
        if (this.data != null) {
            let slots = this.data.slotsRecord.slots;
            let locks = this.data.slotsRecord.locks;
            this.cardItems.forEach((card, index) => {
                card.init(index, slots[index], locks[index] as any, this);
            });
        }

        this.initEvents();
    }

    async init() {

        this.setMyLabel();
        //请求翻牌数据
        let responseData = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/slots/get', []) as any;
        if (responseData.status === 0) {
            this.data = responseData.content;
        }
        if (this.data != null) {
            this.currentReward = this.data.prizeId;
            let slots = this.data.slotsRecord.slots;
            if (slots[0] == 0 && slots[1] == 0 && slots[2] == 0 && slots[3] == 0) {
                this.currentReward = 0;
            }
            this.rewardToggle.forEach((toggle, index) => {
                if (index == this.currentReward - 1) {
                    toggle.isChecked = true;
                } else {
                    toggle.isChecked = false;
                }
            });
            if (this.currentReward > 0) {
                this.unRewardBtn.node.active = false;
                this.serverRewardBtn.node.active = true;
            } else {
                this.unRewardBtn.node.active = true;
                this.serverRewardBtn.node.active = false;
            }
            if (this.serverRewardBtn.node.active) {
                this.lastLock = this.data.slotsRecord.lockCount;
            }

            this.shakeLabel.string = this.costs[this.lastLock].toString();

        }

        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/slots/getLike', []) as any;
        if (response2.status === 0) {
            let awardData = response2.content as Array<any>;
            if (awardData.length > 0) {
                this.redNode.active = true;
            } else {
                this.redNode.active = false;
            }
        }
    }

    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 24));
        this.friendBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onFriendBtn.bind(this)));
        this.shakeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onShakeBtn.bind(this)));
        this.serverRewardBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onServerRewardBtn.bind(this)));
        this.unRewardBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMsgFromConfig(1129);
        });
    }

    setShakeLabel() {
        let lock = 0;
        this.cardItems.forEach((card, index) => {
            if (card.islock) {
                lock += 1;
            }
        });
        this.shakeLabel.string = this.costs[lock].toString();
    }

    async setMyLabel(){
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            this.myCurrency = CommonUtils.toCKb(R.prop('amount', response.content));
        }
        this.myLabel.string = this.myCurrency.toString();
    }

    async onFriendBtn() {
        if (this.isruning) {
            TipsManager.showMessage('正在摇奖中……');
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/tigerMachine/TigerMFriendPanel', TigerMFriendPanel) as TigerMFriendPanel;
        panel.init(this.data.slotsRecord.likeBigPrizeIdList);
        panel.from = this;
        this.node.active = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async onShakeBtn() {
        if (this.isruning) {
            TipsManager.showMessage('正在摇奖中……');
            return;
        }
        if (this.myCurrency < parseInt(this.shakeLabel.string)) {
            TipsManager.showMsgFromConfig(1127);
            return;
        }
        if (this.currentReward > 0) {
            let lock = 0;
            this.cardItems.forEach((card, index) => {
                if (card.islock) {
                    lock += 1;
                }
            });
            if (lock < 1) {
                TipsManager.showMsgFromConfig(1128);
                return;
            }
        }
        this.isruning = true;
        //网络请求
        let data: SlotsOverall = null;
        let responseData = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/slots/pull', []) as any;
        if (responseData.status === 0) {
            data = responseData.content;
            let slots = data.slotsRecord.slots;
            this.countdown = 4;
            this.cardItems.forEach((card, index) => {
                card.startTurn(slots[index], this.onTurn.bind(this));
            });
            this.setMyLabel();
        }
    }

    onTurn() {
        this.countdown -= 1;
        if (this.countdown == 0) {
            this.init();
            this.isruning = false;
        }
    }

    async onServerRewardBtn() {
        if (this.isruning) {
            TipsManager.showMessage('正在摇奖中……');
            return;
        }
        //网络请求
        let responseData = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/slots/take', []) as any;
        if (responseData.status === 0) {
            this.lastLock = 0;
            this.cardItems.forEach((card, index) => {
                card.init(index, TigerCardType.F, false, this);
            });
            this.init();
            //打开奖励界面    
        }
    }

    lastTime = new Date().getMilliseconds();

    update(dt) {
        if (this.rewardToggle[0].node.parent.opacity == 50) {
            this.rewardToggle[0].node.parent.opacity = 1;
            let repeat = cc.fadeTo(1.0, 255);
            this.rewardToggle[0].node.parent.runAction(repeat);
        }
        if (this.rewardToggle[0].node.parent.opacity == 255) {
            this.rewardToggle[0].node.parent.opacity = 254;
            let repeat = cc.fadeTo(1.0, 50);
            this.rewardToggle[0].node.parent.runAction(repeat);
        }
    }

    closePanel() {
        if (this.isruning) {
            TipsManager.showMessage('正在摇奖中……');
            return;
        }
        GameConfig.stopGambling();
        CommonUtils.safeRemove(this.node);
    }
}
