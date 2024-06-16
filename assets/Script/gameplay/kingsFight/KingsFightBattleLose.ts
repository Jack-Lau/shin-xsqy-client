import { CommonUtils } from "../../utils/CommonUtils";
import KingsFightRank from "./KingsFightRank";
import { KingsFightConfig } from "./KingsFightConfig";
import PlayerData from "../../data/PlayerData";
import KingsFightPanel from "./KingsFightPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const {ccclass, property} = cc._decorator;

@ccclass
export default class KingsFightBattleLose extends cc.Component {
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(KingsFightRank)
    rank: KingsFightRank = null;
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Label)
    expAmountLabel: cc.Label = null;

    async start () {
        await KingsFightConfig.initConfig();
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    async playTween(fromGrade: number, toGrade: number) {
        await KingsFightConfig.initConfig();
        this.expAmountLabel.string = '+' + (190 * PlayerData.getInstance().playerLevel + 1785).toLocaleString();
        if (fromGrade >= KingsFightConfig.MAX_GRADE || fromGrade <= 10) {
            this.rank.init(toGrade, true);
        } else {
            this.rank.init(fromGrade, true);
            let node = this.rank.getCurrentStar();
            let action = cc.fadeTo(1, 0)
            node.runAction(action.easing(cc.easeQuarticActionIn()));
            await CommonUtils.wait(1);
            node.active = false;
            node.opacity = 255;
        }
    }

    async closePanel() {
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightPanel', KingsFightPanel) as KingsFightPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        CommonUtils.safeRemove(this.node);
    }
}
