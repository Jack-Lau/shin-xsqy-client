import { ResUtils } from "../../utils/ResUtils";
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
export default class TradingSceenEquEffsItem extends cc.Component {

    @property(cc.Sprite)
    isGou: cc.Sprite = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    toggle: cc.Toggle = null;
    id: number = 0;
    onLoad() {
        this.toggle = this.node.getComponent(cc.Toggle);
        this.toggle.toggleGroup = null;
    }

    async init(id: number, effIds = []) {
        this.id = id;
        this.icon.spriteFrame = await ResUtils.getEquipmentEffectIcon(id);
        let name = R.prop('name', EquipUtils.getSpSkill(id));
        this.nameLabel.string = name;
        if (effIds.indexOf(id) > -1) {
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
