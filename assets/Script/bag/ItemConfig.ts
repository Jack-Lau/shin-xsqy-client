import Optional from "../cocosExtend/Optional";
import { ConfigUtils } from "../utils/ConfigUtil";

export enum PetQuality { Green = 2, Blue = 3, Purple = 4, Orange = 5, Shen = 6 };
export enum ItemQuality { None, White, Green, Blue, Purple, Orange, Gold };
export enum ItemCategory { Equipment = 1, Currency = 2, Title = 3, JustShow = 4, Fashion = 5}
export enum EquipmentPart { Head = 'head', Necklace = 'necklace', Clothes = 'clothes', Weapon = 'weapon', Belt = 'belt', Shoes = 'shoes' };

export interface ItemDisplay {
    prototypeId: number;
    type: ItemCategory;
    prefabId: Optional<number>;
    iconId: number;
    modelId: number;
    name: string;
    description: string;
    showBorderEffect: boolean;
    priority: number;
    disappear: number;
    quality: ItemQuality;
}

export interface Currency {
    id: number;
    name: string;
}

interface Attribute {
    id: number;
    name: string;
    min: number;
    max: number;
}

export interface EquipmentPrototype {
    id: number;
    name: string;
    quality: ItemQuality;
    part: EquipmentPart;
    recommendedPrice: number;
    attr1: Attribute;
    attr2: Attribute;
}

export default class ItemConfig {
    private static _instance: ItemConfig = null;
    private equipmentPrototypeInfo: { [key: string]: EquipmentPrototype } = {};
    private itemDisplayInfo: { [key: string]: ItemDisplay } = {};
    private currencyInfo: { [key: string]: Currency } = {};

    private constructor() {
        this.init();
    }

    public static getInstance(): ItemConfig {
        if (!this._instance) {
            this._instance = new ItemConfig();
        }
        return this._instance;
    }

    getItemDisplayById(id: number, prefabId: number): Optional<ItemDisplay> {
        if (R.prop(id, this.itemDisplayInfo)) {
            return new Optional<ItemDisplay>(R.prop(id, this.itemDisplayInfo));
        } else {
            return new Optional<ItemDisplay>(R.prop(id + '' + prefabId, this.itemDisplayInfo));
        }
    }


    getEquipmentPrototypeById(id: number): Optional<EquipmentPrototype> {
        return new Optional<EquipmentPrototype>(R.prop(id, this.equipmentPrototypeInfo));
    }

    async init() {
        let itemDiplayConfig = await ConfigUtils.getConfigJson('ItemDisplay');
        for (let key in itemDiplayConfig) {
            let itemDiplay = this.genItemDisplay(itemDiplayConfig[key]);
            if (itemDiplay.prefabId.isValid()) {
                this.itemDisplayInfo[itemDiplay.prototypeId + '' + itemDiplay.prefabId.getValue()] = itemDiplay;
            } else {
                this.itemDisplayInfo[itemDiplay.prototypeId] = itemDiplay;
            }
        }

        let prototypeConfig = await ConfigUtils.getConfigJson('EquipmentProduce');
        for (let key in prototypeConfig) {
            let prototype = this.genEquipmentPrototype(prototypeConfig[key]);
            this.equipmentPrototypeInfo[prototype.id] = prototype;
        }

        let currencyConfig = await ConfigUtils.getConfigJson('Currency');
        for (let key in currencyConfig) {
            let value = currencyConfig[key];
            this.currencyInfo[key] = {
                id: R.prop('id', value),
                name: R.prop('name', value)
            }
        }
    }

    genItemDisplay(config) {
        let itemDisplay: ItemDisplay = {
            prototypeId: R.prop('modelId', config),
            type: this.getItemCategory(R.prop('type', config)),
            prefabId: new Optional<number>(R.prop('prefabId', config)),
            iconId: R.prop('icon', config),
            modelId: R.prop('model', config),
            name: R.prop('name', config),
            description: R.prop('description', config),
            showBorderEffect: R.prop('showBorderEffect', config) == 1,
            priority: R.prop('priority', config),
            disappear: R.prop('disappear', config),
            quality: this.getEquipmentQuality(R.prop('color', config)),
        };
        return itemDisplay;
    }

    getCurrencyInfo(id: number): Optional<Currency> {
        if (this.currencyInfo[id]) {
            return new Optional<Currency>(this.currencyInfo[id]);
        } else {
            return new Optional<Currency>();
        }
    }

    getItemCategory(num: number): ItemCategory {
        if (num === 1) { return ItemCategory.Equipment; }
        else if (num === 2) { return ItemCategory.Currency; }
        else return ItemCategory.Title;
    }

    genEquipmentPrototype(config): EquipmentPrototype {
        return {
            id: R.prop('id', config),
            name: R.prop('name', config),
            quality: this.getEquipmentQuality(R.prop('color', config)),
            part: this.getEquipmentPart(R.prop('part', config)),
            recommendedPrice:R.prop('recommendedPrice', config),
            attr1: {
                id: R.path(['attr', 0, 'attrId'], config),
                name: R.path(['attr', 0, 'outputAttribute'], config),
                min: R.path(['attr', 0, 'outputMin'], config),
                max: R.path(['attr', 0, 'outputMax'], config),
            },
            attr2: {
                id: R.path(['attr', 1, 'attrId'], config),
                name: R.path(['attr', 1, 'outputAttribute'], config),
                min: R.path(['attr', 1, 'outputMin'], config),
                max: R.path(['attr', 1, 'outputMax'], config),
            }
        }
    }

    getEquipmentQuality(color: number): ItemQuality {
        switch (color) {
            case 1: { return ItemQuality.White; }
            case 2: { return ItemQuality.Green; }
            case 3: { return ItemQuality.Blue; }
            case 4: { return ItemQuality.Purple; }
            case 5: { return ItemQuality.Orange; }
            case 5: { return ItemQuality.Gold; }
            default: { console.error('ERROR! UNKOWN COLOR: ', color); return ItemQuality.Green; }
        }
    }

    getEquipmentPart(part: number): EquipmentPart {
        switch (part) {
            case 10: { return EquipmentPart.Weapon; }
            case 21: { return EquipmentPart.Head; }
            case 22: { return EquipmentPart.Clothes; }
            case 23: { return EquipmentPart.Shoes; }
            case 24: { return EquipmentPart.Belt; }
            case 25: { return EquipmentPart.Necklace; }
            default: { console.error('ERROR! UNKOWN PART: ', part); return EquipmentPart.Weapon }
        }
    }

    getEquipmentPartInex(part: EquipmentPart): number {
        switch (part) {
            case EquipmentPart.Weapon: { return 10; }
            case EquipmentPart.Head: { return 21; }
            case EquipmentPart.Clothes: { return 22; }
            case EquipmentPart.Shoes: { return 23; }
            case EquipmentPart.Belt: { return 24; }
            case EquipmentPart.Necklace: { return 25; }
            default: { console.error('ERROR! UNKOWN PART: ', part); return 10 }
        }
    }
}