import FriendsData from "../friends/FriendsData";
import { PlayerBaseInfo } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class DigOreFriendItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    numberLabel: cc.Label = null;

    id = 0;
    data: PlayerBaseInfo = null;
    start(){
        this.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
    }

    async init(id: number, num: number) {
        this.data = null;
        this.numberLabel.string = num.toString();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [id]) as any;
        if (response.status === 0) {
            this.data  = response.content[0];
        }
        if (this.data  != null) {
            this.icon.spriteFrame = await ResUtils.getPlayerRectIconById(this.data.player.prefabId);
            this.nameLabel.string = this.data.player.playerName;
        }
    }
    async openTips(event: cc.Event.EventTouch) {
        let detail = new Optional<PlayerBaseInfo>(this.data);
        if (detail.isValid()) {
            CommonUtils.showViewPlayerBox(detail.getValue());
        }
    }
}
