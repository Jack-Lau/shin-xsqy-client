import { ActivityRecord } from "../../net/Protocol";
import ActivityData, { ActivityOtherInfo, ActivityShowInfo, StoryTaskInfo } from "./ActivityData";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { QuestManager } from "../../quest/QuestManager";
import ActivityBoxTips from "./ActivityBoxTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import Optional from "../../cocosExtend/Optional";

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
export default class ActivityPlotItem extends cc.Component {

    //ongoing的
    @property(cc.Sprite)
    bgIcon: cc.Sprite = null;
    @property(cc.Node)
    itemBg: cc.Node = null;
    @property(cc.Node)
    unitemBg: cc.Node = null;
    @property(cc.Sprite)
    titleSprite: cc.Sprite = null;

    @property(cc.Sprite)
    upperLeft: cc.Sprite = null;
    @property(cc.SpriteFrame)
    upperLeftSps: Array<cc.SpriteFrame> = [];
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    untitleLabel: cc.Label = null;
    @property(cc.Node)
    gaidenTitle: cc.Node = null;
    @property(cc.Label)
    describe: cc.Label = null;
    @property(cc.Button)
    goBtn: cc.Button = null;
    @property(cc.Button)
    goAward: cc.Button = null;

    @property(cc.Node)
    ungoBtn: cc.Node = null;
    @property(cc.Node)
    ywgoBtn: cc.Node = null;

    data: ActivityRecord;

    start() {
        this.goBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toTravelTo.bind(this)));
        this.goAward.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    async updateData(data: ActivityRecord) {
        if (data == null) {
            return;
        }
        this.data = data;

        await this.ongoingUpdate();

    }

    isConform(data: ActivityOtherInfo) {
        let playerL = PlayerData.getInstance().playerLevel;
        if (playerL >= data.level) {
            return true;
        }
        return false;
    }

    async ongoingUpdate() {

        let confActivityShowInfo: Optional<ActivityShowInfo> = ActivityData.getInstance().getActivityShowById(this.data.activityId);
        let confActivityOtherInfo: Optional<ActivityOtherInfo> = ActivityData.getInstance().getActivityOtherById(this.data.activityId);
        if (confActivityShowInfo.isValid() && confActivityOtherInfo.isValid()) {
            let isConform = this.isConform(confActivityOtherInfo.getValue());
            this.itemBg.active = isConform;
            this.unitemBg.active = !isConform;
            if (isConform && this.data.completed) {
                this.ywgoBtn.active = true;
                this.goBtn.node.active = false;
                this.ungoBtn.active = false;
            } else {
                this.ywgoBtn.active = false;
                this.goBtn.node.active = isConform;
                this.ungoBtn.active = !isConform;
            }

            this.describe.string = confActivityShowInfo.getValue().description;
            let bgName = '';
            if (confActivityShowInfo.getValue().canPlaytipsDescription == '主线剧情') {
                this.gaidenTitle.active = false;
                this.titleLabel.string = confActivityShowInfo.getValue().name;
                this.untitleLabel.node.active = false;
                this.upperLeft.spriteFrame = this.upperLeftSps[0];

                let name = isConform ? this.data.activityId + '_1' : this.data.activityId + '_2';
                this.titleSprite.spriteFrame = await ResUtils.getActivityFont(name);
                bgName = isConform ? 'bg_zhuxiandi1' : 'bg_zhuxiandi2';

            } else {
                this.gaidenTitle.active = true;
                this.upperLeft.spriteFrame = this.upperLeftSps[1];
                this.titleSprite.spriteFrame = await ResUtils.getActivityFont(this.data.activityId.toString());
                bgName = isConform ? 'bg_zhixiandi1' : 'bg_zhixiandi2';
            }
            this.bgIcon.spriteFrame = await ResUtils.getActivityIcon(bgName);
        } else {
            console.error(`${this.data.activityId} 相关配置文件找不到`);
        }

    }

    /**点击前往，分不同类型 */
    toTravelTo() {
        let confActivityShowInfo: Optional<ActivityShowInfo> = ActivityData.getInstance().getActivityShowById(this.data.activityId);
        let confStoryTaskInfo: Optional<StoryTaskInfo> = ActivityData.getInstance().getStoryTaskById(this.data.activityId);
        if (confActivityShowInfo.isValid() && confStoryTaskInfo.isValid()) {
            switch (confActivityShowInfo.getValue().canPlaytipsDescription) {
                case '主线剧情':
                    //是否完成
                    if (this.data.completed) {
                        TipsManager.showMessage('您已成功通关该剧情任务');
                    } else {
                        let onID = this.getOnChapterID(this.data.activityId);
                        if (onID == -1) {
                            //序章
                            this.currentTask(confStoryTaskInfo.getValue());
                        } else {
                            let confTask: Optional<StoryTaskInfo> = ActivityData.getInstance().getStoryTaskById(onID);
                            console.error(confTask.getValue())
                            if (R.any(QuestManager.isFinished, confTask.getValue().overTask)) {
                                //上章完成，前往当前章节任务
                                this.currentTask(confStoryTaskInfo.getValue());
                            } else {
                                TipsManager.showMessage('剧情即将来临，请先完成当前剧情吧');
                            }
                        }
                    }
                    break;
                case '支线剧情':
                    if (this.data.completed) {
                        //任务完成
                        TipsManager.showMessage('您已成功通关该剧情任务');
                    } else {
                        this.currentTask(confStoryTaskInfo.getValue());
                    }
                    break;
            }
        }

    }

    getOnChapterID(id: number) {
        let ids = [159001, 159002, 159003, 159005, 159007, 159009, 159011, 159013];
        let onM = ids.indexOf(id) - 1;
        if (onM < 0) {
            return -1;
        }
        return ids[onM];
    }
    /**前往当前章节任务 */
    currentTask(confStoryTaskInfo: StoryTaskInfo) {
        let playerTask = QuestManager.getCurrentQuestIds();//玩家身上的任务
        let relevantTask = R.split(',', confStoryTaskInfo.relevantTask) as Array<number>;
        for (let task of playerTask) {
            let isTask = relevantTask.indexOf(task);
            if (isTask > -1) {
                //go task 前往任务;
                QuestManager.gotoNpcByQuestId(task);
                this.closePanel();
                return;
            }
        }
        TipsManager.showMessage('继续完成主线任务即可接取');
    }
	
    async showTips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/activity/activityBoxTips', ActivityBoxTips) as ActivityBoxTips;
        let confActivityShowInfo: Optional<ActivityShowInfo> = ActivityData.getInstance().getActivityShowById(this.data.activityId);
        let showAward = confActivityShowInfo.fmap(s => s.showAward);
        if (showAward.isValid()) {
            panel.init(showAward.getValue(), event);
        }
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    closePanel() {
        let node = this.node.parent.parent.parent.parent;
        if (node) {
            CommonUtils.safeRemove(node);
        }

    }
}
