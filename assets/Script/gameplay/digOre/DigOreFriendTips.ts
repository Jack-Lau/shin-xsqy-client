import { CommonUtils } from "../../utils/CommonUtils";
import DigOreFriendItem from "./DigOreFriendItem";
import { MineExplorationCouponSend } from "../../net/Protocol";

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
export default class DigOreFriendTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    btn: cc.Button = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.btn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    init(coupons: MineExplorationCouponSend[]) {
        let ids: number[] = [];
        let nums: number[] = [];
        coupons.forEach((ele, index) => {
            if (ids.indexOf(ele.receiverId) == -1) {
                ids.push(ele.receiverId);
                nums.push(1);
            } else {
                nums[ids.indexOf(ele.receiverId)] += 1;
            }
        });
        ids.forEach((ele, index) => {
            let item = cc.instantiate(this.itemPrefab).getComponent(DigOreFriendItem);
            item.node.parent = this.scrollView.content;
            item.init(ele, 10);
        });
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    // update (dt) {}
}
