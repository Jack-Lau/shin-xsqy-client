import FriendsData, { FriendsItemData } from "./FriendsData";
import Optional from "../../cocosExtend/Optional";
import { ResUtils } from "../../utils/ResUtils";
import { PlayerBaseInfo } from "../../net/Protocol";
import FriendsChatPanel from "./FriendsChatPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

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
export default class ContactItem extends cc.Component {

    @property(cc.Sprite)
    iconHead: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Toggle)
    toggle: cc.Toggle = null;
    toggleContainer: cc.ToggleContainer = null;
    item: Optional<FriendsItemData> = null;

    from: FriendsChatPanel = null;
    // onLoad () {}

    start() {
        this.toggleContainer = this.node.parent.getComponent(cc.ToggleContainer);
        this.toggle.node.on(cc.Node.EventType.TOUCH_END, this.onSelected.bind(this));

    }

    async init(data: Optional<FriendsItemData>, from) {
        this.from = from;
        this.item = data;
        let detail = new Optional<PlayerBaseInfo>(this.item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).getOrElse({} as PlayerBaseInfo));
        this.iconHead.spriteFrame = await ResUtils.getPlayerRectIconById(detail.fmap(x => x.player).fmap(x => x.prefabId).getOrElse(4000001));
        this.nameLabel.string = detail.fmap(x => x.player).fmap(x => x.playerName).getOrElse('');
        if (this.from.selectAccountId === detail.fmap(x => x.player).fmap(x => x.accountId).getOrElse(0)) {
            this.onSelected();
        } else {
            this.toggle.isChecked = false;
        }
    }

    async onSelected() {
        this.toggle.isChecked = true;
        let detail = new Optional<PlayerBaseInfo>(this.item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).getOrElse({} as PlayerBaseInfo));
        if (this.from.selectAccountId === detail.fmap(x => x.player).fmap(x => x.accountId).getOrElse(0)) {
            return;
        }
        this.from.updateChatContent(detail.fmap(x => x.player).fmap(x => x.accountId).getOrElse(0));

    }

    toDestroy() {

        
    }
}
