import { ResUtils } from "../../../utils/ResUtils";
import BagItem from "../../../bag/BagItem";
import { Equipment } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import EquipmentTips from "../tips/EquipmentTips";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import ItemFrame from "../../../base/ItemFrame";
import { EquipUtils } from "../utils/EquipmentUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangeEquipmentItem extends cc.Component {
    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;
    @property(cc.Sprite)
    equipmentIcon: cc.Sprite = null;
    @property(ItemFrame)
    itemFrame: ItemFrame = null;
    @property(cc.Label)
    equipmentNameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    enhanceLvLabel: cc.Label = null;

    bagItem: BagItem = null;


    start() {
        this.itemFrame.node.on(cc.Node.EventType.TOUCH_END, this.showEquipmentTips.bind(this));
    }

    async init(bagItem: BagItem, callback) {
        this.bagItem = bagItem;
        let itemDisplay = bagItem.getItemDisplay();
        if (!itemDisplay.isValid()) return;
        let prototype = bagItem.getPrototype();
        if (!prototype.isValid()) return;

        let iconId = itemDisplay.getValue().iconId;
        let name = itemDisplay.getValue().name;

        let realAttr = (x, y) => Math.floor(x * (1 + y))
        let effectsText = R.prop('effectsText', bagItem.data);
        let effectIds = effectsText == "" ? []: effectsText.split(',').map(x => parseInt(x));
        let effectFc = R.reduce((x, y) => {
            if (y >= 600) {
                let config = EquipUtils.getSpSkill(y);
                return x + config.fc;
            } else if (y < 600 && y >= 500) {
                let config = EquipUtils.getEnhanceSkill(y);
                return x + config.fc
            } else {
                return x;
            }
        }, 0, effectIds)
        let scale = EquipUtils.getScale((bagItem.data as Equipment).enhanceLevel);
        this.fcLabel.string = (realAttr(R.prop('baseFc', bagItem.data), scale) + effectFc) + '';
        let quality = prototype.getValue().quality;

        this.equipmentNameLabel.string = name;
        // this.fcLabel.string = fc.toString();
        this.node.on(cc.Node.EventType.TOUCH_END, callback);
        this.equipmentIcon.spriteFrame = await ResUtils.getEquipmentIconById(iconId);
		let level = (bagItem.data as Equipment).enhanceLevel;
        this.enhanceLvLabel.string = level > 0 ? `+${level}` : '';
        this.itemFrame.init(quality, itemDisplay.getValue().showBorderEffect ||(level >= 10 ? true : false));
    }

    async showEquipmentTips() {
        if (!this.bagItem) { return; }
        let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
        panel.init(this.bagItem);
        panel.removeButtons();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
    }
}