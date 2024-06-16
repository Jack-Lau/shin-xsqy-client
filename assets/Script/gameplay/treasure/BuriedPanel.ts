import { CommonUtils } from "../../utils/CommonUtils";
import { QuestManager } from "../../quest/QuestManager";
import Optional from "../../cocosExtend/Optional";
import ActivityData, { ActivityShowInfo } from "../activity/ActivityData";
import ActivityBoxTips from "../activity/ActivityBoxTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ChatMessage } from "../../net/Protocol";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { NetUtils } from "../../net/NetUtils";

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

export interface BroadcastInfo {
    id: number;
    name: string;
    external: number;
    description: string;
    talkDescription: string;
}

@ccclass
export default class BuriedPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    lowerBtn: cc.Button = null;
    @property(cc.Button)
    oneBtn: cc.Button = null;
    @property(cc.Button)
    twoBtn: cc.Button = null;
    @property(cc.Button)
    ssBtn: cc.Button = null;

    @property(cc.RichText)
    text: cc.RichText = null;

    burieds: Array<ChatMessage> = [];
    wabaoBuriedConfig: BroadcastInfo = null;

    lastLength = 0;
    time = 4;
    subscript = 0;

    async start() {
        await this.init();
        this.initEvents();
    }

    async init() {
        await ActivityData.getInstance().initConfig();
        this.text.string = '';
        let config = (await ConfigUtils.getConfigJson('BroadcastInfo'));
        this.wabaoBuriedConfig = R.prop(3290001, config);
        this.schedule(this.toBuried.bind(this), this.time * 10);
        this.schedule(this.updateLabel.bind(this), this.time);
        await this.toBuried();
        this.updateLabel();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.lowerBtn.node.on(cc.Node.EventType.TOUCH_END, this.goGoHas.bind(this));
        this.oneBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 13));
        this.twoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 14));
        this.ssBtn.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }
    async showTips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/activity/activityBoxTips', ActivityBoxTips) as ActivityBoxTips;
        let confActivityShowInfo: Optional<ActivityShowInfo> = ActivityData.getInstance().getActivityShowById(157007);
        let showAward = confActivityShowInfo.fmap(s => s.showAward);
        if (showAward.isValid()) {
            panel.init(showAward.getValue(), event);
        }
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    goGoHas() {
        QuestManager.findNpc(44);
        this.closePanel();
    }


    async toBuried() {
        this.lastLength = this.burieds.length;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/latestInterestingMessage/3290001', []) as any;
        if (response.status === 0) {
            this.burieds = response.content as Array<ChatMessage>;
        }
    }

    async updateLabel() {
        if (this.burieds.length <= 0) {
            return;
        }
        this.text.node.y = -30;
        let data1 = this.burieds[this.subscript].elements[0].content;

        let playerName1 = R.path(['args', 'playerName'], data1);
        let search = 'playerName=';
        let start = playerName1.toString().indexOf(search);
        let playerName2 = playerName1.toString().substring(start + search.length, playerName1.toString().indexOf(',', start));
        let amount = '<color=#20650e> ' + R.path(['args', 'amount'], data1) + '</color>';
        let currency = '<color=#20650e>' + R.path(['args', 'currency'], data1) + '</color>';
        let data2 = this.wabaoBuriedConfig.description.toString().replace('${playerName}', '<color=#bc462f> ' + playerName2 + ' </color>');
        let data3 = data2.toString().replace('${currency}', currency);
        let data4 = data3.toString().replace('${amount}', amount);
        this.text.string = data4;

        let action1 = cc.moveTo(0.2, 0, 0);
        this.text.node.runAction(action1);
        await CommonUtils.wait(this.time - 0.5);
        let action2 = cc.moveTo(0.2, 0, 30);
        this.text.node.runAction(action2);

        this.subscript += 1;
        if (this.subscript >= this.burieds.length) {
            this.subscript = 0;
        }
    }

    update(dt) {

    }

    onDestroy() {
        this.unschedule(this.toBuried.bind(this));
        this.unschedule(this.updateLabel.bind(this));
    }
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
