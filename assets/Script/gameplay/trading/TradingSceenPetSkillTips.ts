import { CommonUtils } from "../../utils/CommonUtils";
import TradingSceenPetSikllItem from "./TradingSceenPetSikllItem";
import { PetData } from "../pet/PetData";
import TradingSceenPetTips from "./TradingSceenPetTips";
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
export default class TradingSceenPetSkillTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    resetBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Toggle)
    completely: cc.Toggle = null;
    @property(cc.Toggle)
    notCompletely: cc.Toggle = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    items: TradingSceenPetSikllItem[] = [];

    from: TradingSceenPetTips = null;

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }


    async start() {
        let config = await PetData.getPetSkillConfig();
        for (let id in config) {
            if (!config[id].isActive) {
                let prf = cc.instantiate(this.prefab);
                prf.parent = this.scrollView.content;
                let item = prf.getComponent(TradingSceenPetSikllItem);
                item.init(parseInt(id), this.from.skillIds);
                this.items.push(item);
            }
        }
        if (this.from.from.screenPet.abilitiyMatch != (NetUtils.NONE_VALUE as any)) {
            if (this.from.from.screenPet.abilitiyMatch == 'all') {
                this.completely.isChecked = true;
                this.notCompletely.isChecked = false;
            } else {
                this.completely.isChecked = false;
                this.notCompletely.isChecked = true;
            }
        }
        this.initEvents();
    }

    initEvents() {
        this.resetBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onResetBtn.bind(this)));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
    }

    onResetBtn() {
        this.items.forEach((item) => {
            item.cel();
        });
    }

    onConfirmBtn() {
        let ids: number[] = [];
        this.items.forEach((item) => {
            if (item.getIsGou()) {
                ids.push(item.id);
            }
        });
        if (this.from != null) {
            this.from.showSkillList(ids, this.completely.isChecked ? 'all' : 'any');
        }
        this.closePanel();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
