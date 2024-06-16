import { CommonUtils } from "../../utils/CommonUtils";
import ActivityData, { ActivityType } from "./ActivityData";
import { ActivityRecord } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import ActivityPlotItem from "./ActivityPlotItem";
import { NetUtils } from "../../net/NetUtils";
import YbwlPanel from "../ybwl/YbwlPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import ActivityDailyItem from "./ActivityDailyItem";
import { TipsManager } from "../../base/TipsManager";
import SjjsPanel from "../sjjs/SjjsPanel";
import { GameConfig } from "../../config/GameConfig";

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
export default class ActivityPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    lowerBtn: cc.Button = null;
    @property(cc.Toggle)
    toggles: Array<cc.Toggle> = [];

    @property(cc.Label)
    activePoint: cc.Label = null;
    @property(cc.Node)
    lowerGradeOfSprites: Array<cc.Node> = [];
    @property(cc.Prefab)
    activityPlotItem: cc.Prefab = null;
    @property(cc.Prefab)
    activityLimitItem: cc.Prefab = null;
    @property(cc.Prefab)
    activityDailyItem: cc.Prefab = null;
    @property(cc.Prefab)
    unItem: cc.Prefab = null;
    
    @property(cc.Sprite)
    limitIng: cc.Sprite = null;
    
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.ScrollView)
    scrollView2: cc.ScrollView = null;
    @property(cc.ScrollView)
    scrollView3: cc.ScrollView = null;
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Node)
    bar: cc.Node = null;
    @property(cc.Node)
    effect: cc.Node = null;
    @property(cc.Node)
    entmy: cc.Node = null;
    
    isInit = [true, true, true];
    selectedData = [];
    
    currentlySelected: ActivityType;
    
    async start() {
        await this.init();
        this.initEvents();
    }
    
    async init() {
        await ActivityData.getInstance().initConfig();
        await ActivityData.getInstance().updateActivityComplex();
        //设置默认选中，有限时默认限时 不然日常
        this.currentlySelected = GameConfig.currentActivityPageType;
        this.selectedData[ActivityType.Limit] = ActivityData.getInstance().getConfigLimitTask();
        if (this.selectedData[ActivityType.Limit].length > 0) {
            this.limitIng.node.active = true;
            //this.currentlySelected = ActivityType.Limit;
        } else {
            this.limitIng.node.active = false;
        }
        this.selectedData[ActivityType.Daily] = [];
        this.selectedData[ActivityType.Plot] = [];
        this.setProgressBar(ActivityData.getInstance().activityComplex.activityPlayerRecord.incomingActivePoints);
        this.selected();
    }
	
    /**设置活跃点 进度 */
    async setProgressBar(m: number) {
        this.progressBar.progress = m / 100;
       
        this.activePoint.string = m.toString();
        this.effect.x = this.bar.width;
        //肝帝标签
        let index = 0;
        if (m >= 20) {
            index = 1;
        }
        if (m >= 40) {
            index = 2;
        }
        if (m >= 60) {
            index = 3;
        }
        if (m >= 80) {
            index = 4;
        }
        this.lowerGradeOfSprites.forEach((nodeG, index2) => {
            if (index == index2) {
                nodeG.active = true;
            } else {
                nodeG.active = false;
            }
        })
    }
    
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.setSelected.bind(this, index));
        });
        this.lowerBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openSjjs.bind(this)));
    }
    
    async openSjjs() {
        if (PlayerData.getInstance().playerLevel < 40) {
            TipsManager.showMessage('提升至40级即可开放三界经商');
            return;
        }
        await this.openPanel('gameplay/sjjs/sjjsPanel', SjjsPanel);
    }
	
    async openPanel(prefabName: string, panelType: { prototype: cc.Component }) {
        let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(panelType);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.closePanel();
    }
	
    setSelected(index: number) {
        if (index == this.currentlySelected) {
            return;
        }
        this.currentlySelected = index as ActivityType;
        this.selected();
		//
		GameConfig.currentActivityPageType = this.currentlySelected;
    }
    
    async selected() {
        switch (this.currentlySelected) {
            case ActivityType.Daily:
                if (this.selectedData[ActivityType.Daily].length == 0) {
                    this.selectedData[ActivityType.Daily] = await ActivityData.getInstance().getConfigDailyTask();
                }
                this.updateData(this.selectedData[ActivityType.Daily]);
                break;
            case ActivityType.Limit:
                if (this.selectedData[ActivityType.Limit].length == 0) {
                    this.selectedData[ActivityType.Limit] = await ActivityData.getInstance().getConfigLimitTask();
                }
                this.updateData(this.selectedData[ActivityType.Limit]);
                break;
            case ActivityType.Plot:
                this.selectedData[ActivityType.Plot] = await ActivityData.getInstance().getConfigPlotTask();
                this.updateData(this.selectedData[ActivityType.Plot]);
                break;
        }
        this.toggles[this.currentlySelected].check();
    }
    
    updateData(items) {
        if (items.length > 0) {
            this.entmy.active = false;
        } else {
            this.entmy.active = true;
        }
    
        switch (this.currentlySelected) {
            case ActivityType.Daily:
                this.scrollView.node.active = true;
                this.scrollView2.node.active = false;
                this.scrollView3.node.active = false;
    
                break;
            case ActivityType.Limit:
                this.scrollView.node.active = false;
                this.scrollView2.node.active = true;
                this.scrollView3.node.active = false;
    
                break;
            case ActivityType.Plot:
                this.scrollView.node.active = false;
                this.scrollView2.node.active = false;
                this.scrollView3.node.active = true;
    
                break;
        }
        if (this.isInit[this.currentlySelected]) {
            items.forEach((item, index) => {
                switch (this.currentlySelected) {
                    case ActivityType.Daily:
                        // console.log(item);
                        // if (item.activityId != 157003) {
                        let actDailyItem = cc.instantiate(this.activityDailyItem);
                        actDailyItem.parent = this.scrollView.content;
                        actDailyItem.getComponent(ActivityDailyItem).updateData(item);
                        // }
                        break;
                    case ActivityType.Limit:
                        let actLimitItem = cc.instantiate(this.activityDailyItem);
                        actLimitItem.parent = this.scrollView2.content;
                        actLimitItem.getComponent(ActivityDailyItem).updateData(item);
                        break;
                    case ActivityType.Plot:
                        let actPlotItem = cc.instantiate(this.activityPlotItem);
                        actPlotItem.parent = this.scrollView3.content;
                        actPlotItem.getComponent(ActivityPlotItem).updateData(item);
                        break;
                }
            });
            switch (this.currentlySelected) {
                case ActivityType.Daily:
                    if (items.length > 0) {
                        let unItem1 = cc.instantiate(this.unItem);
                        unItem1.parent = this.scrollView.content;
                    }
    
                    break;
                case ActivityType.Limit:
                    if (items.length > 0) {
                        let unItem2 = cc.instantiate(this.unItem);
                        unItem2.parent = this.scrollView2.content;
                    }
                    break;
                case ActivityType.Plot:
                    if (items.length > 0) {
                        let unItem3 = cc.instantiate(this.unItem);
                        unItem3.parent = this.scrollView3.content;
                    }
                    break;
            }
    
            this.isInit[this.currentlySelected] = false;
        }
    }
    
    // update (dt) {}
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
