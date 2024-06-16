import TradingGoodsItem from "./TradingGoodsItem";
import PagingControl from "../../base/PagingControl";
import { ConsignmentDetail, ConsignmentMarker, MyConsignmentsComplex, Equipment, Title } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TradingGoodsType } from "./TradingIcon";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import TradingShelvesTips from "./TradingShelvesTips";
import { ItemCategory } from "../../bag/ItemConfig";
import TradingNotShelvesTips from "./TradingNotShelvesTips";
import TradingShelvesPanel from "./TradingShelvesPanel";
import BagData from "../../bag/BagData";
import { PetData } from "../pet/PetData";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";

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
enum Classify {
    Ongoing = 0, Obtain
}

@ccclass
export default class TradingMyPanel extends cc.Component {

    @property(cc.Toggle)
    classifyToggles: cc.Toggle[] = [];
    @property(TradingGoodsItem)
    goodsItems: TradingGoodsItem[] = [];
    @property(PagingControl)
    page: PagingControl = null;
    @property(cc.Node)
    ongoingPrompt: cc.Node = null;
    @property(cc.Label)
    ongoingLabel: cc.Label = null;

    @property(cc.Button)
    takeBtn: cc.Button = null;
    @property(cc.Button)
    shelvesBtn: cc.Button = null;
    @property(cc.Button)
    offlineBtn: cc.Button = null;

    @property(cc.Node)
    empty: cc.Node = null;

    contentSelected = -1;

    classify: Classify = Classify.Ongoing;

    data: ConsignmentDetail[] = [];
    myConsignments: MyConsignmentsComplex = null;

    consignmentMarker: ConsignmentMarker[] = [];

    pageNumber = 1;

    readonly Page_Size = 8;

    // onLoad () {}
    start() {
        this.page.init(0, this.updatePage.bind(this));
        this.ongoingLabel.string = '出售中的物品0/8';

        this.initEvents();
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/marker/mine', []) as any;
        if (response.status === 0) {
            this.consignmentMarker = response.content as ConsignmentMarker[];
        }
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/mine', []) as any;
        if (response2.status === 0) {
            this.myConsignments = response2.content as MyConsignmentsComplex;
        }
        this.initClassify(this.classify, this.pageNumber);
    }

