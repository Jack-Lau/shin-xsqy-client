import { CommonUtils } from "../../utils/CommonUtils";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import KingsFightRank from "./KingsFightRank";
import { NetUtils } from "../../net/NetUtils";
import { MjdhWinnerRecord, PlayerBaseInfo, SimpleRanking, SimpleRankingRecord } from "../../net/Protocol";
import { KingsFightConfig } from "./KingsFightConfig";
import SingleDirectionMc from "../../base/SingleDirectionMc";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class KingsFightRankInfoPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    // rank 1 ~ 3
    @property(SingleDirectionMc)
    mcs: Array<SingleDirectionMc> = [];
    @property([cc.Label])
    nameLabels: Array<cc.Label> = [];
    @property([cc.Node])
    rankNodes: Array<cc.Node> = [];

    @property(KingsFightRank)
    fromRank: KingsFightRank = null;
    @property(KingsFightRank)
    toRank: KingsFightRank = null;

    @property(cc.Label)
    rankPercentLabel: cc.Label = null;

    @property(cc.Node)
    blockNode: cc.Node = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		//
		const action = cc.repeatForever(cc.rotateTo(10, 360))
		this.bgLighting.node.runAction(action)
    }

    async init (myRank: number, playerAmount: number, currentGrade: number) {
        let winner = await NetUtils.get<SimpleRanking>('/ranking/view/{id}', [KingsFightConfig.RANK_ID]);
        let base = Math.max(playerAmount, 100);
        let percent = Math.max(0.1, Math.floor((1 - myRank / base) * 1000) / 10);
        this.rankPercentLabel.string = `超过 ${percent}% 的玩家`;
        let currentWinner = winner.fmap(x => x.topRecords).getOrElse([]);
        currentWinner.forEach(w => this.initWinner(w));
        this.fromRank.init(currentGrade, false);
        this.toRank.init(currentGrade + 1, false);
    }

    async initWinner (record: SimpleRankingRecord) {
        if (record.currentRank > 3) {
            return;
        }
        let playerInfo = (await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [record.accountId])).fmap(x => x[0]).toOptional();
        if (playerInfo.valid) {
            this.nameLabels[record.currentRank - 1].string = playerInfo.val.player.playerName;
            this.mcs[record.currentRank - 1].init(playerInfo.val);
            this.rankNodes[record.currentRank - 1].on(cc.Node.EventType.TOUCH_END, () => {
                CommonUtils.showViewPlayerBox(playerInfo.val)
            });
        }
    }

    closePanel () {
        CommonUtils.safeRemove(this.node)
    }
}
