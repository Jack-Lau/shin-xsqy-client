import SideEffect from "../cocosExtend/Effect";
import BagItem from "./BagItem";
import ItemConfig, { EquipmentPart, ItemCategory, ItemQuality } from "./ItemConfig";
import { NetUtils } from "../net/NetUtils";
import PlayerData from "../data/PlayerData";
import { CurrencyRecord, Equipment, Title, Fashion } from "../net/Protocol";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import Optional from "../cocosExtend/Optional";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import { TitleConfig } from "../player/title/TitleConfig";
import { CommonUtils } from "../utils/CommonUtils";


export default class BagData {
    private static _instance: BagData = null;
    bagItems: Array<BagItem> = [];

    readonly PAGE_SIZE = 30;

    private constructor() {

    }

    public static getInstance(): BagData {
        if (!this._instance) {
            this._instance = new BagData();
        }
        return this._instance;
    }

    async initData() {
        this.bagItems = [];
        let currencyResponse = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}', [PlayerData.getInstance().accountId]) as any;
        if (currencyResponse.status === 0) {
            let arr = currencyResponse.content as Array<CurrencyRecord>;
            let filterFunc = (record: CurrencyRecord): boolean => {
                let show = ItemConfig.getInstance().getItemDisplayById(record.currencyId, PlayerData.getInstance().prefabId).fmap(x => x.disappear);
                return record.amount > 0 && show.valid && show.val == 1;
            }
            let _this = this;
            let pushFunc = (record: CurrencyRecord) => {
                let bagItem = new BagItem();
                bagItem.category = ItemCategory.Currency;
                bagItem.data = record;
                _this.bagItems.push(bagItem);
            }
            R.forEach(pushFunc, R.filter(filterFunc, arr));
        }
        let equipmentResponse = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/viewMine', []) as any;
        if (equipmentResponse.status === 0) {
            let arr = equipmentResponse.content as Array<Equipment>;
            let _this = this;
            let filterFunc = (equipment: Equipment) => {
                return PlayerData.getInstance().equipedIds.indexOf(equipment.id) == -1;
            }
            let pushFunc = (equipment: Equipment) => {
                let bagItem = new BagItem();
                bagItem.category = ItemCategory.Equipment;
                bagItem.data = equipment;
                _this.bagItems.push(bagItem);
            }
            R.forEach(pushFunc, R.filter(filterFunc, arr));
        }
        let titleResponse = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/viewMine', []);
        if (titleResponse.status === 0) {
            let arr = titleResponse.content as Array<Title>;
            let _this = this;
            let pushFunc = (title: Title) => {
                let bagItem = new BagItem();
                bagItem.category = ItemCategory.Title;
                bagItem.data = title;
                _this.bagItems.push(bagItem);
            }
            R.forEach(pushFunc, arr);
        }

