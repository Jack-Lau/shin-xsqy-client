import QuestConfig from "./QuestConfig";
import { CommonUtils } from "../utils/CommonUtils";
import { ccExtension } from "../cocosExtend/CocosExtention";

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
export default class ProgressBar extends cc.Component {
    @property(cc.Sprite)
    thump: cc.Sprite = null;

    @property(cc.Label)
    description: cc.Label = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    start () {
    }

    block() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
    }

    async startBar(barId: number) {
        if (undefined == barId) {
            CommonUtils.safeRemove(this.node);
            return;
        }
        let bar = QuestConfig.getInstance().progressbars[barId];
        let time = bar.time;
        let cur = 0;
        let description = bar.content;
        this.thump.node.width = 0;
        this.description.string = description + `(${cur}/${time})`;
        this.schedule(() => {
            cur += 1;
            this.description.string = description + `(${cur}/${time})`;
        }, 1, time - 1);
        let action = ccExtension.sizeTo(time, 480, 45);
        this.thump.node.runAction(action);
        await CommonUtils.wait(time + 0.2);
        await this.startBar(bar['skip']);
    }
}
