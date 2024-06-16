import { CommonUtils } from "../../utils/CommonUtils";
import PagingControl from "../../base/PagingControl";
import { KingsFightConfig } from "./KingsFightConfig";
import { NetUtils } from "../../net/NetUtils";
import { MjdhPlayerRecord, MjdhSeason, MjdhWinnerRecord, AwardResult, MjdhBattleLog, PlayerBaseInfo, SimpleRanking, SimpleRankingRecord, CurrencyStack, MjdhSeasonDetail } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { ShopUtils } from "../../shop/ShopUtils";
import { TipsManager } from "../../base/TipsManager";
import KingsFightRank from "./KingsFightRank";
import KingsFightRankInfoPanel from "./KingsFightRankInfoPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import KingsFightRankPanel from "./KingsFightRankPanel";
import { ResUtils } from "../../utils/ResUtils";
import KingsFightSearchPanel from "./KingsFightSearchPanel";
import PlayerData from "../../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

interface AwardStatus {
    ready: boolean,
    got: boolean
}

interface BattleLogDetail {
    log: MjdhBattleLog;
    opponentInfo: Optional<PlayerBaseInfo>;
}


const { ccclass, property } = cc._decorator;
@ccclass
export default class KingsFightPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    timeRangeLabel: cc.Label = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    rankBtn: cc.Button = null;
    @property(cc.Button)
    shopBtn: cc.Button = null;
    @property(cc.Label)
    winStreakNumLabel: cc.Label = null;

    @property(cc.Label)
    amount165Label: cc.Label = null;
    @property(cc.Label)
    rankLabel: cc.Label = null;
    
    // awards
    @property([cc.Sprite])
    awardSps: Array<cc.Sprite> = [];
    @property([cc.Node])
    boxEffectNodes: Array<cc.Node> = [];
    
    // records
    // 1: A1 icon  2: B1 icon 3: A2 icon 4: B2 icon
    @property(cc.Node)
    record1Node: cc.Node = null;
    @property(cc.Node)
    record2Node: cc.Node = null;
    @property([cc.Sprite])
    playerIcons: Array<cc.Sprite> = [];
    @property([cc.Label])
    playerNameLabels: Array<cc.Label> = [];
    @property([cc.Sprite])
    resultSps: Array<cc.Sprite> = [];
    @property([cc.Node])
    flagNodes: Array<cc.Node> = [];  // 1: 胜 负 2: 胜 负
    @property(PagingControl)
    pageControl: PagingControl = null;
    
    @property(cc.Button)
    startMatchBtn: cc.Button = null;
    
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    // ranks 
    @property(KingsFightRank)
    rank: KingsFightRank = null;
    
    @property(cc.SpriteFrame)
    winSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    loseSf: cc.SpriteFrame = null;
    
    // data
    myRecord: Optional<MjdhPlayerRecord> = Optional.Nothing<MjdhPlayerRecord>();
    seasonInfo: Optional<MjdhSeasonDetail> = Optional.Nothing<MjdhSeasonDetail>();
    battleLog: Array<BattleLogDetail> = [];
    myInfo: Optional<PlayerBaseInfo> = Optional.Nothing();
    recordEnemy1: Optional<PlayerBaseInfo> = Optional.Nothing();
    recordEnemy2: Optional<PlayerBaseInfo> = Optional.Nothing();
    myCurrentRank = 1;
    
    start() {
        this.init();
        let viewHeight = CommonUtils.getViewHeight();
        if (viewHeight < 1366) {
            this.contentNode.scaleX =  this.contentNode.scaleY = viewHeight / 1366;
        }
    }
    
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.awardSps.forEach((sp, index) => {
            if (index < 3) {
                sp.node.on(cc.Node.EventType.TOUCH_END, this.showDailyAwardsOnClick(index));
            } else {
                sp.node.on(cc.Node.EventType.TOUCH_END, this.showSeasonAwardsOnClick());
            }
        });
        this.shopBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            ShopUtils.openShopPanel(4489002)
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 25));
        this.startMatchBtn.node.on(cc.Node.EventType.TOUCH_END, this.startMatch.bind(this));
        this.rank.node.on(cc.Node.EventType.TOUCH_END, this.showRankInfo.bind(this));
        this.rankBtn.node.on(cc.Node.EventType.TOUCH_END, this.openRankPanel.bind(this));
        let _this = this;
        this.playerIcons[1].node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.recordEnemy1.valid) {
                CommonUtils.showViewPlayerBox(_this.recordEnemy1.val)
            }
        });
        this.playerIcons[3].node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.recordEnemy1.valid) {
                CommonUtils.showViewPlayerBox(_this.recordEnemy2.val)
            }
        });
    }
    
    async init() {
        await KingsFightConfig.initConfig();
    
        let r1 = await NetUtils.get<MjdhPlayerRecord>('/mjdh/player/myself', []);
        if (r1.isLeft) {
            let r4 = await NetUtils.post<MjdhPlayerRecord>('/mjdh/player/create', []);
            this.myRecord = r4.toOptional();
        } else {
            this.myRecord = r1.toOptional();
        }
        let r3 = await NetUtils.get<MjdhSeasonDetail>('/mjdh/season/current/detail', []);
        this.seasonInfo = r3.toOptional();
    
        this.initEvents();
        this.initAwards();
        this.initSeasonInfo();
        this.initMySelf();
        this.initRecords();
        this.initRankAndCurrency();
    }
    
    //////////////////////////////////////////////
    // start awards
    initAwards() {
        this.awardSps[0].spriteFrame = this.getDailyAwardBoxSf(this.getFirstWinAwardStatus());
        this.awardSps[1].spriteFrame = this.getDailyAwardBoxSf(this.getChainWinAwardStatus());
        this.awardSps[2].spriteFrame = this.getDailyAwardBoxSf(this.getTenBattleAwardStatus());
    
        this.boxEffectNodes[0].active = this.isShowEffect(this.getFirstWinAwardStatus());
        this.boxEffectNodes[1].active = this.isShowEffect(this.getChainWinAwardStatus());
        this.boxEffectNodes[2].active = this.isShowEffect(this.getTenBattleAwardStatus());
    }
    
    getFirstWinAwardStatus() {
        return {
            ready: this.myRecord.fmap(x => x.dailyFirstWin).getOrElse(false),
            got: this.myRecord.fmap(x => x.dailyFirstWinAwardDelivered).getOrElse(false)
        }
    }
    
    getChainWinAwardStatus() {
        return {
            ready: this.myRecord.fmap(x => x.dailyConsecutiveWinAwardAvailable).getOrElse(false),
            got: this.myRecord.fmap(x => x.dailyConsecutiveWinAwardDelivered).getOrElse(false)
        }
    }
    
    getTenBattleAwardStatus() {
        return {
            ready: this.myRecord.fmap(x => x.dailyBattleCount >= 10).getOrElse(false),
            got: this.myRecord.fmap(x => x.dailyTenBattleAwardDelivered).getOrElse(false)
        }
    }
    
    getDailyAwardBoxSf(awardStatus: AwardStatus) {
        let res = awardStatus.ready ? (awardStatus.got ? 'icon_baoxiangkongyin' : 'icon_baoxiangfaguangyin') : 'icon_baoxiang3';
        return this.atlas.getSpriteFrame(res);
    }
    
    isShowEffect(awardStatus: AwardStatus) {
        return awardStatus.ready && !awardStatus.got;
    }
    /////////////////////////////////////////////
    
    /******* start 初始化赛季信息 *******/
    initSeasonInfo() {
        let seasonId = this.seasonInfo.fmap(x => x.mjdhSeason.id).getOrElse(1);
        let startTime = CommonUtils.getTimeInfo(this.seasonInfo.fmap(x => R.path(['mjdhSeason', 'startTime'], x)).getOrElse(Date.now()));
        let endTime = CommonUtils.getTimeInfo(this.seasonInfo.fmap(x => R.path(['mjdhSeason','endTime'], x)).getOrElse(Date.now()));
        this.timeRangeLabel.string = `第${seasonId}赛季 ${startTime.month}月${startTime.day}日~${endTime.month}月${endTime.day}日`;
    }
    /******** end 初始化赛季信息 ********/
    
    /******* start 初始化个人信息 *******/
    initMySelf() {
        let grade = this.myRecord.fmap(x => x.grade).getOrElse(1);
        this.rank.init(grade, true);
        this.winStreakNumLabel.string = this.myRecord.fmap(x => x.dailyConsecutiveWinCount).fmap(x => x.toString()).getOrElse('0');
    }
    /******** end 初始化个人信息 ********/
    
    /******* start 初始化比赛记录 *******/
    async initRecords() {
        let battleLog = await NetUtils.get<Array<MjdhBattleLog>>('/mjdh/battleLog/mine/', []);
        this.battleLog = battleLog.fmap(x => x.map(y => {
            return {
                log: y,
                myInfo: Optional.Nothing<PlayerBaseInfo>(),
                opponentInfo: Optional.Nothing<PlayerBaseInfo>(),
            }
        })).getOrElse([]);
        this.pageControl.init(Math.max(1, Math.floor(this.battleLog.length / 2)), this.onPageChange.bind(this));
    }
    
    changing: boolean = false;
    async onPageChange(page: number) {
        if (this.changing) { return; }
        this.changing = true;
        this.pageControl.setPage(page);
        let records: Array<BattleLogDetail> = R.slice((page - 1) * 2, page * 2, this.battleLog);
        let hasFirst = records[0] != undefined;
        let hasSecond = records[1] != undefined;
        this.record1Node.active = hasFirst;
        this.record2Node.active = hasSecond;
        if (hasFirst) {
            await this.initRecord(0, records[0]);
        } 
        if (hasSecond) {
            await this.initRecord(1, records[1]);
        }
        this.changing = false;
    }
    
    async initRecord(index: number, record: BattleLogDetail) {
        let opponentInfo = record.opponentInfo;
        let myAccountId = PlayerData.getInstance().accountId;
        if (!this.myInfo.valid) {
            this.myInfo = (await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [PlayerData.getInstance().accountId])).fmap(x => x[0]).toOptional();
        }
        if (!opponentInfo.valid) {
            let ememyAccountId = record.log.loserAccountId == myAccountId ? record.log.winnerAccountId : record.log.loserAccountId;
            opponentInfo = (await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [ememyAccountId])).fmap(x => x[0]).toOptional();
            this.updateInfo(record.log.id, opponentInfo);
        }
        if (index == 1) {
            this.recordEnemy2 = opponentInfo;
        } else {
            this.recordEnemy1 = opponentInfo;
        }
        let won = record.log.winnerAccountId == myAccountId;
        this.playerNameLabels[index * 2].string = this.myInfo.fmap(x => x.player.playerName).getOrElse("");
        this.playerNameLabels[index * 2 + 1].string = opponentInfo.fmap(x => x.player.playerName).getOrElse("");
        this.resultSps[index * 2].spriteFrame = won ? this.winSf : this.loseSf;
        this.resultSps[index * 2 + 1].spriteFrame = won ? this.loseSf : this.winSf;
    
        let fromGrade = won ? record.log.winnerBeforeGrade : record.log.loserBeforeGrade;
        let toGrade = won ? record.log.winnertAftereGrade : record.log.loserAfterGrade;
        let toConfig = KingsFightConfig.getSeasonConfig(Math.min(toGrade, KingsFightConfig.MAX_GRADE));
        let fromConfig = KingsFightConfig.getSeasonConfig(Math.min(fromGrade, KingsFightConfig.MAX_GRADE));
        let toRankArr = toConfig.cRank.split('_').map(x => parseInt(x));
        let fromRankArr = fromConfig.cRank.split('_').map(x => parseInt(x));
        this.flagNodes[index * 2].active = (won && (fromRankArr[0] != toRankArr[0] || fromRankArr[1] != toRankArr[1]));
        this.flagNodes[index * 2 + 1].active = (!won && (fromRankArr[0] != toRankArr[0] || fromRankArr[1] != toRankArr[1]));
        this.playerIcons[index * 2].spriteFrame = await ResUtils.getPlayerRectIconById(this.myInfo.fmap(x => x.player.prefabId).getOrElse(4000001));
        this.playerIcons[index * 2 + 1].spriteFrame = await ResUtils.getPlayerRectIconById(opponentInfo.fmap(x => x.player.prefabId).getOrElse(4000001));
    }
    
    updateInfo(id: number, value: Optional<PlayerBaseInfo>) {
        let index = R.findIndex(x => x.log.id == id, this.battleLog);
        if (index != -1) {
            this.battleLog[index].opponentInfo = value;
        }
    }
    /******** end 初始化比赛记录 ********/
    
    /******* start init Rank & currency *******/
    async initRankAndCurrency () {
        this.amount165Label.string = String(await CommonUtils.getCurrencyAmount(165));
    
        let result = await NetUtils.get<Array<SimpleRankingRecord>>('/ranking/view/{rankingId}/{accountId}/', [KingsFightConfig.RANK_ID, PlayerData.getInstance().accountId]);
        let record = result.fmap(x => x[0]).toOptional();
        if (record.valid) {
            this.myCurrentRank = record.val.currentRank;
            this.rankLabel.string = `排名 ${record.val.currentRank} 名`
        } else {
            this.myCurrentRank = -1;
            this.rankLabel.string = '未上榜';
        }
    }
    /******** end init Rank & currency ********/


    // events
    async openRankPanel() {
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightRankPanel', KingsFightRankPanel) as KingsFightRankPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async startMatch() {
        let serverTimeInfo = CommonUtils.getServerTimeInfo();
        if (!(serverTimeInfo.hour >= 12 && serverTimeInfo.hour < 13) && !(serverTimeInfo.hour >= 18 && serverTimeInfo.hour < 19)) {
            TipsManager.showMessage('每日12:00~13:00和18:00~19:00开启');
            return;
        }
        let mathResult = await NetUtils.post<Object>('/mjdh/startMatch', []);
        if (mathResult.isRight) {
            console.log('开始匹配');
            this.closePanel();
            let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightSearchPanel', KingsFightSearchPanel) as KingsFightSearchPanel;
            let grade = this.myRecord.fmap(x => x.grade).getOrElse(1);
            panel.init(grade);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        } else {
            TipsManager.showMessage(mathResult.left);
        }
    }
    
    async showRankInfo() {
        if (this.myRecord.valid) {
            let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightRankInfoPanel', KingsFightRankInfoPanel) as KingsFightRankInfoPanel;
            let amount = this.seasonInfo.fmap(x => x.playerCount).getOrElse(1); 
            let myRank = this.myCurrentRank;
            if (myRank == -1) {
                myRank = amount;
            }
            panel.init(myRank, amount, this.myRecord.val.grade);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }
    
    // awards
    transfer(award) {
        return { awardId: award.id, amount: award.amount };
    }
    
    showDailyAwardsOnClick(index: number) {
        let _this = this;
        return async function (e) {
            let awardStatus: AwardStatus = { ready: false, got: false };
            let route = "";
            let awardId = 1;
            if (index == 0) { // 首胜
                awardStatus = _this.getFirstWinAwardStatus();
                route = "/mjdh/player/myself/obtainDailyFirstWinAward";
                awardId = 1;
            } else if (index == 1) {
                awardStatus = _this.getChainWinAwardStatus();
                route = "/mjdh/player/myself/obtainDailyConsecutiveWinAward";
                awardId = 3;
            } else {
                awardStatus = _this.getTenBattleAwardStatus();
                route = "/mjdh/player/myself/obtainDailyTenBattleAward";
                awardId = 2;
            }
    
            if (awardStatus.got) {
                TipsManager.showMessage('奖励已经领取过了，明天再来吧');
                return;
            } else if (awardStatus.ready) {
                let result = await NetUtils.post<Array<CurrencyStack>>(route, []);
                if (result.isRight) {
                    result.right.forEach(c => TipsManager.showGainCurrency(c));
                }
                _this.myRecord = (await NetUtils.get<MjdhPlayerRecord>('/mjdh/player/myself', [])).toOptional();
                _this.initAwards();
                return;
            }
            let description = "";
            if (index == 0) {
                description = "战斗获胜即可获得";
            } else if (index == 1) {
                let winStreamNum = _this.myRecord.fmap(x => x.dailyConsecutiveWinCount).getOrElse(0);
                description = `已连胜 ${winStreamNum}/5`
            } else {
                let battleNum = _this.myRecord.fmap(x => x.dailyBattleCount).getOrElse(0);
                description = `已战斗 ${battleNum}/10`
            }
            let config = KingsFightConfig.getDailyAwardConfig(awardId);
            let awards = R.map(_this.transfer, config.award);
            CommonUtils.showCommonAwardsTips({
                title: config.name,
                description: description,
                awards: awards
            })(e);
        }
    }
    
    showSeasonAwardsOnClick() {
        let _this = this;
        return function (e) {
            let grade = Math.min(_this.myRecord.fmap(x => x.grade).getOrElse(1), KingsFightConfig.MAX_GRADE);
            let config = KingsFightConfig.getSeasonConfig(grade);
            let award = R.clone(config.award);
            if (!(award instanceof Array)) {
                award = R.of(award);
            }
            let awards = R.map(_this.transfer, award);
            CommonUtils.showCommonAwardsTips({
                title: '赛季奖励',
                description: '每月1日发放奖励',
                awards: awards
            })(e);
        }
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
