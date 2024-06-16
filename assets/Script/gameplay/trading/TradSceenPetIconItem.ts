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
export default class TradSceenPetIconItem extends cc.Component {

    @property(PetIconItem)
    petIconItem: PetIconItem = null;
    @property(cc.Node)
    matkIcon: cc.Node = null;
    @property(cc.Node)
    patkIcon: cc.Node = null;
    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    definitionId = 0;

    // onLoad () {}

    async init(definitionId: number) {
        this.definitionId = definitionId;
        this.petIconItem.initShow(definitionId);
        let config = await PetData.getConfigById(definitionId);
        if (config.fmap(x => x.isMagic).getOrElse(false)) {
            this.matkIcon.active = true;
            this.patkIcon.active = false;
        } else {
            this.matkIcon.active = false;
            this.patkIcon.active = true;
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
