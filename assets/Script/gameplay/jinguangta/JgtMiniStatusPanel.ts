import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";
import NpcConfig from "../../config/NpcConfig";
import { QuestManager } from "../../quest/QuestManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import JgtManager from "./JgtManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class JgtMiniStatus extends cc.Component {
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    @property(cc.Sprite)
    unfinishedFlag: cc.Sprite = null;
    @property(cc.Sprite)
    finishedFlag: cc.Sprite = null;

    npcId: number = 0;
    isComplete = false;
    readonly jgtMapId = 200;
    
    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.nodeOnClick.bind(this));
        EventDispatcher.on(Notify.MAP_CHANGED, this.onMapChanged);
    }
    
    async init() {
        this.npcId = JgtManager.getInstance().getCurrentRoomNpcId();
        let roomId = JgtManager.getInstance().roomPrototypeId;
        let roomConfig = R.prop(roomId, JgtManager.getInstance().roomConfig);
        this.levelLabel.string = "层数 " + JgtManager.getInstance().level + "层";
        this.nameLabel.string = "房间 " + roomConfig["name"];
        this.descriptionLabel.string = roomConfig["challengeHint"];
        let complete = JgtManager.getInstance().isComplete();
        this.unfinishedFlag.node.active = !complete;
        this.finishedFlag.node.active = complete;
        this.isComplete = complete;
    }
    
    nodeOnClick() {
        if (this.isComplete) {
            TipsManager.showMessage("请选择传送门传送至下一层");
        } else {
            let npc = NpcConfig.getInstance().npcs[this.npcId];
            if (npc) {
                QuestManager.findJgtNpc(this.npcId);
            }
        }
    }
    
    onMapChanged = function(event: EventDispatcher.NotifyEvent) {
        let mapId = R.prop('mapId', event.detail);
        if (mapId && mapId != this.jgtMapId) {
            EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_RIGHT_DOWN_PANEL, {panelName: "JGT"});
        }
    }.bind(this);   
}
