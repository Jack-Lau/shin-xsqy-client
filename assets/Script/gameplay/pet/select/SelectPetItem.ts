import PetIconItem from "../PetIconItem";
import { PetDetail } from "../../../net/Protocol";
import { PetData } from "../PetData";

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
export default class SelectPetItem extends cc.Component {

    @property(cc.Sprite)
    flag: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(PetIconItem)
    item: PetIconItem = null;

    async init(petDetail: PetDetail) {
        let selected = R.prop('selected', petDetail);
        this.flag.node.active = (selected === true);
        this.item.init(petDetail);
        //this.item.showStrengthening(petDetail);
        this.nameLabel.string = petDetail.pet.petName;
        let attributes = await PetData.getAttributes(petDetail);
        this.fcLabel.string = attributes.fc.toString();
    }

}
