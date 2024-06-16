import { PlayerDetail, PlayerBaseInfo } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import FriendsData, { FriendsItemData } from "./FriendsData";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import FriendsChatPanel from "./FriendsChatPanel";
import FriendsPanel from "./FriendsPanel";

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
export default class FriendsItem extends cc.Component {

    @property(cc.Sprite)
    iconHead: cc.Sprite = null;
    @property(cc.Node)
    newIcon: cc.Node = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    msgLabel: cc.Label = null;
    @property(cc.Label)
    stateLabel: cc.Label = null;
    @property(cc.Button)
    detailsBtn: cc.Button = null;
    @property(cc.Node)
    titleNode: cc.Node = null;

    item: Optional<FriendsItemData> = null;
    from: FriendsPanel = null;
    start() {
        this.detailsBtn.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openChat.bind(this)));
        EventDispatcher.on(Notify.UPDATA_MY_FRIENDS_LASTMSG, this.eventsetLastMsg);
    }

    eventsetLastMsg = function () {
        this.setLastMsg();
    }.bind(this);


    async init(from, data: Optional<FriendsItemData>) {
        if (!cc.isValid(this.node)) {
            return;
        }
        this.from = from;
        this.item = data;
        let detail = new Optional<PlayerBaseInfo>(this.item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).getOrElse({} as PlayerBaseInfo));
        this.newIcon.active = this.item.fmap(x => x.new).getOrElse(false);

        this.levelLabel.string = detail.fmap(x => x.player).fmap(x => x.playerLevel).getOrElse(0).toString();
        this.nameLabel.string = detail.fmap(x => x.player).fmap(x => x.playerName).getOrElse('');
        let spriteFrame = await ResUtils.getPlayerRectIconById(detail.fmap(x => x.player).fmap(x => x.prefabId).getOrElse(4000001));

        if (!cc.isValid(this.iconHead)) {
            return;
        } else {
            this.iconHead.spriteFrame = spriteFrame;
        }

        this.titleNode.active = this.item.fmap(x => x.unread).getOrElse(false);
        this.setLastMsg();

        if (this.item.fmap(x => x.friend).fmap(x => x.online).getOrElse(true)) {
            this.stateLabel.node.color = cc.color(82, 132, 18);
            this.stateLabel.string = '在线';
        } else {
            this.stateLabel.node.color = cc.color(125, 125, 125);
            this.stateLabel.string = '离线';
            let timestamp = new Date().getTime();
            let points = (timestamp - detail.fmap(x => x.player).fmap(x => x.lastLoginTime as any).getOrElse(new Date().getTime())) / 1000 / 60;
            this.stateLabel.string = `离线${Math.ceil(points)}分钟`;
            if (points >= 60) {
                let hours = points / 60;
                this.stateLabel.string = `离线${Math.floor(hours)}小时`;
                if (hours >= 24) {
                    this.stateLabel.string = `离线1天以上`;
                }
            }
        }

    }

    idToEmojiText(id: number) {
        for (let key in this.emojiTextToId) {
            if (this.emojiTextToId[key] == id) {
                return key;
            }
        }
    }
    emojiTextToId = {
        "[开心]": 1,
        "[发怒]": 2,
        "[流汗]": 3,
        "[滑稽]": 4,
        "[流口水]": 5,
        "[点头]": 6,
        "[惊讶]": 7,
        "[哭]": 8,
        "[再见]": 9,
        "[不开心]": 10,
        "[瘪嘴]": 11,
        "[尴尬]": 12,
        "[鄙视]": 13,
        "[寒]": 14,
        "[强]": 15,
        "[吐]": 16
    }
    setLastMsg() {
        let msgs = this.item.fmap(x => x.msgs).getOrElse([]);
        if (msgs.length > 0) {
            let msgList = msgs[msgs.length - 1].chatMessage.elements;
            let lastMsg = '';
            msgList.forEach((item) => {
                if (item.type == "EMOTICON") {
                    lastMsg += this.idToEmojiText(item.content);

                } else {
                    lastMsg += item.content;
                }

            });

            this.msgLabel.string = lastMsg;
        } else {
            this.msgLabel.string = '';
        }
    }

    async openTips(event: cc.Event.EventTouch) {
        let detail = new Optional<PlayerBaseInfo>(this.item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).getOrElse({} as PlayerBaseInfo));
        if (detail.isValid()) {
            CommonUtils.showViewPlayerBox(detail.getValue());
        }
    }

    async openChat() {
        if (this.item.isValid()) {
            let ID = this.item.getValue().friend.playerBaseInfo.player.accountId;
            this.from.node.active = false;
            this.from.isInThis = false;
            await FriendsData.getInstance().privateChat(this.item.getValue());
            let panel = await CommonUtils.getPanel('gameplay/friends/FriendsChatPanel', FriendsChatPanel) as FriendsChatPanel;
            panel.init(ID);
            panel.from = this.from;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    onDestroy() {
        EventDispatcher.off(Notify.UPDATA_MY_FRIENDS_LASTMSG, this.eventsetLastMsg);
    }
}
