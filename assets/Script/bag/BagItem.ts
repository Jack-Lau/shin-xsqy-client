import { Equipment, CurrencyRecord, Title, Fashion } from "../net/Protocol";
import ItemConfig, { ItemCategory } from "./ItemConfig";
import Optional from "../cocosExtend/Optional";
import PlayerData from "../data/PlayerData";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import { JustShow } from "../gameplay/activity/ActivityBoxTips";

export default class BagItem {
    data: CurrencyRecord | Equipment | Title | JustShow | Fashion;
    category: ItemCategory;

    get fc(): number {
        if (this.category === ItemCategory.Equipment) {
            return EquipUtils.getRealFc(this.data as Equipment);
        } else {
            return 0;
        }
    }

    get priority(): number {
        let id = 0;
        if (this.category === ItemCategory.Equipment) {
            id = R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.Currency) {
            id = R.prop('currencyId', this.data);
        } else if (this.category === ItemCategory.JustShow) {
            id = R.prop('modelId', this.data);
        } else if (this.category === ItemCategory.Fashion) {
            id = R.prop('definitionId', this.data);
        } 
        let itemDisplay = ItemConfig.getInstance().getItemDisplayById(id, PlayerData.getInstance().prefabId);
        if (itemDisplay.isValid()) {
            return itemDisplay.getValue().priority;
        } else {
            return 0;
        }
    }

    get definitionId(): number {
        if (this.category === ItemCategory.Equipment) {
            return R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.Currency) {
            return R.prop('currencyId', this.data);
        } else if (this.category === ItemCategory.Title) {
            return R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.Fashion) {
            return R.prop('definitionId', this.data);
        } else {
            return 0;
        }
    }

    getItemDisplay() {
        let id = 0;
        if (this.category === ItemCategory.Equipment) {
            id = R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.Currency) {
            id = R.prop('currencyId', this.data);
        } else if (this.category === ItemCategory.Title) {
            id = R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.JustShow) {
            id = R.prop('modelId', this.data);
        } else if (this.category === ItemCategory.Fashion) {
            id = R.prop('definitionId', this.data);
        }
        return ItemConfig.getInstance().getItemDisplayById(id, PlayerData.getInstance().prefabId);
    }

    getPrototype() {
        let id = 0;
        if (this.category === ItemCategory.Equipment) {
            id = R.prop('definitionId', this.data);
        } else if (this.category === ItemCategory.Currency) {
            id = R.prop('currencyId', this.data);
        } else if (this.category === ItemCategory.JustShow) {
            id = R.prop('modelId', this.data);
        } 
        return ItemConfig.getInstance().getEquipmentPrototypeById(id);
    }
}
