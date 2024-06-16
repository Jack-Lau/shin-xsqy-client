import Optional from "../../cocosExtend/Optional";
import { DiscipleRecord, ImpartationRecord } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import MentorPanel from "./MentorPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import DisciplePanel from "./DisciplePanel";
import MentorNonePanel from "./MentorNonePanel";
import DiscipleEndBox from "./DiscipleEndBox";
import SearchMentorPanel from "./SearchMentorPanel";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";

export module MentorUtils {
	
    export enum PlayerMentorState { MENTOR, DISCIPLE, NONE };

    export function getState(): PlayerMentorState {
        let createTime = PlayerData.getInstance().createTime;
        let serverTime = CommonUtils.getServerTime();
        if (serverTime - createTime < 7 * 86400 * 1000) {
            return PlayerMentorState.DISCIPLE;
        } else {
            return PlayerMentorState.MENTOR;
        }
    }

    /**
     * (1) viewMyself -> [Yes] -> Goto (2)
     *                   [No] -> checkTime -> CreateOrChangeRole -> Goto (2)
     * (2) Role -> [Master] ->  fc >= 40000 || hasDisciple -> [Yes] -> MentorPanel
     *                                                        [No] -> NonePanel
     *             [Disciple] -> hasMaster -> [Yes] -> Phase -> [End] -> DiscipleEndPanel
     *                                                         [Practicing] -> DisciplePanel
     *                                        [No] -> searchMentorPanel
     */
    let isOpening = false;
    export async function openMentorPanel() {
        if (isOpening) {
            return;
        }
        isOpening = true;
        let result = await NetUtils.get<ImpartationRecord>('/impartation/view/myself', []);
        let state = getState();
        if (!result.isRight) {
            if (state == PlayerMentorState.MENTOR) {
                if (PlayerData.getInstance().fc < 40000 || PlayerData.getInstance().playerLevel < 70) {
                    TipsManager.showMessage('等级达到70且战力大于40000方可收徒授业');
                } else {
                    result = await NetUtils.post<ImpartationRecord>('/impartation/createOrChangeRole', ['MASTER']);
                }
            } else {
                result = await NetUtils.post<ImpartationRecord>('/impartation/createOrChangeRole', ['DISCIPLE']);
            }
        }
        if (!result.isRight) {
            isOpening = false;
            return;
        }

        let result1 = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        if (result1.isRight && result1.right.phase == "TO_BE_CONFIRMED" && !result1.right.discipleConfirmed) {
            let panel = await CommonUtils.getPanel('gameplay/mentor/discipleEndBox', DiscipleEndBox) as DiscipleEndBox;
            panel.init(result1.right)
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            isOpening = false;
            return;
        }

        if (result.right.role == 'MASTER') {
            openPanelAsMentor();
        } else {
            let result2 = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
            if (result2.isRight) {
	            if (result2.right.phase == 'PRACTISING') {
                    let panel = await CommonUtils.getPanel('gameplay/mentor/disciplePanel', DisciplePanel) as DisciplePanel;
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                } else if (result2.right.discipleConfirmed) {
                    if (PlayerData.getInstance().fc >= 40000 && PlayerData.getInstance().playerLevel >= 70) {
                        await NetUtils.post<ImpartationRecord>('/impartation/createOrChangeRole', ['MASTER']);
                        openPanelAsMentor();
                    } else {
                        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorNonePanel', MentorNonePanel) as MentorNonePanel;
                        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                    }
                }
            } else {
				if (state == PlayerMentorState.MENTOR) {
					if (PlayerData.getInstance().fc < 40000 || PlayerData.getInstance().playerLevel < 70) {
						TipsManager.showMessage('等级达到70且战力大于40000方可收徒授业');
						let panel = await CommonUtils.getPanel('gameplay/mentor/mentorNonePanel', MentorNonePanel) as MentorNonePanel;
                        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
					} else {
						await NetUtils.post<ImpartationRecord>('/impartation/createOrChangeRole', ['MASTER']);
						openPanelAsMentor();
					}
				} else {
					let panel = await CommonUtils.getPanel('gameplay/mentor/searchMentorPanel', SearchMentorPanel) as SearchMentorPanel;
					EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
				}
            }
        }
        isOpening = false;
    }

    async function openPanelAsMentor() {
        let result3 = await NetUtils.get<Array<DiscipleRecord>>('/impartation/disciple/myDisciples', []);
        if ((PlayerData.getInstance().fc >= 40000 && PlayerData.getInstance().playerLevel >= 70) || result3.getOrElse([]).length > 0) {
            let panel = await CommonUtils.getPanel('gameplay/mentor/mentorPanel', MentorPanel) as MentorPanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        } else {
            let panel = await CommonUtils.getPanel('gameplay/mentor/mentorNonePanel', MentorNonePanel) as MentorNonePanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }
    }

    export interface MentorAchievement {
        id: number,
        name: string,
        icon: number,
        type: number,
        award: number,
        description: string,
        feedback: string,
        showAward: Array<{id: number, amount: number}>,
        priority: number
    }

    export async function getPracticeConfig(definitionId: number): Promise<MentorAchievement> {
        let config = await ConfigUtils.getConfigJson('DailyPracticeAndAchievement') as any;
        return config[definitionId];
    }

    export async function getAchievements(): Promise<Array<MentorAchievement>> {
        let config = await ConfigUtils.getConfigJson('DailyPracticeAndAchievement') as any;
        let result = [];
        for (let key in config) {
            let value = config[key] as MentorAchievement;
            if (value.type == 1) {
                result.push(R.clone(value));
            }
        }
        return result;
    }

    export async function getContributionRatio(level: number) {
        let config = await ConfigUtils.getConfigJson('ContributionAndExpGetProportion');
        return R.path([level, 'contributionProportion'], config);
    }

    export async function getExpRatio(level: number) {
        let config = await ConfigUtils.getConfigJson('ContributionAndExpGetProportion');
        return R.path([level, 'expProportion'], config);
    }

    export async function getPool(id: number): Promise<number> {
        let result = await NetUtils.get<number>('/impartation/disciple/{id}/currentHuoyuePool', [id])
        return result.getOrElse(0);
    }

}
