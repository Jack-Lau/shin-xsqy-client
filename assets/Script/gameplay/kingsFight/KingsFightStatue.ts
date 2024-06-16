import NpcPrefab from "../../npc/NpcPrefab";
import { PlayerBaseInfo, MjdhWinnerRecord, PlayerDetail, Title, Equipment, Fashion, FashionDye } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import NpcConfig from "../../config/NpcConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import { Notify } from "../../config/Notify";
import NpcPanel from "../../npc/NpcPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import PlayerPrefab from "../../player/PlayerPrefab";
import Optional from "../../cocosExtend/Optional";
import Either from "../../cocosExtend/Either";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class KingsFightStatue extends cc.Component {
    @property(PlayerPrefab)
    player: PlayerPrefab = null;
    @property(cc.Sprite)
    base: cc.Sprite = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    npcId: number = -1;


    async init(npcId: number) {
        this.npcId = npcId;
        // let record: Either<string, MjdhWinnerRecord> = null;
        let seasonId = Math.floor((npcId - 10000) / 10) + 1;
        let rankIndex = (npcId % 10);
        let rank = rankIndex == 0 ? 3 : (rankIndex == 1 ? 1 : 2);
        // if (npcId == 10000) {
        //     record = await NetUtils.get<MjdhWinnerRecord>('/mjdh/winner/{seasonId}/{ranking}', [1, 3]);
        // } else if (npcId == 10001) {
        //     record = await NetUtils.get<MjdhWinnerRecord>('/mjdh/winner/{seasonId}/{ranking}', [1, 1]);
        // } else if (npcId == 10002) {
        //     record = await NetUtils.get<MjdhWinnerRecord>('/mjdh/winner/{seasonId}/{ranking}', [1, 2]);
        // } 

        let record = await NetUtils.get<MjdhWinnerRecord>('/mjdh/winner/{seasonId}/{ranking}', [seasonId, rank]);
        if (record.right) {
            let baseInfo = (await NetUtils.get<Array<PlayerDetail>>('/player/viewDetail', [String(record.right.accountId)])).fmap(x => x[0]).toOptional();
            if (baseInfo.valid) {
                this.player.initNameLabel(baseInfo.val.schoolId, baseInfo.val.player.playerName);
                let title = new Optional<Title>(baseInfo.val.title);
                this.player.initTitle(title.fmap(t => t.definitionId));
                let prefabId = baseInfo.val.player.prefabId;
                let weaponId = (new Optional<Equipment>(R.prop(0, baseInfo.val.equipments.filter(x => x.id == baseInfo.val.playerRelation.handEquipmentId)))).fmap(x => x.definitionId);
                NpcConfig.getInstance().npcs[npcId].name = baseInfo.val.player.playerName;
                NpcConfig.getInstance().npcs[npcId].prefabId = prefabId;
                let direction = NpcConfig.getInstance().npcs[npcId].direction;
                await this.player.initWithSingleDirection(prefabId, weaponId, new Optional<Fashion>(baseInfo.val.fashion), new Optional<FashionDye>(baseInfo.val.fashionDye), direction);
            }
        }
        this.base.spriteFrame = this.atlas.getSpriteFrame('base' + record.right.ranking);

        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    async onClick() {
        let npc = NpcConfig.getInstance().npcs[this.npcId];
        if (!npc) {
            return;
        }
        let prefab = await CommonUtils.getPanelPrefab('npcPanelPrefab') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(NpcPanel);
        panel.initWithSelection(this.npcId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        EventDispatcher.dispatch(Notify.HIDE_MAIN_UI, {});
    }

}