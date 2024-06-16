import TradingIcon from "./TradingIcon";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import { Equipment, PetDetail, Title } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { TitleConfig } from "../../player/title/TitleConfig";
import { PetData } from "../pet/PetData";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";

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
export default class TradingShelvesItem extends TradingIcon {

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Sprite)
    selected: cc.Sprite = null;

    // onLoad () {}

    async init(data) {
        this.selected.node.active = false;

        let type = R.prop('category', data);
        let name = '';
        let fc = 0;
        if (!cc.isValid(type)) {
            type = 0;
        }
        if (type == ItemCategory.Equipment) {
            let equipment = data.data as Equipment;
            this.setIcon(type, equipment.definitionId, equipment, equipment.enhanceLevel);
            fc = EquipUtils.getRealFc(equipment);
            let config = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
            name = config.fmap(x => x.name).getOrElse('装备');
        } else if (type == 0) {//pet   
            this.setIcon(type, data.pet.definitionId, data, data.pet.rank);
            fc = (await PetData.getAttributes(data)).fc;
            name = (data as PetDetail).pet.petName;
        } else if (type == ItemCategory.Title) {
            let title = (await TitleConfig.getConfigById((data as Title).definitionId));
            this.setIcon(type, data.definitionId, data);
            fc = title.fc;
            name = title.name;
        }
        this.nameLabel.string = name;
        this.fcLabel.string = fc.toString();
    }

    showSelected() {
        this.selected.node.active = true;
    }

    cancelSelected() {
        this.selected.node.active = false;
    }

    // update (dt) {}
}
