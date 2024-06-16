import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import KingsFightPanel from "./KingsFightPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class KingFightSelectPanel extends cc.Component {
    @property(cc.Sprite)
    fight3v3Sp: cc.Sprite = null;
    @property(cc.Button)
    fight1v1Btn: cc.Button = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    blockSp: cc.Sprite = null;

    onLoad () {
        CommonUtils.grey(this.fight3v3Sp);
    }

    start () {
        let _this = this;
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.fight3v3Sp.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage('3V3模式将于近期开放，敬请留意公告~');
        });
        this.fight1v1Btn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            _this.closePanel();
            let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightPanel', KingsFightPanel) as KingsFightPanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        });
        this.blockSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}