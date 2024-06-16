
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import RepairAntiquePanel from "./RepairAntiquePanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import AntiqueData, { WesternMerchantInfo } from "./AntiqueData";
import { AntiqueOverall, ChatMessage } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { BroadcastInfo } from "../treasure/BuriedPanel";
import { ConfigUtils } from "../../utils/ConfigUtil";
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
export default class AntiquePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    clinchBtn: cc.Button = null;
    @property(cc.Button)
    goAntiqueBtn: cc.Button = null;
    @property(cc.Button)
    serverRewardBtn: cc.Button = null;
    @property(cc.Label)
    serverRewardLabel: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    progresslabel: cc.Label = null;

    @property(cc.RichText)
    richText: cc.RichText = null;

    @property(cc.Node)
    contentBoxNode: cc.Node = null;
    @property(cc.Node)
    buyNode: cc.Node = null;
    @property(cc.Node)
    repairNode: cc.Node = null;
    @property(cc.Node)
    antiqueNode: cc.Node = null;

    @property(cc.Node)
    antiqueIcons: cc.Node[] = [];

    private antiqueData: AntiqueData = null;
    private antiqueOverall: Optional<AntiqueOverall> = null;
    private bossesName: string = '';

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.antiqueData = new AntiqueData();
        if (cc.winSize.height / cc.winSize.width < 16 / 9) {
            this.contentBoxNode.scale = cc.winSize.height / 1366;
        }
    }

    async start() {
        GameConfig.startGambling();
        await this.antiqueData.init();
        await this.setData();
        let config = (await ConfigUtils.getConfigJson('BroadcastInfo'));
        this.wabaoBuriedConfig = R.prop(3290002, config);
        this.initEvents();
        this.schedule(this.toBuried.bind(this), this.time * 10);
        this.schedule(this.updateLabel.bind(this), this.time);
        await this.toBuried();
        this.updateLabel();
    }

    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 15));
        this.clinchBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onClinchBtn.bind(this)));
        this.goAntiqueBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onGoAntiqueBtn.bind(this)));
        this.serverRewardBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onServerRewardBtn.bind(this)));
    }

    async setData() {
        this.antiqueOverall = await this.antiqueData.getAntiqueOverall();
        this.updateData();
    }

    async updateData() {

        this.updateAntique();
        if (this.antiqueOverall.fmap(a => a.antiqueRecord).fmap(a => a.repairCount).isValid()) {
            let config = this.antiqueData.getConfigWesternsById(this.antiqueOverall.getValue().antiqueRecord.repairCount);
            if (config.isValid() && this.antiqueOverall.getValue().antiqueRecord.started) {
                let richString1 = config.getValue().description.toString().replace('[CurrencyIcon_150]', '');
                let richString2 = richString1.toString().replace(new RegExp(/\d+/g), function () {
                    return ' <img src=\'150\'/>' + arguments[0];
                });
                this.richText.string = richString2;

            }
            this.progresslabel.string = this.antiqueOverall.getValue().antiqueRecord.progress.toString();
            this.progressBar.progress = this.antiqueOverall.getValue().antiqueRecord.progress / 100;
        }
        this.serverRewardBtn.node.parent.active = false;
        if (this.antiqueOverall.fmap(a => a.antiqueSharedRecord).fmap(a => a.lastPublicAwardCreateTime).isValid()) {
            let myTime = this.antiqueOverall.getValue().antiqueRecord.lastPublicAwardObtainTime;
            let sherdTime = this.antiqueOverall.getValue().antiqueSharedRecord.lastPublicAwardCreateTime;
            if (myTime == null || sherdTime > myTime) {
                this.serverRewardBtn.node.parent.active = true;
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [this.antiqueOverall.getValue().antiqueSharedRecord.publicAwardAccountId]) as any;
                if (response.status === 0) {
                    this.bossesName = response.content;
                    this.serverRewardLabel.string = '来自 ' + this.bossesName;
                }
            }
        }
    }

    async updateAntique() {
        if (this.antiqueOverall.fmap(a => a.antiqueRecord).fmap(a => a.started).isValid()) {
            if (this.antiqueOverall.getValue().antiqueRecord.started) {
                this.antiqueNode.active = true;
                this.buyNode.active = false;
                this.repairNode.active = true;
                this.antiqueIcons.forEach((icon) => {
                    icon.active = false;
                });
                if (this.antiqueOverall.fmap(a => a.antiqueRecord).fmap(a => a.part).isValid()) {
                    //设置已经修复的型象
                    let parts = this.antiqueOverall.getValue().antiqueRecord.part.toString().split(',');
                    parts.forEach((part) => {
                        this.antiqueIcons[parseInt(part)].active = true;
                    });
                }

            } else {
                this.antiqueNode.active = false;
                this.buyNode.active = true;
                this.repairNode.active = false;
                this.richText.string = '豪爽的侠士，<img src=\'150\'/>100 买个古董吧！';
            }
        }
    }

    async onClinchBtn() {
        let config = this.antiqueData.getConfigWesternsById(this.antiqueOverall.getValue().antiqueRecord.repairCount);
        let amount = config.fmap(a => a.sellKCShow).getOrElse(0);
        CommonUtils.showRichSCBox(
            `是否以<img src='currency_icon_${150}'/><color=#187122>${amount * 0.95}</c> 的价格出售给商人？`,
            `(${amount}*0.95=<img src='currency_icon_${150}'/>${amount * 0.95})`,
            "商人需收取5%的服务费用",
            this.toClinch.bind(this)
        );
    }

    async toClinch() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/antique/sell', []) as any;
        if (response.status === 0) {
            this.antiqueData.openRewardTips(response.content, false, '商人抱着买到的古董爱不释手~');
            this.setData();
        }
    }

    async onGoAntiqueBtn() {
        if (this.buyNode.active) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/antique/buy', []) as any;
            if (response.status === 0) {
                TipsManager.showMessage('购买成功！');
                this.setData();
            }
        } else {
            this.openRepair();
        }
    }

    async onServerRewardBtn() {
        let myTime = this.antiqueOverall.getValue().antiqueRecord.lastPublicAwardObtainTime;
        let sherdTime = this.antiqueOverall.getValue().antiqueSharedRecord.lastPublicAwardCreateTime;
        if (sherdTime == null) {
            TipsManager.showMessage('暂无全服奖励！');
        } else {
            if (myTime == null || sherdTime > myTime) {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/antique/take', []) as any;
                if (response.status === 0) {
                    this.antiqueData.openRewardTips(response.content, false, `恭喜你成功抢到了${this.bossesName}发出的全服回馈！`);
                    this.setData();
                }
            } else {
                TipsManager.showMessage('已领取全服奖励！');
            }
        }

    }

    async openRepair() {
        if (this.antiqueOverall.getValue().antiqueRecord.progress == 100) {
            TipsManager.showMessage('已经修复到最完美的程度，不需要再修了');
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/antique/RepairAntiquePanel', RepairAntiquePanel) as RepairAntiquePanel;
        panel.init(this, this.antiqueData, this.antiqueOverall.getValue());
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    //广播

    @property(cc.RichText)
    text: cc.RichText = null;
    burieds: Array<ChatMessage> = [];
    wabaoBuriedConfig: BroadcastInfo = null;

    lastLength = 0;
    time = 4;
    subscript = 0;

    async toBuried() {
        this.lastLength = this.burieds.length;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/latestInterestingMessage/3290002', []) as any;
        if (response.status === 0) {
            this.burieds = response.content as Array<ChatMessage>;
        }
    }

    async updateLabel() {
        if (this.burieds.length <= 0) {
            return;
        }
        this.text.node.y = -50;
        let data1 = this.burieds[this.subscript].elements[0].content;

        let playerName1 = R.path(['args', 'playerName'], data1);
        let search = 'playerName=';
        let start = playerName1.toString().indexOf(search);
        let playerName2 = playerName1.toString().substring(start + search.length, playerName1.toString().indexOf(',', start));
        let amount = '<color=#8cf602> ' + R.path(['args', 'amount'], data1) + ' </color>';
        let data2 = this.wabaoBuriedConfig.description.toString().replace('${playerName}', '<color=#8cf602> ' + playerName2 + ' </color>');
        let data4 = data2.toString().replace('${amount}', amount);
        this.text.string = data4;

        let action1 = cc.moveTo(0.2, 0, 0);
        this.text.node.runAction(action1);
        await CommonUtils.wait(this.time - 0.5);
        let action2 = cc.moveTo(0.2, 0, 50);
        this.text.node.runAction(action2);

        this.subscript += 1;
        if (this.subscript >= this.burieds.length) {
            this.subscript = 0;
        }
    }

    onDestroy() {
        this.unschedule(this.toBuried.bind(this));
        this.unschedule(this.updateLabel.bind(this));
    }
    // update (dt) {}
    closePanel() {
        GameConfig.stopGambling();
        CommonUtils.safeRemove(this.node);
    }

}
