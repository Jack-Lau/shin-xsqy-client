import { CommonUtils } from "../../utils/CommonUtils";
import TradeLineShowScreen from "./TradeLineShowScreen";
import TradeLinePanel, { TradeScreenEqu } from "./TradeLinePanel";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import TradingSceenEquEffsTips from "./TradingSceenEquEffsTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ItemQuality } from "../../bag/ItemConfig";
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

const { ccclass, property } = cc._decorator;

@ccclass
export default class TradingSceenEquTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    spBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.EditBox)
    enLevelEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    fcEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    patkEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    matkEditBox: cc.EditBox = null;
    @property(cc.Toggle)
    partsToggles: cc.Toggle[] = [];
    @property(cc.Toggle)
    schoolToggles: cc.Toggle[] = [];
    @property(cc.Toggle)
    qualityChecks: cc.Toggle[] = [];
    @property(cc.Toggle)
    isSatisfied: cc.Toggle = null;
    @property(cc.Toggle)
    notSatisfied: cc.Toggle = null;


    @property(cc.RichText)
    effRichText: cc.RichText = null;

    @property(cc.Label)
    textLabel1: cc.Label = null;
    @property(cc.Label)
    textLabel2: cc.Label = null;

    screenEqu: TradeScreenEqu = null;

    from: TradeLinePanel = null;

    effIds = [];

    partsData = [10, 21, 25, 22, 24, 23];
    qualitysData = [3, 4, 5];
    schoolsData = [[500, 501, 502, 503, 504, 505], [506, 507, 508, 509, 510, 511], [512, 513, 514, 515, 516, 517], [518, 519, 520, 521, 522, 523]];

    texts = [['外伤', '内伤'], ['外防', '内防'], ['内防', '速度'], ['外防', '气血'], ['气血', '幸运'], ['速度', '幸运']];

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    start() {
        this.initEvents();
    }

    init(screenEqu: TradeScreenEqu) {
        this.screenEqu = screenEqu;
        if (this.screenEqu.part == (NetUtils.NONE_VALUE as any)) {
            return;
        } else {
            let index = this.partsData.indexOf(this.from.screenEqu.part);
            for (let i = 0; i < this.partsToggles.length; i++) {
                let part = this.partsToggles[i];
                if (i == index) {
                    part.isChecked = true;
                } else {
                    part.isChecked = false;
                }
            }
        }
        if (this.from.screenEqu.color != (NetUtils.NONE_VALUE as any)) {
            this.qualityChecks[this.qualitysData.indexOf(this.from.screenEqu.color)].isChecked = true;
        }


        if (this.from.screenEqu.effectIds != (NetUtils.NONE_VALUE as any)) {
            let list = this.from.screenEqu.effectIds.split(',');
            let ids: number[] = [];
            for (let id of list) {
                ids.push(parseInt(id));
            }
            this.showEffRichText(ids, this.from.screenEqu.effectMatch);
        }
        if (this.from.screenEqu.maxEnhanceLevel != (NetUtils.NONE_VALUE as any)) {
            this.enLevelEditBox.string = this.from.screenEqu.maxEnhanceLevel.toString();
        }
        if (this.from.screenEqu.fc != (NetUtils.NONE_VALUE as any)) {
            this.fcEditBox.string = this.from.screenEqu.fc.toString();
        }
        if (this.from.screenEqu.patk != (NetUtils.NONE_VALUE as any)) {
            this.patkEditBox.string = this.from.screenEqu.patk.toString();
        }
        if (this.from.screenEqu.matk != (NetUtils.NONE_VALUE as any)) {
            this.matkEditBox.string = this.from.screenEqu.matk.toString();
        }
        if (this.from.screenEqu.paramMatch != (NetUtils.NONE_VALUE as any)) {
            if (this.from.screenEqu.paramMatch == 'all') {
                this.isSatisfied.isChecked = true;
                this.notSatisfied.isChecked = false;
            } else {
                this.isSatisfied.isChecked = false;
                this.notSatisfied.isChecked = true;
            }
        }
        for (let i = 0; i < this.schoolToggles.length; i++) {
            let list = this.from.screenEqu.skillEnhancementEffectIds.split(',');
            let ids: number[] = [];
            for (let id of list) {
                ids.push(parseInt(id));
            }
            let school = this.schoolToggles[i];
            let isChecked = false;
            for (let id of this.schoolsData[i]) {
                if (ids.indexOf(id) > -1) {
                    isChecked = true;
                    break;
                }
            }
            school.isChecked = isChecked;
        }

    }

    initEvents() {
        this.spBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSpBtn.bind(this)));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        this.partsToggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, () => {
                this.textLabel1.string = `当前${this.texts[index][0]}≥`;
                this.textLabel2.string = `当前${this.texts[index][1]}≥`;
                this.patkEditBox.string = '';
                this.matkEditBox.string = '';
            });
        });
    }

    showEffRichText(ids: number[], isCompletely) {
        this.effIds = ids;
        let text = '';
        let index = 0;
        for (let id of ids) {
            if (id >= 600 && id < 700) {
                let name = R.prop('name', EquipUtils.getSpSkill(id));
                text += `<img src=\'${id}\'/>${name}   `;
            }
            index += 1;
            if (index == 7) {
                break;
            }
        }
        this.effRichText.string = text;
        if (ids.length > 0) {
            this.screenEqu.effectMatch = isCompletely;
        }
    }

    async onSpBtn() {
        let panel = await CommonUtils.getPanel('gameplay/trading/TradingSceenEquEffsTips', TradingSceenEquEffsTips) as TradingSceenEquEffsTips;
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    async onConfirmBtn() {
        for (let i = 0; i < this.partsToggles.length; i++) {
            let part = this.partsToggles[i];
            if (part.isChecked) {
                this.screenEqu.part = this.partsData[i];
                break;
            }
        }
        for (let i = 0; i < this.qualityChecks.length; i++) {
            let quality = this.qualityChecks[i];
            if (quality.isChecked) {
                this.screenEqu.color = this.qualitysData[i];
                break;
            }
        }
        if (this.enLevelEditBox.string != '') {
            this.screenEqu.maxEnhanceLevel = parseInt(this.enLevelEditBox.string);
        }
        if (this.fcEditBox.string != '') {
            this.screenEqu.fc = parseInt(this.fcEditBox.string);
        }
        if (this.patkEditBox.string != '') {
            this.screenEqu.patk = parseInt(this.patkEditBox.string);
        }
        if (this.matkEditBox.string != '') {
            this.screenEqu.matk = parseInt(this.matkEditBox.string);
        }
        if (this.from.screenEqu.fc != (NetUtils.NONE_VALUE as any) || this.from.screenEqu.patk != (NetUtils.NONE_VALUE as any)
            || this.from.screenEqu.matk != (NetUtils.NONE_VALUE as any)) {

            if (this.isSatisfied.isChecked) {
                this.screenEqu.paramMatch = 'all';
            } else {
                this.screenEqu.paramMatch = 'any';
            }
        }

        let schoolIds = [];
        for (let i = 0; i < this.schoolToggles.length; i++) {
            let school = this.schoolToggles[i];
            if (school.isChecked) {
                schoolIds = this.schoolsData[i];
                break;
            }
        }
        if (schoolIds.length > 0) {
            this.screenEqu.skillEnhancementEffectIds = schoolIds.join(',');
        } else {
            this.screenEqu.schoolEmpty();
        }

        let effectIds = (this.effIds as number[]).join(',');
        if (effectIds.length <= 0) {
            this.screenEqu.effsEmpty();
        } else {
            this.screenEqu.effectIds = effectIds;
        }


        if (this.from != null) {
            this.from.pageNumber = 1;
            this.from.adjustPage();
        }
        this.closePanel();
        TipsManager.showMsgFromConfig(1176);
    }

    middleEditBox(box: cc.EditBox) {
        CommonUtils.editBoxCenter(box);
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    // update (dt) {}
}
