import NewYearItem from "./NewYearItem";
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
export default class NewYearPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(NewYearItem)
    items: NewYearItem[] = [];

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.items.forEach((item, index) => {
            let showAwards = [];
            if (index == 0) {
                showAwards = [{ id: 172, amount: 1 }, { id: 20039, amount: 1 }, { id: 166, amount: 1 }];
            } else if (index == 1) {
                showAwards = [{ id: 20039, amount: 1 }, { id: 153, amount: 1 }];
            } else if (index == 2) {
                showAwards = [{ id: 20039, amount: 1 }, { id: 168, amount: 1 }, { id: 158, amount: 1 }];
            }
            item.init(showAwards);
            item.from = this;
        });
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
    // update (dt) {}
}
