import { CommonUtils } from "../../utils/CommonUtils";
import { MineArenaChallengeLog } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { NetUtils } from "../../net/NetUtils";

const { ccclass, property } = cc._decorator;

export enum YqsRecordItemState {WIN, LOSE, AWARD}


@ccclass
export default class YqsRecordItem extends cc.Component {
    @property(cc.Sprite)
    iconSp: cc.Sprite = null;
    @property(cc.RichText)
    content: cc.RichText = null;
    @property(cc.SpriteFrame)
    sfWin: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfLoss: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfAward: cc.SpriteFrame = null;

    start () {
    }

    async init(state: YqsRecordItemState, ele: MineArenaChallengeLog, info?: any) {
        let timeInfo = CommonUtils.getTimeInfo(ele.eventTime);
        let fromMe = ele.challengerAccountId == PlayerData.getInstance().accountId;
        let base = `${timeInfo.month}月${timeInfo.day}日${timeInfo.hour}时${timeInfo.minute}分`;
        let accountId = fromMe ? ele.defenderAccountId : ele.challengerAccountId;
        
        let enemyName = "";
        if (accountId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [String(accountId)]);
            if (response.status === 0) {
                enemyName = '<color=#F66C4A>' + response.content[0] + '</c>';
            }
        }
        let win = state === YqsRecordItemState.WIN;
        let after = '<color=#307614>' + (win ? ele.defenderPosition : ele.challengerPosition) + '</c>';
        switch (state) {
            case YqsRecordItemState.AWARD: {
                this.iconSp.spriteFrame = this.sfAward;
                this.content.string = `您成功领取${timeInfo.month}月${timeInfo.day}日的摇钱收益<color=#307614>${info.kbAmount}仙石、${info.ybAmount}元宝</c>`;
                break;
            }
            case YqsRecordItemState.WIN: {
                this.iconSp.spriteFrame = this.sfWin;
                if (fromMe) {
                    this.content.string = `${base}您战胜${enemyName}，成功抢占到第${after}棵摇钱树。`
                } else {
                    this.content.string = `${base}${enemyName}试图抢占您的摇钱树，凄惨落败，悻悻离去。`
                }
                break;
            }
            case YqsRecordItemState.LOSE: {
                this.iconSp.spriteFrame = this.sfLoss;
                if (fromMe) {
                    this.content.string = `${base}您抢占${enemyName}的树未遂，只得回去守着原来的树。`
                } else {
                    this.content.string = `${base}${enemyName}成功抢占了您的摇钱树，您被挤去第${after}棵小树了。`
                }
                break;
            }
        }
    }

}