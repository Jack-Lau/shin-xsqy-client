import ItemWithEffect from "../../base/ItemWithEffect";
import Optional from "../../cocosExtend/Optional";
import { CurrencyStack, Equipment } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { QuickUseItem } from "./QuickUseItem";
import { QuickUseManager } from "./QuickUseManager";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import ItemConfig, { ItemQuality } from "../../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class QuickUseBox extends cc.Component {
    @property(cc.Button)
    closeItemBtn: cc.Button = null;
    @property(cc.Button)
    closeEquipmentBtn: cc.Button = null;
    @property(ItemWithEffect)
    currencyItem: ItemWithEffect = null;
    @property(ItemWithEffect)
    equipmentItem: ItemWithEffect = null;
    @property(cc.Button)
    useBtn: cc.Button = null;
    @property(cc.Button)
    equipBtn: cc.Button = null;
    @property(cc.Node)
    itemNode: cc.Node = null;
    @property(cc.Node)
    equipmentNode: cc.Node = null;

    @property(cc.Label)
    beforeFcLabel: cc.Label = null;
    @property(cc.Label)
    afterFcLabel: cc.Label = null;

    @property(cc.Label)
    equipmentNameLabel: cc.Label = null;
    @property(cc.Label)
    itemNameLabel: cc.Label = null;


    stack: Optional<CurrencyStack> = new Optional<CurrencyStack>();
    equipment: Optional<Equipment> = new Optional<Equipment>();

    start () {
        this.initEvents();
    }

    initEvents () {
        this.closeItemBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeItem.bind(this));
        this.closeEquipmentBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeEquipment.bind(this));
        this.useBtn.node.on(cc.Node.EventType.TOUCH_END, this.useBtnOnClick.bind(this));
        this.equipBtn.node.on(cc.Node.EventType.TOUCH_END, this.equipBtnOnClick.bind(this));
        EventDispatcher.on(Notify.QUICK_USE_REFRESH, this.refresh.bind(this));
        this.equipmentNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.itemNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);

        EventDispatcher.on(Notify.SWITCH_MAP_EVENT, () => {
            this.equipmentNode.active = false
            this.itemNode.active = false
        })

        let _this = this;
        this.equipmentItem.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.equipment.valid) {
                EquipUtils.showEquipmentTips(_this.equipment.val)();
            }
        });
        this.currencyItem.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (_this.stack.valid) {
                CommonUtils.showCurrencyTips(_this.stack.val, false)(e);
            }
        });
    }

    useBtnOnClick () {
        if (this.stack.valid) {
            QuickUseItem.use(this.stack.val.currencyId);
        }
    }

    async equipBtnOnClick () {
        if (this.equipment.valid) {
            await CommonUtils.exchangeEquipment(this.equipment.val);
            QuickUseManager.removeE(this.equipment.val, true);
            this.refresh();
        }
    }

    closeItem () {
        if (this.stack.valid) {
            QuickUseManager.removeC(this.stack.val);
        }
        this.refresh();
    }

    closeEquipment () {
        if (this.equipment.valid) {
            QuickUseManager.removeE(this.equipment.val, false);
        }
        this.refresh();
    }

    /**
     * 显示规则：
     * 1. 有装备： 显示最近一件装备
     * 2. 无装备
     *    1) 有物品 显示物品
     *    2) 无，移除快捷使用
     */
    refresh () {
        let equipment = QuickUseManager.getE();
        if (equipment.valid) {
            this.equipment = equipment;
            this.showEquipment(equipment.val);
        } else {
            let stack = QuickUseManager.getC();
            this.stack = stack;
            if (stack.valid) {
                this.showCurrency(stack.val);
            } else {
                this.equipmentNode.active = this.itemNode.active = false
            }
        }
    }

    showEquipment(e: Equipment) {
        this.equipmentNode.active = true;
        this.itemNode.active = false;
        this.equipmentItem.initWithEquipment(e);
        let proto = EquipUtils.getProto(e);
        let display = EquipUtils.getDisplay(e);
        this.equipmentNameLabel.string = display.fmap(x => x.name).getOrElse("");
        this.equipmentNameLabel.node.color = cc.Color.fromHEX(this.equipmentNameLabel.node.color, CommonUtils.getTipColorByQuality(proto.fmap(x => x.quality).getOrElse(ItemQuality.Blue)));
        let beforeFc = proto.fmap(x => x.part).monadBind(p => PlayerData.getInstance().equipments[p]).fmap(EquipUtils.getFc).getOrElse(0);
        let afterFc = EquipUtils.getFc(e);
        this.beforeFcLabel.string = String(beforeFc);
        this.afterFcLabel.string = String(afterFc);
    }

    showCurrency(stack: CurrencyStack) {
        this.equipmentNode.active = false;
        this.itemNode.active = true;
        this.currencyItem.initWithCurrency(stack);
        let proto = ItemConfig.getInstance().getItemDisplayById(stack.currencyId, PlayerData.getInstance().prefabId);
        this.itemNameLabel.string = proto.fmap(x => x.name).getOrElse("");
        this.itemNameLabel.node.color = cc.Color.fromHEX(this.itemNameLabel.node.color, CommonUtils.getTipColorByQuality(proto.fmap(x => x.quality).getOrElse(ItemQuality.Blue)));
    }
}




