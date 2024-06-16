import PlayerData from "../../data/PlayerData";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { PetData } from "./PetData";
import Optional from "../../cocosExtend/Optional";
import { PetDetail } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import PetTips from "./PetTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

export module PetUtils {
    export async function tryModifyBattleList(pid: number) {
        let pid1 = PlayerData.getInstance().battlePetId1.getOrElse(null);
            let pid2 = PlayerData.getInstance().battlePetId2.getOrElse(null);
            let pid3 = PlayerData.getInstance().battlePetId3.getOrElse(null);
            let petIds = [pid1, pid2, pid3].filter(x => x != null);
            if (petIds.length < 3) {
                petIds.push(pid);
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/modifyBattleList', [petIds.join(',')]) as any;
                if (response.status === 0) {
                    TipsManager.showMessage('宠物已自动出战');
                    PlayerData.getInstance().updateFc();
                    PlayerData.getInstance().battlePetId1 = new Optional<number>(petIds[0]);
                    PlayerData.getInstance().battlePetId2 = new Optional<number>(petIds[1]);
                    PlayerData.getInstance().battlePetId3 = new Optional<number>(petIds[2]);
                    await PetData.updatePetIds();
                }
            }
    }

    export function isInBattle (petId) {
        return PlayerData.getInstance().battlePetId1.fmap(x => x == petId).getOrElse(false)
                || PlayerData.getInstance().battlePetId2.fmap(x => x == petId).getOrElse(false)
                || PlayerData.getInstance().battlePetId3.fmap(x => x == petId).getOrElse(false)
    }

    export async function showPetTips (petDetail: PetDetail) {
        let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
        panel.init(petDetail);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
}