import { CommonUtils } from "../../utils/CommonUtils";
import { QuestManager } from "../../quest/QuestManager";
import OnlineYearPanel from "./OnlineYearPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import ActivityBoxTips from "../activity/ActivityBoxTips";
import NewYearChallengePanel from "./challenge/NewYearChallengePanel";
import { TipsManager } from "../../base/TipsManager";
import PlayerData from "../../data/PlayerData";

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
export default class NewYearItem extends cc.Component {

    @property(cc.Button)
    rewardBtn: cc.Button = null;
    @property(cc.Button)
    goBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    @property
    index: number = 0;

    helpId = [32, 33, 34];

    from = null;
    showAward = [];
    start() {
        this.rewardBtn.node.on(cc.Node.EventType.TOUCH_END, this.onRewardBtn.bind(this));
        this.goBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onGoBtn.bind(this)));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, this.helpId[this.index]));
    }

    init(data: any[]) {
        this.showAward = data;
    }

    async onRewardBtn(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/activity/activityBoxTips', ActivityBoxTips) as ActivityBoxTips;
        panel.init(this.showAward, event);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async onGoBtn() {
        if (this.index == 0) {
            QuestManager.findNpc(893);
            if (await QuestManager.tryStartQuest(730010)) {
                TipsManager.showMessage('任务领取成功！');
            }
        } else if (this.index == 1) {
            if (PlayerData.getInstance().playerLevel < 35) {           
                TipsManager.showMsgFromConfig(1191);
                return;
            }
            let panel = await CommonUtils.getPanel('gameplay/newYear/challenge/newYearChallengePanel', NewYearChallengePanel);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.index == 2) {
            if (PlayerData.getInstance().playerLevel < 35) {           
                TipsManager.showMsgFromConfig(1191);
                return;
            }
            let panel = await CommonUtils.getPanel('gameplay/newYear/OnlineYearPanel', OnlineYearPanel) as OnlineYearPanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
        this.closePanel();
    }

    closePanel() {
        CommonUtils.safeRemove(this.from.node);
    }

    // update (dt) {}
}
