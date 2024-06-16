import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { BattleConfig } from "../../battle/BattleConfig";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YqsConfirmBox extends cc.Component {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    ticketCostLabel: cc.Label = null;
    @property(cc.Label)
    ybCostLabel: cc.Label = null;
    @property(cc.Label)
    ownLabel: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    position = 0
    ybCost = 0

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    init(position: number, price: number, ticketAmount: number) {
        let ybCost = 0;
        let ticketCost = price;
        if (ticketAmount >= price) {
            this.priceLabel.string = this.ticketCostLabel.string = String(price);
            this.ybCostLabel.string = '0';
        } else {
            ybCost = price - ticketAmount;
            ticketCost = R.max(price - ybCost, 0);
            this.ybCostLabel.string = String(ybCost);
            this.priceLabel.string = String(price);
            this.ticketCostLabel.string = String(ticketCost);
        }
        this.ownLabel.string = PlayerData.getInstance().ybAmount + '';
        if (PlayerData.getInstance().ybAmount < parseInt(this.ybCostLabel.string)) {
            TipsManager.showMessage('您的元宝不足，快去赚些再来吧');
            return;
        }
        this.position = position
        this.ybCost = ybCost
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.startBattle.bind(this))
        // this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
        //     let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/arena/startChallenge', [position, CommonUtils.toSKb(kbCost)]);
        //     if (response.status === 0) {
        //         let battleId = R.prop('battleSessionId', response.content);

        //         let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/view/{id}', [battleId]) as any;
        //         if (response2.status == 0) {
        //             BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;
        //             BattleConfig.getInstance().setAsJJCBattle();
        //             EventDispatcher.dispatch(Notify.BATTLE_OPEN, {
        //                 data: response2.content.result, cb: () => {
        //                     EventDispatcher.dispatch(Notify.YQS_BATTLE_END, {});
        //                     BattleConfig.getInstance().reset();
        //                 }
        //             });
        //             _this.closePanel()
        //         }
        //     }
        // });
    }

    startBattle() {
        EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
            data: this.getBattleData(this.position, this.ybCost), 
            beforeCb: (data: any) => {
                BattleConfig.getInstance().battleSessionId = data.battleSessionId;
                BattleConfig.getInstance().setAsJJCBattle()
            },
            afterCb: () => {
                EventDispatcher.dispatch(Notify.YQS_BATTLE_END, {});
                BattleConfig.getInstance().reset();
            }
        });
        this.closePanel()
    }

    async getBattleData(position, ybCost) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/arena/startChallenge', [position, ybCost]);
        if (response.status === 0) {
            let battleId = R.prop('battleSessionId', response.content);
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/view/{id}', [battleId]) as any;
            if (response2.status == 0) {
                return Object.assign(response2?.content?.result, {
                    battleSessionId: battleId
                })
            }
        }
        return null
    }


    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}