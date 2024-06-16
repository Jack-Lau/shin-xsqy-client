import PagingControl from "../../base/PagingControl";
import { CommonUtils } from "../../utils/CommonUtils";
import { CurrencyRecord, DiscipleRecord, DailyPracticeRecord, CurrencyStack, ObtainDailyPracticeRewardResult, CompleteDailyPracticeResult } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { CurrencyId } from "../../config/CurrencyId";
import { NetUtils } from "../../net/NetUtils";
import { MentorUtils } from "./MentorUtils";
import CommonPanel from "../../base/CommonPanel";
import Either from "../../cocosExtend/Either";
import DisciplePracticeItem from "./DisciplePracticeItem";
import MentorRecordPanel from "./MentorRecordPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { TipsManager } from "../../base/TipsManager";
import { WebsocketHandler } from "../../net/WebsocketHandler";
import Optional from "../../cocosExtend/Optional";
import FriendsData from "../friends/FriendsData";
import SecondConfirmBox from "../../base/SecondConfirmBox";
import ItemConfig from "../../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class DisciplePanel extends CommonPanel {
    // top
    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    mentorValueLabel: cc.Label = null;
    @property(cc.Label)
    awardLabel: cc.Label = null;
    @property(cc.Button)
    viewRecordBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    // center
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Button)
    betrayBtn: cc.Button = null;

    // bottom
    @property(cc.Sprite)
    questIconSp: cc.Sprite = null;
    @property(cc.Label)
    questContentLabel: cc.Label = null;
    @property([cc.Label])
    awardLabels: Array<cc.Label> = [];
    @property([cc.Sprite])
    awardIcons: Array<cc.Sprite> = [];

    @property(cc.Button)
    chatMentorBtn: cc.Button = null;
    @property(cc.Button)
    gotoBtn: cc.Button = null;
    @property(cc.Button)
    getAwardBtn: cc.Button = null;
    @property(cc.Button)
    gotAwardBtn: cc.Button = null;
    @property(cc.Node)
    practiceBgNode: cc.Node = null;
    @property(cc.Node)
    achievementBgNode: cc.Node = null;
    @property(cc.Label)
    practiceLabel: cc.Label = null;
    @property(cc.Label)
    achievementLabel: cc.Label = null;

    @property(cc.Label)
    expAwardLabel: cc.Label = null;
    @property(cc.Label)
    contributionAwardLabel: cc.Label = null;

    @property(cc.Button)
    obtainBtn: cc.Button = null;

    // practise
    @property([DisciplePracticeItem])
    practiceItems: Array<DisciplePracticeItem> = [];

    // achievements
    @property([DisciplePracticeItem])
    achievementItems: Array<DisciplePracticeItem> = [];

    @property(cc.SpriteAtlas)
    iconAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    currencyIconAtlas: cc.SpriteAtlas = null;

    // data
    dailyPractice: Array<DailyPracticeRecord> = [];
    allAchievements: Array<MentorUtils.MentorAchievement> = [];
    record: DiscipleRecord = null;

    readonly PAGE_SIZE = 6;

    start() {
        this.initEvents();
        this.init();
    }

    async init() {
        this.allAchievements = await MentorUtils.getAchievements();
        
        await this.initTop();
        await this.initPraticeAndAchievement();
        await this.initDailyPratice();

        this.allAchievements = R.sortBy(this.sortFunc, this.allAchievements)
        this._state.value = Either.Left<number, number>(0);
        this.pageControl.init(Math.ceil(this.allAchievements.length / this.PAGE_SIZE), this.initAchievements.bind(this));
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 19));
        let _this = this;
        this.practiceItems.forEach((item, index) => item.node.on(cc.Node.EventType.TOUCH_END, () => { _this._state.value = Either.Left<number, number>(index) }))
        this.achievementItems.forEach((item, index) => item.node.on(cc.Node.EventType.TOUCH_END, () => { _this._state.value = Either.Right<number, number>(index) }))
        this.viewRecordBtn.node.on(cc.Node.EventType.TOUCH_END, this.viewRecord.bind(this));
        this.gotoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showQuestTips.bind(this)));
        this.obtainBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.obtainAward.bind(this)));
        this.chatMentorBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            let data = _this.record;
            if (data) {
                _this.closePanel();
                FriendsData.getInstance().openFriendChatByID(data.masterAccountId);
            }
        });
        this.betrayBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            let data = _this.record;
            if (data) {
                let panel = await CommonUtils.getPanel('base/secondConfirmBox', SecondConfirmBox) as SecondConfirmBox;
                let name = (await NetUtils.get<Array<string>>('/player/viewName', [String(data.masterAccountId)])).fmap(x => x.length > 0 ? x[0] : '').getOrElse('')
                panel.init(`您确定要解除与<color=#2c5e07>${name}</color>的师徒关系吗？解除后师徒值将被清空。`, async () => {
                    let result = await NetUtils.post<any>('/impartation/disciple/meAsDisciple/delete', [])
                    if (result.isRight) {
                        _this.closePanel();
                    }
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
            }
        });
        this.getAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.obtainQuestAward.bind(this));
        this.gotAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.onCompleted.bind(this));
    }

    async initTop() {
        let record = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        this.record = record.getOrElse(null);
        let kb = 0;
        if (record.isRight) {
            kb = await MentorUtils.getPool(record.right.accountId)
        }
        this.awardLabel.string = String(CommonUtils.toCKb(kb * 0.3));
        let result = await NetUtils.get<CurrencyRecord>('/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, CurrencyId.师徒值]);
        this.mentorValueLabel.string = result.fmap(x => String(x.amount)).getOrElse('0');

        let level = record.fmap(x => x.playerLevelAtMidnight).getOrElse(0);
        let contributionRatio = await MentorUtils.getContributionRatio(level);
        let expRatio = await MentorUtils.getExpRatio(level);
        this.contributionAwardLabel.string = record.fmap(x => Math.floor(x.yesterdayContributionPool * contributionRatio) + '').getOrElse('0');
        this.expAwardLabel.string = record.fmap(x => Math.floor(x.yesterdayExpPool * expRatio) + '').getOrElse('0');
    }

    async assurePractice () {
        if (!this.record || !this.record.dailyPracticeGenerated) {
            let result = await NetUtils.post<Array<DailyPracticeRecord>>('/impartation/dailyPractice/mine/generate', []);
            if (result.isLeft) {
                TipsManager.showMessage('正在生成每日修行，请稍等...');
                await CommonUtils.wait(4);
                await this.assurePractice();
            }
        }
    }

    async initPraticeAndAchievement() {
        await this.assurePractice();
        let records = await NetUtils.get<Array<DailyPracticeRecord>>('/impartation/dailyPractice/mine/', []);
        this.dailyPractice = records.getOrElse([]);
        let notComplete = (id) => {
            let practice = R.find(practice => practice.definitionId == id, this.dailyPractice) as DailyPracticeRecord;
            return practice == undefined || (practice.status != "COMPLETED" && practice.status != "REWARDED")
        }
        let notInitIds = this.allAchievements.map(x => x.id).filter(notComplete)
        if (notInitIds.length > 0) {
            let result = await NetUtils.post<Array<CompleteDailyPracticeResult>>('/impartation/dailyPractice/mine/complete', [notInitIds.join(',')]);
            if (result.isRight) {
                let records = result.right.filter(x => undefined != x).map(x => x.dailyPracticeRecord);
                this.dailyPractice = this.dailyPractice.filter(x => notInitIds.indexOf(x.definitionId) == -1).concat(records);
            }
        }
    }

    isAchievement(id) {
        return 4470000 <= id && id <= 4478000;
    }

    getInfoById(id: number): Optional<DailyPracticeRecord> {
        return new Optional<DailyPracticeRecord>(R.find(x => x.definitionId == id, this.dailyPractice));
    }

    async initDailyPratice() {
        let data = this.dailyPractice.filter(x => !this.isAchievement(x.definitionId) && x.status != "NOT_STARTED_YET");
        let length = data.length;
        await CommonUtils.asyncForEach(this.practiceItems, async (item, index) => {
            item.node.active = index < length;
            if (index < length) {
                let config = await MentorUtils.getPracticeConfig(data[index].definitionId)
                item.init(config, new Optional<DailyPracticeRecord>(data[index]));
            }
        });
        await CommonUtils.wait(0.2);
    }

    async initAchievements(page: number) {
        this.pageControl.setPage(page);
        let data = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this.allAchievements) as Array<MentorUtils.MentorAchievement>;
        let length = data.length;
        this.achievementItems.forEach((item, index) => {
            item.node.active = index < length;
            if (index < length) {
                item.init(data[index], this.getInfoById(data[index].id));
            }
        });
        let state = this._state.value as Either<number, number>
        if (state.isRight) {
            this._state.value = Either.Right<number, number>(0)
        }
    }

    async initBottom(index: number, isPractice: boolean) {
        this.practiceBgNode.active = isPractice;
        this.practiceLabel.node.active = isPractice;
        this.achievementBgNode.active = !isPractice;
        this.achievementLabel.node.active = !isPractice;
        let data: MentorUtils.MentorAchievement = null;

        if (isPractice) {
            let record = this.practiceItems[index].record;
            if (record.valid) {
                data = await MentorUtils.getPracticeConfig(record.val.definitionId);
                this.practiceLabel.string = data.name;
            }
        } else {
            let page = this.pageControl.currentPage;
            let arr = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this.allAchievements) as Array<MentorUtils.MentorAchievement>;
            data = arr[index];
            this.achievementLabel.string = data.name;
        }
        if (undefined == data) {
            return;
        }
        this.questIconSp.spriteFrame = this.getSf(data.icon + '');
        this.questContentLabel.string = data.description;
        let awards = data.showAward;
        this.awardIcons.forEach(ele => ele.node.active = false);
        this.awardLabels.forEach(ele => ele.node.active = false);
        awards.forEach((award, index) => {
            this.awardIcons[index].node.active = true;
            this.awardIcons[index].spriteFrame = this.getCSf(award.id);
            this.awardLabels[index].node.active = true;
            this.awardLabels[index].string = String(award.amount);
        });

        let record = this.getInfoById(data.id);
        if (record.valid) {
            this.gotoBtn.node.active = record.val.status == "IN_PROGRESS" || record.val.status == "NOT_STARTED_YET";
            this.getAwardBtn.node.active = record.val.status == "COMPLETED";
            this.gotAwardBtn.node.active = record.val.status == "REWARDED";
        } else {
            this.gotAwardBtn.node.active = true;
            this.getAwardBtn.node.active = this.gotAwardBtn.node.active = false;
        }
    }

    refreshState() {
        let state = this._state.value as Either<number, number>;
        this.practiceItems.forEach(item => item.selected = false);
        this.achievementItems.forEach(item => item.selected = false);
        if (state.isLeft) {
            let item = this.practiceItems[state.val];
            item.selected = true;
        } else {
            let item = this.achievementItems[state.val];
            item.selected = true;
        }
        let index = state.val;

        this.initBottom(index, state.isLeft);
        super.refreshState();
    }

    async getPracticeAward(pid: number) {
        let result = await NetUtils.post<ObtainDailyPracticeRewardResult>('/impartation/dailyPractice/mine/{id}/obtainAward', [pid]);
        if (result.isRight) {
            this.dailyPractice = this.dailyPractice.filter(x => x.definitionId != pid);
            this.dailyPractice.push(result.right.dailyPracticeRecord);
            this.allAchievements = R.sortBy(this.sortFunc, this.allAchievements);
            await this.initTop();
            await this.initDailyPratice();
            await this.initAchievements(this.pageControl.currentPage);
			await this.refreshState();
        }
    }

    async viewRecord() {
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorRecordPanel', MentorRecordPanel) as MentorRecordPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async showQuestTips() {
        let state = this._state.value as Either<number, number>;
        let data: MentorUtils.MentorAchievement = null;
        if (state.isLeft) {
            let record = this.practiceItems[state.val].record;
            if (record.valid) {
                data = await MentorUtils.getPracticeConfig(record.val.definitionId);
            } else {
                return;
            }
        } else {
            let page = this.pageControl.currentPage;
            let arr = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this.allAchievements) as Array<MentorUtils.MentorAchievement>;
            data = arr[state.val];
        }
        TipsManager.showMessage(data.feedback);
    }

    async obtainQuestAward() {
        let state = this._state.value as Either<number, number>;
        if (state.isLeft) {
            let record = this.practiceItems[state.val].record;
            if (record.valid) {
                this.getPracticeAward(record.val.definitionId);
            } else {
                return;
            }
        } else {
            let page = this.pageControl.currentPage;
            let arr = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this.allAchievements) as Array<MentorUtils.MentorAchievement>;
            this.getPracticeAward(arr[state.val].id);

        }
    }

    async onCompleted() {
        TipsManager.showMessage('已经领取过奖励了');
    }

    async obtainAward() {
        if (this.record && CommonUtils.getDeltaDay(R.prop('lastYuanbaoExpDelivery', this.record)) == 0) {
            TipsManager.showMessage('今天已经领取过奖励了，明天再来吧');
            return;
        }
        let stacks = await NetUtils.post<Array<CurrencyStack>>('/impartation/disciple/meAsDisciple/obtainYuanbaoExpPoolAward', []);
        if (stacks.isRight) {
            stacks.right.forEach(stack => TipsManager.showGainCurrency(stack))
        }
    }

    sortFunc = (x: MentorUtils.MentorAchievement): number => {
        let record = this.getInfoById(x.id);
        if (record.fmap(x => x.status == "COMPLETED").getOrElse(false)) {
            return -9999999;
        }
        if (record.fmap(x => x.status == "REWARDED").getOrElse(false)) {
            return 9999999;
        }
        return 0 - x.priority;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }

    getSf(key: string): cc.SpriteFrame {
        return this.iconAtlas.getSpriteFrame(key);
    }

    getCSf(cid: number): cc.SpriteFrame {
		if (cid === 152) {
			return this.currencyIconAtlas.getSpriteFrame(`icon_nengliang`)
		} else {
			let icon = ItemConfig.getInstance().getItemDisplayById(cid, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(1);
            return this.currencyIconAtlas.getSpriteFrame(`currency_icon_${icon}`)
		}
    }
}
