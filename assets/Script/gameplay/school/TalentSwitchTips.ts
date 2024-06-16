import TalentSkillPanel, { Talent, TalentModel } from "./TalentSkillPanel";
import { ResUtils } from "../../utils/ResUtils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
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
export default class TalentSwitchTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    bgs: cc.Node[] = [];
    @property(cc.Sprite)
    title: cc.Sprite = null;
    @property(cc.Label)
    textLabel: cc.Label = null;
    @property(cc.Label)
    currencyLabel: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    myCurrency = 0;

    index = 0;

    type = 1;

    from: TalentSkillPanel = null;

    titleFrameNames = ['font_riyao', 'font_yueyao', 'font_huoyao', 'font_shuiyao', 'font_muyao', 'font_jinyao', 'font_tuyao', 'font_luohou', 'font_jidu'];
    // onLoad () {}

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirm.bind(this)));
    }

    async init(LV: number, index: number, type: string, taConifig: Talent, from: TalentSkillPanel) {
        this.index = index;
        this.from = from;
        if (type == 'YIN') {
            this.type = 0;
            this.bgs[0].active = false;
            this.bgs[1].active = true;
            this.title.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[index] + 2);
        } else {
            this.type = 1;
            this.bgs[0].active = true;
            this.bgs[1].active = false;
            this.title.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[index] + 1);
        }
        let data = taConifig.talent[this.type];
        let description = data.description;
        this.textLabel.string = CommonUtils.evalDescription(description, null, LV);

        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${150}`, []) as any;
        if (response.status === 0) {
            this.myCurrency = R.prop('amount', response.content);
        }
        this.currencyLabel.string = this.myCurrency.toString();
    }

    async onConfirm() {
        if (this.myCurrency < 5000) {
            TipsManager.showMsgFromConfig(1154);
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/perk/ring/myself/switchSelection', [this.index, this.type == 0 ? 'YANG' : 'YIN']) as any;
        if (response.status === 0) {
            this.from.perkRing = response.content.perkRing;
            await this.from.setCurrentModel();
            this.from.onItem(this.index);
            TipsManager.showMessage('效果切换成功！');
        }
        this.closePanel();
    }

    closePanel() {
        this.node.destroy();
    }
    // update (dt) {}
}
