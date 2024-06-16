import { CurrencyStack } from "../../../net/Protocol";
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
export default class SweepJGTTips extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    experience: cc.Node = null;
    time = 1;

    isOpacity = false;
    // onLoad () {}

    start() {
        this.node.opacity = 255;
    }

    async startanimation(data: CurrencyStack) {
        this.node.opacity = 255;
        this.node.position = cc.v2(0, 0);
        this.isOpacity = false;
        this.experience.active = true;
        this.label.string = data.amount.toString();
        let action = cc.moveTo(this.time, 0, 800);
        this.node.runAction(action);
        await CommonUtils.wait(this.time / 2);
        this.isOpacity = true;
    }

    update(dt) {
        if (this.isOpacity) {
            this.node.opacity -= 500 * dt;
            if (this.node.opacity <= 0) {
                this.node.opacity = 0;
            }
        }
    }

}
