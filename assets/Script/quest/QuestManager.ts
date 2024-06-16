import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { QuestProxy } from "./QuestProxy"
import { CommonUtils } from "../utils/CommonUtils";
import QuestConfig, { Quest, TaskType, getTaskByStr, getTaskArrayByStr } from "./QuestConfig";
import MapManager from "../map/MapManager";
import NpcConfig from "../config/NpcConfig";
import { QuestRecord } from "../net/Protocol";
import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import { BattleConfig } from "../battle/BattleConfig";
import { SpecialQuest } from "./SpecialQuest";
import Optional from "../cocosExtend/Optional";
import QuestCompleteTween from "../gameplay/quest/QuestCompleteTween";

export namespace QuestManager {
    let initial: boolean = false;

    export async function init() {
        if (initial) {
            return;     // 最多初始化一次
        }
        initial = true;

        // 注册所有处理函数
        EventDispatcher.on(Notify.QUEST_MANAGER_UPDATE_ALL_QUEST, updateAllQuestStatus);
        EventDispatcher.on(Notify.QUEST_FINISH_QUEST, onFinishQuest);
        EventDispatcher.on(Notify.QUEST_NEW_QUEST, onNewQuest);

        // 请求我当前的任务
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/quest/view/myself', []) as any;
        if (response.status == 0) {
            EventDispatcher.dispatch(Notify.QUEST_MANAGER_UPDATE_ALL_QUEST, { quests: response.content });
        }
    }


    /*****************************/
    /****      任务处理函数     ****/
    /*****************************/

    // 1. 任务显示变化应该是由【显示对象本身】 bind 到currentQuest上 (complete)
    // 2. 为任务选项绑定选项
    // 3. 将选项植入NPC中
    // 4. 从NPC中删除选项

    // 为选项绑定事件, 将选项植入NPC中
    export function addSelectionToNpc(tasks: any[], questId: number) {
        tasks.map((task, index) => {
            switch (task.type) {
                case TaskType.FindNpc:
                case TaskType.ProgressBar: {
                    let npcId = task.config.npcId;
                    let startSelectionId = task.config.beginSelectionId;
                    let endSelectionId = task.config.endSelectionId;
                    let isFinished = task.completed;
                    if (isFinished) {
                        break;
                    }
                    NpcConfig.getInstance().npcSelections[startSelectionId].questId = questId;
                    NpcConfig.getInstance().npcs[npcId].addSelectionById(startSelectionId);
                    if (task.config.fixConditions && task.config.fixConditions.isBattle) {
                        NpcConfig.getInstance().npcSelections[endSelectionId].toBattle = true;
                        NpcConfig.getInstance().npcSelections[endSelectionId].battleObjectiveIndex = index;
                        NpcConfig.getInstance().npcSelections[endSelectionId].battleId = task.config.fixConditions.battleId;
                    }  else {
                        NpcConfig.getInstance().npcSelections[endSelectionId].findNpcActionIsEnd = true;
                    }

                    if (endSelectionId) {
                        NpcConfig.getInstance().npcSelections[endSelectionId].progressId = task.config.progressId;
                        NpcConfig.getInstance().npcSelections[endSelectionId].questId = questId;
                        NpcConfig.getInstance().npcSelections[endSelectionId].npcObjectiveIndex = index;
                    }
                    break;
                }
                case TaskType.SubmitItem: {
                    let startSelectionId = task.config.beginSelectionId;
                    let npcId = task.config.npcId;
                    if (task.config.fixConditions && task.config.fixConditions.submitItem) { 
                        NpcConfig.getInstance().npcSelections[startSelectionId].toSumbitItem = true;
                        NpcConfig.getInstance().npcSelections[startSelectionId].smtCurrencyAmount = R.prop('amount',  task.config.fixConditions);
                        NpcConfig.getInstance().npcSelections[startSelectionId].smtCurrencyId = R.prop('currencyId',  task.config.fixConditions);
                        NpcConfig.getInstance().npcSelections[startSelectionId].itemObjectiveIndex = index;
                        NpcConfig.getInstance().npcSelections[startSelectionId].npcId = npcId;
                        NpcConfig.getInstance().npcSelections[startSelectionId].questId = questId;
                        NpcConfig.getInstance().npcs[npcId].addSelectionById(startSelectionId);
                    }
                    break;
                }
                default: {
                    CommonUtils.log('暂时不支持该类型的任务！');
                }
            }
        });
    }

