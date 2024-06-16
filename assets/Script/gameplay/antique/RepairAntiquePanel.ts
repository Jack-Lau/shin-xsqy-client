import AntiquePanel from "./AntiquePanel";
import AntiqueData from "./AntiqueData";
import Optional from "../../cocosExtend/Optional";
import { AntiqueOverall } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import PlayerData from "../../data/PlayerData";

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
export default class RepairAntiquePanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    gotoBtn: cc.Button = null;
    @property(cc.Node)
    antiqueIcons: cc.Node[] = [];
    @property(cc.Animation)
    unAntiqueAnims: cc.Animation[] = [];
    @property(cc.Toggle)
    toggles: cc.Toggle[] = [];

    @property(cc.Label)
    formulaLabel: cc.Label = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    bottomLabel: cc.Label = null;
    @property(cc.Label)
    successLabel: cc.Label = null;

    @property(cc.Node)
    banNode: cc.Node = null;
    @property(cc.Node)
    boxNode: cc.Node = null;

    @property(cc.Animation)
    successAnim: cc.Animation = null;

    private from: AntiquePanel = null;
    private data: AntiqueData = null;
    private antiqueOverall: AntiqueOverall = null;
    private parts: Array<string> = [];
    private selected = 0;
    private showToggles: Array<number> = [];

    private isRuning = false;
    onLoad() {
        if (cc.winSize.height / cc.winSize.width < 16 / 9) {
            this.boxNode.scale = cc.winSize.height / 1366;
        }
    }

    start() {
        this.banNode.active = false;
        this.initEvents();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.gotoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onGotoBtn.bind(this)));
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.upSelected.bind(this, index));
        });
    }

    init(from: AntiquePanel, data: AntiqueData, antiqueOverall: AntiqueOverall) {
        this.from = from;
        this.data = data;
        this.antiqueOverall = antiqueOverall;

        this.updateLabel();

        this.antiqueIcons.forEach((icon) => {
            icon.active = false;
        });
        if (cc.isValid(this.antiqueOverall.antiqueRecord.part)) {
            //设置已经修复的型象
            this.parts = this.antiqueOverall.antiqueRecord.part.toString().split(',');
            this.parts.forEach((part) => {
                this.antiqueIcons[parseInt(part)].active = true;
            });
        }
        //标号
        let max = 5;
        this.showToggles = [];
        this.toggles.forEach((toggle, index) => {
            if (this.parts.toString().indexOf(index.toString()) != -1) {
                toggle.node.active = false;
            } else {
                toggle.node.active = true;
                max -= 1;
                if (max < 0) {
                    toggle.node.active = false;
                } else {
                    this.showToggles.push(index);
                }
            }
        });
        this.upSelected(this.showToggles[0]);
    }

    async updateLabel() {
        let config1 = this.data.getConfigWesternsById(this.antiqueOverall.antiqueRecord.repairCount);
        let config2 = this.data.getConfigWesternsById(this.antiqueOverall.antiqueRecord.repairCount + 1);
        this.successLabel.string = Math.floor(config1.fmap(c => c.successRate).getOrElse(0) * 100) + '%';
        if (config2.isValid()) {
            let beilv = (config2.getValue().sellKCShow / (config1.getValue().sellKCShow + config1.getValue().repairPrice) * 100).toString();
            let label = (config1.getValue().sellKCShow + config1.getValue().repairPrice) + 'x' + parseInt(beilv) + '%=';
            this.formulaLabel.string = label;
            this.priceLabel.string = config2.getValue().sellKCShow.toString();
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${150}`, []) as any;
        if (response.status === 0) {
            let currency = R.prop('amount', response.content);
            this.bottomLabel.string = config1.getValue().repairPrice;
			this.bottomLabel.node.color = cc.Color.fromHEX(this.bottomLabel.node.color, currency < config1.getValue().repairPrice ? '#ff5050' : '#0C6D08');
        }
    }

    upSelected(selected: number) {
        this.selected = selected;
        this.toggles.forEach((toggle) => {
            toggle.isChecked = false;
        });
        this.toggles[selected].isChecked = true;
    }

    async onGotoBtn() {
        let data;
        if (this.parts.length == 0) {
            data = this.selected;
        } else {
            data = R.append(this.selected)(this.parts);
        }
        this.banNode.active = true;
        this.isRuning = true;
        //播动画   
        let animStart = this.unAntiqueAnims[this.selected].play('repairGuoc');
        await CommonUtils.wait(animStart.duration - 0.2);
        
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/antique/repair', [data.toString()]) as any;
        if (response.status === 0) {
            this.antiqueOverall = response.content;
            if (this.antiqueOverall.antiqueRecord.started) {
                //播动画     
                let start = this.successAnim.play('repairChengg');
                await CommonUtils.wait(start.duration);
                this.from.setData();
                CommonUtils.safeRemove(this.node);
            } else {
                this.data.openRewardTips(this.antiqueOverall, true, '真可惜，只能廉价变卖给商人换些材料了');
                this.isRuning = false;
                this.closePanel();
                return;
            }

        }
        await CommonUtils.wait(0.5);
        this.isRuning = false;
        this.banNode.active = false;
    }

    // update (dt) {}
    closePanel() {
        if (this.isRuning) {
            TipsManager.showMessage('修复中……');
            return;
        }
        this.from.setData();
        CommonUtils.safeRemove(this.node);
    }

}
