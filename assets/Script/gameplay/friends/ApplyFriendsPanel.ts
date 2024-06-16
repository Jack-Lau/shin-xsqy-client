import FriendsPanel from "./FriendsPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";
import { Friend } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import ApplyFriendsItem from "./ApplyFriendsItem";
import FriendsData, { FriendsItemData } from "./FriendsData";
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
export default class ApplyFriendsPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    refusedBtn: cc.Button = null;
    @property(cc.Button)
    agreedBtn: cc.Button = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    applyData: Optional<Friend>[] = [];

    list: ApplyFriendsItem[] = [];

    isRuning
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.initEvents();
        EventDispatcher.on(Notify.UPDATA_APPLY_LIST, this.eventInit);
    }

    initEvents() {
        this.refusedBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onBtn.bind(this, false)));
        this.agreedBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onBtn.bind(this, true)));
    }

    eventInit = function () {
        this.init();
    }.bind(this);

    async init() {

        this.applyData = await FriendsData.getInstance().getApplyFriendsAll();
        if (this.applyData.length > 0) {
            this.emptyNode.active = false;
            this.scrollView.node.active = true;
            let length = this.list.length;
            this.applyData.forEach((itemData, index) => {
                if (index < length) {
                    this.list[index].init(this, itemData.getValue());
                } else {
                    this.list.length = index + 1;
                    let itemNode = cc.instantiate(this.itemPrefab);
                    itemNode.parent = this.scrollView.content;
                    let item = itemNode.getComponent(ApplyFriendsItem);
                    item.init(this, itemData.getValue());
                    this.list[index] = item;
                }
            });
            this.list.forEach((item, index) => {
                if (index >= this.applyData.length) {
                    item.node.destroy();
                    this.list.length -=1;
                }
            });
        } else {
            this.emptyNode.active = true;
            this.scrollView.node.active = false;
        }
    }

    async onBtn(agreed: boolean) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/friend/batchHandle', [agreed]) as any;
        if (response.status === 0) {
            if (response.content) {
                for (let itemData of this.applyData) {
                    await FriendsData.getInstance().delApplyFriends(itemData.getValue());
                    let data = {} as FriendsItemData;
                    data.friend = itemData.getValue();
                    data.recordTime = itemData.getValue().playerBaseInfo.player.lastLoginTime as any;
                    await FriendsData.getInstance().addMyFriends(data);
                }

            }
            await FriendsData.getInstance().toApplyFriendsAll();
            this.init();
        }
    }

    // update (dt) {}
    closePanel() {
        EventDispatcher.off(Notify.UPDATA_APPLY_LIST, this.eventInit);
        CommonUtils.safeRemove(this.node);
    }

}
