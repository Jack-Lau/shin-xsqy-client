import ItemFrame from "../../../base/ItemFrame";
import { PetDetail } from "../../../net/Protocol";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { PetQuality, ItemQuality } from "../../../bag/ItemConfig";
import SelectPetSkillItem from "./SelectPetSkillItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import PetTips from "../PetTips";

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
export default class SelectPetMaterialItem extends cc.Component {

    @property(cc.Sprite)
    materialIcon: cc.Sprite = null;
    @property(ItemFrame)
    materialBox: ItemFrame = null;
    @property(cc.Label)
    materialLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    progress = 0;

    isGo = false;

    petDetail: PetDetail;

    start() {
        this.materialIcon.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showTips.bind(this)));
    }

    async init(petDetail: PetDetail) {
        this.petDetail = petDetail;
        this.nameLabel.string = petDetail.pet.petName;
        let config = await PetData.getConfigById(petDetail.pet.definitionId);
        if (config.isValid()) {
            let iconID = config.getValue().prefabId;
            this.materialIcon.spriteFrame = await ResUtils.getPetHeadIconById(iconID);
            await this.toColor(this.materialBox, config.getValue().color, petDetail.pet.rank);
        }
        let rank = petDetail.pet.rank;
        if (rank > 0) {
            this.materialLabel.string = '+' + rank.toString();
        } else {
            this.materialLabel.string = '';
        }

        let abilities = petDetail.pet.abilities;
        for (let id of abilities) {
            let petSkillConfig = await PetData.getPetSkillInfoById(id);
            let item = cc.instantiate(this.prefab);
            item.parent = this.content;
            let skillItem = item.getComponent(SelectPetSkillItem);
            skillItem.init(petSkillConfig.fmap(x => x.icon).getOrElse(310001), petSkillConfig.fmap(x => x.name).getOrElse('被动技能'));
        }
        await CommonUtils.wait(1);
        this.isGo = true;
    }

    async toColor(effect, color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                effect.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                effect.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                effect.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                effect.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                effect.node.active = false;
                break;
        }
        effect.node.active = true;
    }

    async showTips() {
        let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
        panel.init(this.petDetail);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    update(dt) {
        if (this.isGo && this.content.width > this.content.parent.width) {
            this.content.x -= 80 * dt;
            if (this.content.x < -(this.content.width + 10)) {
                this.content.x = this.content.parent.width + 10;
            }
        }
    }
}
