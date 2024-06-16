import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { RankingInfo, SimpleRanking, KuaibiDailyRecord, SimpleRankingRecord } from "../../net/Protocol";
import RankPanelItem from "./RankPanelItem";
import PlayerData from "../../data/PlayerData";
import { RankUtils } from "./RankUtils";
import { TipsManager } from "../../base/TipsManager";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


enum LeftPage { FC_RANK, ABILITY_RANK }
enum TopPage { ALL, LXD, PTS, PSD, WZG, LEVEL, PET, EQUIPMENT }
interface RankPanelState {
    left: LeftPage;
    top1: TopPage;
    top2: TopPage;
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class RankPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(RankPanelItem)
    myselfRankItem: RankPanelItem = null;
    @property(cc.Button)
    showAwardBtn: cc.Button = null;
    @property(cc.Button)
    showRankBtn: cc.Button = null;

    @property(cc.Node)
    scrollBgNode: cc.Node = null;

    @property(cc.ToggleContainer)
    leftContainer: cc.ToggleContainer = null;
    @property(cc.ToggleContainer)
    topContainer1: cc.ToggleContainer = null;
    @property(cc.ToggleContainer)
    topContainer2: cc.ToggleContainer = null;

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
    @property(cc.Sprite)
    title1: cc.Sprite = null;
    @property(cc.Sprite)
    title2: cc.Sprite = null;

    // 分页
    // 共显示20个，触底加载初始化下10个，并删除之前的10
    // 同时startIndex += 10
    startIndex = 0;    // 当前的起始元素
    readonly pageSize = 20; // 总数量
    records: Array<SimpleRankingRecord> = [];