        let fashions = (await NetUtils.get<Array<Fashion>>('/fashion/getByAccountId', [])).getOrElse([]);
        let _this = this;
        let pushFunc = (fashion: Fashion) => {
            let bagItem = new BagItem();
            bagItem.category = ItemCategory.Fashion;
            bagItem.data = fashion;
            _this.bagItems.push(bagItem);
        }
        R.forEach(pushFunc, fashions);
        this.bagItems = this.sortData(this.bagItems);
    }

    getQuickUseItems() {
        return R.filter(R.prop('quickUse'), this.bagItems)
    }

    sortData(data: Array<BagItem>): Array<BagItem> {
        let sort = R.sortWith([
            R.descend(R.prop('priority')),
            R.ascend(R.prop('definitionId')),
            R.descend(R.prop('fc'))
        ]);

        return sort(data);
    }

    // items
    getItemPageNum() {
        let pageNum = Math.ceil(this.bagItems.length / this.PAGE_SIZE);
        return R.max(pageNum, 1);
    }

    // 0 ~ getItemPageNum
    getItemsByPage(page: number) {
        return R.slice(this.PAGE_SIZE * page, this.PAGE_SIZE * (page + 1), this.bagItems);
    }

    // equipments
    getAllEquipments(): Array<BagItem> {
        return R.filter(this.isEquipment, this.bagItems);
    }

    getEquipmentByPage(pageNum: number, pageSize: number): Array<BagItem> {
        return R.slice(pageSize * pageNum, pageSize * (pageNum + 1), this.getAllEquipments());
    }

    getEquipmentsByPart(part: EquipmentPart): Array<BagItem> {
        return R.filter(
            _ => this.isEquipment(_) && this.isThePart(_, part),
            this.bagItems
        );
    }

    isEquipment(item: BagItem): boolean {
        return item.category === ItemCategory.Equipment;
    }

    isTitle(item: BagItem): boolean {
        if (item.category === ItemCategory.Title) {
            let data = item.data as Title;
            if (TitleConfig.getConfigById(data.definitionId))
                return !PlayerData.getInstance().title.fmap(t => t.id == data.id).getOrElse(false);
        }
        return false;
    }

    async getAllTitles() {
        let titles: Array<BagItem> = [];
        for (let bag of this.bagItems) {
            if (bag.category === ItemCategory.Title) {
                let data = bag.data as Title;
                if (!PlayerData.getInstance().title.fmap(t => t.id == data.id).getOrElse(false)) {
                    let config = await TitleConfig.getConfigById(data.definitionId);
                    let serverTime = CommonUtils.getServerTime();
                    let time = (data.tradeLockTime as any);
                    if (config.type == 1 && serverTime > time) {
                        titles.push(bag);
                    }
                }
            }
        }
        return this.sortData(titles);
    }

    async getTitleByPage(pageNum: number, pageSize: number){
        let titles = await this.getAllTitles();
        return R.slice(pageSize * pageNum, pageSize * (pageNum + 1), titles);
    }

    getAllTradEquipments(): Array<BagItem> {
        let isTrad = (item: BagItem) => {
            if (item.category === ItemCategory.Equipment) {
                let data = item.data as Equipment;
                let serverTime = CommonUtils.getServerTime();
                let time = (data.nextWithdrawTime as any);
                if (serverTime > time) {
                    return ItemConfig.getInstance().getItemDisplayById(data.definitionId, PlayerData.getInstance().prefabId).fmap(x => x.quality).getOrElse(ItemQuality.Green) != ItemQuality.Green;
                }
            }
            return false;
        }
        return R.filter(isTrad, this.bagItems);
    }

    getTradEquipmentByPage(pageNum: number, pageSize: number): Array<BagItem> {
        return R.slice(pageSize * pageNum, pageSize * (pageNum + 1), this.getAllTradEquipments());
    }

    isThePart(item: BagItem, part: EquipmentPart): boolean {
        let prototype = item.getPrototype();
        if (!prototype.isValid()) { return false; }
        return prototype.getValue().part === part;
    }

    getCurrencyNum(currencyId) {
        if (currencyId == 150) {
            return PlayerData.getInstance().ybAmount;
        } else if (currencyId == 151) {
            return PlayerData.getInstance().kbAmount;
        } else {
            let index = this.findCurrency(currencyId);
            if (index != -1) {
                return (this.bagItems[index].data as CurrencyRecord).amount;
            } else {
                return 0;
            }
        }
    }

    showBestEquipment(e: Equipment) {
        let part = EquipUtils.getProto(e).fmap(x => x.part);
        if (part.valid) {
            let best = R.head(this.getEquipmentsByPart(part.val));
            EventDispatcher.dispatch(Notify.BAG_ADD_NEW_EQUIPMENT, { equipment: best.data });
        }
    }

    // side effects
    updateEquipmentInfo(data: Equipment): SideEffect {
        let index = this.findEquipment(data.id);
        if (index != -1) {
            this.bagItems[index].data = data;
            this.bagItems = this.sortData(this.bagItems);
            EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
            return SideEffect.getInstance('pushEquipmentToBag');
        }
    }

    pushEquipmentToBag(data: Equipment, isDisArm: boolean = false): SideEffect {
        let bagItem = new BagItem();
        bagItem.data = data;
        bagItem.category = ItemCategory.Equipment;
        this.bagItems.push(bagItem);
        this.bagItems = this.sortData(this.bagItems);
        EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
        if (!isDisArm) {
            this.showBestEquipment(data);
        }
        return SideEffect.getInstance('pushEquipmentToBag');
    }

    async pushEquipmentIdToBag(equipmentId: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [equipmentId]);
        if (response.status === 0) {
            let bagItem = new BagItem();
            bagItem.data = response.content;
            bagItem.category = ItemCategory.Equipment;
            this.bagItems.push(bagItem);
            this.bagItems = this.sortData(this.bagItems);
            this.showBestEquipment(response.content);
            EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
        }
    }

    removeEquipmentFromBag(data: Equipment): SideEffect {
        this.bagItems = R.filter((bagItem: BagItem) => {
            return bagItem.category !== ItemCategory.Equipment || (R.prop('id', bagItem.data) !== data.id)
        }, this.bagItems);
        EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
        EventDispatcher.dispatch(Notify.BAG_REMOVE_EQUIPMENT, {});
        return SideEffect.getInstance('removeEquipmentFromBag');
    }

    removeBagItems(data: Array<BagItem>): SideEffect {
        let notInArr = id => {
            for (let ele of data) {
                if (R.path(['data', 'id'], ele) === id) {
                    return false;
                }
            }
            return true;
        }
        this.bagItems = R.filter((bagItem: BagItem) => {
            return bagItem.category !== ItemCategory.Equipment || notInArr(R.prop('id', bagItem.data))
        }, this.bagItems);
        EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
        EventDispatcher.dispatch(Notify.BAG_REMOVE_EQUIPMENT, {});
        return SideEffect.getInstance('removeBagItems');
    }

    updateCurrencyAmount(currencyId: number, amount: number): SideEffect {
        let index = this.findCurrency(currencyId);
        if (index != -1) {
            if (amount == 0) {
                this.bagItems = R.remove(index, 1, this.bagItems);
            } else {
                (this.bagItems[index].data as CurrencyRecord).amount = amount;
            }
        } else {
            let bagItem = new BagItem();
            bagItem.category = ItemCategory.Currency;
            bagItem.data = { 'accountId': PlayerData.getInstance().accountId, 'amount': amount, 'currencyId': currencyId };
            this.bagItems.push(bagItem);
            this.bagItems = this.sortData(this.bagItems);
        }

        EventDispatcher.dispatch(Notify.BAG_CURRENCY_NUM_CHANGE, { stack: { currencyId: currencyId, amount: amount } });
        EventDispatcher.dispatch(Notify.BAG_ITEM_CHANGE, {});
        return SideEffect.getInstance('updateCurrencyAmount');
    }

    addTitleToBag(title: Title) {
        let bagItem = new BagItem();
        bagItem.category = ItemCategory.Title;
        bagItem.data = title;
        this.bagItems.push(bagItem);
        this.bagItems = this.sortData(this.bagItems);
        return SideEffect.getInstance('addTitleToBag');
    }

    findCurrency(currencyId) {
        return R.findIndex(item => item.category == ItemCategory.Currency && item.data.currencyId == currencyId, this.bagItems);
    }

    findEquipment(equipmentId) {
        return R.findIndex(item => item.category == ItemCategory.Equipment && item.data.id == equipmentId, this.bagItems);
    }
}
