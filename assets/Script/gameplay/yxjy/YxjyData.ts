import Optional from "../../cocosExtend/Optional";
import { YxjyRecord } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { precondition } from "../../utils/BaseFunction";
import PlayerData from "../../data/PlayerData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

export module YxjyData {
    export let record: Optional<YxjyRecord> = Optional.Nothing();
    let isOn = false;

    export async function 初始化元宵佳肴() {
        if (precondition(PlayerData.getInstance().playerLevel >= 50)) {
            let result = await NetUtils.get<YxjyRecord>('/yuanxiaojiayao/viewMyself', []);
            if (result.isRight) {
                record = result.toOptional();
            } else {
                let result2 = await NetUtils.post<YxjyRecord>('/yuanxiaojiayao/createRecord', []);
                record = result2.toOptional();
            }
        } else {
            if (!isOn) {
                isOn = true;
                EventDispatcher.on(Notify.PLAYER_LEVEL_UP, checkYxjy);
            }
        }
    }

    export async function trytoUpdate() {
        if (precondition(PlayerData.getInstance().playerLevel >= 50)) {
            let result = await NetUtils.get<YxjyRecord>('/yuanxiaojiayao/viewMyself', []);
            if (result.isRight) {
                record = result.toOptional();
            }
        }
    }

    export async function checkYxjy() {
        if (!record.valid) {
            初始化元宵佳肴();
        }
    }
}