import { CommonUtils } from "../utils/CommonUtils";
import SchoolEnrollment from "../school/SchoolEnrollment";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import PlayerData from "../data/PlayerData";
import { QuestManager } from "./QuestManager";

export module SpecialQuest {
    const SPECIAL_QUEST_IDS = [700011];
    
    export let isSpecialQuest = (questId) => {
        return R.contains(questId, SPECIAL_QUEST_IDS);
    }

    export let handler_700011 = () => { 
        CommonUtils.aloneFunction(async () => {
            if (null === PlayerData.getInstance().schoolId) {
                let panel = await CommonUtils.getPanel('school/schoolEnrollment', SchoolEnrollment) as SchoolEnrollment;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            } else {
                QuestManager.finishQuest(700011, 0);
            }
            await CommonUtils.wait(2);
        })();
    }
}