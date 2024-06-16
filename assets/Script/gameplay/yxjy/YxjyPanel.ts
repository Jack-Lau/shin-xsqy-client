import CommonPanel from "../../base/CommonPanel";
import { YxjyRecord, PlayerBaseInfo, YxjyAwardSatatus } from "../../net/Protocol";
import ItemWithEffect from "../../base/ItemWithEffect";
import { NetUtils } from "../../net/NetUtils";
import { precondition } from "../../utils/BaseFunction";
import { YxjyData } from "./YxjyData";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import YxjyEatPanel from "./YxjyEatPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import ItemConfig from "../../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class YxjyPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    blockNode: cc.Node = null;
    
    // award
    @property(cc.Label)
    awardNameLabel: cc.Label = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    @property(cc.Button)
    shareBtn: cc.Button = null;
    @property(cc.Button)
    eatBtn: cc.Button = null;

    // players
    @property([cc.Sprite])
    playerIcons: Array<cc.Sprite> = [];
    @property([cc.Label])
    playerNameLabels: Array<cc.Label> = [];

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    playerInfoArray: Array<PlayerBaseInfo> = [];


    readonly prefabId2IconSource = {
        "4000001": "icon_chuangjianjuesetouxiang3",
        "4000002": "icon_chuangjianjuesetouxiang1",
        "4000003": "icon_chuangjianjuesetouxiang2",
        "4000004": "icon_chuangjianjuesetouxiang4",
    }

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.shareBtn.node.on(cc.Node.EventType.TOUCH_END, this.share.bind(this));
        this.eatBtn.node.on(cc.Node.EventType.TOUCH_END, this.eat.bind(this));
        this.playerIcons.forEach((icon, index) => icon.node.on(cc.Node.EventType.TOUCH_END, this.playerIconOnClick(index).bind(this)));
        this.item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showCurrencyTips({currencyId: 20053, amount: 1}, false));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.init();
        this.initAward();
    }

    async init () {
        await YxjyData.trytoUpdate();
        this.refresh();
    }

    initAward() {
        this.item.initWithCurrency({currencyId: 20053, amount: 1});
        let display = ItemConfig.getInstance().getItemDisplayById(20053, PlayerData.getInstance().prefabId);
        this.awardNameLabel.string = display.fmap(x => x.name).getOrElse("");
    }

    async refresh() {
        let playerIds = YxjyData.record.fmap(x => x.invitedAccountIds).getOrElse([]).filter(x => x != null);
        if (playerIds.length > 0) {
            let playerBaseInfos = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [playerIds]);
            this.playerInfoArray = playerBaseInfos.getOrElse([])
            this.render(this.playerInfoArray);
        } else {
            this.render([]);
        }
    }

    render(playerInfos: Array<PlayerBaseInfo>) {
        this.playerIcons.forEach((icon, index) => {
            if (index < playerInfos.length) {
                icon.spriteFrame = this.atlas.getSpriteFrame(this.prefabId2IconSource[playerInfos[index].player.prefabId]);
                this.playerNameLabels[index].string = playerInfos[index].player.playerName;
            } else {
                icon.spriteFrame = this.atlas.getSpriteFrame('icon_chuangjianjuesetouxiang5');
                this.playerNameLabels[index].string = '敬请期待';
            }
        });
        this.shareBtn.node.active = YxjyData.record.fmap(x => x.awardSatatus == "NOT_AVAILABLE").getOrElse(true);
        this.eatBtn.node.active = YxjyData.record.fmap(x => x.awardSatatus == "AVAILABLE").getOrElse(false);
        
    }

    async share() {
        if (precondition(PlayerData.getInstance().playerLevel >= 50, "少侠等级不足50") &&
            precondition(YxjyData.record.fmap(x => x.awardSatatus == "NOT_AVAILABLE").getOrElse(true), 1263) &&
            precondition(YxjyData.record.fmap(x => CommonUtils.getServerTime() - R.prop('lastInvitationTime', x) > 3 * 60 * 1000).getOrElse(true), 1264)
        ) {
            let result = await NetUtils.post<YxjyRecord>('/yuanxiaojiayao/publishInvitation', []);
            if (result.isRight) {
                TipsManager.showMessage('邀请发送成功');
                YxjyData.record = result.toOptional();
                this.refresh();
            }
        }
    }

    async eat() {
        if (precondition(YxjyData.record.fmap(x => x.invitedAccountIds).getOrElse([]).length >= 3, 1270) &&
            precondition(YxjyData.record.fmap(x => x.awardSatatus == "AVAILABLE").getOrElse(false), 1271)    
        ) {
            this.closePanel();
            let panel = await CommonUtils.getPanel('gameplay/yxjy/yxjyEatPanel', YxjyEatPanel) as YxjyEatPanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            let result = await NetUtils.post<YxjyRecord>('/yuanxiaojiayao/obtainAward', []);
            if (result.isRight) {
                TipsManager.showGainCurrency({currencyId: 20053, amount: 1});
                YxjyData.record = result.toOptional();
            }
        }
    }

    playerIconOnClick (index: number) {
        let _this = this;
        return function() {
            if (YxjyData.record.valid) {
                let ids = YxjyData.record.val.invitedAccountIds.filter(x => x != null);
                if (ids.length > index && _this.playerInfoArray.length > index) {
                    CommonUtils.showViewPlayerBox(_this.playerInfoArray[index]);
                }
            }
        }
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}