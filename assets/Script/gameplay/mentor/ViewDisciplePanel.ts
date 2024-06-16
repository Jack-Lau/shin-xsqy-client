import PagingControl from "../../base/PagingControl";
import { CommonUtils } from "../../utils/CommonUtils";
import { CurrencyRecord, DiscipleRecord, DailyPracticeRecord, CompleteDailyPracticeResult } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { CurrencyId } from "../../config/CurrencyId";
import { NetUtils } from "../../net/NetUtils";
import { MentorUtils } from "./MentorUtils";
import CommonPanel from "../../base/CommonPanel";
import Either from "../../cocosExtend/Either";
import DisciplePracticeItem from "./DisciplePracticeItem";
import { TipsManager } from "../../base/TipsManager";
import Optional from "../../cocosExtend/Optional";
import ItemConfig from "../../bag/ItemConfig";


/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class ViewDisciplePanel extends CommonPanel {
    // top
    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    mentorValueLabel: cc.Label = null;
    @property(cc.Label)
    awardLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    // center
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Label)
    practiceProgressLabel: cc.Label = null;
    @property(cc.Label)
    achievementProgressLabel: cc.Label = null;

    // bottom
    @property(cc.Sprite)
    questIconSp: cc.Sprite = null;
    @property(cc.Label)
    questContentLabel: cc.Label = null;
    @property([cc.Label])
    awardLabels: Array<cc.Label> = [];
    @property([cc.Sprite])
    awardIcons: Array<cc.Sprite> = [];

    @property(cc.Node)
    practiceBgNode: cc.Node = null;
    @property(cc.Node)
    achievementBgNode: cc.Node = null;
    @property(cc.Label)
    practiceLabel: cc.Label = null;
    @property(cc.Label)
    achievementLabel: cc.Label = null;

    @property(cc.Node)
    completeNode: cc.Node = null;
    @property(cc.Node)
    getAwardNode: cc.Node = null;
    @property(cc.Node)
    doingNode: cc.Node = null;

    // practise
    @property([DisciplePracticeItem])
    practiceItems: Array<DisciplePracticeItem> = [];
    @property(cc.Node)
    nonePracticeNode: cc.Node = null;

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
    accountId: number = 0;

    start() {
        this.initEvents();
    }

    async init(accountId: number, record: DiscipleRecord) {
        this.accountId = accountId;
        this.record = record;
        this.nameLabel.string = (await NetUtils.get<Array<string>>('/player/viewName', [String(accountId)])).fmap(x => x.length > 0 ? x[0] : '').getOrElse('');
        this.allAchievements = await MentorUtils.getAchievements();
        this.initTop(record);
        await this.initPraticeAndAchievement(accountId);
        await this.initDailyPratice();

        this.allAchievements = R.sortBy(this.sortFunc, this.allAchievements)
        let data = this.dailyPractice.filter(x => !this.isAchievement(x.definitionId) && x.status != "NOT_STARTED_YET");
        this.nonePracticeNode.active = data.length == 0;
        if (data.length == 0) {
            this._state.value = Either.Right<number, number>(0);
        } else {
            this._state.value = Either.Left<number, number>(0);
        }
        this.pageControl.init(Math.ceil(this.allAchievements.length / this.PAGE_SIZE), this.initAchievements.bind(this));
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        let _this = this;
        this.practiceItems.forEach((item, index) => item.node.on(cc.Node.EventType.TOUCH_END, () => { _this._state.value = Either.Left<number, number>(index) }))
        this.achievementItems.forEach((item, index) => item.node.on(cc.Node.EventType.TOUCH_END, () => { _this._state.value = Either.Right<number, number>(index) }))
    }

    async initTop(record: DiscipleRecord) {
        let kb = await MentorUtils.getPool(record.accountId)
        this.awardLabel.string = String(CommonUtils.toCKb(kb * 0.7));
        let result = await NetUtils.get<CurrencyRecord>('/currency/view/{accountId}/{currencyId}', [this.accountId, CurrencyId.师徒值]);
        this.mentorValueLabel.string = result.fmap(x => String(x.amount)).getOrElse('0');
    }


    async initPraticeAndAchievement(accountId: number) {
        let records = await NetUtils.get<Array<DailyPracticeRecord>>('/impartation/dailyPractice/{accountId}/', [accountId]);
        this.dailyPractice = records.getOrElse([]);
        let achievements = this.dailyPractice.filter(x => this.isAchievement(x.definitionId));
        let completed = achievements.filter(x => x.status == "REWARDED").length;
        this.achievementProgressLabel.string = `(${completed}/59)`;
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
        let completed = data.filter(x => x.status == "REWARDED").length;
        this.practiceProgressLabel.string = `(${completed}/3)`
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
            this.doingNode.active = record.val.status == "IN_PROGRESS" || record.val.status == "NOT_STARTED_YET";
            this.getAwardNode.active = record.val.status == "COMPLETED";
            this.completeNode.active = record.val.status == "REWARDED";
        } else {
            this.doingNode.active = true;
            this.completeNode.active = this.getAwardNode.active = false;
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
        if (cid == 152) {
            return this.currencyIconAtlas.getSpriteFrame("icon_nengliang")
        } else {
            let icon = ItemConfig.getInstance().getItemDisplayById(cid, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(1);
            return this.currencyIconAtlas.getSpriteFrame(`currency_icon_${icon}`)
        }
        
    }
}