    start() {
        this.initState();
        this.initEvents();
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.showAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.showAward.bind(this));
        this.showRankBtn.node.on(cc.Node.EventType.TOUCH_END, this.showRank.bind(this));
        this.leftContainer.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK).bind(this));
        this.leftContainer.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.ABILITY_RANK).bind(this));

        this.topContainer2.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.ABILITY_RANK, TopPage.LEVEL).bind(this));
        this.topContainer2.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.ABILITY_RANK, TopPage.PET).bind(this));
        this.topContainer2.toggleItems[2].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.ABILITY_RANK, TopPage.EQUIPMENT).bind(this));

        this.topContainer1.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK, TopPage.ALL).bind(this));
        this.topContainer1.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK, TopPage.LXD).bind(this));
        this.topContainer1.toggleItems[2].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK, TopPage.PTS).bind(this));
        this.topContainer1.toggleItems[3].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK, TopPage.PSD).bind(this));
        this.topContainer1.toggleItems[4].node.on(cc.Node.EventType.TOUCH_END, this.switchState(LeftPage.FC_RANK, TopPage.WZG).bind(this));

        this.scroll.node.on('scroll-to-bottom', this.loadNextPage.bind(this));
        this.scroll.node.on('scroll-to-top', this.loadPrevPage.bind(this));
    }

    async initState() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/lastDayKuaibiDailiRecord', []) as any;
        if (response.status == 0) {
            let record = response.content as KuaibiDailyRecord;
            let other = new Optional<number>(R.prop('rebateMilliKuaibiFromOther', record));
            RankUtils.totalKb = Math.floor(other.getOrElse(0) * 0.1);
        }
        this._state.value = { left: LeftPage.FC_RANK, top1: TopPage.ALL, top2: TopPage.LEVEL };
    }

    async loadPrevPage() {
        if (this.startIndex <= 0) {
            return;
        } else {
            let rankId = this.getRankIdByState(this._state.value);
            let from = Math.max(this.startIndex - 10, 0);
            let to = this.startIndex;
            this.startIndex = Math.max(this.startIndex - 10, 0);
            let remain = this.pageSize - (to - from);
            while (this.scroll.content.children.length > remain) {
                this.scroll.content.removeChild(this.scroll.content.children[this.scroll.content.children.length - 1]);
            }
            if (rankId == 4430007) {
                await this.initPetScroll(from, to, false);
            } else {
                await this.initScroll(from, to, false);
            }
            this.scroll.scrollToPercentVertical(1 - (to - from + 2) / this.pageSize);
        }
    }

    async loadNextPage() {
        if (this.startIndex + this.pageSize >= this.records.length) {
            return;
        } else {
            let rankId = this.getRankIdByState(this._state.value);
            let from = this.startIndex + this.pageSize;
            let to = Math.min(this.startIndex + this.pageSize + 10, this.records.length);
            if (rankId == 4430007) {
                await this.initPetScroll(from, to, true);
            } else {
                await this.initScroll(from, to, true);
            }
            this.startIndex = Math.min(this.startIndex +  10, this.records.length - this.pageSize);
            while (this.scroll.content.children.length > 20) {
                this.scroll.content.removeChild(this.scroll.content.children[0]);
            }
            this.scroll.scrollToPercentVertical((to - from + 2) / this.pageSize);
        }
    }

    async initScroll(from: number, to: number, isNext: boolean) {
        let rankId = this.getRankIdByState(this._state.value);
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
                let item = itemNode.getComponent(RankPanelItem);
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

    async initPetScroll(from: number, to: number, isNext: boolean) {
        let rankId = this.getRankIdByState(this._state.value);
        let records = R.slice(from, to, this.records)
        let petIds = R.map(x => x.objectId, records).join(',')
        let accountIds = R.map(x => x.accountId, records).join(',')
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [accountIds]) as any;
        let playerNames = response2.content;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [petIds]) as any;
        let length = this.records.length;
        if (response.status == 0) {
            let petInfoArray = response.content;
            records.forEach((ele, index) => {
                let itemNode = cc.instantiate(this.itemPrefab);
                if (!isNext) { // 插入到最前
                    itemNode.zIndex = this.startIndex - 10 + index - length
                }
                itemNode.parent = this.scroll.content;
                let item = itemNode.getComponent(RankPanelItem);
                item.initWithPet(
                    petInfoArray[index],
                    ele.currentRank,
                    ele.rankValue,
                    playerNames[index],
                    rankId
                );
                if (this.showAwardBtn.node.active) {
                    item.showRank();
                } else {
                    item.showAward();
                }
            });
        }
    }


    refreshState() {
        let rankId = this.getRankIdByState(this._state.value);
        this.topContainer1.node.active = this._state.value.left == LeftPage.FC_RANK;
        this.topContainer2.node.active = this._state.value.left == LeftPage.ABILITY_RANK;
        if (this._state.value.left == LeftPage.FC_RANK) {
            this.title1.spriteFrame = this.atlas.getSpriteFrame('font_juesexinxi')
            this.title2.spriteFrame = this.atlas.getSpriteFrame('font_zongpingfen')
        } else {
            if (this._state.value.top2 == TopPage.LEVEL) {
                this.title1.spriteFrame = this.atlas.getSpriteFrame('font_juesexinxi')
                this.title2.spriteFrame = this.atlas.getSpriteFrame('font_dengji')
            } else if (this._state.value.top2 == TopPage.PET) {
                this.title1.spriteFrame = this.atlas.getSpriteFrame('font_chongwuxinxi')
                this.title2.spriteFrame = this.atlas.getSpriteFrame('font_chongwupingfen')
            } else {
                this.title1.spriteFrame = this.atlas.getSpriteFrame('font_juesexinxi')
                this.title2.spriteFrame = this.atlas.getSpriteFrame('font_zhuangbeipingfen')
            }
        }
 
        if (rankId == 4430007) {
            this.initPetRank(rankId);
        } else {
            this.initPlayerRank(rankId);
        }
        super.refreshState();
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
                this.scrollBgNode.height = 525;
                this.scroll.node.height = 470;
                let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [myselfRankInfo.accountId + '']) as any;
                if (response3.status == 0 && response3.content.length > 0) {
                    this.myselfRankItem.init({
                        playerBaseInfo: response3.content[0],
                        currentRank: myselfRankInfo.currentRank,
                        rankValue: myselfRankInfo.rankValue
                    }, rankId);
                }
            } else {
                this.scrollBgNode.height = 645;
                this.scroll.node.height = 590;
            }
            this.myselfRankItem.node.active = myselfRankInfo != undefined;
        }

        this.showRank();
    }

    async initPetRank(rankId) {
        this.scroll.content.removeAllChildren();
        this.scroll.scrollToPercentVertical(1);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ranking/view/{id}', [rankId]) as any;
        if (response.status == 0) {
            let rankInfo = response.content as SimpleRanking;
            this.records = rankInfo.topRecords;
            this.startIndex = 0;
            this.initPetScroll(0, this.pageSize, true);
            /**
             * 如果自己可以被排行
             * 则显示排行
             * 否则
             * 拉长scroll
             */
            let myselfRankInfo = R.prop(0, rankInfo.selfRecords);
            if (myselfRankInfo) {
                this.scrollBgNode.height = 525;
                this.scroll.node.height = 470;
                let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [myselfRankInfo.objectId + '']) as any;
                if (response3.status == 0 && response3.content.length > 0) {
                    this.myselfRankItem.initWithPet(
                        response3.content[0]
                        , myselfRankInfo.currentRank
                        , myselfRankInfo.rankValue
                        , PlayerData.getInstance().playerName
                        , rankId
                    );
                }
            } else {
                this.scrollBgNode.height = 645;
                this.scroll.node.height = 590;
            }
            this.myselfRankItem.node.active = myselfRankInfo != undefined;
        }

        this.showRank();
    }


    showAward() {
        this.showAwardBtn.node.active = false;
        this.showRankBtn.node.active = true;
        this.myselfRankItem.showAward();
        this.scroll.content.children.forEach(ele => {
            let item = ele.getComponent(RankPanelItem);
            item.showAward();
        })
        let state = this._state.value;
        if (state.left == LeftPage.FC_RANK && state.top1 == TopPage.ALL) {
            let kbAmount = CommonUtils.toCKb(RankUtils.totalKb);
            this.noteNode.active = true;
            this.noteLabel.node.active = false;
            this.amountLabel.string = String(kbAmount);
        } else {
            this.noteNode.active = false;
            this.noteLabel.node.active = true;
            this.noteLabel.string = '排行榜奖励每日0点通过邮件发放';
        }
    }

    showRank() {
        this.showAwardBtn.node.active = true;
        this.showRankBtn.node.active = false;
        this.myselfRankItem.showRank();
        this.scroll.content.children.forEach(ele => {
            let item = ele.getComponent(RankPanelItem);
            item.showRank();
        });
        this.noteLabel.node.active = true;
        this.noteNode.active = false;
        this.noteLabel.string = '排行榜数据每5分钟更新一次';
    }

    switchState(left: LeftPage, top: TopPage = null) {
        let _this = this;
        return function () {
            let state = _this._state.value;
            if (top == null) {
                _this._state.value = { left: left, top1: state.top1, top2: state.top2 }
            } else {
                if (left == LeftPage.FC_RANK) {
                    _this._state.value = { left: left, top1: top, top2: state.top2 }
                } else {
                    _this._state.value = { left: left, top1: state.top1, top2: top }
                }
            }
        }
    }

    getRankIdByState(state: RankPanelState) {
        if (state.left == LeftPage.FC_RANK) {
            switch (state.top1) {
                case TopPage.ALL: return 4430001;
                case TopPage.LXD: return 4430002;
                case TopPage.PTS: return 4430003;
                case TopPage.PSD: return 4430004;
                case TopPage.WZG: return 4430005;
            }
        } else if (state.left == LeftPage.ABILITY_RANK) {
            switch (state.top2) {
                case TopPage.LEVEL: return 4430006;
                case TopPage.PET: return 4430007;
                case TopPage.EQUIPMENT: return 4430008;
            }
        }
        return 4430001;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
