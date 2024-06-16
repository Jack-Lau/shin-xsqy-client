import FriendsPanel from "./FriendsPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import AddFriendsItem from "./AddFriendsItem";
import { NetUtils } from "../../net/NetUtils";
import { FriendRecommend, PlayerBaseInfo, Friend } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import PlayerData from "../../data/PlayerData";
import FriendsData from "./FriendsData";

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
export default class AddFriendsPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    findBtn: cc.Button = null;
    @property(cc.Button)
    inBtn: cc.Button = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(AddFriendsItem)
    recommendeds: AddFriendsItem[] = [];
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    addItem: AddFriendsItem = null;

    friendRecommend: FriendRecommend = null;

    start() {

        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.initEvents();

    }

    initEvents() {
        this.inBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onRecommended.bind(this)));
        this.findBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.find.bind(this)));
    }

    async init(findString = '') {

        this.recommendeds[0].node.parent.active = true;
        this.scrollView.node.active = false;
        this.onRecommended();
        if (findString != '') {
            this.editBox.string = findString;
            this.find();
        }
    }

    async onRecommended() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/friend/recommend', []) as any;
        if (response.status === 0) {
            this.friendRecommend = response.content as FriendRecommend;
        }
        let ram = Math.random() * (this.friendRecommend.rankingList.length - 1);
        this.recommendeds[0].init(new Optional<PlayerBaseInfo>(R.prop('playerBaseInfo', this.friendRecommend.rankingList[Math.floor(ram)])));
        ram = Math.random() * (this.friendRecommend.fcList.length - 1);
        this.recommendeds[1].init(new Optional<PlayerBaseInfo>(R.prop('playerBaseInfo', this.friendRecommend.fcList[Math.floor(ram)])));
        ram = Math.random() * (this.friendRecommend.lvList.length - 1);
        this.recommendeds[2].init(new Optional<PlayerBaseInfo>(R.prop('playerBaseInfo', this.friendRecommend.lvList[Math.floor(ram)])));
    }

    async find() {
        let findString = this.editBox.string;
        if (cc.isValid(this.addItem)) {
            this.addItem.node.destroy();
        }
        if (findString == null || findString == '') {
            this.recommendeds[0].node.parent.active = true;
            this.scrollView.node.active = false;
        } else {
            this.recommendeds[0].node.parent.active = false;
            this.scrollView.node.active = true;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/friend/find', [findString]) as any;
            if (response.status === 0) {
                let data = response.content as Friend;
                if (data != null && data.playerBaseInfo.player.accountId != PlayerData.getInstance().accountId
                    && !FriendsData.getInstance().getMyFriendsByID(data.playerBaseInfo.player.accountId).isValid()) {
                    this.emptyNode.active = false;
                    let itemNode = cc.instantiate(this.itemPrefab);
                    itemNode.parent = this.scrollView.content;
                    this.addItem = itemNode.getComponent(AddFriendsItem);
                    this.addItem.init(new Optional<PlayerBaseInfo>(data.playerBaseInfo));
                } else {
                    this.emptyNode.active = true;
                }
            } else {
                this.emptyNode.active = true;
            }
        }

    }
    // update (dt) {}
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
