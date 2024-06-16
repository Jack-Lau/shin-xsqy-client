import ItemFrame from "../../base/ItemFrame";
import { PetDetail } from "../../net/Protocol";
import { PetData } from "./PetData";
import { ItemQuality, PetQuality } from "../../bag/ItemConfig";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import PetTips from "./PetTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PetPrototypeTips from "./PetPrototypeTips";

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
export default class PetIconItem extends cc.Component {

    @property(ItemFrame)
    frame: ItemFrame = null;
    @property(cc.Sprite)
    petIcon: cc.Sprite = null;
    @property(cc.Sprite)
    effect: cc.Sprite = null;
    @property(cc.Label)
    number: cc.Label = null;
    item: PetDetail = null;
    isFromBag: boolean = false;

    isShow = false;
    definitionId = 0;
    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    async init(item: PetDetail, isFromBag: boolean = false) {
        this.item = item;
        this.isFromBag = isFromBag;
        let pet = this.item.pet;
        let config = await PetData.getConfigById(pet.definitionId);
        if (config.isValid()) {
            let petConfigItem = config.getValue();
            this.petIcon.spriteFrame = await ResUtils.getPetHeadIconById(petConfigItem.prefabId);
            this.toColor(petConfigItem.color, pet.rank);
        }
        this.showStrengthening(item);
    }

    async initShow(definitionId: number, isShow: boolean = true) {
        this.isShow = isShow;
        this.definitionId = definitionId;
        let config = await PetData.getConfigById(definitionId);
        if (config.isValid()) {
            let petConfigItem = config.getValue();
            this.petIcon.spriteFrame = await ResUtils.getPetHeadIconById(petConfigItem.prefabId);
            this.toColor(petConfigItem.color, 0);
        }
    }


    async toColor(color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                this.frame.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                this.frame.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                this.frame.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                this.frame.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                this.frame.init(4, false);
                break;
        }
    }

    showStrengthening(item: PetDetail) {
        let rank = item.pet.rank;
        if (rank > 0) {
            this.number.string = '+' + rank.toString();
        }
    }

    /**清空格 */
    recovery() {
        this.item = null;
        this.petIcon.spriteFrame = null;
        this.frame.itemFrame.spriteFrame = null;
        this.frame.effectSprite.node.active = false;
        this.effect.spriteFrame = null;
        this.number.string = "";
    }

    async showTips() {
        if(this.isShow){
            let panel = await CommonUtils.getPanel('gameplay/pet/petPrototypeTips', PetPrototypeTips) as PetPrototypeTips;
            panel.init(this.definitionId);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }else{
            let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
            panel.init(this.item);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }      
    }
}
