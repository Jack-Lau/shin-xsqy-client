import PagingControl from "../../base/PagingControl";
import { FashionConfig } from "./FashionConfig";
import { FashionDye, Fashion } from "../../net/Protocol";
import FashionDyeItem from "./FashionDyeItem";
import Optional from "../../cocosExtend/Optional";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PlayerData from "../../data/PlayerData";
import { CurrencyId } from "../../config/CurrencyId";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionSwitchDyePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(PagingControl)
    pageControl: PagingControl = null;

    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property([FashionDyeItem])
    items: Array<FashionDyeItem> = [];

    @property(cc.Sprite)
    blockSp: cc.Sprite = null;

    dyes: Array<FashionDye> = [];
    fashion: Optional<Fashion> = Optional.Nothing();
    currentSelectDye: FashionDye = null;
    
    own = 0;
    cost = 0;
    isPutOff = false;

    start () {
        this.initEvents();
    }

    async init (dyes: Array<FashionDye>, fashion: Fashion) {
        let sortFunc = (x: FashionDye, y: FashionDye) => { 
            if (x.id == fashion.dyeId) {
                return -1;
            } else {
                return x.id > y.id ? 1 : -1;
            }
        }
        this.dyes = R.sort(sortFunc, dyes);
        this.fashion = new Optional(fashion);
        let config = await FashionConfig.getFashionInfo(fashion.definitionId);
        let own = await CommonUtils.getCurrencyAmount(CurrencyId.染色剂);
        let cost = config.fmap(x => x.changeDyeCost).getOrElse(0)
        this.costLabel.string = '/' + cost;
        this.ownLabel.string = String(own);
        this.own = own;
        this.cost = cost;
        this.pageControl.init(Math.max(Math.ceil((this.dyes.length + 1) / 4), 1), this.onPageChange.bind(this), 1);
        this.onPageChange(1);
    }

    initEvents () {
        this.items.forEach((item, index) => {
            item.bgSp.node.on(cc.Node.EventType.TOUCH_END, this.dyeItemOnClick(index).bind(this));
        });
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmBtnOnClick.bind(this));
        this.blockSp.node.on(cc.Node.EventType.TOUCH_END,  CommonUtils.blockClick);
    }

    onPageChange(page) {
        this.pageControl.setPage(page);
        let arr = R.slice((page - 1) * 4, page * 4, this.dyes);
        let length = arr.length;
        let definitionId = this.fashion.fmap(x => x.definitionId).getOrElse(4465000);
        this.items.forEach((item, index) => {
            item.node.active = index < length;
            if (index < length) {
                item.init(definitionId, arr[index], this.fashion.fmap(x => x.dyeId == arr[index].id).getOrElse(false));
            }
        });
        if (length < 4) {
            this.items[length].initWithDefault(this.fashion.val);
            this.items[length].node.active = true;
        }
        this.dyeItemOnClick(0)();
    }

    dyeItemOnClick (index: number) {
        let _this = this;
        return function () {
            let page = _this.pageControl.currentPage;
            let arr = R.slice((page - 1) * 4, page * 4, _this.dyes); 
            _this.items.forEach((ele, i) => {
                ele.selectedNode.active = i == index;
            })
            _this.isPutOff = _this.items[index].isPutOff;
            if (_this.isPutOff) {
                _this.costLabel.string = '/0';
            } else {
                _this.costLabel.string = '/' + _this.cost;
            }
            if (arr[index] == undefined) {
                return;
            }
            _this.currentSelectDye = arr[index];
        }
    }

    async confirmBtnOnClick () {
        if (!this.fashion.valid || !this.currentSelectDye) {
            TipsManager.showMessage('未选中任何染色方案');
            return;
        }
        if (this.isPutOff) {
            let result = await NetUtils.post<any>('/fashion/putOffDye', [this.fashion.fmap(x => x.id).getOrElse(null)]);
            if (result.isRight) {
                TipsManager.showMessage('更换成功');
                this.closePanel();
                FashionConfig.updateFashionDyeId(this.fashion.val, 0);
                EventDispatcher.dispatch(Notify.FASHION_REFRESH_DYE, {});
                if (PlayerData.getInstance().fashion.fmap(x => x.id == this.fashion.val.id).getOrElse(false)) {
                    EventDispatcher.dispatch(Notify.PLAYER_FASHION_REFRESH_DYE, {dye: Optional.Nothing()});
                }
                return;
            }
            return;
        }


        if (this.own < this.cost) {
            TipsManager.showMsgFromConfig(1184);
            return;
        }
        const dyeId = this.currentSelectDye.id;
        let result = await NetUtils.post<any>('/fashion/chooseDye', [this.fashion.fmap(x => x.id).getOrElse(null), dyeId]);
        if (result.isRight) {
            TipsManager.showMessage('更换成功');
            this.closePanel();
            FashionConfig.updateFashionDyeId(this.fashion.val, dyeId);
            EventDispatcher.dispatch(Notify.FASHION_REFRESH_DYE, {});
            if (PlayerData.getInstance().fashion.fmap(x => x.id == this.fashion.val.id).getOrElse(false)) {
                EventDispatcher.dispatch(Notify.PLAYER_FASHION_REFRESH_DYE, {dye: new Optional<FashionDye>(this.currentSelectDye)});
            }
            return;
        }
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}