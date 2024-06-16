import { CommonUtils } from "../../utils/CommonUtils";
import HspmHotestItem from "./HspmHotestItem";
import HspmPanelItem from "./HspmPanelItem";
import PlayerData from "../../data/PlayerData";
import PagingControl from "../../base/PagingControl";
import HspmTwItem from "./HspmTwItem";
import { NetUtils } from "../../net/NetUtils";
import { AuctionRecord, AuctionOverall, CommodityDetail, CommodityPlayerRecord, Commodity, CommodityWithdrawResult } from "../../net/Protocol";
import { HspmConfig } from "./HspmConfig";
import { TipsManager } from "../../base/TipsManager";
import Optional from "../../cocosExtend/Optional";
import { TitleConfig } from "../../player/title/TitleConfig";
import BagData from "../../bag/BagData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class HspmPanel extends cc.Component {
    // title
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Node)
    blockBgNode: cc.Node = null;
    @property(cc.Sprite)
    topBgSp: cc.Sprite = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;

    // content
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    // bottom
    @property(cc.Sprite)
    nonEmptyFlagSp: cc.Sprite = null;
    @property(cc.Sprite)
    boxSp: cc.Sprite = null;
    @property(cc.Label)
    zanAmountLabel: cc.Label = null;
    @property(cc.Label)
    ybAmountLabel: cc.Label = null;

    // prefab
    @property([HspmPanelItem])
    items: Array<HspmPanelItem> = [];
    @property(HspmHotestItem)
    hotestItem: HspmHotestItem = null;

    // 二次确认
    @property(cc.Node)
    scBoxNode: cc.Node = null;
    @property(cc.Node)
    scBoxBgNode: cc.Node = null;
    @property(cc.Button)
    scCloseBtn: cc.Button = null;
    @property(cc.Label)
    scPriceLabel: cc.Label = null;
    @property(cc.EditBox)
    scBaseAmountEditBox: cc.EditBox = null;
    @property(cc.Label)
    scBaseLabel: cc.Label = null;
    @property(cc.Label)
    scTotalLabel: cc.Label = null;
    @property(cc.Label)
    scYbAmountLabel: cc.Label = null;
    @property(cc.Button)
    scConfirmBtn: cc.Button = null;

    scBasePrice = 0;
    scBaseAmount = 1;
    scCommodity: CommodityDetail = null;
    currentIndex: number = 0;

    // 临时仓库 tw = temporary Warehouse
    @property(cc.Node)
    twBoxNode: cc.Node = null;
    @property(cc.Node)
    twBoxBgNode: cc.Node = null;
    @property(cc.Button)
    twCloseBtn: cc.Button = null;
    @property(PagingControl)
    twPageControl: PagingControl = null;
    @property([HspmTwItem])
    twItems: Array<HspmTwItem> = [];
    @property(cc.Button)
    twConfirmBtn: cc.Button = null;
    zanAmount = 0;

    commodityData: Array<CommodityDetail> = []
    auctionRecord: AuctionRecord = null;
    data: AuctionOverall = null;

    async start() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/auction/overall', []);
        if (response.status === 0) {
            this.data = response.content as AuctionOverall;
            let sortFunc = R.sortWith([R.descend(R.prop('bidderCount'))])
            this.data.onSaleCommodities = sortFunc(this.data.onSaleCommodities)
            this.commodityData = this.data.onSaleCommodities;
            this.initItems(this.commodityData);
            this.initBottom();
            this.initTwBox();
        } else {
            await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/auction/createRecord', []);
            await this.init();
        }

        this.initEvents()
        this.autoFit()
        this.timeLabel.schedule(this.initTimeLabel, 1);
        this.schedule(this.init, 10);
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/auction/overall', []);
        if (response.status === 0) {
            this.data = response.content as AuctionOverall;
            let sortFunc = R.sortWith([R.descend(R.prop('bidderCount'))])
            this.data.onSaleCommodities = sortFunc(this.data.onSaleCommodities)
            this.commodityData = this.data.onSaleCommodities;
        }
        this.initItems(this.commodityData);
        this.initBottom();
        this.initTwBox();
    }

    initTimeLabel = function () {
        const timeInfo = CommonUtils.getServerTimeInfo();
        const f = (val: number) => CommonUtils.prefixNum(2, val)
        this.timeLabel.string = `当前时间 ${f(timeInfo.hour)}:${f(timeInfo.minute)}:${f(timeInfo.seconds)}`;
    }.bind(this);

    initBottom() {
        this.zanAmountLabel.string = String(this.data.auctionRecord.likedTodayLimit - this.data.auctionRecord.likedToday);
        this.ybAmountLabel.string = (PlayerData.getInstance().ybAmount + this.data.auctionRecord.stockYb) + '';
    }

    autoFit() {
        let height = CommonUtils.getViewHeight()
        let width = CommonUtils.getViewWidth();
        if (height / width > 16 / 9) {
            let realHeight = height * 768 / width;
            this.scroll.content.getComponent(cc.Layout).spacingY = (realHeight - 1326) / 2;
        } else {
            this.scroll.scrollToTop();
        }
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 17))

        // 二次确认框
        this.scBoxBgNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick)
        this.scConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.scConfirmBtnOnClick.bind(this))
        this.scCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.scCloseBtnOnClick.bind(this))

        // 临时仓库
        this.boxSp.node.on(cc.Node.EventType.TOUCH_END, this.openTwBox.bind(this))
        this.twBoxBgNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick)
        this.twConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.twConfirmBtnOnClick.bind(this))
        this.twCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.twCloseBtnOnClick.bind(this))

        this.hotestItem.auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(0).bind(this))
        this.items[0].auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(1).bind(this))
        this.items[1].auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(2).bind(this))
        this.items[2].auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(3).bind(this))
        this.items[3].auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(4).bind(this))
        this.items[4].auctionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSCBox(5).bind(this))

        this.hotestItem.zanBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(0).bind(this)))
        this.items[0].zanGroupNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(1).bind(this)))
        this.items[1].zanGroupNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(2).bind(this)))
        this.items[2].zanGroupNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(3).bind(this)))
        this.items[3].zanGroupNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(4).bind(this)))
        this.items[4].zanGroupNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.zanBtnOnClick(5).bind(this)))
    }

    initItems(data: Array<CommodityDetail>) {
        data.forEach((info, index) => {
            if (index >= 6) {
                return;
            }
            if (index == 0) {
                this.hotestItem.init(info, this.findRecordById(info.commodity.id));
            } else {
                this.items[index - 1].init(info, this.findRecordById(info.commodity.id));
            }
        })
    }

    findRecordById(id: number): Optional<CommodityPlayerRecord> {
        for (let record of this.data.commodityPlayerRecords) {
            if (record.commodityId == id) {
                return new Optional<CommodityPlayerRecord>(record);
            }
        }
        return new Optional<CommodityPlayerRecord>();
    }

    zanBtnOnClick(index: number) {
        let _this = this;
        return async () => {
            if (this.data.auctionRecord.likedTodayLimit - this.data.auctionRecord.likedToday <= 0) {
                TipsManager.showMessage('您今日点赞次数已用完，明天再来吧');
                return;
            }
            let commodity = R.path([index, 'commodity'], _this.commodityData) as Commodity;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/auction/commodity/{id}/like', [commodity.id]);
            if (response.status === 0) {
                if (index == 0) {
                    await _this.hotestItem.zanOnClick();
                    await this.init();
                } else {
                    await _this.items[index - 1].zanOnClick();
                    await this.init();
                }
            }
        }
    }

    // 二次确认框
    openSCBox(index: number) {
        let _this = this;
        return async () => {
            let commodity = R.path([index, 'commodity'], _this.commodityData) as Commodity;
            if (commodity.lastBidderAccountId == PlayerData.getInstance().accountId) {
                TipsManager.showMessage('您已是当前出价最高的竞拍者');
                return;
            }
            _this.scBoxNode.active = true;
            _this.currentIndex = index;
            await this.initSCBox(index);
        }
    }

    async initSCBox(index: number) {
        let _this = this;
        let commodity = R.path([index, 'commodity'], _this.commodityData) as Commodity;
        CommonUtils.editBoxRight(this.scBaseAmountEditBox);
        _this.scCommodity = R.prop(index, _this.commodityData);
        let config = await HspmConfig.getConfigById(commodity.definitionId)
        _this.scBaseLabel.string = config.PriceRise + '';
        _this.scPriceLabel.string = commodity.lastBid + '';

        if (commodity.lastBidderAccountId == null) {
            _this.scBaseAmountEditBox.string = '0';
            _this.scBaseAmount = 0;
        } else {
            _this.scBaseAmountEditBox.string = '1';
            _this.scBaseAmount = 1;
        }

        _this.scBasePrice = config.PriceRise;
        let avaiableYb = PlayerData.getInstance().ybAmount + _this.data.auctionRecord.stockYb;
        _this.scYbAmountLabel.string = String(avaiableYb);
        _this.scTotalLabel.string = (commodity.lastBid + config.PriceRise * _this.scBaseAmount) + '';
    }

    editEnd() {
        CommonUtils.editBoxRight(this.scBaseAmountEditBox);
        let amount = parseInt(this.scBaseAmountEditBox.string);
        if (amount) {
            this.scBaseAmount = amount;
            let price = this.scCommodity.commodity.lastBid + this.scBasePrice * this.scBaseAmount;
            this.scTotalLabel.string = price + '';
        }
    }

    async scConfirmBtnOnClick() {
        if (!this.scCommodity) {
            return;
        }
        let id = this.scCommodity.commodity.id;
        let price = this.scCommodity.commodity.lastBid + this.scBasePrice * this.scBaseAmount;
        let availableYb = PlayerData.getInstance().ybAmount + this.data.auctionRecord.stockYb;
        if (price > availableYb) {
            TipsManager.showMessage('您的元宝不足，先去赚一些再来吧');
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/auction/commodity/{id}/bid', [id, price]);
        if (response.status === 0) {
            TipsManager.showMessage('竞拍成功');
            await this.init();
            this.scCloseBtnOnClick()
        } else {
            await this.init();
            await this.initSCBox(this.currentIndex)
        }
    }

    scCloseBtnOnClick() {
        this.scBoxNode.active = false;
    }

    // 临时仓库
    twPage = 0;
    twData: Array<any> = [];
    async openTwBox() {
        this.twPage = 0;
        this.twBoxNode.active = true;
        let maxPage = Math.ceil(this.twData.length / 8);
        this.twPageControl.init(maxPage, this.initByPage.bind(this));
    }

    initByPage(page: number) {
        let data = R.slice((page - 1) * 8, page * 8, this.twData);
        this.twItems.forEach((item, index) => {
            let info = R.prop(index, data)
            if (info) {
                item.item.node.active = true;
                if (info.type == 'pet') {

                } else if (info.type == 'equipment') {

                } else if (info.type == 'currency') {
                    let amount = info.auctionId == 151 ? CommonUtils.toCKb(info.amount) : info.amount;
                    item.item.initWithCurrency({ currencyId: info.auctionId, amount: amount })
                    item.init(info)
                } else if (info.type == 'title') {
                    item.item.initWithTitle(info.auctionId);
                    item.init(info)
                }
                item.lockSp.node.active = info.locked == true;
            } else {
                item.item.node.active = false;
                item.lockSp.node.active = false;
            }
        })
    }

    async initTwBox() {
        this.twData = [];
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/auction/commodity/deliverable', []);
        if (response.status === 0) {
            let data = response.content as Array<Commodity>
            if (this.data.auctionRecord.lockedYb > 0) {
                this.twData.push({ type: 'currency', locked: true, auctionId: 150, amount: this.data.auctionRecord.lockedYb });
            }
            if (this.data.auctionRecord.stockYb > 0) {
                this.twData.push({ type: 'currency', locked: false, auctionId: 150, amount: this.data.auctionRecord.stockYb });
            }

            let config = await HspmConfig.getConfig();

            let pets = [];
            let titles = [];
            let equipments = [];
            let currencies = []
            for (let ele of data) {
                let info = config[ele.definitionId];
                if (!info) continue;
                if (info.type == 1) {
                    equipments.push({ type: 'equipment', locked: false, auctionId: info.auctionId })
                } else if (info.type == 2) { // 神宠
                    pets.push({ type: 'pet', locked: false, auctionId: info.auctionId });
                } else if (info.type == 3) {
                    let titleInfo = await TitleConfig.getGodConfigById(info.auctionId);
                    titles.push({ type: 'title', locked: false, auctionId: titleInfo.titleInfo.id, serialNum: titleInfo.serialNum})
                } else if (info.type == 4) {
                    currencies.push({ type: 'currency', locked: false, auctionId: info.auctionId, amount: 1 })
                }
            }
            this.twData = this.twData.concat(currencies, titles, equipments, pets)
        }

        this.nonEmptyFlagSp.node.active = this.twData.length > 0 && (this.twData.length != 1 || !this.twData[0].locked);
        if (this.twData.length > 0) {
            this.nonEmptyFlagSp.getComponent(cc.Animation).play();
        }
    }

    twCloseBtnOnClick() {
        this.twBoxNode.active = false;
    }

    async twConfirmBtnOnClick() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/auction/withdrawAll', []);
        if (response.status === 0) {
            TipsManager.showMessage('领取成功');
            let data = response.content as CommodityWithdrawResult;
            data.titles.forEach(ele => {
                BagData.getInstance().addTitleToBag(ele);
            })
            await this.init();
            this.twCloseBtnOnClick();
        }
    }

    closePanel() {
        this.unschedule(this.init);
        this.timeLabel.unschedule(this.initTimeLabel);
        CommonUtils.safeRemove(this.node)
    }
}
