import ItemFrame from "../../../../base/ItemFrame";
import ItemWithEffect from "../../../../base/ItemWithEffect";
import { Equipment } from "../../../../net/Protocol";
import Optional from "../../../../cocosExtend/Optional";
import { EquipUtils } from "../../utils/EquipmentUtils";
import { CommonUtils } from "../../../../utils/CommonUtils";
import EquipmentEffectItem from "./EquipmentEffectItem";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipmentRecastSelectItem extends cc.Component {
    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    @property(cc.Label)
    equipmentNameLabel: cc.Label = null;
    @property(cc.Layout)
    effectGroup: cc.Layout = null;

    @property(cc.Prefab)
    effectItemPrefab: cc.Prefab = null;

    eqiupment = new Optional<Equipment>();

    start() {
        this.item.node.on(cc.Node.EventType.TOUCH_END, this.showEquipmentTips.bind(this));
    }

    init(equipment: Equipment, callback) {
        this.eqiupment = new Optional<Equipment>(equipment);
        if (this.eqiupment.valid) {
            this.item.initWithEquipment(equipment);
            this.equipmentNameLabel.string = EquipUtils.getDisplay(equipment).fmap(x => x.name).getOrElse('')
            let effectIds = this.eqiupment.fmap(EquipUtils.getEffectIds).getOrElse([])
            this.effectGroup.node.removeAllChildren();
            effectIds.forEach(id => {
                let item = cc.instantiate(this.effectItemPrefab).getComponent(EquipmentEffectItem)
                item.init(parseInt(id));
                item.node.parent = this.effectGroup.node;
            })
        }
        this.node.on(cc.Node.EventType.TOUCH_END, callback);
        this.showTween();
    }

    async showTween() {
        await CommonUtils.wait(0.5);
        let width = this.effectGroup.node.width;
        if (width < 200) {
            return;
        }
        let time = 0.01 * width;
        this.effectGroup.node.runAction(cc.repeatForever(
            cc.sequence(
                [
                    cc.moveTo(time, -width, 0),
                    cc.moveTo(0.01, 200, 0),
                    cc.moveTo(2, 0, 0)
                ]
            )
        ));
    }

    async showEquipmentTips(e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this.eqiupment.valid) { return; }
        EquipUtils.showEquipmentTips(this.eqiupment.val)();
    }

    onDestroy() {
        this.effectGroup.node.stopAllActions();
    }
}
