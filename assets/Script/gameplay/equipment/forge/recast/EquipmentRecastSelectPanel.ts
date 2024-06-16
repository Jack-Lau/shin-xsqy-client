import EquipmentRecastSelectItem from "./EquipmentRecastSelectItem";
import { EquipmentPart, ItemCategory, ItemQuality } from "../../../../bag/ItemConfig";
import { Equipment } from "../../../../net/Protocol";
import { CommonUtils } from "../../../../utils/CommonUtils";
import BagData from "../../../../bag/BagData";
import BagItem from "../../../../bag/BagItem";
import PlayerData from "../../../../data/PlayerData";
import { ResUtils } from "../../../../utils/ResUtils";
import Optional from "../../../../cocosExtend/Optional";
import { EquipUtils } from "../../utils/EquipmentUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipmentRecastSelectPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    
    // 当前装备
    @property(EquipmentRecastSelectItem)
    currentItem: EquipmentRecastSelectItem = null;
    @property(cc.Node)
    emptyItemNode: cc.Node = null;
    @property(cc.Sprite)
    emptyPart: cc.Sprite = null;

    // 背包装备
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    selectItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    normalSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    selectedSf: cc.SpriteFrame = null;

    selectedEquipment: Optional<Equipment> = new Optional<Equipment>();
    part: EquipmentPart = null;

    callback = (e) => {}

    start() {
        this.initEvents();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.confrimBtnOnClick.bind(this)));
    }

    async init(part: EquipmentPart, effectIds: Array<string>, callback) {
        // 初始化背包装备
        this.callback = callback;
        this.part = part;
        let bagItems = BagData.getInstance().getEquipmentsByPart(part).filter(x => {
            let effectIdArray = EquipUtils.getEffectIds(x.data as Equipment);
            return R.without(effectIds, effectIdArray).length > 0 && x.getItemDisplay().fmap(y => y.quality == ItemQuality.Blue || y.quality == ItemQuality.Purple).getOrElse(false);
        });
        this.scroll.content.removeAllChildren();

        R.forEach((ele: BagItem) => {
            let itemDisplay = ele.getItemDisplay();
            if (!itemDisplay.isValid()) return;
            let prototype = ele.getPrototype();
            if (!prototype.isValid()) return;
            let equipmentItem = cc.instantiate(this.selectItemPrefab).getComponent(EquipmentRecastSelectItem);
            equipmentItem.init(ele.data as Equipment, this.itemOnClick(equipmentItem).bind(this));
            equipmentItem.node.parent = this.scroll.content;
        }, bagItems);

        this.emptyNode.active = bagItems.length == 0;

        // 初始化当前装备
        let oe = PlayerData.getInstance().equipments[part];
        if (oe.valid) {
            this.currentItem.init(oe.val, () => {});
            this.currentItem.node.active = true;
            this.emptyItemNode.active = false;
        } else {
            this.currentItem.node.active = false;
            this.emptyItemNode.active = true;
            this.emptyPart.spriteFrame = await ResUtils.getEmptyEquipmentIconByPart(part);
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    itemOnClick(equipmentItem: EquipmentRecastSelectItem) {
        let _this = this;
        return () => {
            let children = _this.scroll.content.children;
            children.forEach(ele => {
                ele.getComponent(EquipmentRecastSelectItem).bgSprite.spriteFrame = _this.normalSf;
            });
            equipmentItem.bgSprite.spriteFrame = _this.selectedSf;
            _this.selectedEquipment = equipmentItem.eqiupment;
        }
    }

    async confrimBtnOnClick() {
        this.callback(this.selectedEquipment)
        this.closePanel();
    }
}