    // 移除选项事件，从NPC中删除选项
    export function removeSelection(tasks: any[], questId) {
        tasks.map((task, index) => {
            switch (task.type) {
                case TaskType.FindNpc:
                case TaskType.ProgressBar: {
                    let npcId = task.config.npcId;
                    let startSelectionId = task.config.beginSelectionId;
                    NpcConfig.getInstance().npcs[npcId].removeSeletionbyId(startSelectionId, questId);
                    break;
                }
                case TaskType.SubmitItem: {
                    let npcId = task.config.npcId;
                    let startSelectionId = task.config.beginSelectionId;
                    NpcConfig.getInstance().npcs[npcId].removeSeletionbyId(startSelectionId, questId);
                    break;
                }
                default: {
                    CommonUtils.log('暂时不支持该类型的任务！');
                }
            }
        })
    }

    // 开启一场指定任务，指定Index的战斗
    let _sendBattleRequest = false
    export async function sendBattleRequest(battleId, questId: number, index: number) {
        if (_sendBattleRequest) return;
        _sendBattleRequest = true
        // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/start', [battleId, false]) as any;
        // if (response.status == 0) {
        //     BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;

        //     let callback = async () => {
        //         let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/achieveObjective', [questId, index, response.content.battleSessionId]) as any;
        //         if (response2.status == 0) {
        //             CommonUtils.log('任务完成成功');
        //         }
        //     }
        //     EventDispatcher.dispatch(Notify.BATTLE_OPEN, { data: response.content.result, cb: callback });
        // }

        const data = NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/start', [battleId, false])
            .then(response => 
                response.status != 0 
                ? null 
                : Object.assign(response?.content?.result ?? {}, {battleSessionId: response?.content?.battleSessionId}))
        EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
            data,
            beforeCb: (data) => BattleConfig.getInstance().battleSessionId = data.battleSessionId,
            afterCb: async () => {
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/achieveObjective', [questId, index, BattleConfig.getInstance().battleSessionId]) as any;
                if (response2.status == 0) {
                    CommonUtils.log('任务完成成功');
                }
            }
        })
        _sendBattleRequest = false
    }

    // 完成指定的任务行为
    export async function finishQuest(questId: number, index: number) {
        QuestProxy.incNonce();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/achieveObjective', [questId, index]) as any;
        if (response.status == 0) {
            QuestProxy.addCompletedQuestId(questId);
            if (QuestConfig.getInstance().isShowTween(questId)) {
                let panel = await CommonUtils.getPanel('gameplay/quest/questCompleteTween', QuestCompleteTween) as QuestCompleteTween;
                panel.init(questId);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            } else {
                CommonUtils.log('任务完成成功');
            }
        }
    }


    /*****************************/
    /****      任务行为函数     ****/
    /*****************************/

    // 巡逻任务
    // 进行一定巡逻之后，触发后续事件
    function patrol(task) {
        let timeRange = parseInt(task.config.patrolSeconds);
        let mapId = parseInt(task.config.mapId);
        // if (mapId == MapManager.getInstance().currentMapId) {
        //     this.sendNotification(UINotify.MAP_START_PATROL, { questId: questId, timeRange: timeRange })
        // } else {
        //     EventDispatcher.dispatchEvent(new EventDispatcher.NotifyEvent(Notify.SWITCHTOMAP))
        //     this.sendNotification(UINotify.MAP_SWITCH_MAP, { mapId: mapId, questId: questId, timeRange: timeRange });
        // }
    }

    // 触发任务自动寻路行为
    export let openPanel = false;
    export let currentFindNpcId = -1;
    export function findNpc(npcId) {
        let npc = NpcConfig.getInstance().npcs[npcId];
        if (!npc) {
            return;
        }
        let mapId = npc.locationMapId;
        let location = NpcConfig.getInstance().getNpcFindPathPointById(npcId);
        openPanel = true;
        currentFindNpcId = npcId;
        if (mapId == MapManager.getInstance().currentMapId) {
            let event = new EventDispatcher.NotifyEvent(Notify.AUTO_FIND_NPC);
            event.detail = { location: location }
            EventDispatcher.dispatchEvent(event)
        } else {
            let event = new EventDispatcher.NotifyEvent(Notify.SWITCH_TO_MAP_AND_FIND_NPC);
            event.detail = { mapId: mapId, location: location };
            EventDispatcher.dispatchEvent(event)
        }
    }

    export function findJgtNpc(npcId) {
        let npc = NpcConfig.getInstance().npcs[npcId];
        if (!npc) {
            return;
        }
        let mapId = 200;
        let location = NpcConfig.getInstance().getNpcFindPathPointById(npcId);
        openPanel = true;
        currentFindNpcId = npcId;
        if (mapId == MapManager.getInstance().currentMapId) {
            let event = new EventDispatcher.NotifyEvent(Notify.AUTO_FIND_NPC);
            event.detail = { location: location }
            EventDispatcher.dispatchEvent(event)
        } else {
            let event = new EventDispatcher.NotifyEvent(Notify.SWITCH_TO_MAP_AND_FIND_NPC);
            event.detail = { mapId: mapId, location: location };
            EventDispatcher.dispatchEvent(event)
        }
    }

    /*****************************/
    /****  对外部事件的处理函数  ****/
    /*****************************/
    function updateAllQuestStatus(event: EventDispatcher.NotifyEvent) {
        QuestProxy.clearCompletedQuestIds();
        let data = event.detail.quests as Array<QuestRecord>;
        for (let quest of data) {
            if (quest.questStatus == 'COMPLETED') {
                QuestProxy.addCompletedQuestId(quest.questId);
                QuestProxy.addCompletedQuests(quest);
                continue;
            } else if (quest.questStatus != "IN_PROGRESS") {
                continue;
            }
            if (quest.randomBacId) {
                let tasks = getTaskByBacId(quest.randomBacId);
                addSelectionToNpc(tasks, quest.questId);
            } else {
                let questConfig = QuestConfig.getInstance().getQuestConfig(quest.questId);
                addSelectionToNpc(questConfig.tasks, questConfig.id);
            }

            let questInfo = QuestConfig.getInstance().getQuestConfig(quest.questId);
            if (questInfo && !questInfo.show) {
                continue;
            }
            QuestProxy.add(quest);
        }
        QuestProxy.setCurrentQuest();
    }

    async function onFinishQuest(event: EventDispatcher.NotifyEvent) {
        let quest = event.detail.quest as QuestRecord;
        if (quest) {
            if (quest.questId == 730009) {
                TipsManager.showMessage('任务完成，快去“欢乐大转盘”抽奖吧');
            }
            if (quest.questId >= 730111 && quest.questId <= 730150) {
                if (quest.results != "A") {
                    TipsManager.showMessage('挑战失败！');
                }
            }
            // if (quest && quest.randomBacId) { // 随机任务行为删除任务应小心
            //     let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/quest/view/myself/{questId}', [quest.questId]) as any;
            //     if (response.status == 404) {// 任务已不存在
            //         QuestProxy.deleteQuest(quest.questId);
            //     } else if (response.status == 0) {
            //         if (response.content.objectiveStatus == 'T') {
            //             QuestProxy.deleteQuest(response.content.questId);
            //         } else {
            //             QuestProxy.update(response.content);
            //         }
            //     }
            // } else {
            //     QuestProxy.deleteQuest(quest.questId);
            // }
            QuestProxy.deleteQuest(quest.questId);

            // 从本地标记任务已完成
            if (quest.randomBacId) {
                let tasks = getTaskByBacId(quest.randomBacId);
                removeSelection(tasks, quest.questId);
            } else {
                let questConfig = QuestConfig.getInstance().getQuestConfig(quest.questId);
                removeSelection(questConfig.tasks, quest.questId);
            }
            QuestProxy.deleteQuest(quest.questId);
            QuestProxy.addCompletedQuests(quest);
            EventDispatcher.dispatch(Notify.REFRESH_QUEST_NPC, {});
        }
    }

    function onNewQuest(event: EventDispatcher.NotifyEvent) {
        let quest = event.detail.quest;
        if (quest) {
            // 从本地标记任务已完成
            QuestProxy.update(quest);

            // 并且添加该任务关联的NPC
            if (quest.randomBacId) {
                let tasks = getTaskByBacId(quest.randomBacId);
                addSelectionToNpc(tasks, quest.questId);
            } else {
                let questConfig = QuestConfig.getInstance().getQuestConfig(quest.questId);
                addSelectionToNpc(questConfig.tasks, questConfig.id);
            }
            EventDispatcher.dispatch(Notify.REFRESH_QUEST_NPC, {});
        }
    }

    export function getNpcIdByQuest(quest) {
        let npcId = -1;
        if (quest.randomBacId) {
            let tasks = getTaskByBacId(quest.randomBacId);
            npcId = tasks[0].config.npcId;
        } else {
            npcId = QuestConfig.getInstance().getQuestConfig(quest.questId).tasks[0].config.npcId;
        }
        return npcId;
    }

    export function getNpcIdByQuestId(questId: number) {
        return QuestConfig.getInstance().getQuestConfig(questId).tasks[0].config.npcId;
    }

    function getTaskByBacId(bacId: number) {
        let bac = QuestConfig.getInstance().objective[bacId];
        return getTaskArrayByStr(bac.fixBehaviors, bac.fixConditions);
    }

    export async function tryStartQuest (questId: number): Promise<boolean> {
        if (questId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/start', [questId]) as any;
            if (response.status === 0) {
                return true;
            }
        }
        return false;
    }


    // main 
    export function questCompOnClick() {
        let quest = QuestProxy.currentQuest.getValue() as QuestRecord;
        _gotoQuestNpc(quest);
    }

    export function isFinished(questId: number) {
        return QuestProxy.isCompleted(questId);
    }

    export function getCurrentQuestIds () {
        return R.keys(QuestProxy.getAllQuests());
    }

    export function gotoNpcByQuestId(questId: number) {
        let quest = QuestProxy.findById(questId) as QuestRecord;
        _gotoQuestNpc(quest);
    }

    function _gotoQuestNpc (quest: QuestRecord) {
        if (!quest) {
            TipsManager.showMessage('去领取转盘任务或四处逛逛吧~');
            return;
        }
        if (SpecialQuest.isSpecialQuest(quest.questId)) {
            SpecialQuest['handler_' + quest.questId]();
            return;
        }

        // 任务追踪提示
        if (quest.randomBacId) {
            let questConfig = QuestConfig.getInstance().objective[quest.randomBacId];
            if (questConfig.navigation != 1) {
                TipsManager.showMsgFromConfig(questConfig.navigation);
                return;
            }
        } else {
            let questConfig = QuestConfig.getInstance().getQuestConfig(quest.questId);
            if (questConfig.navigation != 1) {
                TipsManager.showMsgFromConfig(questConfig.navigation);
                return;
            }
        }

        let questConfig = QuestConfig.getInstance().questConfig[quest.questId];
        if (questConfig.isComingSoon) {
            TipsManager.showMessage(questConfig.description);
        } else if (questConfig.navigation == 1) {
            let npcId = QuestManager.getNpcIdByQuest(quest);
            if (npcId != -1) {
                QuestManager.findNpc(npcId);
            }
        } else {
            TipsManager.showMessage(questConfig.navigation);
        }
    }
}
