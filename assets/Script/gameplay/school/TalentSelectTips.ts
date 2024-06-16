import { CommonUtils } from "../../utils/CommonUtils";
import TalentSkillPanel, { Talent } from "./TalentSkillPanel";
import { ResUtils } from "../../utils/ResUtils";
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

@ccclass
export default class TalentSelectTips extends cc.Component {

    @property(cc.Sprite)
    titles: cc.Sprite[] = [];
    @property(cc.Label)
    textLabels: cc.Label[] = [];
    @property(cc.Button)
    button1: cc.Button = null;
    @property(cc.Button)
    button2: cc.Button = null;

    index = 0;

    from: TalentSkillPanel = null;

    titleFrameNames = ['font_riyao', 'font_yueyao', 'font_huoyao', 'font_shuiyao', 'font_muyao', 'font_jinyao', 'font_tuyao', 'font_luohou', 'font_jidu'];
    // onLoad () {}

    start() {
        this.button1.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSelected.bind(this, 'YIN')));
        this.button2.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSelected.bind(this, 'YANG')));
    }

    async init(index: number, taConifig: Talent, from: TalentSkillPanel) {
        this.index = index;
        this.from = from;
        this.titles[0].spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[index] + 1);
        this.titles[1].spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[index] + 2);
        this.textLabels[0].string = CommonUtils.evalDescription(taConifig.talent[1].description, null, 1);
        this.textLabels[1].string = CommonUtils.evalDescription(taConifig.talent[0].description, null, 1);
    }

    async onSelected(type: string) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/perk/ring/myself/makeSelection', [this.index, type]) as any;
        if (response.status === 0) {
            this.from.perkRing = response.content.perkRing;
            this.from.setCurrentModel();
        }
        this.closePanel();
    }

    closePanel() {
        this.node.destroy();
    }
    // update (dt) {}
}
