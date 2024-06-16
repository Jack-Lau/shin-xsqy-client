import { CommonUtils } from "../utils/CommonUtils";
import { BroadcastHandler } from "../mainui/BroadcastHandler";
import { precondition } from "../utils/BaseFunction";
import PlayerData from "../data/PlayerData";
import { YxjyData } from "../gameplay/yxjy/YxjyData";
import { ResUtils } from "../utils/ResUtils";
import SecondConfirmBox from "../base/SecondConfirmBox";
import { NetUtils } from "../net/NetUtils";
import { YxjyRecord } from "../net/Protocol";
import { TipsManager } from "../base/TipsManager";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SystemChatItem extends cc.Component {
    @property(cc.Label)
    msgLabel: cc.Label = null;

    @property(cc.RichText)
    msgRichText: cc.RichText = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    broadcastId = null;
    extraParams = null;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    init(content: string, broadcastId?: number, extraParams?: any) {
        this.broadcastId = broadcastId;
        this.extraParams = extraParams;

        if (broadcastId == 3200054) { // 元宵佳肴发出邀请
            content += '  [027422]<u>[点击前往]</u>[ffffff]';
        }
        this.msgRichText.string = "<img src='icon_xitong'/> " + CommonUtils.textToRichText(content);
    }

    update () {
        this.node.height = this.bgSprite.node.height = 22 + this.msgRichText.node.height;
    }

    async onClick() {
        if (this.broadcastId == 3200054) {
            if (this.extraParams) {
                let extraParams = this.extraParams;
                let accountId = parseInt(R.prop('accountId', extraParams));
                let playerName = R.prop('playerName', extraParams);
                if (precondition(accountId != undefined) &&
                    precondition(PlayerData.getInstance().playerLevel >= 50, "少侠等级不足50") &&
                    precondition(PlayerData.getInstance().accountId != accountId, 1265) &&
                    precondition(YxjyData.record.fmap(x => x.todayAttendedCount).getOrElse(0) < 5, 1266) &&
                    precondition(YxjyData.record.fmap(x => x.attendedAccountIds.indexOf(accountId) == -1).getOrElse(false), 1267)
                ) {
                    let sf = await ResUtils.loadSpriteFromAltas('ui/gameplay/yxjy/yxjy_panel', 'font_yuanxiaojiayaoyaoqing')
                    let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
                    let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
                    scb.titleSp.spriteFrame = sf;

                    let cb = async () => {
                        let result = await NetUtils.post<YxjyRecord>('/yuanxiaojiayao/attend', [accountId]);
                        if (result.isRight) {
                            TipsManager.showMsgFromConfig(1269);
                            TipsManager.showGainCurrency({currencyId: 20054, amount: 1});
                            YxjyData.record = result.toOptional();
                        }
                    }
                    let count = YxjyData.record.fmap(x => x.todayAttendedCount).getOrElse(0);
                    scb.init(CommonUtils.textToRichText(`[211c1c]确定接受[ffffff]  [116c08]${playerName}[ffffff]  [211c1c]的佳肴邀请？[ffffff]<br/>[991616](今日已赴宴${count}/5次)[ffffff]`), cb);
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: scb });
                }
            }
        }
    }

    // update (dt) {}
}
