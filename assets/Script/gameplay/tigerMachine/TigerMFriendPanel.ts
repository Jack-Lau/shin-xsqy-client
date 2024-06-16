import TigerMachinePanel from "./TigerMachinePanel";
import { CommonUtils } from "../../utils/CommonUtils";
import { SlotsBigPrize, SlotsLike } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import TMFriendItem from "./TMFriendItem";
import TFMAwardItem from "./TFMAwardItem";

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
export default class TigerMFriendPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    awardBtn: cc.Button = null;
    @property(cc.ScrollView)
    praiseScrollView: cc.ScrollView = null;
    @property(cc.ScrollView)
    awardScrollView: cc.ScrollView = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;

    @property(cc.Prefab)
    praiseItem: cc.Prefab = null;
    @property(cc.Prefab)
    awardItem: cc.Prefab = null;

    
    @property(cc.Node)
    redNode: cc.Node = null;


    praiseData: SlotsBigPrize[] = [];
    awardData: SlotsLike[] = [];

    awardlist = [];

    from: TigerMachinePanel = null;


    // onLoad () {}

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.awardBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onAwardBtn.bind(this)));
    }

    async init(likeBigPrizeIds: number[]) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/slots/getFriendBigPrize', []) as any;
        if (response.status === 0) {
            this.praiseData = response.content as Array<SlotsBigPrize>;
        }

        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/slots/getLike', []) as any;
        if (response2.status === 0) {
            this.awardData = response2.content as Array<SlotsLike>;
        }
        if (this.awardData.length > 0) {
            this.redNode.active = true;
        } else {
            this.redNode.active = false;
        }
        this.praiseData.forEach((item, index) => {
            let node = cc.instantiate(this.praiseItem);
            node.parent = this.praiseScrollView.content;
            node.getComponent(TMFriendItem).init(item, likeBigPrizeIds);
        });
        this.awardlist = [];
        this.awardData.forEach((item, index) => {
            let node = cc.instantiate(this.awardItem);
            node.parent = this.awardScrollView.content;
            node.getComponent(TFMAwardItem).init(index, item.senderId);
            this.awardlist.push(node);
        });

        this.onToggle(null);
    }

    onToggle(toggle, index = '0') {
        this.emptyNode.active = false;
        if (index === '0') {
            this.awardScrollView.node.parent.active = false;
            this.praiseScrollView.node.parent.active = true;
            if (this.praiseData.length == 0) {
                this.emptyNode.active = true;
                this.praiseScrollView.node.parent.active = false;
            }

        } else {
            this.awardScrollView.node.parent.active = true;
            this.praiseScrollView.node.parent.active = false;
            if (this.awardlist.length == 0) {
                this.emptyNode.active = true;
                this.awardScrollView.node.parent.active = false;
            }
        }
    }

    async onAwardBtn() {

        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/slots/takeLike', []) as any;
        if (response.status === 0) {
            this.awardlist.forEach((item) => {
                item.destroy();
            });
            this.awardlist = [];
            this.redNode.active = false;
            this.onToggle(null, '1');
        }

    }

    // update (dt) {}
    closePanel() {
  
        if (this.from != null) {
            this.from.node.active = true;
            this.from.init();
        }
        CommonUtils.safeRemove(this.node);
    }
}
