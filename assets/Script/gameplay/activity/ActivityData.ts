import { ActivityComplex, ActivityRecord, ActionRecord } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { ConfigUtils } from "../../utils/ConfigUtil";
import PlayerData from "../../data/PlayerData";
import { QuestManager } from "../../quest/QuestManager";

export interface ActivityShowInfo {
    id: number;
    description: string;
    canPlaytipsDescription: string;
    unPlaytipsDescription: string;
    showAward: Array<ShowAward>;
    priority: number;
    type: number;
    name: string;
}
export interface ShowAward {
    id: number;
    amount: number;
    name: string;
}
export interface ActivityOtherInfo {
    id: number;
    responseType: number;
    livenessAward: number;
    name: string;
    level: number;
    livenessRequirement: string;
    responseParameter: string;
}

export interface StoryTaskInfo {
    id: number;
    relevantTask: string;
    overTask: number[];
    name: string;
}

export enum ActivityType { Daily = 0, Limit = 1, Plot = 2 };


export default class ActivityData {
    private static _instance: ActivityData = null;
    activityComplex: any = null;
    activityRecords: Array<ActivityRecord> = [];

    private confActivityShowInfo: Array<ActivityShowInfo> = [];
    private confActivityOtherInfo: Array<ActivityOtherInfo> = [];
    private confStoryTaskInfo: Array<StoryTaskInfo> = [];

    private isInit = true;
    public static getInstance() {
        if (this._instance == null) {
            this._instance = new ActivityData();
        }
        return this._instance;
    }

    /**初始化配置表 */
    async initConfig() {
        if (!this.isInit) {
            return;
        }
        this.isInit = false;
        let configShow = (await ConfigUtils.getConfigJson('ActivityShowInfo')) as Array<ActivityShowInfo>;
        this.confActivityShowInfo = [];
        for (let key in configShow) {
            let value = R.prop(key, configShow);
            this.confActivityShowInfo.push(value);
        }

        let configOther = (await ConfigUtils.getConfigJson('ActivityOtherInfo')) as Array<ActivityOtherInfo>;
        this.confActivityOtherInfo = [];
        for (let key in configOther) {
            let value = R.prop(key, configOther);
            this.confActivityOtherInfo.push(value);
        }

        let configStory = (await ConfigUtils.getConfigJson('StoryTaskInfo')) as Array<StoryTaskInfo>;
        this.confStoryTaskInfo = [];
        for (let key in configStory) {
            let value = R.prop(key, configStory);
            value.overTask = (value.overTask as string).split(",").filter(x => x.length > 0).map(x => parseInt(x))
            this.confStoryTaskInfo.push(value);
        }

    }

    /**获取剧情任务 */
    getConfigPlotTask() {
        let isPlot = (item: ActivityShowInfo) => {
            if (item.type - 1 == ActivityType.Plot) {
                return true;
            }
            return false;
        }
        let plotConfs = R.filter(isPlot, this.confActivityShowInfo);
        let plots: Array<ActivityRecord> = [];
        plotConfs.forEach((element, index) => {
            let plot = {} as ActivityRecord;
            plot.activityId = element.id;
            plot.completed = this.plotIsCompleted(plot.activityId);
            plots.push(plot);
        });
        //排序
        return this.sortActivit(plots);
    }

    plotIsCompleted(activityId: number) {
        let confActivityShowInfo: Optional<ActivityShowInfo> = ActivityData.getInstance().getActivityShowById(activityId);
        let confStoryTaskInfo: Optional<StoryTaskInfo> = ActivityData.getInstance().getStoryTaskById(activityId);
        let completed = false;
        if (confActivityShowInfo.isValid() && confStoryTaskInfo.isValid()) {
            completed = R.any(QuestManager.isFinished, confStoryTaskInfo.getValue().overTask)
        }
        return completed;
    }


    /**获取日常任务 */
    async getConfigDailyTask() {

        let isDaily = (item: ActivityShowInfo) => {
            if (item.type - 1 == ActivityType.Daily) {
                return true;
            }
            return false;
        }
        let dailyConfs = R.filter(isDaily, this.confActivityShowInfo);
        //取出有记录的活动信息
        return await this.getActivityByTypeList(dailyConfs);
    }

    /**获取限时任务 */
    getConfigLimitTask() {
        let isLimit = (item: ActivityShowInfo) => {
            if (item.type - 1 == ActivityType.Limit) {
                return true;
            }
            return false;
        }
        let limitConfs = R.filter(isLimit, this.confActivityShowInfo);
        return this.getActivityByTypeList(limitConfs);
    }

