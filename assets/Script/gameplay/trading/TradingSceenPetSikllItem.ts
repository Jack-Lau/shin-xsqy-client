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
export default class TradingSceenPetSikllItem extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    toggle: cc.Toggle = null;
    id: number = 0;

    onLoad() {
        this.toggle = this.node.getComponent(cc.Toggle);
        this.toggle.toggleGroup = null;
    }

    async init(id: number, sikllIds = []) {
        this.id = id;
        let name = (await PetData.getPetSkillInfoById(id)).fmap(x => x.name).getOrElse('');
        this.nameLabel.string = name;
        if (sikllIds.indexOf(id) > -1) {
            this.selected();
        } else {
            this.cel();
        }
    }

    getIsGou() {
        return this.toggle.isChecked;
    }

    cel() {
        this.toggle.isChecked = false;
    }

    selected() {
        this.toggle.isChecked = true;
    }
    // update (dt) {}
}
