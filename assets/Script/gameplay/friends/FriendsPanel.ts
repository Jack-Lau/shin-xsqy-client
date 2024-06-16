import { CommonUtils } from "../../utils/CommonUtils";
import FriendsItem from "./FriendsItem";
import ApplyFriendsItem from "./ApplyFriendsItem";
import FriendsData, { FriendsItemData } from "./FriendsData";
import Optional from "../../cocosExtend/Optional";
import { Friend } from "../../net/Protocol";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import AddFriendsPanel from "./AddFriendsPanel";
import ApplyFriendsPanel from "./ApplyFriendsPanel";
import FriendsChatPanel from "./FriendsChatPanel";

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
export default class FriendsPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    eraseBtn: cc.Button = null;
    @property(cc.Button)
    screenBtn: cc.Button = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Label)
    friendsLabel: cc.Label = null;
    @property(cc.Button)
    chatBtn: cc.Button = null;
    @property(cc.Button)
    addBtn: cc.Button = null;
    @property(cc.Button)
    applyBtn: cc.Button = null;

    @property(cc.Node)
    hasChat: cc.Node = null;
    @property(cc.Node)
    hasApply: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    myfriendsData: Optional<FriendsItemData>[] = [];

    applyData: Optional<Friend>[] = [];
    friendsItems: FriendsItem[] = [];
    page = 0;
    pageNumber = 10;

    isInThis = true;
    // onLoad () {}

    async start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        await FriendsData.getInstance().toMyFriendsAll();
        await this.init();
        await this.initEvents();

        EventDispatcher.on(Notify.UPDATA_MY_FRIENDS, this.eventinit);
        EventDispatcher.on(Notify.UPDATA_APPLY_LIST, this.eventsetHasApply);
    }

    initEvents() {
        this.chatBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openChat.bind(this)));
        this.addBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openAddPanel.bind(this)));
        this.applyBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openApplyPanel.bind(this)));
        this.screenBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.screen.bind(this)));
        this.eraseBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.editBox.string = '';
            this.screen();
            this.screenBtn.node.active = true;
            this.eraseBtn.node.active = false;
        });
        this.scrollView.node.on('scroll-to-bottom', CommonUtils.aloneFunction(this.addItem.bind(this)));
    }

    eventinit = function () {
        this.updateListData();
    }.bind(this);


    eventsetHasApply = function () {
        this.setHasApply();
    }.bind(this);


    async openAddPanel() {

        let panel = await CommonUtils.getPanel('gameplay/friends/AddFriendsPanel', AddFriendsPanel) as AddFriendsPanel;
        panel.init();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async openApplyPanel() {

        let panel = await CommonUtils.getPanel('gameplay/friends/ApplyFriendsPanel', ApplyFriendsPanel) as ApplyFriendsPanel;
        panel.init();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async openChat() {

        let panel = await CommonUtils.getPanel('gameplay/friends/FriendsChatPanel', FriendsChatPanel) as FriendsChatPanel;
        panel.init();
        panel.from = this;
        this.node.active = false;
        this.isInThis = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async init() {
        this.myfriendsData = await FriendsData.getInstance().getMyFriendsAll();
        this.friendsItems.forEach((item, index) => {
            item.node.destroy();
        });
        this.friendsItems = [];
        this.page = 0;
        this.addItem();

        this.friendsLabel.string = this.myfriendsData.length.toString();
        if (this.myfriendsData.length > 0) {
            this.emptyNode.active = false;
        } else {
            this.emptyNode.active = true;
        }

        this.setHasApply();
        this.setHasChat();

    }

    async updateListData() {
        if (!this.isInThis) {
            return;
        }
        this.myfriendsData = await FriendsData.getInstance().getMyFriendsAll();
        if (this.eraseBtn.node.active) {
            let screenString = this.editBox.string;
            let screenFcn = (item: Optional<FriendsItemData>) => {
                if (item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).fmap(x => x.player).fmap(x => x.playerName).getOrElse('').toString().indexOf(screenString) > -1) {
                    return true;
                }
                return false;
            };
            this.myfriendsData = R.filter(screenFcn, this.myfriendsData);
        } else if (this.friendsItems.length < 10) {
            this.init();
            return;
        }
        this.friendsItems.forEach((itemData, index) => {
            if (index < this.myfriendsData.length) {
                itemData.init(this, this.myfriendsData[index]);
            }else{
                let del = (this.friendsItems.splice(index, 1)[0]) as FriendsItem;
                del.node.destroy();
            }
        });
        this.setHasApply();
        this.setHasChat();

    }

    async setHasChat() {
        this.hasChat.active = false;
        FriendsData.getInstance().chatfriendsData.forEach((data) => {
            if (data.unread) {
                this.hasChat.active = true;
            }
        });
    }
    async setHasApply() {
        this.applyData = await FriendsData.getInstance().getApplyFriendsAll();

        if (this.applyData.length > 0) {
            this.hasApply.active = true;
        } else {
            this.hasApply.active = false;
        }

    }

    async screen() {

        this.friendsItems.forEach((item, index) => {
            item.node.destroy();
        });
        this.friendsItems = [];

        let screenString = this.editBox.string;
        if (screenString == '') {
            this.init();
        } else {
            this.screenBtn.node.active = false;
            this.eraseBtn.node.active = true;
            let data = await FriendsData.getInstance().getMyFriendsAll();
            let screenFcn = (item: Optional<FriendsItemData>) => {
                if (item.fmap(x => x.friend).fmap(x => x.playerBaseInfo).fmap(x => x.player).fmap(x => x.playerName).getOrElse('').toString().indexOf(screenString) > -1) {
                    return true;
                }
                return false;
            };
            data = R.filter(screenFcn, data);
            data.forEach((ele) => {
                let itemNode = cc.instantiate(this.itemPrefab);
                itemNode.parent = this.scrollView.content;
                let item = itemNode.getComponent(FriendsItem);
                item.init(this, ele);
                this.friendsItems.push(item);
            });
            this.myfriendsData = data;
        }
    }

    async addItem() {
        let filterFunc = (element) => {
            let indexOf = this.myfriendsData.indexOf(element);
            if ((indexOf >= this.page * this.pageNumber) && (indexOf < (this.page + 1) * this.pageNumber)) {
                return true;
            }
            return false;
        };
        let items = R.filter(filterFunc, this.myfriendsData) as Optional<FriendsItemData>[];

        items.forEach((element) => {
            let itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.scrollView.content;
            let item = itemNode.getComponent(FriendsItem);
            item.init(this, element);
            this.friendsItems.push(item);
        });

        if (items.length > 0) {
            this.page += 1;
        }
    }

    // update (dt) {}
    closePanel() {
        FriendsData.getInstance().updateMyFriendsNew();
        CommonUtils.safeRemove(this.node);
        if (this.hasChat.active || this.hasApply.active) {
            EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: true });
        } else {
            EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, { name: 'friendBtn', visible: false });
            FriendsData.getInstance().toChatFriendsAll();
        }
    }

    onDestroy() {
        EventDispatcher.off(Notify.UPDATA_MY_FRIENDS, this.eventinit.bind(this));
        EventDispatcher.off(Notify.UPDATA_APPLY_LIST, this.eventsetHasApply.bind(this));

    }
}