    initEvents() {
        this.classifyToggles.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.initClassify.bind(this, index)));
        });
        this.goodsItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onItem.bind(this, index)));
            item.addNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onItem.bind(this, index)));
        });
        this.takeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onTakeBtn.bind(this)));
        this.shelvesBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onShelvesBtn.bind(this)));
        this.offlineBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onOfflineBtn.bind(this)));
    }

    async onTakeBtn() {
        let item = this.goodsItems[this.contentSelected];
        let itemData = this.data[this.contentSelected];
        switch (item.type) {
            case TradingGoodsType.Noton:
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/cancel', [itemData.consignment.id]) as any;
                if (response.status === 0) {
                    this.adjustPage();

                    if (item.detail.pet != null) {
                        PetData.updatePetIds();
                    } else if (item.detail.enhanceLevel != null) {
                        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [itemData.consignment.goodsObjectId]) as any;
                        if (response.status === 0) {
                            let equipment = response.content as Equipment;
                            BagData.getInstance().pushEquipmentToBag(equipment);
                        }
                    } else {
                        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [itemData.consignment.goodsObjectId]) as any;
                        if (response.status === 0) {
                            let title = response.content as Title;
                            BagData.getInstance().addTitleToBag(title);
                        }
                    }
                    TipsManager.showMsgFromConfig(1178);
                }
                break;
            case TradingGoodsType.Obtain:
                let response2 = {} as any;
                if (itemData.consignment.sellerAccountId == PlayerData.getInstance().accountId) {
                    response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/obtainPayment', [itemData.consignment.id]) as any;
                    if (response2.status === 0) {
                        this.adjustPage();
                        TipsManager.showGainCurrency({ currencyId: 151, amount: CommonUtils.toCKb(itemData.consignment.price * 0.9) });
                    }
                } else {
                    response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/obtainGoods', [itemData.consignment.id]) as any;
                    if (response2.status === 0) {
                        this.adjustPage();

                        if (item.detail.pet != null) {
                            PetData.updatePetIds();
                        } else if (item.detail.enhanceLevel != null) {
                            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [itemData.consignment.goodsObjectId]) as any;
                            if (response.status === 0) {
                                let equipment = response.content as Equipment;
                                BagData.getInstance().pushEquipmentToBag(equipment);
                            }
                        } else {
                            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [itemData.consignment.goodsObjectId]) as any;
                            if (response.status === 0) {
                                let title = response.content as Title;
                                BagData.getInstance().addTitleToBag(title);
                            }
                        }
                        TipsManager.showMsgFromConfig(1178);
                    }
                }
                break;
        }

    }

    async onShelvesBtn() {

        let panel = await CommonUtils.getPanel('gameplay/trading/TradingShelvesTips', TradingShelvesTips) as TradingShelvesTips;
        let consignment = this.data[this.contentSelected].consignment;
        let type = ItemCategory.Equipment;
        if (consignment.goodsType == "EQUIPMENT") {
            type = ItemCategory.Equipment;
        } else if (consignment.goodsType == "PET") {
            type = 2;
        } else if (consignment.goodsType == "TITLE") {
            type = ItemCategory.Title;
        }
        panel.init(this.data[this.contentSelected].consignment, null, type);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    async onOfflineBtn() {

        let panel = await CommonUtils.getPanel('gameplay/trading/TradingNotShelvesTips', TradingNotShelvesTips) as TradingNotShelvesTips;
        panel.init(this.data[this.contentSelected].consignment);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    async onItem(index: number) {
        this.contentSelected = index;
        for (let ind = 0; ind < this.goodsItems.length; ind++) {
            let item = this.goodsItems[ind];
            if (ind == this.contentSelected) {
                item.showSelected();
                switch (item.type) {
                    case TradingGoodsType.Shelves:
                        this.takeBtn.node.active = false;
                        this.shelvesBtn.node.active = false;
                        this.offlineBtn.node.active = true;
                        break;
                    case TradingGoodsType.Noton:
                        this.takeBtn.node.active = true;
                        this.shelvesBtn.node.active = true;
                        this.offlineBtn.node.active = false;
                        break;
                    case TradingGoodsType.Obtain:
                        this.takeBtn.node.active = true;
                        this.shelvesBtn.node.active = false;
                        this.offlineBtn.node.active = false;
                        break;
                    case TradingGoodsType.Add:
                        this.takeBtn.node.active = false;
                        this.shelvesBtn.node.active = false;
                        this.offlineBtn.node.active = false;
                        let panel = await CommonUtils.getPanel('gameplay/trading/TradingShelvesPanel', TradingShelvesPanel) as TradingShelvesPanel;
                        panel.from = this;
                        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                        break;
                }
            } else {
                item.cancelSelected();
            }
        }
    }

    /** 选项初始化 */
    async initClassify(classify: Classify, pagem) {
        if (!(pagem instanceof Number)) {
            pagem = 1;
        }
        this.classify = classify;
        if (classify == Classify.Ongoing) {
            this.contentSelected = -1;
            this.page.node.parent.active = false;
            this.ongoingPrompt.active = true;

            this.takeBtn.node.active = false;
            this.shelvesBtn.node.active = false;
            this.offlineBtn.node.active = false;
            this.ongoingLabel.string = `出售中的物品  ${this.myConsignments.onSaleConsignments.length}/8`;
            this.data = R.concat(this.myConsignments.onSaleConsignments)(this.myConsignments.suspendedConsignments);
            this.updateShow();
            this.empty.active = false;
        } else {
            this.page.node.parent.active = true;
            this.ongoingPrompt.active = false;
            this.updatePage(pagem);
        }
    }

    async updatePage(pageNumber: number) {
        if (this.classify == Classify.Ongoing) {
            return;
        }
        this.pageNumber = pageNumber;
        this.contentSelected = -1;

        this.takeBtn.node.active = false;
        this.shelvesBtn.node.active = false;
        this.offlineBtn.node.active = false;
        let list = R.concat(this.myConsignments.paymentObtainableConsignments)(this.myConsignments.goodsObtainableConsignments);
        this.data = R.slice(this.Page_Size * (pageNumber - 1), this.Page_Size * pageNumber, list);
        this.page.setMax(Math.ceil(list.length / this.Page_Size));
        this.page.setPage(pageNumber);
        this.updateShow();
        if (this.data.length == 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
    }

    async updateShow() {
        this.goodsItems.forEach((item, index) => {
            if (index < this.data.length) {
                item.node.active = true;
                item.init(this.data[index].consignment, true);
                item.setCollectionLabel(this.data[index].markerCount);
            } else {
                if (this.classify == Classify.Ongoing) {
                    item.node.active = true;
                    item.init(null, false);
                } else {
                    item.node.active = false;
                }
            }
        });
    }

    toIsFocus(consignmentId: number) {
        for (let mekar of this.consignmentMarker) {
            if (mekar.consignmentId == consignmentId) {
                return true;
            }
        }
        return false;
    }

    adjustPage() {
        if (this.data.length == 1 && this.pageNumber > 1) {
            this.pageNumber -= 1;
        }
        this.init();
    }

    // update (dt) {}
}
