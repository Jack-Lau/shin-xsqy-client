import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import PetTips from "../PetTips";
import { CommonUtils } from "../../../utils/CommonUtils";
import { ItemQuality, PetQuality } from "../../../bag/ItemConfig";
import { PetDetail } from "../../../net/Protocol";
import ItemFrame from "../../../base/ItemFrame";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";

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
export default class SelectGodBeastItem extends cc.Component {

    @property(cc.Sprite)
    materialIcon: cc.Sprite = null;
    @property(ItemFrame)
    materialBox: ItemFrame = null;
    @property(cc.Label)
    materialLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    level: cc.Label = null;

    petDetail: PetDetail;

    idNames = {
        300018: '一阶神兽', 300019: '二阶神兽', 300020: '三阶神兽', 300021: '四阶神兽', 300022: '五阶神兽',
        300023: '一阶神兽', 300024: '二阶神兽', 300025: '三阶神兽', 300026: '四阶神兽', 300027: '五阶神兽'
    };

    start() {

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
        this.level.string = this.idNames[petDetail.pet.definitionId];
        this.materialIcon.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showTips.bind(this)));
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

}
