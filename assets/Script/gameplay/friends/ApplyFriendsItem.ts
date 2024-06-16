import Optional from "../../cocosExtend/Optional";
import FriendsData, { FriendsItemData } from "./FriendsData";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { PlayerBaseInfo, Friend } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import ApplyFriendsPanel from "./ApplyFriendsPanel";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";

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
export default class ApplyFriendsItem extends cc.Component {

    @property(cc.Sprite)
    iconHead: cc.Sprite = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Button)
    refusedBtn: cc.Button = null;
    @property(cc.Button)
    agreedBtn: cc.Button = null;

    detail: Optional<PlayerBaseInfo> = null;
    item: Friend = null;

    from: ApplyFriendsPanel = null;
    // onLoad () {}

    start() {
        this.refusedBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toApply.bind(this, false)));
        this.agreedBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toApply.bind(this, true)));
    }


    async init(from: ApplyFriendsPanel, data: Friend) {
        if (data == null) {
            return;
        }
        this.from = from;
        this.item = data;
        this.detail = new Optional<PlayerBaseInfo>(data.playerBaseInfo);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(this.detail.fmap(x => x.schoolId));
        this.iconHead.spriteFrame = await ResUtils.getPlayerRectIconById(this.detail.fmap(x => x.player).fmap(x => x.prefabId).getOrElse(4000001));
        this.levelLabel.string = this.detail.fmap(x => x.player).fmap(x => x.playerLevel).getOrElse(0).toString();
        this.nameLabel.string = this.detail.fmap(x => x.player).fmap(x => x.playerName).getOrElse('');
        this.fcLabel.string = this.detail.fmap(x => x.player).fmap(x => x.fc).getOrElse(0).toString();
    }

    async toApply(agreed: boolean) {
        let id = this.detail.fmap(x => x.player).fmap(x => x.accountId);
        if (this.item != null && id.isValid()) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/friend/handle', [id.getValue(), agreed]) as any;
            if (response.status === 0) {            
                if (response.content) {
                    let data = {} as FriendsItemData;
                    data.friend = this.item;
                    data.recordTime = this.item.playerBaseInfo.player.lastLoginTime as any;
                    FriendsData.getInstance().addMyFriends(data);
                }
                await FriendsData.getInstance().delApplyFriends(this.item);
            }
        }

    }
}
