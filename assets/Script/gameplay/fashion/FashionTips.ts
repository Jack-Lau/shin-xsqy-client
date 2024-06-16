import { Fashion, FashionDye } from "../../net/Protocol";
import { FashionConfig } from "./FashionConfig";
import Optional from "../../cocosExtend/Optional";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import FashionModel from "./FashionModel";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionTips extends cc.Component {
    @property(cc.Node)
    bgNode: cc.Node = null;
    @property(cc.Sprite)
    blockSp: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property(cc.Button)
    leftRotateBtn: cc.Button = null;
    @property(cc.Button)
    rightRotateBtn: cc.Button = null;

    @property(cc.Label)
    dyeLabel: cc.Label = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    @property(cc.Label)
    serialLabel: cc.Label = null;
    @property(cc.Label)
    lockLabel: cc.Label = null;

    @property(cc.Node)
    fashionNode: FashionModel = null;

    start () {
        this.initEvents();
    }
    
    async init (fashion: Fashion, playerPrefabId = PlayerData.getInstance().prefabId) {
        let prefabId = FashionConfig.getPrefabId(fashion.definitionId, playerPrefabId)
        this.fashionModel.init(prefabId)
        this.fashionModel.switchToNormal();
        let dye = Optional.Nothing<FashionDye>();
        if (fashion.dyeId) {
            dye = await FashionConfig.getDye(fashion.dyeId);
        }
        this.fashionModel.setDye(dye, fashion.definitionId);
        let itemDisplay = ItemConfig.getInstance().getItemDisplayById(fashion.definitionId, playerPrefabId);
        this.descriptionLabel.string = itemDisplay.fmap(x => x.description).getOrElse('描述迷路了');
        this.dyeLabel.string = '当前染色方案  ' + dye.fmap(x => x.dyeName).getOrElse('默认方案');
        let config = await FashionConfig.getFashionInfo(fashion.definitionId);
        this.nameLabel.string = itemDisplay.fmap(x => x.name).getOrElse('名称丢失了');
        let total = config.fmap(x => x.limitedQuantity).getOrElse(100);
        let serial = CommonUtils.toSerailString(fashion.number, String(total).length);
        this.serialLabel.string = `★专属编号 ？？？`;
        let nextWithdrawTime = R.prop('nextWithdrawTime', fashion);
        if (nextWithdrawTime != null
            && nextWithdrawTime > CommonUtils.getServerTime()) {
            let t =  CommonUtils.getTimeInfo(nextWithdrawTime);
            this.lockLabel.string = `${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}前不能流通`;
            this.lockLabel.node.active = true;
        } else {
            this.lockLabel.node.active = false;
        }
    }

    initEvents () {
        this.bgNode.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.leftRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.leftRotateOnClick, this);
        this.rightRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.rightRotateOnClick, this);
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.toNormal, this);
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.toBattle, this);
    }

    leftRotateOnClick () {
        this.fashionModel.counterClockwiseRotate();
    }

    rightRotateOnClick () {
        this.fashionModel.clockwiseRotate();
    }

    toNormal () {
        this.fashionModel.switchToNormal();
    }

    toBattle () {
        this.fashionModel.switchToBattle();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    get fashionModel(): FashionModel {
        return this.fashionNode.getComponent(FashionModel);
    }
}