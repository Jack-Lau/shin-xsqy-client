import KingsFightRank from "./KingsFightRank";
import { NetUtils } from "../../net/NetUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import Optional from "../../cocosExtend/Optional";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { PlayerBaseInfo, MjdhPlayerRecord } from "../../net/Protocol";
import { Notify } from "../../config/Notify";
import KingsFightPanel from "./KingsFightPanel";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class KingsFightSearchPanel extends cc.Component {
    @property(cc.Label)
    timerLabel: cc.Label = null;
    
    // top
    @property(cc.Sprite)
    tPlayerBust: cc.Sprite = null;
    @property(cc.Sprite)
    tSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    tNameLabel: cc.Label = null;
    @property(KingsFightRank)
    tRank: KingsFightRank = null;

    // down
    @property(cc.Sprite)
    dPlayerBust: cc.Sprite = null;
    @property(cc.Sprite)
    dSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    dNameLabel: cc.Label = null;
    @property(KingsFightRank)
    dRank: KingsFightRank = null;

    @property(cc.Button)
    cancelBtn: cc.Button = null;
    @property(cc.Label)
    currentTimeLabel: cc.Label = null;

    @property(cc.Node)
    blockNode: cc.Node = null;

    matchTime = 0;

    myGrade = 1;

    readonly prefabIds = [4000001, 4000002, 4000003, 4000004];
    readonly schoolIds = [101, 102, 103, 104];
    readonly names = [
        "平和安","林宜修","成承福","蓟锐达","宰瀚海","丁嘉木","席欣怿","苏安宜",
        "张哲圣","窦元忠","熊文星","柴浩渺","柯含之","龚珠雨","田静程","长孙绮山",
        "房惜雪","衡婉秀","耿娜娜","宰采波","大井拓真","黒岩佳右","神原佳右","川合千佳子","中山郁美"];

    start () {
        this.cancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.cancelMatch.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        EventDispatcher.on(Notify.KINGS_FIGHT_MATCH_END, this.showOpponent);
        EventDispatcher.on(Notify.KINGS_FIGHT_SEARCH_FORCE_CLOSE, this.forceClose);
        this.schedule(this.onTimer, 1);
        this.schedule(this.switchPlayer, 0.2);
    }

    async init (grade: number) {
        this.myGrade = grade;
        this.dNameLabel.string = PlayerData.getInstance().playerName;
        this.dPlayerBust.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + PlayerData.getInstance().prefabId);
        this.dSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional(PlayerData.getInstance().schoolId));
        this.dRank.init(grade, true);
    }

    async cancelMatch () {
        await NetUtils.post('/mjdh/cancelMatch', []);
        this.closePanel();
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightPanel', KingsFightPanel) as KingsFightPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    onTimer() {
        this.matchTime += 1;
        this.timerLabel.string = String(this.matchTime);
        let serverTimeInfo = CommonUtils.getServerTimeInfo();
        this.currentTimeLabel.string = `${this.formatTime(serverTimeInfo.hour)}:${this.formatTime(serverTimeInfo.minute)}`;
    }

    formatTime(x) {
        if (x < 10) {
            return `0${x}`
        } else {
            return String(x);
        }
    }

    async switchPlayer () {
        this.tNameLabel.string = CommonUtils.randomOne(this.names);
        this.tPlayerBust.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + CommonUtils.randomOne(this.prefabIds));
        this.tSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional(CommonUtils.randomOne(this.schoolIds)));
        let grade = this.myGrade + CommonUtils.randomInt(-3, 3);
        grade = Math.max(1, grade);
        this.tRank.init(grade, true);
    }

    showOpponent = async function (e: EventDispatcher.NotifyEvent) {
        this.unschedule(this.onTimer);
        this.unschedule(this.switchPlayer);
        let detail = e.detail;
        let accountId = detail.accountId;
        let opponentInfo = (await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [accountId])).fmap(x => x[0]).toOptional(); 
        this.tNameLabel.string = opponentInfo.fmap(x => x.player.playerName).getOrElse("");
        let prefabId = opponentInfo.fmap(x => x.player.prefabId).getOrElse(4000001);
        let schoolId = opponentInfo.fmap(x => x.schoolId);
        this.tPlayerBust.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + prefabId);
        this.tSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(schoolId);
        try {
            let opponentRecord = (await NetUtils.get<MjdhPlayerRecord>('/mjdh/player/{accountId}', [accountId])).toOptional();
            let grade = opponentRecord.fmap(x => x.grade).getOrElse(1);
            this.tRank.init(grade, true);
            await CommonUtils.wait(1.5);
        } catch (e) {

        } finally {
            this.closePanel();
        }
    }.bind(this);

    forceClose = function () {
        this.closePanel();
    }.bind(this);

    closePanel () {
        EventDispatcher.off(Notify.KINGS_FIGHT_MATCH_END, this.showOpponent);
        EventDispatcher.off(Notify.KINGS_FIGHT_SEARCH_FORCE_CLOSE, this.forceClose);
        this.unschedule(this.switchPlayer);
        this.unschedule(this.onTimer);
        CommonUtils.safeRemove(this.node);
    }
}