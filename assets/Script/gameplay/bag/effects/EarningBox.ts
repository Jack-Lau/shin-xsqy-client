import { CommonUtils } from "../../../utils/CommonUtils";

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
export default class EarningBox extends cc.Component {

    @property(cc.Node)
    critNode: cc.Node = null;

    @property(cc.Label)
    numberLabel: cc.Label = null;

    actionTo: cc.ActionInterval = null;
    // onLoad () {}

    start() {
       //this.init(0.2,5,true);
    }

    async init(duration: number, earning: number, bingo: boolean) {
        this.node.x = 0;
        this.node.y = 0;
        this.node.opacity = 255;
        if (bingo) {
            this.critNode.active = true;
            this.numberLabel.node.active = false;
        } else {
            this.critNode.active = false;
            this.numberLabel.node.active = true;
            this.numberLabel.string = '+' + earning;
        }
        this.actionTo = cc.scaleTo(duration, 1);
        this.node.runAction(this.actionTo);
    }

    update(dt) {
        if (this.actionTo != null && this.actionTo.isDone()) {
            this.node.y += 500 * dt;
            if (this.node.y > 20 && this.node.opacity > 0)
                this.node.opacity -= 255 * dt*2;
            if (this.node.opacity < 0)
                this.node.opacity = 0;
        }
    }

    onDestroy() {
        this.actionTo = null;
    }

    onDisable() {
        this.actionTo = null;
    }
}
