import DigOreFListItem from "./DigOreFListItem";
import PagingControl from "../../base/PagingControl";
import { MineExplorationCouponSend } from "../../net/Protocol";
import DigOrePanel from "./DigOrePanel";

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
export default class DigOreFriendPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(DigOreFListItem)
    items: DigOreFListItem[] = [];

    @property(PagingControl)
    page: PagingControl = null;

    @property(cc.Node)
    empty: cc.Node = null;
    coupons: MineExplorationCouponSend[] = [];

    readonly Page_Size = 5;

    from: DigOrePanel = null;
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.page.init(1, this.updatePage.bind(this));
    }

    init(coupons: MineExplorationCouponSend[]) {
        if (coupons.length > 0) {
            this.empty.active = false;
            this.items[0].node.parent.active = true;
            this.coupons = this.sortData(coupons);
            this.page.setMax(Math.ceil(this.coupons.length / this.Page_Size));
            this.updatePage(this.page.currentPage); 
        } else {
            this.empty.active = true;
            this.items[0].node.parent.active = false;
        }
    }

    updatePage(pageNumber: number) {
        let data = R.slice(this.Page_Size * (pageNumber - 1), this.Page_Size * pageNumber, this.coupons) as MineExplorationCouponSend[];
        this.items.forEach((item, index) => {
            if (index < data.length) {
                item.node.active = true;
                let itemData = data[index];
                item.init(itemData.id, itemData.senderId, !itemData.taken);
                item.from = this;
            } else {
                item.node.active = false;
            }
        });
        this.page.setPage(pageNumber);
    }

    sortData(coupons: MineExplorationCouponSend[]) {
        let data = coupons;

        //ID
        let bySort = (itemA: MineExplorationCouponSend, itemB: MineExplorationCouponSend) => {
            let a = 0;
            let b = 0;
            if (itemA.taken) {
                a = 0;
            } else {
                a = 1;
            }
            if (itemB.taken) {
                b = 0;
            } else {
                b = 1;
            }
            if (a == b) {
                return (itemB.createTime as any) - (itemA.createTime as any);
            } else {
                return b - a;
            }

        };
        let byData = R.sort(bySort, data) as Array<MineExplorationCouponSend>;
        data = byData;
        return data;
    }


    closePanel() {
        if (this.from != null) {
            this.from.updateShow();
        }
        this.node.destroy();
    }

    // update (dt) {}
}
