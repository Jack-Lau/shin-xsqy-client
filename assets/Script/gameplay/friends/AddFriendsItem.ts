import FriendsData, { FriendsItemData } from "./FriendsData";
import Optional from "../../cocosExtend/Optional";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
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
export default class AddFriendsItem extends cc.Component {

    @property(cc.Sprite)
    iconHead: cc.Sprite = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    idLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Button)
    applyBtn: cc.Button = null;
    @property(cc.Node)
    appliedNode: cc.Node = null;


    detail: Optional<PlayerBaseInfo> = null;
    // onLoad () {}

    start() {
        this.applyBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toApply.bind(this)));
    }

    async init(data: Optional<PlayerBaseInfo>) {
        this.detail = data;
        this.appliedNode.active = false;
        this.applyBtn.node.active = true;
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(this.detail.fmap(x => x.schoolId));
        this.iconHead.spriteFrame = await ResUtils.getPlayerRectIconById(this.detail.fmap(x => x.player).fmap(x => x.prefabId).getOrElse(4000001));
        this.levelLabel.string = this.detail.fmap(x => x.player).fmap(x => x.playerLevel).getOrElse(0).toString();
        this.nameLabel.string = this.detail.fmap(x => x.player).fmap(x => x.playerName).getOrElse('');
        this.idLabel.string = this.detail.fmap(x => x.player).fmap(x => x.accountId).getOrElse(0).toString();
        this.fcLabel.string = this.detail.fmap(x => x.player).fmap(x => x.fc).getOrElse(0).toString();
    }

    async toApply() {
        let id = this.detail.fmap(x => x.player).fmap(x => x.accountId);
        if (id.isValid()) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/friend/apply', [id.getValue()]) as any;
            if (response.status === 0) {
                this.appliedNode.active = true;
                this.applyBtn.node.active = false;
            }else if(response.status === 2101) {
                this.appliedNode.active = true;
                this.applyBtn.node.active = false;
            }
        }

    }
}
