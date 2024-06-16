import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { ConfigUtils } from "../../utils/ConfigUtil";

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
export default class TalentRadio extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    time = 4;
    subscript = 0;
    burieds = ['每提升1星级，属性会获得提升','一个天赋位置升级后会自动跳转到下个位置','使用九灵仙丹将随机提升1~5点天赋经验','天赋的等级提升后，天赋效果也会随之提升','天赋位置提升至1级即可选择天赋效果激活','天赋排列组合会对战斗风格产生各种各样的影响'];

    async start() {

        this.schedule(this.updateLabel.bind(this), this.time);
        
    }

    async updateLabel() {
        if (this.burieds.length <= 0) {
            return;
        }
        this.label.node.y = -30;
        this.label.string = this.burieds[this.subscript];
        let action1 = cc.moveTo(0.2, 0, 0);
        this.label.node.runAction(action1);
        await CommonUtils.wait(this.time - 0.5);
        let action2 = cc.moveTo(0.2, 0, 30);
        this.label.node.runAction(action2);

        this.subscript += 1;
        if (this.subscript >= this.burieds.length) {
            this.subscript = 0;
        }
    }


    // update (dt) {}
}
