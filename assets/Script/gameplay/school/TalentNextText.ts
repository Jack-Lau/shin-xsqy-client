import { CommonUtils } from "../../utils/CommonUtils";

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
export default class TalentNextText extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    textLabel: cc.Label = null;

    // onLoad () {}

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    show(LV: number, text: string) {
        this.node.active = true;
        if (LV == 21) {
            this.textLabel.string = '当前已达最高等级';
        } else {
            let description = text;
            this.textLabel.string = CommonUtils.evalDescription(description, null, LV);
        }
    }

    closePanel() {
        this.node.active = false;
    }
    // update (dt) {}
}
