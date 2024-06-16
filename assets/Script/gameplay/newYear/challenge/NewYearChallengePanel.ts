import NewYearChallengePopup from "./NewYearChallengePopup";
import { CommonUtils } from "../../../utils/CommonUtils";
import { NetUtils } from "../../../net/NetUtils";
import { QuestRecord, FxjlOverall, FxjlRecord, AwardResult } from "../../../net/Protocol";
import { QuestProxy } from "../../../quest/QuestProxy";
import { TipsManager } from "../../../base/TipsManager";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import PlayerData from "../../../data/PlayerData";
import Optional from "../../../cocosExtend/Optional";
import { NewYearChallengeData } from "./NewYearChallengeData";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

enum ChallengeState {NOT_START, CHALLENGING, FAILED, COMPLETE};

@ccclass
export default class NewYearChallengePanel extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    awardBoxSp: cc.Sprite = null;
    @property(cc.Node)
    boxEffectNode: cc.Node = null;

    @property([cc.Sprite])
    starSps: Array<cc.Sprite> = [];
    @property([cc.Node])
    winFlagNodes: Array<cc.Node> = [];
    @property([cc.Button])
    opBtns: Array<cc.Button> = [];

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    status = [ChallengeState.NOT_START, ChallengeState.NOT_START, ChallengeState.NOT_START, ChallengeState.NOT_START];
    overall: Optional<FxjlOverall> = Optional.Nothing();
    todayLuckyInfoId: number = 1

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.awardBoxSp.node.on(cc.Node.EventType.TOUCH_END, this.awardBoxOnClick.bind(this));
        this.opBtns.forEach((btn, index) => {
            btn.node.on(cc.Node.EventType.TOUCH_END, this.opBtnOnClick(index).bind(this));
        });
        let viewHeight = CommonUtils.getViewHeight();
        this.closeBtn.node.y = Math.min(540, viewHeight / 2 - 40);
        this.init();
    }

    async init () {
        let overall = await NetUtils.get<FxjlOverall>('/fxjl/overall', []);
        this.overall = overall.toOptional();
        if (overall.isRight) {
            if (!overall.right.fxjlRecord) {
                let record= await NetUtils.post<FxjlRecord>('/fxjl/createRecord', [])
                overall.right.fxjlRecord = record.getOrElse(null);
            }
            if (!overall.right.fxjlRecord) {
                CommonUtils.reportError('/fxjl/createRecord', [], '');
            } else {
                let record = overall.right.fxjlRecord;
                let questIds = overall.right.fxjlSharedRecord.questIds;
                this.todayLuckyInfoId = (overall.right.fxjlSharedRecord as any)["todayLuckyInfoId"]
                let status: Array<ChallengeState> = questIds.map(id => {
                    let quest = QuestProxy.getQuestRecord(id);
                    if (quest.valid) {
                        if (quest.val.questStatus == "COMPLETED") {
                            if (quest.val.results == "A") {
                                return ChallengeState.COMPLETE;
                            } else {
                                return ChallengeState.FAILED;
                            }
                        } else if (quest.val.questStatus == "IN_PROGRESS") {
                            return ChallengeState.CHALLENGING;
                        } else {
                            return ChallengeState.NOT_START;
                        }
                    } else {
                        return ChallengeState.NOT_START;
                    }
                });

                let avaiable = status.filter(x => x == ChallengeState.COMPLETE).length >= 3;
                this.boxEffectNode.active = avaiable && !record.awardDelivered;
                if (avaiable) {
                    if (record.awardDelivered) {
                        this.awardBoxSp.spriteFrame = this.atlas.getSpriteFrame('icon_baoxianglingquwan');
                    } else {
                        this.awardBoxSp.spriteFrame = this.atlas.getSpriteFrame('icon_baoxiangdakai');
                    }
                } else {
                    this.awardBoxSp.spriteFrame = this.atlas.getSpriteFrame('icon_baoxiang');
                }
                this.status = status;

                status.forEach((s, index) => {
                    this.opBtns[index].node.active = s != ChallengeState.COMPLETE;
                    this.winFlagNodes[index].active = s == ChallengeState.COMPLETE;
                    CommonUtils.ungrey(this.starSps[index]);
                    switch(s) {
                        case ChallengeState.NOT_START: {
                            this.opBtns[index].node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame('bt_tiaozhan');
                            break;
                        }
                        case ChallengeState.COMPLETE: {
                            break;
                        }
                        case ChallengeState.CHALLENGING: {
                            this.opBtns[index].node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame('bt_tiaozhanzhong');
                            break;
                        }
                        case ChallengeState.FAILED: {
                            this.opBtns[index].node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame('bt_chongxintiaozhan');
                            CommonUtils.grey(this.starSps[index]);
                            break;
                        }
                    }
                });
            }

        }
    }

    /******* start events *******/
    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    opBtnOnClick (index) {
        let _this = this;
        return async function () {
            let status = _this.status[index];
            switch (status) {
                case ChallengeState.NOT_START: {
                    let result = await NetUtils.post<QuestRecord>('/fxjl/startQuest', [index]);
                    if (result.isRight) {
                        this.opBtns[index].node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame('bt_tiaozhanzhong');
                        let questId = result.right.questId;
                        let panel = await CommonUtils.getPanel('gameplay/newYear/challenge/newYearChallengePopup', NewYearChallengePopup) as NewYearChallengePopup;
                        panel.init(questId);
                        panel.from = this;
                        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                    }
                    break;
                }
                case ChallengeState.FAILED: {
                    let callback = async () => {
                        let result = await NetUtils.post<any>('/fxjl/resetQuest', [index]);
                        if (result.isRight) {
                            TipsManager.showMessage('挑战重置成功');
                            if (_this.overall.valid) {
                                let questId = _this.overall.val.fxjlSharedRecord.questIds[index];
                                QuestProxy.deleteCompletedQuest(questId);
                            }
                            _this.init();   
                        }
                    }
                    let own = PlayerData.getInstance().kbAmount;
                    if (own < 30) {
                        TipsManager.showMsgFromConfig(1021);
                        return;
                    }
                    CommonUtils.showRichSCBox(
                        `是否花费 <img src='currency_icon_151'/><color=#900404>30</color> 重新挑战福星？`,
                        `(当前拥有<img src='currency_icon_151'/>${own})`,
                        null,
                        callback
                    );
                    break;
                }
                case ChallengeState.CHALLENGING: {
                    TipsManager.showMessage('任务已领取，快去完成吧');
                    break;
                }
            }
        }
    }

    awardBoxOnClick (event) {
        let avaiable = this.status.filter(x => x == ChallengeState.COMPLETE).length >= 3;
        let got = this.overall.fmap(x => x.fxjlRecord.awardDelivered).getOrElse(true);
        if (avaiable && !got) {
            this.obtainAward();
        } else if (avaiable && got) {
            TipsManager.showMessage('今日奖励已领取，明日再来吧');
        } else {
            this.showTips(event);
        }
    }

    async showTips (e) {
        let config = await NewYearChallengeData.getTodayAward(this.todayLuckyInfoId);
        let awards = config.currency.map(x => {
            return {
                awardId: x.Id,
                amount: x.amount,
            }
        })
        CommonUtils.showCommonAwardsTipsWithoutArrow({
            title: "福星降临奖励",
            description: "完成三项可获得",
            awards: awards
        })(e);
    }

    async obtainAward() {
        let award = await NetUtils.post<AwardResult>('/fxjl/obtainAward', []);
        if (award.isRight) {
            // award.right.currencyStacks.forEach(stack => {
            //     stack.amount > 0 && TipsManager.showGainCurrency(stack);
            // });
            this.init();
        }
    }
    /******** end events ********/
}