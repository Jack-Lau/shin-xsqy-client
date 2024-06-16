import PagingControl from "../../base/PagingControl";
import FashionItem from "./FashionItem";
import FashionModel from "./FashionModel";
import FashionEquip from "./FashionEquip";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { Fashion, FashionDye } from "../../net/Protocol";
import Item from "../../base/Item";
import { FashionConfig } from "./FashionConfig";
import FashionDyePage from "./FashionDyePage";
import Optional from "../../cocosExtend/Optional";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { TipsManager } from "../../base/TipsManager";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class FashionMainPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    
    @property(FashionModel)
    model: FashionModel = null;
    @property(cc.Button)
    leftRotateBtn: cc.Button = null;
    @property(cc.Button)
    rightRotateBtn: cc.Button = null;

    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property(cc.Button)
    effectBtn: cc.Button = null;

    @property(PagingControl)
    pageControl: PagingControl = null;
    @property([FashionItem])
    fashionItems: Array<FashionItem> = [];

    @property(FashionEquip)
    fashionEquip: FashionEquip = null;
    @property(FashionDyePage)
    fashionDye: FashionDyePage = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    readonly PAGE_SIZE = 5;
    
    start () {
        this.init();
        this.initEvents();
    }

    /******* start Init *******/
    async init () {
        if (CommonUtils.getViewHeight() / CommonUtils.getViewWidth() < 16 / 9) {
            this.contentNode.scaleX = this.contentNode.scaleY = CommonUtils.getViewHeight() / 1366;
        }
        await this.initFashion();
        this.pageControl.init(Math.ceil(FashionConfig.fashionList.length / this.PAGE_SIZE), this.initList.bind(this), 1);
        this.initList(1);
        let prefabId = FashionConfig.getPrefabId(this.getCurrentFashion().definitionId)
        this.model.init(prefabId);
        this.model.switchToNormal();
    }

    initEvents () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 27));
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchToEquip, this);
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchToDye, this);
        this.effectBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showToDo);
        this.leftRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.leftRotateOnClick, this);
        this.rightRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.rightRotateOnClick, this);
        this.fashionItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.chooseItem(index).bind(this));
        });
        EventDispatcher.on(Notify.FASHION_REFRESH_DYE, this.refreshDye);

        this.fashionEquip.armBtn.node.on(cc.Node.EventType.TOUCH_END, this.putOn, this);
        this.fashionEquip.disArmBtn.node.on(cc.Node.EventType.TOUCH_END, this.putOff, this);
    }

    async initFashion() {
        let r1 = await NetUtils.get<Array<Fashion>>('/fashion/getByAccountId', []);
        if (r1.isRight) { 
            FashionConfig.fashionList = r1.right;
        }
    }

    initList (page: number) {
        this.pageControl.setPage(page);
        let arr: Array<Fashion> = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, FashionConfig.fashionList);
        if (arr.length == 0) {
            return;
        }
        let length = arr.length;
        this.fashionItems.forEach((item, index) => {
            item.visible = index < length;
            if (index < length) {
                item.init(arr[index]);
            }
        });
        this.chooseItem(0)();
    }

    async refreshTheme (fashion: Fashion) {
        let dye = await FashionConfig.getDye(fashion.dyeId);
        this.fashionEquip.init(dye, fashion, this.model);
        this.showArmBtns();
    }

    async refreshHSB(fashion: Fashion) {
        this.fashionDye.init(fashion, this.model);
    }

    /******** end Init ********/

    getCurrentFashion():Fashion {
        let selectedIndex = R.findIndex(R.prop('selected'), this.fashionItems);
        if (selectedIndex == -1) {
            return null;
        } else {
            let index = selectedIndex + (this.pageControl.currentPage - 1) * this.PAGE_SIZE;
            return FashionConfig.fashionList[index];
        }
    }

    /******* start Events *******/
    closePanel () {
        EventDispatcher.off(Notify.FASHION_REFRESH_DYE, this.refreshDye);
        CommonUtils.safeRemove(this.node);
    }

    switchToEquip () {
        this.fashionEquip.node.active = true;
        this.fashionDye.node.active = false;
        this.fashionEquip.container.toggleItems[0].check();
        this.fashionEquip.toNormal();
        this.refreshTheme(this.getCurrentFashion());
    }
    
    switchToDye() {
        this.fashionEquip.node.active = false;
        this.fashionDye.node.active = true;
        this.fashionDye.statusContianer.toggleItems[0].check();
        this.fashionDye.toNormal();
        this.fashionDye.init(this.getCurrentFashion(), this.model);
    }

    leftRotateOnClick () {
        this.model.counterClockwiseRotate();
    }

    rightRotateOnClick () {
        this.model.clockwiseRotate();
    }

    chooseItem(chooseIndex: number) {
        let _this = this;
        return function () {
            if (!_this.fashionItems[chooseIndex].nameLabel.node.active) {
                return;
            }
            _this.fashionItems.forEach((item, index) => {
                item.selected = chooseIndex == index
            });
            
            if (_this.container.toggleItems[0].isChecked) {
                _this.refreshTheme(_this.getCurrentFashion());
            } else {
                _this.refreshHSB(_this.getCurrentFashion());
            }
        }
    }

    showArmBtns () {
        let fashion = this.getCurrentFashion();
        if (!fashion) {
            return;
        }
        let isOn = PlayerData.getInstance().fashion.fmap(x => x.id == fashion.id).getOrElse(false);
        this.fashionEquip.armBtn.node.active = !isOn;
        this.fashionEquip.disArmBtn.node.active = isOn;
    }

    refreshDye = function () {
        if (CommonUtils.getCheckedIndex(this.container) == 0) {
            this.refreshTheme(this.getCurrentFashion());
        }
    }.bind(this);

    async putOn() {
        let fashion = this.getCurrentFashion();
        if (!fashion) {
            return;
        }
        let result = await NetUtils.post<any>('/fashion/putOn', [fashion.id])
        if (result.isRight) {
            let dye = await FashionConfig.getDye(fashion.dyeId);
            PlayerData.getInstance().fashion = Optional.Just<Fashion>(R.clone(fashion));
            PlayerData.getInstance().fashionDye = dye;
            TipsManager.showMessage('时装穿戴成功');
            EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            this.showArmBtns();
        } else {
            CommonUtils.reportError('/fashion/putOn', [fashion.id], result.left);
        }
    }

    async putOff() {
        let fashion = this.getCurrentFashion();
        if (!fashion) {
            return;
        }
        let result = await NetUtils.post<any>('/fashion/putOff', [fashion.id])
        if (result.isRight) {
            PlayerData.getInstance().fashion = Optional.Nothing<Fashion>();
            PlayerData.getInstance().fashionDye = Optional.Nothing<FashionDye>();
            TipsManager.showMessage('时装卸下成功');
            EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            this.showArmBtns();
        } else {
            CommonUtils.reportError('/fashion/putOff', [fashion.id], result.left);
        }
    }
    /******** end Events ********/
}
