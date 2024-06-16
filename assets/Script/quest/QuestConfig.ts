import { ConfigUtils } from "../utils/ConfigUtil";
import { CommonUtils } from "../utils/CommonUtils";
import { NetUtils } from "../net/NetUtils";

/**
 * 任务相关配置信息
 */
export default class QuestConfig {
    private static _instance: QuestConfig = null;
    questConfig = {};
    rawData = {};
    quests = [730000];
    objective = {};
    questTweenCofig = {};

    progressbars = {};

    private constructor() {

    }

    public static getInstance(): QuestConfig {
        if (!this._instance) {
            this._instance = new QuestConfig;
        }
        return this._instance;
    }

    async init() {
        // init quest
        let config = await ConfigUtils.getConfigJson("SequenceQuest") as any;
        for (let key in config) {
            let value = config[key];
            let quest = new Quest();
            quest.id = value.id;
            quest.name = value.name;
            quest.description = value.description;
            if (!value.fixBehaviors) {
                value.fixBehaviors = '';
            }
            if (!value.fixConditions) {
                value.fixConditions = '';
            }
            if (value.fixBehaviors == 5) {
                quest.isComingSoon = true;
            }

            quest.tasks = getTaskArrayByStr(value.fixBehaviors.toString(), value.fixConditions.toString());
            quest.priority = value.priority;
            quest.show = value.showQuestChase == 1 ? true : false;
            quest.navigation = value.navigation;
            this.questConfig[key] = quest;
        }

        // init progressbar
        this.progressbars = await ConfigUtils.getConfigJson('ReadingInformation') as any;
        this.objective = await ConfigUtils.getConfigJson('RandQuestBehaAndConds') as any;
        this.questTweenCofig = await ConfigUtils.getConfigJson('StoryQuestCompleted') as any;
    }

    getQuestConfig(questId): Quest {
        return this.questConfig[questId];
    }

    getQCTConfig(questId) {
        return this.questTweenCofig[questId];
    }

    isShowTween(questId: number): boolean {
        return this.getQCTConfig(questId) != null; 
    }
}

export function getTaskArrayByStr(taskString, fixConditions) {
    let arr = fixConditions.split(',');
    let task = taskString.split(',');
    
    let func = function(taskStr, conditionStr) {
        let task = getTaskByStr(taskStr);
        task.config.fixConditions = getFixCondition(conditionStr);
        return task;
    }
    return NetUtils.zipWith(func, task, arr);
    // return taskString.split(',').map(item => {return getTaskByStr(item)});
}

function getFixCondition(conStr: string) {
    let conArr = conStr.split('_');
    let reg = /_[a-zA-Z]_[z-zA-Z]/g
    let isBattle = reg.exec(conStr)
    if (isBattle) { // battle
        return {
            isBattle: true,
            battleId: conArr[0],
        }
    } else if (conArr.length == 3) {
        return {
            submitItem: true,
            currencyId: conArr[0],
            amount: conArr[1]
        }
    } else if (conArr[0] != '无') {
        return {
            level: conArr[0]
        }
    }
}

export function getTaskByStr(taskString: string) {
    let taskArr = taskString.split('_').map(item => { return parseInt(item) });
    let task = new Task();
    task.type = taskArr[0];
    if (task.type == TaskType.FindNpc) {
        task.config = {
            npcId: taskArr[1],
            beginSelectionId: taskArr[2],
            endSelectionId: taskArr[3]
        }
    } else if (task.type == TaskType.ProgressBar) {
        task.config = {
            npcId: taskArr[1],
            beginSelectionId: taskArr[2],
            endSelectionId: taskArr[3],
            progressId: taskArr[4]
        }
    } else if (task.type == TaskType.Patrol) {
        task.config = {
            mapId: taskArr[1],
            timeRnage: taskArr[2]
        }
    } else if (task.type == TaskType.ComingSoon) {
        task.config = {
            
        }
    } else if (task.type == TaskType.SubmitItem) {
        task.config = {
            npcId: taskArr[1],
            beginSelectionId: taskArr[2]
        }
    } else {
        task.config = {
            specailId: taskArr[1]
        }
    }
    task.completed = false;
    return task;
}

export enum TaskType { FindNpc = 1, ProgressBar, Patrol, Special, ComingSoon, SubmitItem }
enum CompleteType { Battle, None }
interface TaskConfig {
    npcId?: number;
    beginSelectionId?: number;
    endSelectionId?: number;
    progressId?: number;
    mapId?: number;
    timeRnage?: number;
    specailId?: number;
    fixConditions?: any,
}

class Task {
    type: TaskType;
    config: TaskConfig;
    completed: boolean;
}


export class Quest {
    id: number;
    name: string;
    description: string;
    tasks: Array<Task>;
    completeType: CompleteType;
    navigation: number;
    priority: number;
    show: boolean;
    isComingSoon: boolean;
}
