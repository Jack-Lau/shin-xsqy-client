import PlayerPrefab from "./PlayerPrefab";
import Optional from "../cocosExtend/Optional";
import { CommonUtils } from "../utils/CommonUtils";
import { StepRecord } from "./TeamManager";
import { StepDirectionString } from "../map/PathStep";
import { Title } from "../net/Protocol";

/**
 * 队伍中队友
 * - 拥有PlayerPrefab
 * - 拥有自身相关的数据
 */
export default class Partner {
    player: PlayerPrefab = null;

    name: string = "";
    prefabId: number = 0;
    weaponId: Optional<number> = new Optional<number>();
    fc: number = 0;
    schoolId: number = 0;
    accountId: number = 0;

    getNode(): Optional<cc.Node> {
        return new Optional<cc.Node>(R.prop('node', this.player));
    }

    async init(info) {
        this.accountId = info.accountId;
        this.player = await CommonUtils.getPanel('player/playerPrefab', PlayerPrefab) as PlayerPrefab;
        this.player.nameLabel.string = this.getRTName(info.schoolId, info.playerName);
        let title = new Optional<Title>(info.title);
        this.player.initTitle(title.fmap(t => t.definitionId));
        this.prefabId = info.prefabId;
        this.weaponId = info.weaponId;
        await this.player.initAnimation(this.prefabId, this.weaponId, info.fashion, info.fashionDye);
    }

    getRTName(schoolId: Optional<number>, name: string) {
        let id = 0;
        if (schoolId.isValid()) {
            id = schoolId.getValue();
        }
        return "<img src='school_icon_" + id + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + name + '</outline></b></color>';
    }

    move(record: StepRecord) {
        let deltaX = R.prop('deltaX', record);
        let deltaY = R.prop('deltaY', record);
        let direction = R.prop('direction', record);
        let isMasked = R.prop('isMasked', record);
        this.player.changeMoveStatus('run_' + StepDirectionString[direction]);
        this.player.node.x -= deltaX;
        this.player.node.y += deltaY;
        if (isMasked) {
            this.player.node.opacity = 255 * 0.7;
        } else {
            this.player.node.opacity = 255;
        }
    }
}
