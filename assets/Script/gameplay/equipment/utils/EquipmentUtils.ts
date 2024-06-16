import EquipmentTips from "../tips/EquipmentTips";
import { Equipment } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import BagItem from "../../../bag/BagItem";
import ItemConfig, { ItemCategory, EquipmentPrototype, ItemDisplay } from "../../../bag/ItemConfig";
import Optional from "../../../cocosExtend/Optional";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";

export module EquipUtils {
	
    let paramsData = {};
    let enchanceConfig = {};
    let spSkillConfig = {}
    let enhanceSkillConfig = {}
	
    export async function initEnhanceConfig () {
        enchanceConfig = await ConfigUtils.getConfigJson('EquipmentStrengthening');
        spSkillConfig = await ConfigUtils.getConfigJson('EquipmentSpeciallyEffect');
        enhanceSkillConfig = await ConfigUtils.getConfigJson('EquipmentSchoolStrengthen');
    }

    export function showEquipmentTips (equipment: Equipment) {
        return async () => {
            if (!equipment) { return; }
            let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
            panel.init(genBagItem(equipment));
            panel.removeButtons();
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }
    
    export function genBagItem (equipment: Equipment) {
        let bagItem = new BagItem();
        bagItem.data = equipment;
        bagItem.category = ItemCategory.Equipment;
        return bagItem;
    }
    
    export function getProto (equipment: Equipment): Optional<EquipmentPrototype> {
        return ItemConfig.getInstance().getEquipmentPrototypeById(equipment.definitionId);
    }
    
    export function getDisplay (equipment: Equipment, prefabId = null): Optional<ItemDisplay> {
        if (prefabId == null) {
            prefabId = PlayerData.getInstance().prefabId;
        }
        return ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, prefabId);
    }
    
    export function getScale (level): number {
       return R.path([level, 'ability'], enchanceConfig)
    }
    
    export function getFc (e: Equipment): number {
        return Math.floor(e.baseFc * (1 + getScale(e.enhanceLevel)))
    }
    
    export function updateParams (id, params) {
        paramsData[id] = params;
    }
    
    export function getSRate (level) {
        return String(enchanceConfig[level]['success']);
    }
    
    export function getPrice (level) {
        return enchanceConfig[level]['amount']
    }
    
    export function getRecommendedPrice (level) {
        return enchanceConfig[level]['recommendedPrice']
    }
    
    // 特效
    export function getSpSkill (spId) {
        return R.clone(spSkillConfig[spId]);
    }
    
    export function getEffectIds(equipment: Equipment) {
        let text = equipment.effectsText;
        let arr = text == "" ? [] : text.split(',')
        return arr.filter(id => {
            let idInt = parseInt(id)
            return idInt >= 600 && idInt <= 699
        });
    }
    
    export function getEnhanceSkill (spId) {
        return R.clone(enhanceSkillConfig[spId]);
    }
    
    // 神装
    export async function getGodEquipmentById (id: number):Promise<Optional<Equipment>> {
        let config = await ConfigUtils.getConfigJson('GodEquipment');
        let equipmentInfo = R.prop(id, config)
        if (equipmentInfo) {
            return new Optional<Equipment>()
        } else {
            return new Optional<Equipment>()
        }
    }
    
    export function getSpSkillConfig () {
        return spSkillConfig;
    }
    
    export function getRealFc(equipment: Equipment) {
        let realAttr = (x : number, y : number) => Math.floor(x * (1 + y))
        let effectsText = R.prop('effectsText', equipment);
        let effectIds = effectsText == "" ? []: effectsText.split(',').map(x => parseInt(x));
        let effectFc = R.reduce((x, y) => {
            if (y >= 600) {
                let config = EquipUtils.getSpSkill(y);
                return x + config.fc;
            } else if (y < 600 && y >= 500) {
                let config = EquipUtils.getEnhanceSkill(y);
                return x + config.fc
            } else {
                return x;
            }
        }, 0, effectIds)
        let scale : number = EquipUtils.getScale(equipment.enhanceLevel);
        return realAttr(R.prop('baseFc', equipment), scale) + effectFc;
    }

}
