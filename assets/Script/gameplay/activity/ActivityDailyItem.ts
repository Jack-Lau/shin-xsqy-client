import { ActivityRecord } from "../../net/Protocol";
import ActivityData, { ActivityOtherInfo, ActivityShowInfo, StoryTaskInfo, ShowAward } from "./ActivityData";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import KbWheel from "../kbwheel/KbWheel";
import JinGuangTaPanel from "../jinguangta/JinGuangTaPanel";
import YbwlPanel from "../ybwl/YbwlPanel";
import SharePanel from "../share/SharePanel";
import { QuestManager } from "../../quest/QuestManager";
import { TipsManager } from "../../base/TipsManager";
import ActivityBoxTips from "./ActivityBoxTips";
import Optional from "../../cocosExtend/Optional";
import BuriedPanel from "../treasure/BuriedPanel";
import AntiquePanel from "../antique/AntiquePanel";
import RivalPanel from "../rival/RivalPanel";
import TigerMachinePanel from "../tigerMachine/TigerMachinePanel";
import KingsFightPanel from "../kingsFight/KingsFightPanel";
import DigOrePanel from "../digOre/DigOrePanel";
import YxjyPanel from "../yxjy/YxjyPanel";
import { BroadcastHandler } from "../../mainui/BroadcastHandler";
import OnlineYearPanel from "../newYear/OnlineYearPanel";
import NewYearChallengePanel from "../newYear/challenge/NewYearChallengePanel";

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

enum ResponseType {
    /** 打开一个界面*/
    Panel = 1,
    /** 前往某个NPC处*/
    NPC = 2,
    /** 出现指定的系统tips*/
    Tips = 3,
}
@ccclass
export default class ActivityDailyItem extends cc.Component {

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
    upperLeftIcon: cc.Sprite = null;
    @property(cc.SpriteFrame)
    upperLeftSpriteFrames: Array<cc.SpriteFrame> = [];
    @property(cc.Label)
    LeftLabel: cc.Label = null;
    @property(cc.Label)
    conditionLabel: cc.Label = null;
    @property(cc.Node)
    gouIcon: cc.Node = null;
    @property(cc.Label)
    describeLabel: cc.Label = null;
    @property(cc.Button)
    goBtn: cc.Button = null;
    @property(cc.Button)
    goAwardBtn: cc.Button = null;
    
    @property(cc.Node)
    ungoBtn: cc.Node = null;
    /**要求签 */
    @property(cc.Sprite)
    conditionIcon: cc.Sprite = null;
    
    data: ActivityRecord;
    
    start() {
        this.goBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toTravelTo.bind(this)));
        this.goAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }
    
    async updateData(data: ActivityRecord) {
        if (data == null) {
            return;
        }
        this.data = data;
    
        await this.ongoingUpdate();
    
    }
    
    isConfirm(data: ActivityOtherInfo) {
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
            const info = confActivityOtherInfo.getValue()
            let isConfirm = this.isConfirm(info) && ((ActivityData.getInstance().activityComplex?.openingActivityIds as number[] ?? []).indexOf(info.id) !== -1 || info.id < 158000)
            this.itemBg.active = isConfirm;
            this.unitemBg.active = !isConfirm;
            this.goBtn.node.active = isConfirm;
            this.goBtn.node.active = isConfirm;
            this.ungoBtn.active = !isConfirm;
            this.describeLabel.string = confActivityShowInfo.getValue().description;
    
            this.upperLeftIcon.spriteFrame = this.upperLeftSpriteFrames[0];
            this.conditionIcon.spriteFrame = this.upperLeftSpriteFrames[2];
            let name = isConfirm ? this.data.activityId + '_1' : this.data.activityId + '_2';
            this.titleSprite.spriteFrame = await ResUtils.getActivityFont(this.data.activityId + '_1');
            this.bgIcon.spriteFrame = await ResUtils.getActivityIcon(name);
            this.LeftLabel.string = isConfirm ? confActivityShowInfo.getValue().canPlaytipsDescription : confActivityShowInfo.getValue().unPlaytipsDescription
            if (confActivityOtherInfo.getValue().livenessAward <= 0) {
                this.conditionIcon.node.active = false;
            } else {
                this.conditionIcon.node.active = true;
                let value = confActivityOtherInfo.getValue().livenessRequirement.toString().replace(new RegExp(/\$.*?\}/), ' ' + this.data.progress);
                this.conditionLabel.string = `${value} ${confActivityOtherInfo.getValue().livenessAward}活跃点`;
                if (this.data.completed) {
                    this.gouIcon.active = true;
                } else {
                    this.gouIcon.active = false;
                }
                this.conditionIcon.node.active = isConfirm;
            }
        } else {
            console.error(`${this.data.activityId} 相关配置文件找不到`);
        }
    }
    
    /**点击前往，分不同类型 */
    async toTravelTo() {
        let confOther: Optional<ActivityOtherInfo> = ActivityData.getInstance().getActivityOtherById(this.data.activityId);
        if (confOther.isValid()) {
            switch (confOther.getValue().responseType) {
                case ResponseType.Panel:
                    await this.open(confOther.getValue().id);
                    break;
                case ResponseType.NPC:
                    QuestManager.findNpc(parseInt(confOther.getValue().responseParameter));
                    this.closePanel();
                    break;
                case ResponseType.Tips:
                    TipsManager.showMsgFromConfig(parseInt(confOther.getValue().responseParameter));
                    break;
            }
        } else {
            console.error(`${this.data.activityId} 相关配置文件找不到`);
        }
    }
    
    async open(id: number) {
        switch (id) {
            case 157002:
                await this.openPanel('gameplay/jinguangta/JinGuangTaPanel', JinGuangTaPanel);
                break;
            case 157004:
                await this.openPanel('kbWheel', KbWheel);
                break;
            case 157005:
                await this.openPanel('share/sharePanel', SharePanel);
                break;
            case 157007:
                await this.openPanel('gameplay/treasure/BuriedPanel', BuriedPanel);
                break;
            case 157008:
                if (PlayerData.getInstance().playerLevel >= 50) {
                    await this.openPanel('gameplay/rival/RivalPanel', RivalPanel);
                } else {
                    TipsManager.showMsgFromConfig(1116);
                }
                break;
            case 158003: {
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMessage('提升至50级即可参加王者决战');
                    return;
                }
                await this.openPanel('gameplay/kingsFight/kingsFightPanel', KingsFightPanel);
                break;
            }
            case 158005: {
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMessage('提升至50级即可参加周末佳肴');
                    return;
                }
                await this.openPanel('gameplay/yxjy/yxjyPanel', YxjyPanel);
                break;
            }
            case 158006: {
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMessage('提升至50级即可参加在线有礼');
                    return;
                }
				await this.openPanel('gameplay/newYear/OnlineYearPanel', OnlineYearPanel);
                break;
            }
            case 158007: {
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMessage('提升至50级即可参加福星降临');
                    return;
                }
				await this.openPanel('gameplay/newYear/challenge/newYearChallengePanel', NewYearChallengePanel);
                break;
            }
        }
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
    
    async openPanel(prefabName: string, panelType: { prototype: cc.Component }) {
        let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(panelType);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.closePanel();
    }
    
    closePanel() {
        let node = this.node.parent.parent.parent.parent;
        if (node) {
            CommonUtils.safeRemove(node);
        }
    }
}

