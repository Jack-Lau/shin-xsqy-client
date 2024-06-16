import PetIconItem from "../pet/PetIconItem";
import { PetDetail } from "../../net/Protocol";
import { PetData } from "../pet/PetData";

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
export default class TradingSceenPetTypeItem extends cc.Component {

    @property(PetIconItem)
    petIconItem: PetIconItem = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    skillLabel: cc.Label = null;
    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    sikllNames = ['输出型', '辅助型'];

    definitionId = 0;

    // onLoad () {}


    async init(definitionId: number) {
        this.definitionId = definitionId;
        this.petIconItem.initShow(definitionId);
        let config = await PetData.getConfigById(definitionId);
        this.nameLabel.string = config.fmap(x => x.name).getOrElse('迎庭');
        if (config.fmap(x => x.isMagic).getOrElse(true)) {
            this.skillLabel.string = '内功宠';
        } else {
            this.skillLabel.string = '外功宠';
        }

    }

    isChecked() {
        this.toggle.isChecked = true;
    }

    notChecked() {
        this.toggle.isChecked = false;
    }

    getChecked() {
        return this.toggle.isChecked;
    }


    // update (dt) {}
}
