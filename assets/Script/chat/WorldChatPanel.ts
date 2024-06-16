import { MovieclipUtils } from "../utils/MovieclipUtils";
import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";
import MyChatItem from "./MyChatItem";
import SystemChatItem from "./SystemChatItem";
import { Chat, ChannelMode } from "./Chat";
import ItemConfig from "../bag/ItemConfig";
import { ChatMessageComplex } from "../net/Protocol";
import { SimpleBehaviorSubject } from "../base/SimpleBehaviorSubject";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WorldChatPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    sendBtn: cc.Button = null;

    @property(cc.Button)
    bqBtn: cc.Button = null;

    @property(cc.EditBox)
    input: cc.EditBox = null;

    @property(cc.Sprite)
    bqGroup: cc.Sprite = null;

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Sprite)
    hide: cc.Sprite = null;

    @property(cc.Prefab)
    myChatItem: cc.Prefab = null;

    @property(cc.Prefab)
    otherChatItem: cc.Prefab = null;

    @property(cc.Prefab)
    systemChatItem: cc.Prefab = null;

    @property([cc.Sprite])
    emojiArr: Array<cc.Sprite> = [];

    @property(cc.Sprite)
    unreadBg: cc.Sprite = null;

    @property(cc.Label)
    unreadLabel: cc.Label = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    bgBg: cc.Sprite = null;

    @property(cc.ToggleContainer)
    channelToggle: cc.ToggleContainer = null

    from: cc.Node = null;
    isLock: boolean = true;
    indexes: {[key: string]: number} = {
        "All": -1,
        "World": -1,
        "System": -1
    };
    msgLength: number = 0;
    currentMsgTime: number = 0;
    chatMessage = [];
    static lastSendTimestamp: number = 0;

    channelMode: SimpleBehaviorSubject<ChannelMode> = new SimpleBehaviorSubject("All")

    start () {
        this.currentMsgTime = 0;
        this.onNewMsg = this.doOnNewMsg.bind(this);

        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.bqBtn.node.on(cc.Node.EventType.TOUCH_END, this.showBq.bind(this));
        this.hide.node.on(cc.Node.EventType.TOUCH_END, this.hideBq.bind(this));
        this.sendBtn.node.on(cc.Node.EventType.TOUCH_END, this.sendMsg.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.bgBg.node.on(cc.Node.EventType.TOUCH_END, function() {
            this.bqGroup.node.active = false;
        }.bind(this));

        this.channelToggle.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchMode("All").bind(this));
        this.channelToggle.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchMode("System").bind(this));
        this.channelToggle.toggleItems[2].node.on(cc.Node.EventType.TOUCH_END, this.switchMode("World").bind(this));

        this.channelMode.subscribe(mode => this.renderMessage(mode))

        // this.scroll.node.on('scroll-to-bottom', this.showNewMessage.bind(this));
        // this.scroll.node.on('scroll-to-top', this.showOldMessage.bind(this));
        this.scroll.node.on('scroll-ended', function() {
            let delta = this.scroll.content.height - 635 + 317.5 - (this.scroll.getContentPosition() as cc.Vec2).y;
            if (delta < 4) {
                this.showNewMessage();
            } else if ((this.scroll.getContentPosition() as cc.Vec2).y < 320) {
                this.showOldMessage();
            }
            let num = Chat.ChatManager.getInstance().getUnreadMsgNum(this.channelMode.value);
            if (num > 0) {
                this.unreadLabel.string = num.toString();
            } else {
                this.unreadBg.node.active = false;
            }
            
        }.bind(this));
        this.unreadBg.node.on(cc.Node.EventType.TOUCH_END, () => this.showLastestMessage.bind(this)(this.channelMode.value));

        for (let i = 0; i < this.emojiArr.length; ++i) {
            this.emojiArr[i].node.on(cc.Node.EventType.TOUCH_END, this.emojiOnClock(i).bind(this));
        }

        EventDispatcher.on(Notify.CHAT_NEW_MSG, this.onNewMsg);
        this.bqGroup.node.active = false;

        this.updateTime();
        this.schedule(this.updateTime, 1);
    }

    switchMode(mode: ChannelMode) {
        return () => {
            if (mode === this.channelMode.value) {
                return
            }
            this.indexes = {
                "All": -1,
                "World": -1,
                "System": -1
            }
            this.channelMode.add(mode)
        }
    }

    renderMessage(mode: ChannelMode) {
        this.showLastestMessage(mode);
    }

    showNewMessage() {
        const newMessage = Chat.ChatManager.getInstance().getMoreMsg(this.channelMode.value);
        if (newMessage.length == 0) {
            return;
        }
        const showMsg = this.showMsg.bind(this);
        this.msgLength += newMessage.length;

        CommonUtils.reverse(newMessage).forEach(msg => {
            showMsg(msg);
        });
    }

    showOldMessage() {
        const oldMessage = Chat.ChatManager.getInstance().getOldMessage(this.channelMode.value);
        if (oldMessage.length == 0) {
            return;
        }
        this.msgLength += oldMessage.length;
        const showMsg = this.showMsg.bind(this);
        oldMessage.forEach(msg => {
            showMsg(msg, true);
        });
        this.scroll.scrollToPercentVertical((this.msgLength - oldMessage.length) / this.msgLength);
    }

    emojiOnClock(index) {
        return function() {
            let str = this.idToEmojiText(index + 1);
            this.input.string += str;
        }.bind(this);
    }

    showMsg(msg: ChatMessageComplex, isOld = false) {
        let content = '';
        let emojiIdArr = [];
        let showTime = false;

        if (this.currentMsgTime == 0) {
            this.currentMsgTime = R.path(['chatMessage', 'eventTime'], msg);
        } else {
            showTime = R.path(['chatMessage', 'eventTime'], msg) - this.currentMsgTime > 3 * 60 * 1000;
            this.currentMsgTime = R.path(['chatMessage', 'eventTime'], msg);
        }

        let extraParams = {};
        msg.chatMessage.elements.forEach(item => {
            if (item.type == "TEXT") {
                content += item.content;
            } else if (item.type == "EMOTICON") {
                content += "<img src='emoji' height=40 width=60 align=center/>";
                emojiIdArr.push(item.content);
            } else if (item.type == "TEMPLATE") {
                // content += item.content;
                if (Chat.ChatManager.getInstance().broadcastConfig) {
                    let config = Chat.ChatManager.getInstance().broadcastConfig[item.content.id];
                    let description = R.clone(config.talkDescription)
                    if (description.indexOf('${equipment:EquipmentName}') == -1) {
                        content += CommonUtils.replaceArr(description, item.content.args);
                        extraParams = item.content.args;
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
						content = CommonUtils.replaceArr(content, item.content.args);
                    }
                }
            }
        });
        if (msg.senderPlayer && msg.senderPlayer.player.accountId == PlayerData.getInstance().accountId) {
            let chatItem = cc.instantiate(this.myChatItem).getComponent(MyChatItem) as MyChatItem;
            chatItem.contentRichText.string = content;
            chatItem.node.x = 0;
            chatItem.init(emojiIdArr, msg.senderPlayer, R.path(['chatMessage', 'eventTime'], msg));
            if (isOld) {
                chatItem.node.zIndex = this.indexes[this.channelMode.value]
                this.indexes[this.channelMode.value] -= 1
            } else {
                chatItem.node.zIndex = this.scroll.content.children.length
            }
            chatItem.timeBg.node.active = showTime;
            chatItem.node.height = showTime ? 170 : 140;
            chatItem.node.parent = this.scroll.content;
        } else if (msg.chatMessage.systemMessage) {
            let chatItem = cc.instantiate(this.systemChatItem).getComponent(SystemChatItem) as SystemChatItem;
            chatItem.init(content, msg.chatMessage.broadcastId, extraParams);
            if (isOld) {
                chatItem.node.zIndex = this.indexes[this.channelMode.value]
                this.indexes[this.channelMode.value] -= 1
            } else {
                chatItem.node.zIndex = this.scroll.content.children.length
            }
            chatItem.node.x = 0;
            chatItem.node.parent = this.scroll.content;
        } else {
            let chatItem = cc.instantiate(this.otherChatItem).getComponent(MyChatItem) as MyChatItem;
            chatItem.contentRichText.string = content;
            if (isOld) {
                chatItem.node.zIndex = this.indexes[this.channelMode.value]
                this.indexes[this.channelMode.value] -= 1
            } else {
                chatItem.node.zIndex = this.scroll.content.children.length
            }
            chatItem.init(emojiIdArr, msg.senderPlayer, R.path(['chatMessage', 'eventTime'], msg));
            chatItem.node.x = 0;
            chatItem.timeBg.node.active = showTime;
            chatItem.node.height = showTime ? 170 : 140;
            chatItem.node.parent = this.scroll.content;
        }
    }

    onNewMsg() {
    }

    doOnNewMsg (event: EventDispatcher.NotifyEvent) {
        // 只有当当前显示的最新一条消息为最新消息
        // 且在最底部时，方可自动添加信息
        let isNewest = Chat.ChatManager.getInstance().isNewest(this.channelMode.value);

        let delta = this.scroll.content.height - 695 + 317.5 - this.scroll.getContentPosition().y;
        const isBottom = delta < 4

        if (!isBottom || !isNewest) {
            const num =  Chat.ChatManager.getInstance().getUnreadMsgNum(this.channelMode.value)
            this.unreadBg.node.active = num > 0;
            this.unreadLabel.string = `${num}`;
            return;
        }

        this.showMsg(event.detail.msg);
        this.msgLength++;
        Chat.ChatManager.getInstance().showOneMsg(this.channelMode.value);

        if (this.scroll.content.height > 600) {
            this.scroll.scrollToPercentVertical(0);
        }
    }

    async showLastestMessage(mode: ChannelMode) {
        this.unreadBg.node.active = false;
        this.scroll.content.removeAllChildren();
        let msgArr = Chat.ChatManager.getInstance().getLatestCommonChatMsg(mode);
        this.msgLength = msgArr.length;
        this.chatMessage = msgArr;
        let showMsg = this.showMsg.bind(this);
        const arr = CommonUtils.reverse(msgArr)
        arr.forEach(msg => showMsg(msg));
        await CommonUtils.wait(0.1);
        if (this.scroll.content.height > 695) {
            this.scroll.scrollToPercentVertical(0);
        }
    }

    async sendMsg() {
        if (PlayerData.getInstance().playerLevel < 30) {
            TipsManager.showMessage('少侠等级不足30，赶紧去完成主线任务升级吧')
            return;
        }
        let msg = this.input.string;
        if (msg == "") {
            return;
        }
        
        let emojiArr = msg.match(/\[.*?\]/g);
        let msgArr = msg.split(/\[.*?\]/g);
        let length = msgArr.join('').length
        if (emojiArr) {
            length += emojiArr.length * 3;
        }
        
        if (length > 24) {
            TipsManager.showMessage('输入文字太多');
            return;
        }
        
        let elements = [];
        if (emojiArr) {
            NetUtils.zipWith((a, b) => { return [a, b];}, msgArr, emojiArr).forEach(item => {
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
            "broadcast": true,
            "elements": elements.filter(item => {
                return item["content"] != "";
            })
        };
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, '/chat/sendMessage', [], json) as any;
        if (response.status == 0) {
            this.bqGroup.node.active = false;
            this.input.string = "";
            TipsManager.showMessage('消息发送成功');
            WorldChatPanel.lastSendTimestamp = (new Date()).getTime();
            this.updateTime();
            this.showLastestMessage(this.channelMode.value);
        }
    }

    updateTime() {
        let timestamp = (new Date()).getTime();
        let delta = Math.floor((timestamp - WorldChatPanel.lastSendTimestamp) / 1000);
        if (delta < 20) {
            this.input.placeholder = (20 - delta) + '秒后可发言';
        } else {
            this.input.placeholder = "点击输入发言";
        }
    }

    showBq() {
        this.bqGroup.node.active = !this.bqGroup.node.active;
    }

    hideBq() {
        this.bqGroup.node.active = false;
    }

    closePanel() {
        this.unschedule(this.updateTime);
        EventDispatcher.off(Notify.CHAT_NEW_MSG, this.onNewMsg);
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }

    ////////////////////////////////////////

    ///////////////////////////////////////
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
        "[尴尬]":12,
        "[鄙视]": 13,
        "[寒]": 14,
        "[强]": 15,
        "[吐]":16
    }

    idToEmojiText(id: number) {
        for (let key in this.emojiTextToId) {
            if (this.emojiTextToId[key] == id) {
                return key;
            }
        } 
    }


    // update (dt) {}
}
