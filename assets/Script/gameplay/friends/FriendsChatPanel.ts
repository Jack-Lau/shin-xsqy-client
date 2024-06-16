import { CommonUtils } from "../../utils/CommonUtils";
import FriendsData, { FriendsItemData, FriendsMsg } from "./FriendsData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import FriendsPanel from "./FriendsPanel";
import ContactItem from "./ContactItem";
import Optional from "../../cocosExtend/Optional";
import { Chat } from "../../chat/Chat";
import ItemConfig from "../../bag/ItemConfig";
import { NetUtils } from "../../net/NetUtils";
import MyChatItem from "../../chat/MyChatItem";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { PlayerBaseInfo } from "../../net/Protocol";
import KBWheelAwardItem from "../kbwheel/KBWheelAwardItem";

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
export default class FriendsChatPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    contactScrollView: cc.ScrollView = null;
    @property(cc.ScrollView)
    chatScrollView: cc.ScrollView = null;

    @property(cc.Node)
    expressionNode: cc.Node = null;
    @property(cc.Node)
    packUpNode: cc.Node = null;
    @property(cc.Button)
    expressionBtn: cc.Button = null;
    @property(cc.Button)
    sendBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property([cc.Sprite])
    emojiArr: Array<cc.Sprite> = [];

    @property(cc.Prefab)
    contactPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    chatMyPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    chatOtherPrefab: cc.Prefab = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Node)
    contentNode: cc.Node = null;
    /**当前聊天的好友 */
    selectAccountId: number = 0;

    from: FriendsPanel = null;

    contactList: ContactItem[] = [];
    chatList: MyChatItem[] = [];
    page = 0;
    pageNumber = 10;

    lastMsgTime = 0;

    showChatNumber = 10;
    currentMsgs: FriendsMsg[] = null;
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
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        if (FriendsData.getInstance().chatfriendsData.length > 0) {
            this.emptyNode.active = false;
            this.contentNode.active = true;
            this.initEvents();
        } else {
            this.emptyNode.active = true;
            this.contentNode.active = false;
        }
    }

    initEvents() {
        this.packUpNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.expressionNode.active = false;
        });
        this.expressionBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.expressionNode.active = true;
        });
        this.sendBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSendBtn.bind(this)));
        this.contactScrollView.node.on('scroll-to-bottom', CommonUtils.aloneFunction(this.addItem.bind(this)));
        this.chatScrollView.node.on('bounce-top', CommonUtils.aloneFunction(this.scrollAddChatContent.bind(this)));
        for (let i = 0; i < this.emojiArr.length; ++i) {
            this.emojiArr[i].node.on(cc.Node.EventType.TOUCH_END, this.emojiOnClock(i).bind(this));
        }

        EventDispatcher.on(Notify.UPDATA_FRIEND_CHAT_NEW_MSG, this.eventChat);
        EventDispatcher.on(Notify.FRIEND_CHAT_LIST, this.eventInit);
    }

    eventInit = function () {
        this.updateListData();
    }.bind(this);

    eventChat = function (event) {
        if (event.detail.id === this.selectAccountId) {
            this.updateChatContent(this.selectAccountId, false);
        }
    }.bind(this);


    async init(selectAccountId: number = 0) {
        this.expressionNode.active = false;
        this.selectAccountId = selectAccountId;
        let chatfriendsData = FriendsData.getInstance().chatfriendsData;
        if (chatfriendsData.length <= 0) {
            return;
        }
        this.contactList = [];
        CommonUtils.wait(0.1);
        this.addItem();
        if (this.selectAccountId == 0) {
            this.updateChatContent(chatfriendsData[0].friend.playerBaseInfo.player.accountId);
        } else {
            this.updateChatContent(this.selectAccountId);
        }

    }

    emojiOnClock(index) {
        return function () {
            let str = this.idToEmojiText(index + 1);
            this.editBox.string += str;
        }.bind(this);
    }

    idToEmojiText(id: number) {
        for (let key in this.emojiTextToId) {
            if (this.emojiTextToId[key] == id) {
                return key;
            }
        }
    }

    async addItem() {
        let chatfriendsData = FriendsData.getInstance().chatfriendsData;
        let filterFunc = (element) => {
            let indexOf = chatfriendsData.indexOf(element);
            if ((indexOf >= this.page * this.pageNumber) && (indexOf < (this.page + 1) * this.pageNumber)) {
                return true;
            }
            return false;
        };
        let items = R.filter(filterFunc, chatfriendsData) as FriendsItemData[];

        items.forEach((itemData) => {
            let itemNode = cc.instantiate(this.contactPrefab);
            itemNode.parent = this.contactScrollView.content;
            let item = itemNode.getComponent(ContactItem);
            item.init(new Optional<FriendsItemData>(itemData), this);
            this.contactList.push(item);
        });

        if (items.length > 0) {
            this.page += 1;
        }
    }

    updateListData() {
        let chatfriendsData = FriendsData.getInstance().chatfriendsData;
        this.contactList.forEach((itemData, index) => {
            itemData.init(new Optional<FriendsItemData>(chatfriendsData[index]), this);
        });
    }

    async scrollAddChatContent() {   
        if (this.showChatNumber >= this.currentMsgs.length) {
            return;
        }
        this.chatScrollView.enabled = false;
        this.showChatNumber += 10;
        let scrollTo = 10 / this.showChatNumber;   
        await this.initChatList();
        this.scheduleOnce(function () {
            this.chatScrollView.scrollToPercentVertical(1-scrollTo);
        }, 0.1);
        await CommonUtils.wait(0.2);
        this.chatScrollView.enabled = true;
    }

    getShowMsg(msgs: FriendsMsg[]) {
        let index = msgs.length - this.showChatNumber;
        if (index < 0) {
            index = 0;
        }
        let filterFunc = (element) => {
            let indexOf = msgs.indexOf(element);
            if ((indexOf >= index) && (indexOf < msgs.length)) {
                return true;
            }
            return false;
        };
        let items = R.filter(filterFunc, msgs) as FriendsMsg[];
        return items;
    }

    async initChatList() {
        let msgs = this.getShowMsg(this.currentMsgs);
        this.chatList.forEach((itemData) => {
            itemData.node.destroy();
        });
        this.chatList = [];
        msgs.forEach(async (itemData, index) => {
            let itemNode;
            if (itemData.isMy) {
                itemNode = cc.instantiate(this.chatMyPrefab);
            } else {
                itemNode = cc.instantiate(this.chatOtherPrefab);
            }

            itemNode.parent = this.chatScrollView.content;
            let item = itemNode.getComponent(MyChatItem);
            await this.setChatContent(itemData, item);
            this.chatList.push(item);
        });

    }

    async updateChatContent(accountId: number, isInit = true) {
        this.selectAccountId = accountId;
        this.currentMsgs = FriendsData.getInstance().showFriendMsg(accountId);
        if (isInit) {
            this.showChatNumber = 10;
            await this.initChatList();
        } else {
            this.showChatNumber += 1;
            let msgs = this.getShowMsg(this.currentMsgs);
            let itemNode;
            let itemData = msgs[this.chatList.length];
            if (itemData.isMy) {
                itemNode = cc.instantiate(this.chatMyPrefab);
            } else {
                itemNode = cc.instantiate(this.chatOtherPrefab);
            }
            itemNode.parent = this.chatScrollView.content;
            let item = itemNode.getComponent(MyChatItem);
            this.setChatContent(itemData, item);
            this.chatList.push(item);
        }
        this.scheduleOnce(function () {
            this.chatScrollView.scrollToBottom(0.1);
        }, 0.1);

    }

    async setChatContent(msg: FriendsMsg, item: MyChatItem) {
        let content = '';
        let emojiIdArr = [];
        let showTime = false;

        msg.chatMessage.elements.forEach(item => {
            if (this.lastMsgTime == 0) {
                showTime = true;

            } else {
                if (((msg.chatMessage.eventTime as any) - this.lastMsgTime) > 60 * 1000 * 5) {
                    showTime = true;
                } else {
                    showTime = false;
                }
            }
            this.lastMsgTime = msg.chatMessage.eventTime as any;
            if (item.type == "TEXT") {
                content += item.content;
            } else if (item.type == "EMOTICON") {
                content += '<img src="emoji"/>';
                emojiIdArr.push(item.content);
            } else if (item.type == "TEMPLATE") {
                // content += item.content;
                if (Chat.ChatManager.getInstance().broadcastConfig) {
                    let config = Chat.ChatManager.getInstance().broadcastConfig[item.content.id];
                    let description = R.clone(config.talkDescription)

                    if (description.indexOf('${equipment:EquipmentName}') == -1) {
                        content += CommonUtils.replaceArr(description, item.content.args);
                    } else {
                        let name = 'equipment';
                        let pid = item.content.args[name + '_definitionId'];
                        let prefabId = item.content.args[name + '_playerPrefabId'];
                        let display = ItemConfig.getInstance().getItemDisplayById(pid, prefabId);
                        let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(pid);
                        description = description.replace('${playerName}', item.content.args['playerName'])
                        if (display.isValid() && prototype.isValid()) {
                            let color = CommonUtils.getForgeColorByQuality(prototype.getValue().quality);
                            content = description.replace('${equipment:EquipmentName}', '<color=' + color + '>' + display.getValue().name + '</color>');
                        }
                    }
                }
            }
        });
        let player: PlayerBaseInfo;
        if (!msg.isMy) {
            player = FriendsData.getInstance().getChatFriendsByID(msg.chatMessage.senderId).getValue().friend.playerBaseInfo;
        } else {
            player = FriendsData.getInstance().myBaseInfo;
        }
        item.node.height = showTime ? 170 : 140;
        item.contentRichText.string = content;
        item.timeBg.node.active = showTime;
        await item.init(emojiIdArr, player, R.path(['chatMessage', 'eventTime'], msg));

    }

    async onSendBtn() {
        let msg = this.editBox.string;
        if (msg == "") {
            return;
        }
        if (msg.length > 24) {
            TipsManager.showMessage('输入文字太多');
            return;
        }

        let emojiArr = msg.match(/\[.*?\]/g);
        let msgArr = msg.split(/\[.*?\]/g);
        let length = msgArr.join('').length
        if (emojiArr) {
            length += emojiArr.length * 3;
        }

        let elements = [];
        if (emojiArr) {
            NetUtils.zipWith((a, b) => { return [a, b]; }, msgArr, emojiArr).forEach(item => {
                let text = item[0];
                let emoji = item[1];
                elements.push({
                    "type": "TEXT",
                    "content": text
                });
                if (this.emojiTextToId[emoji]) {
                    elements.push({
                        "type": "EMOTICON",
                        "content": this.emojiTextToId[emoji]
                    });
                } else {
                    elements.push({
                        "type": "TEXT",
                        "content": emoji
                    });
                }

            });
        }
        elements.push({
            "type": "TEXT",
            "content": msgArr[0]
        });

        let json = {
            "systemMessage": false,
            "broadcast": false,
            "receiverId": this.selectAccountId,
            "elements": elements.filter(item => {
                return item["content"] != "";
            })
        };
        NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, '/chat/sendMessage', [], json) as any;
        this.expressionNode.active = false;
        this.editBox.string = "";

    }

    closePanel() {
        if (this.from != null) {
            this.from.node.active = true;
            this.from.isInThis = true;
        }
        this.contactList.forEach((itemData, index) => {
            itemData.toDestroy();
        });
        EventDispatcher.off(Notify.FRIEND_CHAT_LIST, this.eventInit);
        EventDispatcher.off(Notify.UPDATA_FRIEND_CHAT_NEW_MSG, this.eventChat);
        EventDispatcher.dispatch(Notify.UPDATA_MY_FRIENDS, {});
        CommonUtils.safeRemove(this.node);
    }

}
