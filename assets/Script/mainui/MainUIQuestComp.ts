import { QuestProxy } from "../quest/QuestProxy";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { QuestManager } from "../quest/QuestManager";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainUIQuestComp extends cc.Component {
    @property(cc.Label)
    questName: cc.Label = null;

    @property(cc.RichText)
    questDesc: cc.RichText = null;

    questId: number = null;

    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (this.questId) {
                QuestProxy.changeCurrentQuest(this.questId);
                QuestManager.questCompOnClick();
            }
            EventDispatcher.dispatch(Notify.MAIN_UI_FOLD_QUEST_CHASER, {})
        }.bind(this));
    }

    // update (dt) {}
}
