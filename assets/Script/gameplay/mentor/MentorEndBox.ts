import { CommonUtils } from "../../utils/CommonUtils";
import { DiscipleRecord, CurrencyRecord, CurrencyStack } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { CurrencyId } from "../../config/CurrencyId";
import { ResUtils } from "../../utils/ResUtils";
import { TipsManager } from "../../base/TipsManager";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { MentorUtils } from "./MentorUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorEndBox extends cc.Component {
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Label)
    mentorValueLabel: cc.Label = null;

    @property(cc.Label)
    award1Label: cc.Label = null;
    @property(cc.Sprite)
    award1IconSp: cc.Sprite = null;

    @property(cc.Label)
    award2Label: cc.Label = null;

    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    @property(cc.Label)
    discipleNameLabel: cc.Label = null;
	
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

    async init(record: DiscipleRecord) {
        this.record = record;
        let pool = await MentorUtils.getPool(record.accountId);
        let award1 = CommonUtils.toCKb(pool * 0.28);
        if (award1 <= 0) {
            this.award1Label.string = '500';
            this.award1IconSp.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/icon/item_icon', 'currency_icon_150');
        } else {
            this.award1Label.string = award1 + '';
        }
        this.award2Label.string = CommonUtils.toCKb(pool * 0.42) + '';

        let result1 = await NetUtils.get<CurrencyRecord>('/currency/view/{accountId}/{currencyId}', [record.accountId, CurrencyId.师徒值]);
        this.mentorValueLabel.string = result1.fmap(x => String(x.amount)).getOrElse('')

        let result2 = await NetUtils.get<string>('/player/viewName', [String(record.accountId)]);
	      this.discipleNameLabel.string = result2.getOrElse('');
    }

    async confirmBtnOnClick () {
        if (!this.record) {
            return;
        }
        let result = await NetUtils.post<CurrencyStack>('/impartation/disciple/myDisciples/{id}/confirm', [this.record.accountId]);
        EventDispatcher.dispatch(Notify.MENTOR_UPDATE_DISCIPLE, {});
        this.closePanel();
    }

    closePanel () {
        CommonUtils.safeRemove(this.node)
    }
}
