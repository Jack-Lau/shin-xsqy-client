import { TipsManager } from "../base/TipsManager";
import { CommonUtils } from "../utils/CommonUtils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerPopup extends cc.Component {
    @property(cc.Sprite)
    iconImage: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    @property(cc.Button)
    interactBtn: cc.Button = null;

    @property([cc.SpriteFrame])
    iconSf: Array<cc.SpriteFrame> = [];

    start () {
        this.interactBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo);
    }

    init (playerInfo) {
        this.node.x = 273;
        this.node.y = -310;
        this.nameLabel.string = playerInfo.name;
        this.iconImage.spriteFrame = this.iconSf[playerInfo.prefabId - 4000001];
        this.levelLabel.string = playerInfo.playerLevel;
        setTimeout(this.disappear.bind(this), 1500);
    }

    showToDo() {
        TipsManager.showMsgFromConfig(1478);
    }

    async disappear() {
        let action = cc.fadeTo(0.2, 0);
        this.node.runAction(action);
        await CommonUtils.wait(0.22);
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
        }
    }
    // update (dt) {}
}
