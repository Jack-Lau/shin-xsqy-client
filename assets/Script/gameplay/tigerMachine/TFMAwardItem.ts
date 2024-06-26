import FriendsData from "../friends/FriendsData";
import Optional from "../../cocosExtend/Optional";
import { PlayerBaseInfo } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";

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
export default class TFMAwardItem extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    bg1: cc.Node = null;
    @property(cc.Node)
    bg2: cc.Node = null;
    // onLoad () {}

    async init(index = 0, id: number) {
        let player = new Optional<PlayerBaseInfo>(null);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [id]) as any;
        if (response.status === 0) {
            player = new Optional<PlayerBaseInfo>(response.content[0]);
        }
        this.label.string = player.fmap(x => x.player).fmap(x => x.playerName).getOrElse('101');
        if (index % 2 == 0) {
            this.bg1.active = true;
            this.bg2.active = false;

        } else {
            this.bg1.active = false;
            this.bg2.active = true;

        }
    }

    // update (dt) {}
}
