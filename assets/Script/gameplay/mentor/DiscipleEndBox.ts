import { CommonUtils } from "../../utils/CommonUtils";
import { DiscipleRecord, CurrencyStack } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import { CurrencyId } from "../../config/CurrencyId";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { MentorUtils } from "./MentorUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class DiscipleEndBox extends cc.Component {
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Label)
    mentorValueLabel: cc.Label = null;

    @property(cc.Sprite)
    award1IconSp: cc.Sprite = null;
    @property(cc.Label)
    award1Label: cc.Label = null;
    @property(cc.Label)
    award2Label: cc.Label = null;

    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    record: DiscipleRecord = null;

    start () {
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.confirmBtnOnClick.bind(this)));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		//
		const action = cc.repeatForever(cc.rotateTo(0.5, 360))
		this.bgLighting.node.runAction(action)
    }

    async init (record: DiscipleRecord) {
        this.record = record;
        let pool = await MentorUtils.getPool(record.accountId);
        let award1 = Math.max(Math.floor(pool * 0.3), 1);
        this.award1Label.string = award1 + '';
        this.award2Label.string = Math.floor(pool * 0.7) + '';
        let amount = await CommonUtils.getCurrencyAmount(CurrencyId.师徒值)
        this.mentorValueLabel.string = amount + '';
    }

    async confirmBtnOnClick () {
        let result = await NetUtils.post<CurrencyStack>('/impartation/disciple/meAsDisciple/confirm', []);
        this.closePanel();
    }

    closePanel () {
        CommonUtils.safeRemove(this.node)
    }

}
