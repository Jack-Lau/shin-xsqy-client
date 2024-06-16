import ItemFrame from "../../base/ItemFrame";
import { SlotsBigPrize, PlayerBaseInfo } from "../../net/Protocol";
import FriendsData from "../friends/FriendsData";
import { ResUtils } from "../../utils/ResUtils";
import { ItemQuality } from "../../bag/ItemConfig";
import { NetUtils } from "../../net/NetUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import TigerMachineTips from "./TigerMachineTips";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import Optional from "../../cocosExtend/Optional";

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
export default class TMFriendItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Sprite)
    boxIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Button)
    praiseBtn: cc.Button = null;
    @property(cc.Node)
    unPraise: cc.Node = null;

    @property(ItemFrame)
    item: ItemFrame = null;
    data: SlotsBigPrize = null;
    // onLoad () {}

    start() {
        this.praiseBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onPraiseBtn.bind(this)));
        this.item.node.on(cc.Node.EventType.TOUCH_END, this.openTips.bind(this));
    }

    async init(data: SlotsBigPrize, likeBigPrizeIds: number[]) {
        this.data = data;
        let player = new Optional<PlayerBaseInfo>(null);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [this.data.accountId]) as any;
        if (response.status === 0) {
            player = new Optional<PlayerBaseInfo>(response.content[0]);
        }
        
        this.boxIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/tigerMachine/tigerMachinePanel', 'icon_baoxiang' + (data.awardId - 1));
        if (data.awardId > 4) {
            this.item.init(ItemQuality.Orange, true);
        }
        this.icon.spriteFrame = await ResUtils.getPlayerRectIconById(player.fmap(x => x.player).fmap(x => x.prefabId).getOrElse(4000001));
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(player.fmap(x => x.schoolId));
        this.nameLabel.string = player.fmap(x => x.player).fmap(x => x.playerName).getOrElse('101');
        this.levelLabel.string = player.fmap(x => x.player).fmap(x => x.playerLevel).getOrElse(0).toString() + '级';

        if (likeBigPrizeIds.indexOf(data.id) == -1) {
            this.praiseBtn.node.active = true;
            this.unPraise.active = false;
        } else {
            this.praiseBtn.node.active = false;
            this.unPraise.active = true;
        }

        this.boxIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/tigerMachine/tigerMachinePanel', 'icon_baoxiang' + (data.awardId - 1));
        if (data.awardId > 4) {
            this.item.init(ItemQuality.Orange, true);
        } else {
            this.item.init(ItemQuality.White, false);
        }
    }

    async onPraiseBtn() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/slots/like', [this.data.id]) as any;
        if (response.status === 0) {
            this.praiseBtn.node.active = false;
            this.unPraise.active = true;
        }
    }

    async openTips(event: cc.Event.EventTouch) {
        let reward;
        let boxSpriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/tigerMachine/tigerMachinePanel', 'icon_baoxiang' + (this.data.awardId - 1));
        let configInfo = (await ConfigUtils.getConfigJson('SlotMachineAward'));
        for (let key in configInfo) {
            if (key == this.data.awardId as any) {
                reward = R.prop(key, configInfo);
                break;
            }
        }
        let panel = await CommonUtils.getPanel('gameplay/tigerMachine/TigerMachineTips', TigerMachineTips) as TigerMachineTips;
        panel.init(reward, boxSpriteFrame, this.data.awardId > 4);
        let location = event.getLocationInView();
        let func = R.compose(
            R.min(768 / 2 - panel.tipNode.width / 2),
            R.max(panel.tipNode.width / 2 - 768 / 2)
        );
        panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
        panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    // update (dt) {}
}
