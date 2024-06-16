import { EquipUtils } from "../../utils/EquipmentUtils";
import { ResUtils } from "../../../../utils/ResUtils";
import { TipsManager } from "../../../../base/TipsManager";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class EquipmentEffectItem extends cc.Component {
    @property(cc.Sprite)
    effectIconSp: cc.Sprite = null;
    @property(cc.Label)
    effectNameLabel: cc.Label = null;
    effectId: number = null;

    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    async init(effectId: number) {
        this.effectId = effectId;
        let skill = EquipUtils.getSpSkill(effectId);
        this.effectNameLabel.string = skill.name;
        this.effectIconSp.spriteFrame = await ResUtils.getEquipmentEffectIcon(effectId)
    }

    showTips() {
        if (undefined == this.effectId) {
            return;
        }
        let skill = EquipUtils.getSpSkill(this.effectId);
        TipsManager.showMessage(`${skill.description}`)
    }
}
