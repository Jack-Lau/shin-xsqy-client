import { CommonUtils } from "../../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

type Tuple2<A, B> = {first: A, second: B, win: boolean};

@ccclass
export default class HlttRecordItem extends cc.Component {
    @property(cc.Label)
    labels: Array<cc.Label> = [];

    data: Array<Tuple2<number, number>> = [null, null, null, null, null, null];

    showPlus: boolean = false;

    setData(data: Array<Tuple2<number, number>>) {
        let result = R.clone(data);
        while (result.length < 6) {
            result.push(null);
        }
        this.data = result;
        this.init(this.data);
    } 

    init (result: Array<Tuple2<number, number>>) {
        result.forEach((d: Tuple2<number, number>, index: number) => {
            if (d) {
                this.labels[index].string = this.showPlus ? (d.first + ' + ' + d.second) : '' + CommonUtils.divide(d.first + d.second, 10).remain;
                this.labels[index].node.color = cc.Color.fromHEX(this.labels[index].node.color, d.win ? "#337309" : "#bb4912")
                // this.labels[index].node.color = cc.hexToColor(d.win ? "#337309" : "#bb4912");
            } else {
                this.labels[index].string = "--";
            }
        })
    }

    switch () {
        this.showPlus = !this.showPlus;
        this.init(this.data);
    }
}