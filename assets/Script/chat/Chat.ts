import { CommonUtils } from "../utils/CommonUtils";
import { ChatMessage, ChatMessageComplex } from "../net/Protocol";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { ResUtils } from "../utils/ResUtils";
import { ConfigUtils } from "../utils/ConfigUtil";

export type ChannelMode
	= "All"
	| "World"
	| "System"

export module Chat {
	// 聊天时间显示间隔
	export let ChatTimeShowInternal: number = 10 * 60 * 1000;
	let MaxChatRecordNum: number = 20;

	export const enum Talker {
		ME, OTHER, SYSTEM, ACTIVITY, HONGBAO_ME, HONGBAO_OTHER, SYSTEM_SAFE
	}

	export interface ChatData {
		who?: Talker;
		id?: number;
		roleType?: number; //角色类型
		name?: string;
		msg?: string;
		timestamp?: number;
		extraParam?: any;
		noblemanLevel?: number;
		schoolId?: number;

		/* 广播消息使用
			一元购界面：1；
			月卡界面：2；
			邀请与分享：3；
			充值转盘：4；
			随缘乱斗：5；
			充值转盘：6；
			首充界面：7；
		*/
		goto?: number; //是否跳转：0：不跳，> 0:表示跳转的界面
	}

	export interface ChatUnit {
		id?: number;
		name?: string;
		roleType?: number;	//角色造型
		hasNewMsg?: boolean; //有新消息未查看，为true
		chats?: ChatData[];
		noblemanLevel?: number;
	}

	// 广播消息，跑马灯
	export interface MarqueeMsg {
		msgId?: number;
		msg?: string;
		showType?: number; //广播类型 0：正常广播 1：走马灯广播
		targetType?: number; // 目标人群类型 0：全部  其他：帮派ID
		extraParam?: any;
		/*
			一元购界面：1；
			月卡界面：2；
			邀请与分享：3；
			充值转盘：4；
			随缘乱斗：5；
			充值转盘：6；
			首充界面：7；
		*/
		goto?: number; //是否跳转：0：不跳，> 0:表示跳转的界面 
		isHongbao?: boolean;
	}

	function byMode(mode: ChannelMode) {
		return (msg: ChatMessageComplex) => {
			return mode === "All" 
					|| (mode === "System" && msg.chatMessage.systemMessage) 
					|| (mode === "World" && !msg.chatMessage.systemMessage)
		}
	}

	export class ChatManager {
		private recentChatList: Array<ChatUnit>;
		private worldChatDataList: Array<ChatMessageComplex>;
		private marqueeList: Array<MarqueeMsg>;
		private _myId: number;

		private indexes: {[key: string]: {preIndex: number; newIndex: number}} = {
			"All": { preIndex: 0, newIndex: 0},
			"World": { preIndex: 0, newIndex: 0},
			"System": { preIndex: 0, newIndex: 0},
		}

		public broadcastConfig = null;

		private static _instance: ChatManager;

		public constructor() {
			this.recentChatList = new Array<ChatUnit>();
			this.worldChatDataList = new Array<ChatMessageComplex>();
			this.marqueeList = new Array<MarqueeMsg>();
			this.initConfig();

			EventDispatcher.on(Notify.CHAT_NEW_MSG, this.addMsg.bind(this))
		}

		async initConfig() {
			this.broadcastConfig = await ConfigUtils.getConfigJson('BroadcastInfo');
		}

		public static getInstance(): ChatManager {
			if (!this._instance) {
				this._instance = new ChatManager();
			}
			return this._instance;
		}

		public getLatestCommonChatMsg(mode: ChannelMode): Array<ChatMessageComplex> {
			const list = this.worldChatDataList.filter(byMode(mode));
			this.indexes[mode].newIndex = 0
			this.indexes[mode].preIndex = Math.min(10, list.length)
			return CommonUtils.take(10, list);
		}

		public addMsg(event: EventDispatcher.NotifyEvent) {
			const msg = event.detail.msg as ChatMessageComplex;
			this.worldChatDataList.unshift(msg);
			this.indexes["All"].newIndex += 1
			this.indexes["All"].preIndex += 1
			if (msg.chatMessage.systemMessage) {
				this.indexes["System"].newIndex += 1
				this.indexes["System"].preIndex += 1
			} else {
				this.indexes["World"].newIndex += 1
				this.indexes["World"].preIndex += 1
			}
			EventDispatcher.dispatch(Notify.MAIN_UI_SHOW_NEW_MESSAGE, { msg: msg });
		}

		public getMoreMsg(mode: ChannelMode) {
			const list = this.worldChatDataList.filter(byMode(mode))
			if (this.indexes[mode].newIndex >= 10) {
				this.indexes[mode].newIndex -= 10;
				return CommonUtils.takeFrom(this.indexes[mode].newIndex, 10, list);
			} else if (this.indexes[mode].newIndex > 0) {
				let result = CommonUtils.takeFrom(0, this.indexes[mode].newIndex, list);
				this.indexes[mode].newIndex = 0;
				return result;
			} else if (this.indexes[mode].newIndex == 0) {
				return [];
			}
		}

		public getUnreadMsgNum(mode: ChannelMode) {
			return this.indexes[mode].newIndex;
		}

		isNewest(mode: ChannelMode) {
			return this.indexes[mode].newIndex === 1
		}

