import Optional from "../../cocosExtend/Optional";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { Fashion, FashionDye } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import { update } from "immutable";
import FashionTips from "./FashionTips";

export module FashionConfig {

    const OFFSET_MIN = -0.3;
    const OFFSET_MAX = 0.5;

    // 0 - 100 -> (min, max)
    export function pToB(p) {
        return p * (OFFSET_MAX - OFFSET_MIN) + OFFSET_MIN
    }

    export function bToP(b) {
        return (b - OFFSET_MIN) / (OFFSET_MAX - OFFSET_MIN);
    }


    interface FashionInfo {
        id: number;
        perfabName: string;
        modelOne: number;
        modelFour: number;
        modelThree: number;
        modelTwo: number;
        limitedQuantity: number;
        dyeCostModel: number;
        changeDyeCost: number;
    }

    interface PartColor {
        id: number; // part
        color: number,
        saturation: number,
        brightness: number,
    }

    export async function getPresetColor(definitionId, model) {
        let prefabId = getPrefabId(definitionId);
        let config = await ConfigUtils.getConfigJson('FashionPreset');
        let value =  R.find(x => x.exampleId == prefabId && x.alwayUse == model, R.values(config));
        if (value) {
            return R.prop('part', value);
        } else {
            return null;
        }
    }

    export async function getFashionInfo(definitionId: number): Promise<Optional<FashionInfo>> {
        let fashionConfig =  await ConfigUtils.getConfigJson('FashionInfo');
        return new Optional(fashionConfig[definitionId]);
    }

    export async function getCostModel (definitionId: number) {
        let config = await getFashionInfo(definitionId);
        let modelConfig = await ConfigUtils.getConfigJson('FashionDyeCost');
        return config.monadBind(x => new Optional(modelConfig[x.dyeCostModel]))
    }

    export async function getDefaultColor(prefabId: number): Promise<Array<PartColor>> {
        let colorConfig = await ConfigUtils.getConfigJson('FashionDefaultColor');
        return R.path([prefabId, 'part'], colorConfig);
    }

    export async function getDefaultColor2(definitionId: number): Promise<Array<PartColor>> {
        let colorConfig = await ConfigUtils.getConfigJson('FashionDefaultColor');
        let prefabId = getPrefabId(definitionId);
        return R.path([prefabId, 'part'], colorConfig);
    }

    export let dyesCache = {};

    export async function getDyes(definitionId: number) {
        let dyes = await NetUtils.get<Array<FashionDye>>('/fashion/getDyeByAccountIdAndDefinitionId', [definitionId]);
        if (dyes.right) {
            dyes.right.forEach(ele => {
                dyesCache[ele.id] = ele;
            })
            return dyes.right;
        } else {
            console.error(dyes.left);
        }
        return [];
    }

    export async function getDye(dyeId: number): Promise<Optional<FashionDye>> {
        if (dyeId == undefined || dyeId == 0) {
            return Optional.Nothing();
        }
        if (dyesCache[dyeId] == undefined) {
            let dye = await NetUtils.get<FashionDye>('/fashion/getDye', [dyeId]);
            if (dye.isRight) {
                dyesCache[dye.right.id] = dye.right;
            } else {
                CommonUtils.reportError('/fashion/getDye', [dyeId], dye.left);
            }
        }
        return new Optional<FashionDye>(dyesCache[dyeId]);
    }

    export async function getCurrentUseDye(definitionId:number) : Promise<Optional<FashionDye>> {
        let dyes = await getDyes(definitionId)
        return new Optional<FashionDye>(R.find(R.prop('inUse'), dyes))
    } 

    export function getPrefabId(definitionId: number, orginalPrefabId = PlayerData.getInstance().prefabId) {
        let prefabId = ItemConfig.getInstance().getItemDisplayById(definitionId, orginalPrefabId).fmap(x => x.modelId).getOrElse(4000005);
        return prefabId;
    }

    export let fashionList: Array<Fashion> = [];
    export function updateFashionDyeId(fashion: Fashion, dyeId: number) {
        fashionList.forEach(ele => {
            if (ele.id == fashion.id) {
                ele.dyeId = dyeId;
            }
        })
    } 

    export async function showFashionTips(fashion, playerPrefabId = PlayerData.getInstance().prefabId) {
        let panel = await CommonUtils.getPanel('gameplay/fashion/fashionTips', FashionTips) as FashionTips;
        panel.init(fashion, playerPrefabId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel}); 
    }
}