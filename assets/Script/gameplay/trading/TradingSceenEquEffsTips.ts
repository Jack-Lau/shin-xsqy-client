import { CommonUtils } from "../../utils/CommonUtils";
import TradingSceenEquEffsItem from "./TradingSceenEquEffsItem";
import TradingSceenEquTips from "./TradingSceenEquTips";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import { fromJS } from "immutable";
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
export default class TradingSceenEquEffsTips extends cc.Component {

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

    @property(cc.Node)
    layout: cc.Node = null;

    items: TradingSceenEquEffsItem[] = [];

    from: TradingSceenEquTips = null;

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));

    }


    start() {
        this.items = this.layout.getComponentsInChildren(TradingSceenEquEffsItem);
        this.initEvents();
        let spSkillConfig = EquipUtils.getSpSkillConfig();
        let index = 0;
        for (let key in spSkillConfig) {
            this.items[index].init(parseInt(key), this.from.effIds);
            index += 1;
        }
        if (this.from && this.from.from && this.from.from.screenEqu.effectMatch != (NetUtils.NONE_VALUE as any)) {
            if (this.from.from.screenEqu.effectMatch == 'all') {
                this.completely.isChecked = true;
                this.notCompletely.isChecked = false;
            } else {
                this.completely.isChecked = false;
                this.notCompletely.isChecked = true;
            }
        }
    }

    initEvents() {
        this.resetBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onResetBtn.bind(this)));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        this.items.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.legalCheck.bind(this, index));
        });
    }

    legalCheck(index: number) {
        let ids: number[] = [];
        this.items.forEach((item) => {
            if (item.getIsGou()) {
                ids.push(item.id);
            }
        });
        if (ids.length > 6) {
            this.items[index].cel();
            TipsManager.showMessage('最多选择6个！');
        }
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
            this.from.showEffRichText(ids, this.completely.isChecked ? 'all' : 'any');
        }
        this.closePanel();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