		showOneMsg(mode: ChannelMode) {
			if (this.indexes[mode].newIndex < 1) {
				console.error("U cannot show this msg");
			} else {
				this.indexes[mode].newIndex -= 1;
			}
		}

		public getOldMessage(mode: ChannelMode) {
			const list = this.worldChatDataList.filter(byMode(mode))
			const result = CommonUtils.takeFrom(this.indexes[mode].preIndex, 10, list);
			this.indexes[mode].preIndex = Math.min(list.length, this.indexes[mode].preIndex + 10)
			return result;
		}


		public updateChatList(roleId?: number, noblemanLevel?: number): any {
			if (roleId) { // 点击某个好友直接聊天
				let ret, d;
				let idx = -1;
				for (let i = 0; i < this.recentChatList.length; i++) {
					if (this.recentChatList[i].id == roleId) {
						idx = i;
						break;
					}
				}
				if (idx != -1) {
					this.recentChatList[idx].hasNewMsg = false;
					ret = { index: idx, data: this.recentChatList[idx] };
				} else {
					let chatUnit: ChatUnit = {};
					chatUnit.id = roleId;
					// chatUnit.name = FriendDataManager.getInstance().getFriendName(roleId);
					if (noblemanLevel) {
						chatUnit.noblemanLevel = noblemanLevel;
					} else {
						// chatUnit.noblemanLevel = FriendDataManager.getInstance().getFriendNobleLevel(roleId);
					}
					chatUnit.chats = new Array<ChatData>();
					if (!this._checkIfIn(roleId)) {
						this.recentChatList.unshift(chatUnit);
					}
					ret = { index: 0, data: this.recentChatList[0] };
				}
				return ret;
			} else { // 点击最近聊天按钮
				if (this.recentChatList.length) {
					this.recentChatList[0].hasNewMsg = false;
					return { index: 0, data: this.recentChatList[0] };
				}
			}
			return null;
		}

		public getChatUnitById(id: number): ChatUnit {
			let r = this.recentChatList.filter((m): boolean => { return m && m.id == id; });
			if (r.length) {
				return r[0];
			}
			return null;
		}

		public getPrivateList(): any {
			return this.recentChatList;
		}

		private _checkIfIn(id: number): boolean {
			let result = this.recentChatList.filter((m): boolean => { return m && m.id == id });
			return result.length > 0;
		}

		public isEmpty(): boolean {
			return this.recentChatList.length == 0;
		}

		public addChatMsg(id: number, cd: ChatData) {
			for (let i = 0; i < this.recentChatList.length; i++) {
				if (this.recentChatList[i].id == id) {
					this.recentChatList[i].hasNewMsg = true;
					this.recentChatList[i].chats.push(cd);
					this.checkChatNums(this.recentChatList[i].chats);
					return;
				}
			}
			let cu: ChatUnit = {};
			cu.id = cd.id;
			cu.name = cd.name;
			cu.roleType = cd.roleType;
			cu.chats = new Array<ChatData>();
			cu.chats.push(cd);
			cu.hasNewMsg = true;
			cu.noblemanLevel = cd.noblemanLevel;
			this.recentChatList.unshift(cu);
		}

		public getLastChatMsg(roleId: number): any {
			let find = this.recentChatList.filter((m): boolean => {
				return m && m.id == roleId;
			});
			if (find.length > 0) {
				let chats = find[0].chats;
				if (chats.length > 0) {
					return { "message": chats[chats.length - 1].msg, "timestamp": chats[chats.length - 1].timestamp };
				}
			}
			return { "message": "", "timestamp": 0 };
		}

		// 检查该roleId玩家是否有新消息
		public checkFriendNewMsg(roleId: number): boolean {
			for (let f of this.recentChatList) {
				if (f.id == roleId) {
					return f.hasNewMsg;
				}
			}
			return false;
		}

		// set chat msg old
		public setChatMsgOld(roleId: number) {
			for (let f of this.recentChatList) {
				if (f.id == roleId) {
					f.hasNewMsg = false;
				}
			}
		}

		private checkChatNums(list: Array<ChatData>) {
			let rms = list.length - MaxChatRecordNum;
			if (rms > 0) {
				for (let i = 0; i < rms; i++) {
					list.shift();
				}
			}
		}

		public static checkStrLen(str: string): number {
			let realLength = 0;
			let len = str.length;
			let charCode = -1;
			for (let i = 0; i < len; i++) {
				charCode = str.charCodeAt(i);
				if (charCode >= 0 && charCode <= 128) {
					realLength += 1;
				} else {
					realLength += 2;
				}
			}
			return realLength;
		}


		// marquee 
		public addMarqueeMsg(msg: MarqueeMsg) {
			this.marqueeList.unshift(msg);
			// Broadcast.showBroadcast();
		}

		public getOneMarqueeMsg(): MarqueeMsg {
			if (this.marqueeList.length > 0) {
				return this.marqueeList.pop();
			}
			return null;
		}

		private _mainuiShowChatList = [];
		public addMainUIShowChat(chatData: ChatData) {
			this._mainuiShowChatList.push(chatData);
			// AppFacade.getInstance().sendNotification(UINotify.MAINUI_UPDATE_CHAT_MESSAGE);
		}

		public getLastMainUIShowChat(): ChatData {
			if (this._mainuiShowChatList.length == 0) {
				return null;
			}
			return this._mainuiShowChatList.shift();
		}

		public hasNewMainUIMessage(): boolean {
			return this._mainuiShowChatList.length > 0;
		}
	}
}