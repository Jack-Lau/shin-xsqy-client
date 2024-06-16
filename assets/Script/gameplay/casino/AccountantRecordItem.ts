import { ChanglefangLog } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class AccountantRecordItem extends cc.Component {
    @property(cc.Sprite)
    inputSp: cc.Sprite = null;
    @property(cc.Sprite)
    outputSp: cc.Sprite = null;
    @property(cc.RichText)
    descriptionRT: cc.RichText = null;

    init (log: ChanglefangLog) {
        let isOutput = log.type === "EXCHANGE_KC";
        this.inputSp.node.active = !isOutput;
        this.outputSp.node.active = isOutput;
    
        let timeInfo = CommonUtils.getTimeInfo(R.prop('createTime', log));
        if (isOutput) {
            this.descriptionRT.string = CommonUtils.textToRichText(`${timeInfo.month}月${timeInfo.day}日，您消耗了[e43826]${log.costValue}[ffffff]坊金兑换了[417a13]${log.gainValue}[ffffff]仙石`);
        } else if (log.gainValue > 0) {
            this.descriptionRT.string = CommonUtils.textToRichText(`您从${timeInfo.month}月${timeInfo.day}日的长乐坊收益中，获得了[417a13]${log.gainValue}[ffffff]坊金分奖!`);
        }
    }
}