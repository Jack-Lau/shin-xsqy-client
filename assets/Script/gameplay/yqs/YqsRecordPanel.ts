import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { MineArenaLogComplex } from "../../net/Protocol";
import YqsRecordItem, { YqsRecordItemState } from "./YqsRecordItem";
import PlayerData from "../../data/PlayerData";

const { ccclass, property } = cc._decorator;



@ccclass
export default class YqsRecordPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.init();
    }

    async init () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/logs', []);
        if (response.status === 0) {
            let data = response.content as MineArenaLogComplex;
            let logs = R.take(20, R.sort(R.descend(R.prop('eventTime')), R.concat(data.mineArenaChallengeLogs, data.mineArenaRewardObtainLogs)));
            logs.forEach(ele => {
                let item = cc.instantiate(this.itemPrefab).getComponent(YqsRecordItem);
                if (ele.accountId) {
                    let  getAmount = (cid) => {
                        for (let reward of ele.rewardStacks) {
                            if (reward.currencyId == cid) {
                                if (cid == 151) {
                                    return Math.floor(reward.amount / 1000);
                                } else {
                                    return reward.amount;
                                }
                            }
                        }
                        return 0;
                    }
                    // 获得
                    item.init(YqsRecordItemState.AWARD, ele, {kbAmount: getAmount(151), ybAmount: getAmount(150)});
                } else {
                    // 挑战
                    let fromMe = ele.challengerAccountId == PlayerData.getInstance().accountId;
                    let win = ele.success == fromMe;
                    if (win) {
                        item.init(YqsRecordItemState.WIN, ele)
                    } else {
                        item.init(YqsRecordItemState.LOSE, ele);
                    }
                }
                item.node.parent = this.scroll.content;
            });
            this.emptyNode.active = logs.length == 0;
        }
        
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
    

}