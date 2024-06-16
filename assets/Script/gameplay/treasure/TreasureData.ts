import { ConfigUtils } from "../../utils/ConfigUtil";
import Optional from "../../cocosExtend/Optional";

export interface TreasureAward {
    id: number;
    name: string;
    interfaceBroadcastId: number;
    currencyId: number;
    broadcastId: number;
    amount: number;
}
export interface TreasurePlace {
    id: number;
    name: string;
    mapId: number;
    initialX: number;
    initialY: number;
    probability: number;
}

export default class TreasureData {
    private static _instance: TreasureData = null;
    private confTreasurePlaces: Array<TreasurePlace> = [];
    private confTreasureAwards: Array<TreasureAward> = [];

    private isInit = true;


    public static getInstance() {
        if (this._instance == null) {
            this._instance = new TreasureData();
        }
        return this._instance;
    }

    async initConfig() {
        if (!this.isInit) {
            return;
        }
        let configPlace = (await ConfigUtils.getConfigJson('TreasurePlace'));
        for (let key in configPlace) {
            let value = R.prop(key, configPlace);
            this.confTreasurePlaces[key] = value;
        }
        /*
        let configAward = (await ConfigUtils.getConfigJson('TreasureAward'));
        for (let key in configAward) {
            let value = R.prop(key, configAward);
            this.confTreasureAwards[key] = value;
        }
        */
        this.isInit = false;
    }

    getTreasurePlaceById(id: number) {
        return new Optional<TreasurePlace>(this.confTreasurePlaces[id]);
    }

    getTreasureAwardById(id: number) {
        return new Optional<TreasureAward>(this.confTreasureAwards[id]);
    }

    randomTreasureMap() {
        let weight: Array<number> = [];
        let max = 0;
        weight.push(max);
        this.confTreasurePlaces.forEach((item, index) => {
            max += item.probability;
            weight.push(max);
        });

        let random = Math.random() * max;
        let mapId = 0;
        for (let key = 1; key < weight.length; key++) {
            if (random >= weight[key - 1] && random < weight[key]) {
                mapId = key;
                break;
            }
        }
        return new Optional<TreasurePlace>(this.confTreasurePlaces[mapId]);
    }
}