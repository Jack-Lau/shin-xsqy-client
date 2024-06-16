import Optional from "../../cocosExtend/Optional";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { AntiqueOverall, PlayerDetail, PlayerBaseInfo, Friend, ChatMessage, PartyRecord } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import FriendsChatPanel from "./FriendsChatPanel";
import AddFriendsPanel from "./AddFriendsPanel";
import TeamManager from "../../player/TeamManager";


export interface FriendsItemData {
    friend: Friend;
    addTime: number;
    unread: boolean;
    new: boolean;
    recordTime: number;
    msgs: FriendsMsg[];
    priority: number;
}

export interface FriendsMsg {
    isMy: boolean;
    chatMessage: ChatMessage;
}

export default class FriendsData {
    myBaseInfo: PlayerBaseInfo = null;
    private myFriends: FriendsItemData[] = [];
    private applyFriends: Friend[] = [];
    chatfriendsData: FriendsItemData[] = [];
    private static _instance: FriendsData = null;

    public static getInstance() {
        if (this._instance == null) {
            this._instance = new FriendsData();
        }
        return this._instance;
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [PlayerData.getInstance().accountId]) as any;
        if (response.status === 0) {
            this.myBaseInfo = response.content[0];
            this.myBaseInfo.player.playerName = '我';
        }
        await this.toMyFriendsAll();
        await this.toApplyFriendsAll();
        await this.toChatFriendsAll();
        EventDispatcher.on(Notify.WEB_FRIEND_APPLY, this.eventApply.bind(this));
        EventDispatcher.on(Notify.WEB_FRIEND_PASS, this.eventPass.bind(this));
        EventDispatcher.on(Notify.FRIEND_CHAT_NEW_MSG, this.eventChatMsg.bind(this));
    }

    async eventApply(event) {
        await this.addApplyFriends(event.detail);
        EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: true });
    }

    async eventPass(event) {
        let friend = event.detail as Friend;
        let data = {} as FriendsItemData;
        data.friend = friend;
        data.recordTime = friend.playerBaseInfo.player.lastLoginTime as any;
        await this.addMyFriends(data);
    }

    async eventChatMsg(event) {
        let chatMsg = R.prop('chatMessage', event.detail);
        let msg: FriendsMsg = {} as FriendsMsg;
        msg.chatMessage = chatMsg;
        this.addFriendsMsg(msg);
        EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: true });
    }

    getNewMyfriendData(friend: Friend) {
        let item = {} as FriendsItemData;
        item.friend = friend;
        item.new = false;

        item.recordTime = item.friend.playerBaseInfo.player.lastLoginTime as any;
        item.unread = false;
        if (friend.lastChatMessage != null && item.msgs == null) {
            item.msgs = [];
            let msg: FriendsMsg = {} as FriendsMsg;
            msg.chatMessage = friend.lastChatMessage;
            msg.isMy = msg.chatMessage.senderId === PlayerData.getInstance().accountId;
            item.msgs.push(msg);
            if (msg.chatMessage.senderId == friend.playerBaseInfo.player.accountId && !item.friend.alreadyRead) {
                item.unread = true;
            }
        } else {
            item.msgs = [];
        }
        return item;
    }

    /**私聊消息变动 */
    async privateChat(item: FriendsItemData) {
        let index = -1;
        this.chatfriendsData.forEach((ele, indexOf) => {
            if (item.friend.playerBaseInfo.player.accountId == ele.friend.playerBaseInfo.player.accountId) {
                index = indexOf;
            }
        });
        let data = [];
        if (index != -1) {
            data = this.chatfriendsData.splice(index, 1);
            if (item.msgs.length <= 1 && data.length > 0) {
                //不保存初始化的内容。因为每次打开好友面板会初始化成只保存LastMsg的状态。
                this.chatfriendsData.unshift(data[0]);
            } else {
                this.chatfriendsData.unshift(item);
            }
        } else {
            this.chatfriendsData.unshift(await this.toConversation(item));
        }
        await this.updateMyFriendsData(this.chatfriendsData[0]);
        EventDispatcher.dispatch(Notify.FRIEND_CHAT_LIST, {});
    }

    async toConversation(item: FriendsItemData) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/private/conversation', [item.friend.playerBaseInfo.player.accountId, 0, 10]) as any;
        let itemData = item;
        if (response.status === 0) {
            let chatMessages = response.content as ChatMessage[];
            itemData.msgs = [];
            chatMessages.forEach((chatMessage) => {
                let msg: FriendsMsg = {} as FriendsMsg;
                msg.chatMessage = chatMessage;
                msg.isMy = msg.chatMessage.senderId === PlayerData.getInstance().accountId;

                itemData.msgs.push(msg);
            });
            itemData.msgs.reverse();
        }
        return itemData;

    }


    /**从服务器获取我的好友 */
    async toMyFriendsAll() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/friend/get', []) as any;
        if (response.status === 0) {
            let list = [];
            let data = response.content;
            data.forEach((item) => {
                let friend = item as Friend;
                item = this.getNewMyfriendData(friend);
                list.push(item);
            });
            this.myFriends = await this.sortFriends(list);

        }
    }

    /**删除好友 */
    async delMyFriendsByID(accountId: number) {
        this.toChatReadByID(accountId);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/friend/delete', [accountId]) as any;
        if (response.status === 0 && response.content) {
            let data = this.getMyFriendsByID(accountId);
            this.delMyFriends(data.getValue());
            EventDispatcher.dispatch(Notify.UPDATA_MY_FRIENDS, {});
        }
    }

    updateMyFriendsNew() {
        for (let data of this.myFriends) {
            if (data.new) {
                data.new = false;
            } else {
                break;
            }
        }
    }
    /**与聊天数据同步 */
    async updateMyFriendsData(data: FriendsItemData) {
        let index = -1;
        this.myFriends.forEach((ele, indexOf) => {
            if (data.friend.playerBaseInfo.player.accountId == ele.friend.playerBaseInfo.player.accountId) {
                index = indexOf;
            }
        });
        this.myFriends[index] = data;
        this.myFriends = await this.sortFriends(this.myFriends);

        EventDispatcher.dispatch(Notify.UPDATA_MY_FRIENDS, {});
    }
    /**从服务器获取我的 未读聊天消息 */
    async toChatFriendsAll() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/private/incomingInfo', []) as any;
        if (response.status === 0) {
            if (response.content.length > 0) {
                //发送有未读消息通知
                EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: true });
            }
        }
    }
    /**从服务器设置已读*/
    async toChatReadByID(accountId: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/chat/private/markAlreadyRead', [accountId]) as any;
        if (response.status === 0) {

        }
    }

    /**从服务器获取我的 好友申请列表 */
    async toApplyFriendsAll() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/friend/getApply', []) as any;
        if (response.status === 0) {
            this.applyFriends = response.content;
            if (this.applyFriends.length > 0) {
                EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: true });
            }
        }
    }

    async addMyFriends(data: FriendsItemData) {
        data.new = true;
        if (data.friend.lastChatMessage != null && data.msgs == null) {
            data.msgs = [];
            let msg: FriendsMsg = {} as FriendsMsg;
            msg.chatMessage = data.friend.lastChatMessage;
            msg.isMy = msg.chatMessage.senderId === PlayerData.getInstance().accountId;
            data.msgs.push(msg);
            if (msg.chatMessage.senderId == data.friend.playerBaseInfo.player.accountId && !data.friend.alreadyRead) {
                data.unread = true;
            } else {
                data.unread = false;
            }
        } else {
            data.msgs = [];
        }
        this.myFriends.unshift(data);
        this.myFriends = await this.sortFriends(this.myFriends);
        EventDispatcher.dispatch(Notify.UPDATA_MY_FRIENDS, {});
    }

    async delMyFriends(data: FriendsItemData) {
        let index = this.myFriends.indexOf(data);
        this.myFriends.splice(index, 1);

        let chatIndex = -1;
        this.chatfriendsData.forEach((ele, indexOf) => {
            if (data.friend.playerBaseInfo.player.accountId == ele.friend.playerBaseInfo.player.accountId) {
                chatIndex = indexOf;
            }
        });
        if (chatIndex != -1) {
            this.chatfriendsData.splice(chatIndex, 1);
        }

        EventDispatcher.dispatch(Notify.FRIEND_CHAT_LIST, {});
        EventDispatcher.dispatch(Notify.UPDATA_MY_FRIENDS, {});
    }

    async addApplyFriends(data: Friend) {
        this.applyFriends.unshift(data);
        EventDispatcher.dispatch(Notify.UPDATA_APPLY_LIST, {});
    }

    async delApplyFriends(data: Friend) {
        let index = this.applyFriends.indexOf(data);
        this.applyFriends.splice(index, 1);
        EventDispatcher.dispatch(Notify.UPDATA_APPLY_LIST, {});
    }

    /**从本地获取好友列表 */
    async getMyFriendsAll() {
        let datas: Optional<FriendsItemData>[] = [];
        this.myFriends.forEach((ele) => {
            datas.push(new Optional<FriendsItemData>(ele));
        });
        return datas;
    }

    /**从本地获取好友助战列表ID */
    async getMyFriendsPartnerIds(isHigh = false) {
        // let datas: any[] = [];

        let result = await NetUtils.post<PartyRecord>('/party/requestCandidatesInFriends', [isHigh]);
        if (result.isRight) {
            let supporters = result.right.candidateSupporters;
            if (supporters != '') {
                let friends = supporters.split(',');
                let result = [];
                friends.forEach(ele => {
                    if (result.indexOf(ele) == -1
                        && TeamManager.getInstance().partner1.fmap(x => x.accountId != parseInt(ele)).getOrElse(true)
                        && TeamManager.getInstance().partner2.fmap(x => x.accountId != parseInt(ele)).getOrElse(true)
                    ) {
                        result.push(ele);
                    }
                })
                return result;
            } else {
                return [];
            }
        }
        // if (isHigh) {
        //     this.myFriends.forEach((ele) => {
        //         let fc = ele.friend.playerBaseInfo.player.fc;
        //         if (fc >= (1000 + 1.5 * PlayerData.getInstance().fc) && fc <= (2000 + 2 * PlayerData.getInstance().fc)) {
        //             datas.push(ele.friend.playerBaseInfo.player.accountId);
        //         }
        //     });
        //     if (datas.length < 50) {
        //         datas = [];
        //         this.myFriends.forEach((ele) => {
        //             let fc = ele.friend.playerBaseInfo.player.fc;
        //             if (fc >= (1000 + 1.4 * PlayerData.getInstance().fc) && fc <= (5000 + 2 * PlayerData.getInstance().fc)) {
        //                 datas.push(ele.friend.playerBaseInfo.player.accountId);
        //             }
        //         });
        //     }
        // } else {
        //     this.myFriends.forEach((ele) => {
        //         let fc = ele.friend.playerBaseInfo.player.fc;
        //         if (fc >= (0.8 * PlayerData.getInstance().fc) && fc <= (1000 + 1.2 * PlayerData.getInstance().fc)) {
        //             datas.push(ele.friend.playerBaseInfo.player.accountId);
        //         }
        //     });
        //     if (datas.length < 50) {
        //         datas = [];
        //         this.myFriends.forEach((ele) => {
        //             let fc = ele.friend.playerBaseInfo.player.fc;
        //             if (fc >= (0.65 * PlayerData.getInstance().fc) && fc <= (1000 + 1.35 * PlayerData.getInstance().fc)) {
        //                 datas.push(ele.friend.playerBaseInfo.player.accountId);
        //             }
        //         });
        //     }
        // }
        // return datas;
    }

    /**从本地获取好友申请列表 */
    async getApplyFriendsAll() {
        let datas: Optional<Friend>[] = [];
        this.applyFriends.forEach((ele) => {
            datas.push(new Optional<Friend>(ele));
        });
        return datas;
    }

    /**记录一条消息 */
    async addFriendsMsg(msg: FriendsMsg) {
        msg.isMy = msg.chatMessage.senderId === PlayerData.getInstance().accountId;
        let frinds: Optional<FriendsItemData> = null;
        if (msg.isMy) {
            frinds = this.getMyFriendsByID(msg.chatMessage.receiverId);
        } else {
            frinds = this.getMyFriendsByID(msg.chatMessage.senderId);
        }

        if (frinds.isValid()) {
            let friendData = frinds.getValue();
            if (friendData.msgs.length <= 1) {
                friendData = await this.toConversation(frinds.getValue());
            } else {
                friendData.msgs.push(msg);
            }

            if (!msg.isMy) {
                friendData.unread = true;
                friendData.friend.online = true;
            }
            await this.privateChat(friendData);
            EventDispatcher.dispatch(Notify.UPDATA_FRIEND_CHAT_NEW_MSG, { id: frinds.getValue().friend.playerBaseInfo.player.accountId });
        }
    }

    showFriendMsg(accountId: number) {
        if (accountId == 0) {
            return;
        }
        let data = new Optional<FriendsItemData>(null);
        for (let item of this.chatfriendsData) {
            if (item.friend.playerBaseInfo.player.accountId == accountId) {
                item.unread = false;
                data = new Optional<FriendsItemData>(item);
            }
        }
        if (data.isValid()) {
            this.updateMyFriendsData(data.getValue());
            EventDispatcher.dispatch(Notify.FRIEND_CHAT_LIST, {});
            FriendsData.getInstance().toChatReadByID(accountId);
        }
        return data.fmap(x => x.msgs).getOrElse([]);
    }

    getMyFriendsByID(accountId: number) {

        let isID = (data: FriendsItemData) => {
            if (data.friend.playerBaseInfo.player.accountId == accountId) {
                return true;
            }
            return false;
        };
        return new Optional<FriendsItemData>(R.find(isID)(this.myFriends));
    }

    getChatFriendsByID(accountId: number) {
        let isID = (data: FriendsItemData) => {
            if (data.friend.playerBaseInfo.player.accountId == accountId) {
                return true;
            }
            return false;
        };
        return new Optional<FriendsItemData>(R.find(isID)(this.chatfriendsData));
    }

    /**排序 */
    async sortFriends(list: FriendsItemData[]) {
        let data = list;

        //ID
        let byID = (itemA: FriendsItemData, itemB: FriendsItemData) => {
            let a = itemA.friend.playerBaseInfo.player.accountId;
            let b = itemB.friend.playerBaseInfo.player.accountId;
            return a - b;
        };
        let byIDData = R.sort(byID, data) as Array<FriendsItemData>;
        data = byIDData;

        //离线时间
        let byTime = R.descend(R.prop('recordTime'));
        let byTimeData = R.sort(byTime, data) as Array<FriendsItemData>;
        data = byTimeData;

        for (let i = 0; i < data.length; i++) {
            data[i].priority = data.length - i;
            if (data[i].friend.online) {
                data[i].priority += 101;
            }
            if (data[i].unread) {
                data[i].priority += 1000;
            }
            if (data[i].new) {
                data[i].priority += 10000;
            }
        }
        let byLine = R.descend(R.prop('priority'));
        let byLineData = R.sort(byLine, data) as Array<FriendsItemData>;
        data = byLineData;

        return data;
    }

    async openFriendChatByID(accountId: number) {
        let item = this.getMyFriendsByID(accountId);
        if (item.isValid()) {
            await FriendsData.getInstance().privateChat(item.getValue());
            let panel = await CommonUtils.getPanel('gameplay/friends/FriendsChatPanel', FriendsChatPanel) as FriendsChatPanel;
            panel.init(item.getValue().friend.playerBaseInfo.player.accountId);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else {
            let panel = await CommonUtils.getPanel('gameplay/friends/AddFriendsPanel', AddFriendsPanel) as AddFriendsPanel;
            panel.init(accountId.toString());
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }

    }
}