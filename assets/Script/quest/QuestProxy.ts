import { CommonUtils } from "../utils/CommonUtils";
import { Binder } from "../data/Binder";
import QuestConfig from "./QuestConfig";
import { QuestRecord } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";

export namespace QuestProxy {
    let completedQuestIds = [];
    let completedQuests = {};
    let questData = {};
    let nonce = 1;
    export let currentQuest: Binder.BindableObject = new Binder.BindableObject(null, []);
    export let questAmount: Binder.BindableObject = new Binder.BindableObject(0, []);

    // 已完成任务的处理
    export function addCompletedQuestId (id: number) {
        completedQuestIds.push(id);
    }

    export function addCompletedQuests (quest: QuestRecord) {
        completedQuests[quest.questId] = quest;
    }

    export function deleteCompletedQuest (questId: number) {
        completedQuests[questId] = null;
        delete completedQuests[questId];
        completedQuestIds = completedQuestIds.filter(x => x != questId);
    }

    export function clearCompletedQuestIds () {
        completedQuestIds = [];
        completedQuests = {};
    }

    export function isCompleted (questId: number) {
        return completedQuestIds.indexOf(questId) != -1;
    }

    export function getQuestRecord(questId: number): Optional<QuestRecord> {
        if (completedQuests[questId]) {
            return Optional.Just(completedQuests[questId]);
        } else {
            return Optional.Just(questData[questId]);
        }
    }

    // 当前任务更新
    export function changeCurrentQuest(questId: number) {
        let quest = questData[questId]
        if (quest && R.prop('show', QuestConfig.getInstance().getQuestConfig(questId)) == true) {
            currentQuest.setValue(quest);
        } else {
            CommonUtils.log('[log] (changeCurrentQuest) quest %d does not exist.', questId);
        }
    }

    export function setCurrentQuest() {
        currentQuest.setValue(getFirstQuest());
    }

    function getFirstQuest() {
        let priorityIdSort = R.sortWith([
            R.descend(R.prop('nonce')),
            R.descend(R.prop('priority')),
            R.ascend(R.prop('questId'))
        ]);
        return R.head(priorityIdSort(R.values(questData)).filter((x: QuestRecord) => R.prop('show', QuestConfig.getInstance().getQuestConfig(x.questId))));
    }

    // 任务数据 增删改查
    export function add(quest) {
        let questId = quest.questId;
        let priority = R.prop('priority', QuestConfig.getInstance().getQuestConfig(questId));
        quest = R.assoc('priority', priority, quest);
        quest = R.assoc('nonce', nonce, quest);
        if (R.prop('show', QuestConfig.getInstance().getQuestConfig(quest.questId))) {
            if (!questData[questId]) {
                questAmount.setValue(questAmount.getValue() + 1);
            }
            currentQuest.setValue(quest);
        }
        questData[questId] = quest;
    }

    export function deleteQuest(questId: number) {
        if (questData[questId]) {
            questData[questId] = null;
            delete questData[questId];
            if (currentQuest.getValue().questId == questId) {
                currentQuest.setValue(getFirstQuest());
            }
            if (R.prop('show', QuestConfig.getInstance().getQuestConfig(questId))) {
                questAmount.setValue(questAmount.getValue() - 1);
            }
        }
    }

    export function update(quest) {
        if (quest.ObjectiveStatus == 'T') {
            deleteQuest(quest.questId);
        } else {
            add(quest);
        }
    }

    export function findById(questId: number) {
        if (questData[questId]) {
            return questData[questId];
        } else {
            CommonUtils.log('[log] (findById) quest %d does not exist.', questId)
            return null;
        }
    }

    export function getAllQuests() {
        return questData;
    }

    export function getQuestArray() {
        let result = [];
        for (let key in questData) {
            result.push(questData[key]);
        }
        let priorityIdSort = R.sortWith([
            R.descend(R.prop('nonce')),
            R.descend(R.prop('priority')),
            R.ascend(R.prop('questId'))
        ]);
        return priorityIdSort(result).filter((x: QuestRecord) => R.prop('show', QuestConfig.getInstance().getQuestConfig(x.questId)));
    }

    export function incNonce() {
        nonce += 1;
    }
}