import CommonPanel from "../../base/CommonPanel";
import { NetUtils } from "../../net/NetUtils";
import { SimpleRanking, KuaibiDailyRecord, SimpleRankingRecord, MjdhPlayerRecord } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import KingsFightRankItem from "./KingsFightRankItem";
import { RankUtils } from "../rank/RankUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import { KingsFightConfig } from "./KingsFightConfig";
import PlayerData from "../../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class KingsFightRankPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(KingsFightRankItem)
    myselfRankItem: KingsFightRankItem = null;
    @property(cc.Button)
    showAwardBtn: cc.Button = null;
    @property(cc.Button)
    showRankBtn: cc.Button = null;

    @property(cc.Node)
    scrollBgNode: cc.Node = null;

    @property(cc.Label)
    noteLabel: cc.Label = null;
    @property(cc.Label)
    beforeKbLabel: cc.Label = null;
    @property(cc.Label)
    amountLabel: cc.Label = null;
    @property(cc.Node)
    noteNode: cc.Node = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    // 分页
    // 共显示20个，触底加载初始化下10个，并删除之前的10
    // 同时startIndex += 10
    startIndex = 0;    // 当前的起始元素
    readonly pageSize = 20; // 总数量
    records: Array<SimpleRankingRecord> = [];

    start() {
        this.init();
        this.initEvents();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.showAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.showAward.bind(this));
        this.showRankBtn.node.on(cc.Node.EventType.TOUCH_END, this.showRank.bind(this));

        this.scroll.node.on('scroll-to-bottom', this.loadNextPage.bind(this));
        this.scroll.node.on('scroll-to-top', this.loadPrevPage.bind(this));
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/lastDayKuaibiDailiRecord', []) as any;
        if (response.status == 0) {
            let record = response.content as KuaibiDailyRecord;
            let other = new Optional<number>(R.prop('rebateMilliKuaibiFromOther', record));
            RankUtils.totalKb = Math.floor(other.getOrElse(0) * 0.1);
        }
        this.initPlayerRank(this.getRankId());
    }

    async loadPrevPage() {
        if (this.startIndex <= 0) {
            return;
        } else {
            let from = Math.max(this.startIndex - 10, 0);
            let to = this.startIndex;
            this.startIndex = Math.max(this.startIndex - 10, 0);
            let remain = this.pageSize - (to - from);
            while (this.scroll.content.children.length > remain) {
                this.scroll.content.removeChild(this.scroll.content.children[this.scroll.content.children.length - 1]);
            }
            await this.initScroll(from, to, false);
            this.scroll.scrollToPercentVertical(1 - (to - from + 2) / this.pageSize);
        }
    }

    async loadNextPage() {
        if (this.startIndex + this.pageSize >= this.records.length) {
            return;
        } else {
            let from = this.startIndex + this.pageSize;
            let to = Math.min(this.startIndex + this.pageSize + 10, this.records.length);
            await this.initScroll(from, to, true);
            this.startIndex = Math.min(this.startIndex +  10, this.records.length - this.pageSize);
            while (this.scroll.content.children.length > 20) {
                this.scroll.content.removeChild(this.scroll.content.children[0]);
            }
            this.scroll.scrollToPercentVertical((to - from + 2) / this.pageSize);
        }
    }

    async initScroll(from: number, to: number, isNext: boolean) {
        let rankId = this.getRankId();
        let records = R.slice(from, to, this.records)
        let accountIds = R.map(x => x.accountId, records).join(',')
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [accountIds]) as any;
        let length = this.records.length;
        if (response.status == 0) {
            let playerInfoArray = response.content;
            records.forEach((ele, index) => {
                let itemNode = cc.instantiate(this.itemPrefab);
                if (!isNext) { // 插入到最前
                    itemNode.zIndex = this.startIndex - 10 + index - length
                }
                itemNode.parent = this.scroll.content;
                let item = itemNode.getComponent(KingsFightRankItem);
                item.init({
                    playerBaseInfo: playerInfoArray[index],
                    currentRank: ele.currentRank,
                    rankValue: ele.rankValue
                }, rankId);

                if (this.showAwardBtn.node.active) {
                    item.showRank();
                } else {
                    item.showAward();
                }
            });
        }
    }

    async initPlayerRank(rankId) {
        this.scroll.content.removeAllChildren();
        this.scroll.scrollToPercentVertical(1);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ranking/view/{id}', [rankId]) as any;
        if (response.status == 0) {
            this.startIndex = 0;
            let rankInfo = response.content as SimpleRanking;
            this.records = rankInfo.topRecords;
            await this.initScroll(0, this.pageSize, true);
            /**
             * 如果自己可以被排行
             * 则显示排行
             * 否则
             * 拉长scroll
             */
            let myselfRankInfo = R.prop(0, rankInfo.selfRecords);
            if (myselfRankInfo) {
                let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [myselfRankInfo.accountId + '']) as any;
                if (response3.status == 0 && response3.content.length > 0) {
                    this.myselfRankItem.init({
                        playerBaseInfo: response3.content[0],
                        currentRank: myselfRankInfo.currentRank,
                        rankValue: myselfRankInfo.rankValue
                    }, rankId);
                }
            } else {
                let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [PlayerData.getInstance().accountId + '']) as any;
                let grade = (await NetUtils.get<MjdhPlayerRecord>('/mjdh/player/myself', [])).fmap(x => x.grade).getOrElse(1);
                if (response3.status == 0 && response3.content.length > 0) {
                    this.myselfRankItem.init({
                        playerBaseInfo: response3.content[0],
                        currentRank: -1,
                        rankValue: grade
                    }, rankId);
                }
            }
        }
        this.showRank();
    }

    showAward() {
        this.showAwardBtn.node.active = false;
        this.showRankBtn.node.active = true;
        this.myselfRankItem.showAward();
        this.scroll.content.children.forEach(ele => {
            let item = ele.getComponent(KingsFightRankItem);
            item.showAward();
        })

        this.noteNode.active = false;
        this.noteLabel.node.active = true;
        this.noteLabel.string = '赛季结束时按对应排名结算奖励';
        
    }

    showRank() {
        this.showAwardBtn.node.active = true;
        this.showRankBtn.node.active = false;
        this.myselfRankItem.showRank();
        this.scroll.content.children.forEach(ele => {
            let item = ele.getComponent(KingsFightRankItem);
            item.showRank();
        });
        this.noteLabel.node.active = true;
        this.noteNode.active = false;
        this.noteLabel.string = '排行榜数据每5分钟更新一次';
    }

    getRankId() {
        return KingsFightConfig.RANK_ID;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