    private getActivityByTypeList(confs: Array<ActivityShowInfo>) {
        let datas: Array<ActivityRecord> = [];
        confs.forEach((element, index) => {
            let onServer = this.getActivityByServer(element.id);
            if (onServer != undefined) {
                datas.push(onServer);
            } else {
                let data = {} as ActivityRecord;
                data.activityId = element.id;
                data.completed = false;
                data.progress = 0;
                datas.push(data);
            }
        });
        //排序
        return this.sortActivit(datas);
    }

    getActivityByServer(activityId: number) {
        return R.find(R.propEq('activityId', activityId))(this.activityRecords) as ActivityRecord;
    }

    getActivityShowById(id: number) {
        let activityShowInfo = R.find(R.propEq('id', id))(this.confActivityShowInfo) as ActivityShowInfo;
        if (activityShowInfo === undefined) {
            console.error(`${id}活动找不到相关配置`);
            return new Optional<ActivityShowInfo>(null);
        } else {
            if (!R.is(Array, activityShowInfo.showAward)) {
                activityShowInfo.showAward = R.of(activityShowInfo.showAward);
            }
            return new Optional<ActivityShowInfo>(activityShowInfo);
        }

    }

    getActivityOtherById(id: number) {
        return new Optional<ActivityOtherInfo>(R.find(R.propEq('id', id))(this.confActivityOtherInfo));
    }

    getStoryTaskById(id: number) {
        return new Optional<StoryTaskInfo>(R.find(R.propEq('id', id))(this.confStoryTaskInfo));
    }

    /**获取服务器活动信息 */
    async updateActivityComplex() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/activity/overall', []) as any;
        if (response.status === 0) {
            this.activityComplex = response.content;
            this.activityRecords = this.sortActivit(this.activityComplex.activityRecords);
        }
    }

    /**排序 */
    sortActivit(data: Array<ActivityRecord>) {
        //等级是否满足
        let byLevel = (itemA: ActivityRecord, itemB: ActivityRecord) => {
            let otherA = this.getActivityOtherById(itemA.activityId);
            let otherB = this.getActivityOtherById(itemB.activityId);
            if (otherA.isValid() && otherB.isValid()) {
                let playerL = PlayerData.getInstance().playerLevel;
                let a = 0;
                let b = 0;
                if (playerL >= otherA.getValue().level) {
                    a = 1;
                } else {
                    a = 0;
                }
                if (playerL >= otherB.getValue().level) {
                    b = 1;
                } else {
                    b = 0;
                }
                if (b == a) {
                    if (itemA.completed) {
                        a = 1;
                    } else {
                        a = 0;
                    }
                    if (itemB.completed) {
                        b = 1;
                    } else {
                        b = 0;
                    }
                    if (a == b) {
                        let confA = this.getActivityShowById(itemA.activityId);
                        let confB = this.getActivityShowById(itemB.activityId);
                        if (confA.isValid() && confB.isValid()) {
                            return confB.getValue().priority - confA.getValue().priority;
                        } else {
                            console.error('null');
                            return true;
                        }
                    }
                    return a - b;
                }
                return b - a;
            } else {
                console.error('null');
                return true;
            }

        };
        const byActive = (a: ActivityRecord, b: ActivityRecord) => {
            const aActive = this.activityComplex.openingActivityIds.indexOf(a.activityId) !== -1 ? 0 : 1
            const bActive = this.activityComplex.openingActivityIds.indexOf(b.activityId) !== -1 ? 0 : 1
            return aActive - bActive
        }
        const byLevelIsSatisfied = (a: ActivityRecord, b: ActivityRecord) => {
            const configA = this.getActivityOtherById(a.activityId).getValue()
            const configB = this.getActivityOtherById(b.activityId).getValue()
            const playerLevel = PlayerData.getInstance().playerLevel
            const aLevel = configA.level <= playerLevel ? 0 : 1
            const bLevel = configB.level <= playerLevel ? 0 : 1
            return aLevel - bLevel
        }
        const byCompleted = (a: ActivityRecord, b: ActivityRecord) => {
            const aComplete = a.completed ? 1 : 0
            const bComplete = b.completed ? 1 : 0
            return aComplete - bComplete
        }
        const byPriority = (a: ActivityRecord, b: ActivityRecord) => {
            const configA = this.getActivityShowById(a.activityId).getValue()
            const configB = this.getActivityShowById(b.activityId).getValue()
            return configB.priority - configA.priority
        }
        const byId = R.descend(R.prop("id"))

       return R.sortWith([
            byActive,
            byLevelIsSatisfied,
            byCompleted,
            byPriority,
            byId
        ])(data)
    }

}