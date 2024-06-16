import TradingRecordItem from "./TradingRecordItem";
import PagingControl from "../../base/PagingControl";
import { ConsignmentDetail, MyConsignmentsComplex } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";

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
export default class TradingRecordPanel extends cc.Component {

    @property(TradingRecordItem)
    recordItems: TradingRecordItem[] = [];
    @property(PagingControl)
    page: PagingControl = null;
    @property(cc.Node)
    empty: cc.Node = null;

    data: ConsignmentDetail[] = [];
    myConsignments: MyConsignmentsComplex = null;

    readonly Page_Size = 5;
    pageNumber = 1;

    list = [];
    // onLoad () {}
    start() {
        this.page.init(0, this.updatePage.bind(this));
    }

    async init() {
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/mine', []) as any;
        if (response2.status === 0) {
            this.myConsignments = response2.content as MyConsignmentsComplex;
        }
        let datas = R.concat(this.myConsignments.paymentObtainableConsignments)(this.myConsignments.goodsObtainableConsignments);
        this.list = this.sortData(R.concat(datas)(this.myConsignments.archiveConsignments));
        this.page.setMax(Math.ceil(this.list.length / this.Page_Size));
        this.updatePage(this.pageNumber);
    }

    async updatePage(pageNumber: number) {
        if (this.myConsignments == null) {
            return;
        }
        this.pageNumber = pageNumber;

        this.data = R.slice(this.Page_Size * (pageNumber - 1), this.Page_Size * pageNumber, this.list);
        this.page.setPage(pageNumber);
        this.updateShow();
    }

    async updateShow() {
        if (this.data.length == 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
        this.recordItems.forEach((item, index) => {
            if (index < this.data.length) {
                item.node.active = true;
                item.init(this.data[index].consignment);
            } else {
                item.node.active = false;
            }
        });
    }

    adjustPage() {
        this.init();
    }


    sortData(data) {
        let sort = R.sortWith([
            R.descend(R.path(['consignment', 'dealTime']))
        ]);

        return sort(data);
    }
    // update (dt) {}
}
