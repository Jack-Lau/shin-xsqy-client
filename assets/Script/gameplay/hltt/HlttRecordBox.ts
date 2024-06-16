import HlttRecordItem from "./HlttRecordItem";
import PagingControl from "../../base/PagingControl";
import { BaccaratGame } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class HlttRecordBox extends cc.Component {
    @property(HlttRecordItem)
    redItem: HlttRecordItem = null;
    @property(HlttRecordItem)
    blueItem: HlttRecordItem = null;
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Label)
    descLabel: cc.Label = null;

    records: Array<BaccaratGame> = [];
    PAGE_SIZE = 6;

    init (records: Array<BaccaratGame>) {
        this.records = records;
        let total = Math.ceil(records.length / 6);
        total = Math.max(1, total);
        this.pageControl.init(total, this.pageChange.bind(this));
        this.switchBtn.node.on(cc.Node.EventType.TOUCH_END, this.switch, this);
        this.blockNode.on(cc.Node.EventType.TOUCH_END, this.hideNode, this);
    }

    pageChange(page: number) {
        this.pageControl.setPage(page);
        let arr = this.records.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE);
        let red = arr.map(x => {
            let r1 = x.redPoint_1 >= 10 ? 0 : x.redPoint_1;
            let r2 = x.redPoint_2 >= 10 ? 0 : x.redPoint_2;
            let b1 = x.bluePoint_1 >= 10 ? 0 : x.bluePoint_1;
            let b2 = x.bluePoint_2 >= 10 ? 0 : x.bluePoint_2;
            
            return {
                first: r1,
                second: r2,
                win: (CommonUtils.divide(r1 + r2, 10).remain >= CommonUtils.divide(b1 + b2, 10).remain)
            }
        });
        let blue = arr.map(x => {
            let r1 = x.redPoint_1 >= 10 ? 0 : x.redPoint_1;
            let r2 = x.redPoint_2 >= 10 ? 0 : x.redPoint_2;
            let b1 = x.bluePoint_1 >= 10 ? 0 : x.bluePoint_1;
            let b2 = x.bluePoint_2 >= 10 ? 0 : x.bluePoint_2;
            
            return {
                first: b1,
                second: b2,
                win: (CommonUtils.divide(r1 + r2, 10).remain <= CommonUtils.divide(b1 + b2, 10).remain)
            }
        });
        this.redItem.setData(red);
        this.blueItem.setData(blue);

        this.descLabel.string = `近期${(page - 1)*this.PAGE_SIZE+ 1}~${page * this.PAGE_SIZE}场的具体数据`
    }

    switch() {
        this.redItem.switch();
        this.blueItem.switch();
    }

    hideNode () {
        this.node.active = false;
    }
}