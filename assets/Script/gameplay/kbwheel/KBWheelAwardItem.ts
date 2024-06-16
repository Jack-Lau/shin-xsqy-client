import { TipsManager } from "../../base/TipsManager";

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
export default class KBWheelAwardItem extends cc.Component {
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;
     
    currencyId: number = 150;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.icon.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    showTips() {
        if (this.currencyId == 150) {
            TipsManager.showMessage("元宝<img src='currency_icon_150'/> 好汉, 就是好浪费钱的汉!");
        } else if (this.currencyId == 151) {
            TipsManager.showMessage("仙石<img src='currency_icon_151'/> 有钱男子汉, 没钱汉子难!");
        }
    }

    // update (dt) {}
}
