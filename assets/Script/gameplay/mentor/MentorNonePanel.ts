import { CommonUtils } from "../../utils/CommonUtils";
import MentorRecordPanel from "./MentorRecordPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { NetUtils } from "../../net/NetUtils";
import { DiscipleRecord, CurrencyStack } from "../../net/Protocol";
import { MentorUtils } from "./MentorUtils";
import { TipsManager } from "../../base/TipsManager";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorNonePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    viewRecordBtn: cc.Button = null;
    @property(cc.Button)
    obtainBtn: cc.Button = null;

    @property(cc.Label)
    awardLabel: cc.Label = null;
    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    hasAward = false;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.viewRecordBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.viewRecord.bind(this)));
        this.obtainBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.obtainAward.bind(this)));
        this.init();
    }

    async init () {
        let result = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        if (result.isRight && CommonUtils.getDeltaDay(R.prop('discipleLastKuabiDelivery', result.right)) > 0 && undefined != R.prop('confirmationDate', result.right)) {
            this.hasAward = true;
            let day = CommonUtils.getDeltaDay(R.prop('confirmationDate', result.right));
            if (day >= 7) {
                this.hasAward = false;
                this.awardLabel.string = '0';
                return;
            }
            let ratio = await MentorUtils.getKbRatio(day + 1, true);
            let pool = await MentorUtils.getPool(result.right.accountId);
            let kcAmount = CommonUtils.toCKb(pool * ratio);
            this.awardLabel.string = String(kcAmount);
        } else {
            this.awardLabel.string = '0';
        }
    }

    async obtainAward() {
        if (!this.hasAward) {
            TipsManager.showMessage('暂无仙石可领取');
            return;
        }
        let result = await NetUtils.post<CurrencyStack>('/impartation/disciple/meAsDisciple/obtainKuaibiPoolAward', []);
        if (result.isRight) {
            TipsManager.showMessage('领取成功');
            this.hasAward = false;
            TipsManager.showGainCurrency({currencyId: result.right.currencyId, amount: CommonUtils.toCKb(result.right.amount)});
        }
    }

    async viewRecord () {
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorRecordPanel', MentorRecordPanel) as MentorRecordPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    closePanel () {
        CommonUtils.safeRemove(this.node)
    }
}
