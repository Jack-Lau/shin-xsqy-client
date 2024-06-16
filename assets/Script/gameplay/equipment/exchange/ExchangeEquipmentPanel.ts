import ItemConfig, { EquipmentPart, ItemCategory } from "../../../bag/ItemConfig";
import BagData from "../../../bag/BagData";
import BagItem from "../../../bag/BagItem";
import ExchangeEquipmentItem from "./ExchangeEquipmentItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import { TipsManager } from "../../../base/TipsManager";
import { NetUtils } from "../../../net/NetUtils";
import { ResUtils } from "../../../utils/ResUtils";
import PlayerData from "../../../data/PlayerData";
import Optional from "../../../cocosExtend/Optional";
import { Equipment } from "../../../net/Protocol";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangeEquipmentPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    armBtn: cc.Button = null;
    
    // 当前装备
    @property(ExchangeEquipmentItem)
    currentItem: ExchangeEquipmentItem = null;
    @property(cc.Node)
    emptyItemNode: cc.Node = null;
    @property(cc.Sprite)
    emptyPart: cc.Sprite = null;
    @property(cc.Button)
    disarmBtn: cc.Button = null;

    // 背包装备
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    equipmentItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    normalSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    selectedSf: cc.SpriteFrame = null;

    selectedBagItem: BagItem = null;
    part: EquipmentPart = null;

    start() {
        this.initEvents();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.armBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.armBtnOnClick.bind(this)));
        this.disarmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.disarmBtnOnClick.bind(this)));
    }

    async init(part: EquipmentPart) {
        // 初始化背包装备
        this.part = part;
        let bagItems = BagData.getInstance().getEquipmentsByPart(part);
        this.scroll.content.removeAllChildren();

        R.forEach((ele: BagItem) => {
            let itemDisplay = ele.getItemDisplay();
            if (!itemDisplay.isValid()) return;
            let prototype = ele.getPrototype();
            if (!prototype.isValid()) return;
            let equipmentItem = cc.instantiate(this.equipmentItemPrefab).getComponent(ExchangeEquipmentItem);
            equipmentItem.init(ele, this.itemOnClick(equipmentItem).bind(this));
            equipmentItem.node.parent = this.scroll.content;
        }, bagItems);

        this.emptyNode.active = bagItems.length == 0;

        // 初始化当前装备
        let isValid = false;
        let oe = PlayerData.getInstance().equipments[part];

        if (oe.isValid()) {
            let bagItem = new BagItem();
            bagItem.category = ItemCategory.Equipment;
            bagItem.data = oe.getValue();
            this.currentItem.init(bagItem, () => {});
            this.currentItem.node.active = true;
            this.emptyItemNode.active = false;
            // }
        } else {
            this.currentItem.node.active = false;
            this.emptyItemNode.active = true;
            this.emptyPart.spriteFrame = await ResUtils.getEmptyEquipmentIconByPart(part);
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    itemOnClick(equipmentItem: ExchangeEquipmentItem) {
        let _this = this;
        return () => {
            let children = _this.scroll.content.children;
            children.forEach(ele => {
                ele.getComponent(ExchangeEquipmentItem).bgSprite.spriteFrame = _this.normalSf;
            });
            equipmentItem.bgSprite.spriteFrame = _this.selectedSf;
            _this.selectedBagItem = equipmentItem.bagItem;
        }
    }

    async armBtnOnClick() {
        if (this.selectedBagItem == null) {
            TipsManager.showMessage('还没有选择任何装备哦~');
            return;
        }
        await CommonUtils.exchangeEquipment(this.selectedBagItem.data as Equipment);
        this.init(this.part);
        this.closePanel();
    }

    async disarmBtnOnClick() {
        if (this.part == null) {
            TipsManager.showMessage('面板尚未初始化完成呢~');
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/disarm', [ItemConfig.getInstance().getEquipmentPartInex(this.part)]) as any;
        if (response.status === 0) {
            TipsManager.showMessage('装备卸下成功!');
            let equipment = PlayerData.getInstance().equipments[this.part];
            if (equipment.isValid()) {
                BagData.getInstance().pushEquipmentToBag(equipment.getValue(), true);
                PlayerData.getInstance().equipments[this.part] = new Optional<Equipment>();
                PlayerData.getInstance().equipedIds = R.filter(x => x != equipment.getValue().id, PlayerData.getInstance().equipedIds);
                this.init(this.part);
                EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            }
            PlayerData.getInstance().recheck();
        }
    }

}