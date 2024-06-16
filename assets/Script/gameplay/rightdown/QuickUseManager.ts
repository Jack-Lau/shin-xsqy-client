import { CurrencyStack, Equipment } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { EquipmentPart } from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import QuickUseBox from "./QuickUseBox";
import { CommonUtils } from "../../utils/CommonUtils";
import BagData from "../../bag/BagData";

/**
 * get   :  获取并移除一个
 * push  :  放入一个
 * clear :  清空所有
 */
export module QuickUseManager {
    export async function init () {
        EventDispatcher.on(Notify.BAG_ADD_NEW_EQUIPMENT, onNewEquipment);
        EventDispatcher.on(Notify.BAG_REMOVE_EQUIPMENT, onRemoveEquipment);
        EventDispatcher.on(Notify.BAG_CURRENCY_NUM_CHANGE, onCurrencyChange);
    }

    function onNewEquipment (event: EventDispatcher.NotifyEvent) {
        let equipment = event.detail.equipment as Equipment;
        pushE(equipment);
        EventDispatcher.dispatch(Notify.QUICK_USE_REFRESH, {});
    }

    function onRemoveEquipment (event: EventDispatcher.NotifyEvent) {
        equipments = equipments.filter(x => BagData.getInstance().findEquipment(x.id) != -1);
        EventDispatcher.dispatch(Notify.QUICK_USE_REFRESH, {});
    }

    /**
     *  1. 如果货币数为0，则移除
     *  2. 如果当前已拥有
          1) 如果新数量比当前大，当放在第一位
          2) 如果新数量比当前小，则更新数量
        3. 如果无，则直接放在第一位
     */
    function onCurrencyChange (event: EventDispatcher.NotifyEvent) {
        let stack = event.detail.stack as CurrencyStack;
        let currencyId = stack.currencyId;
        if (currencyId < 20000 || currencyId > 29999) { 
            return;
        }
        if (stack.amount == 0) {
            removeC(stack);
        } else {
            pushC(stack);
        }
        EventDispatcher.dispatch(Notify.QUICK_USE_REFRESH, {});
    }

    // 物品的快捷使用
    let quickUseItems = Immutable.List<CurrencyStack>() 
    function pushC (cs: CurrencyStack) {
        quickUseItems = _removeC(cs, quickUseItems).unshift(cs)
    }

    export function removeC (cs: CurrencyStack) {
        quickUseItems = _removeC(cs, quickUseItems)
    }

    function _removeC (cs: CurrencyStack, list: Immutable.List<CurrencyStack>) {
        return list.filter(x => x.currencyId != cs.currencyId)
    }

    export function getC (): Optional<CurrencyStack> {
        return new Optional<CurrencyStack>(quickUseItems.first())
    }

    export function clearC () {
        quickUseItems = quickUseItems.clear()
    }

    // 装备的快捷使用
    let equipments = Immutable.List<Equipment>();
    let equipmentTrash = Immutable.Map<EquipmentPart, Equipment>({});
    export function pushE (e: Equipment) {
        let proto = EquipUtils.getProto(e);
        // 1. 如果当前战力比新装备战力高，则不出现
        let currentEquipment = proto.fmap(x => x.part).monadBind(p => PlayerData.getInstance().equipments[p]);
        if (currentEquipment.valid && higherFc(currentEquipment.val, e)) {
            return;
        }
        // note: 如果垃圾桶内有此部位装备，则当前必然没有
        // 2.1 如果当前新装备战力比在垃圾桶中的装备战力低，则出现垃圾桶的装备， 并移除垃圾桶内该部位装备
        // 2.2 如果当前新装备战力比在垃圾桶中的装备战力高，则出现该装备，并移除垃圾桶内该部位装备
        let oldEquipment = proto.fmap(x => x.part).fmap(p => equipmentTrash.get(p));
        if (oldEquipment.valid && higherFc(oldEquipment.val, e)) {
            equipments = equipments.unshift(oldEquipment.val);
            equipmentTrash = equipmentTrash.delete(proto.fmap(x => x.part).val);
        } else if (proto.valid) {
            equipmentTrash = equipmentTrash.delete(proto.fmap(x => x.part).val);
            let len = equipments.filter(x => betterEquipment(x, e)).size;
            if (len == 0) {
                equipments = _removeE(e, equipments).unshift(e);
            }
        }
    }

    export function removeE (e: Equipment, equiped: boolean) {
        if (!equiped) { // 如果没有装备，则移到垃圾桶
            let proto = EquipUtils.getProto(e);
            let oldEquipment = proto.fmap(x => x.part).fmap(p => equipmentTrash.get(p));
            if (oldEquipment.valid && higherFc(oldEquipment.val, e)) {
                return;
            } else if (proto.valid){
                equipmentTrash.set(proto.val.part, e);
            }
        }
        equipments = _removeE(e, equipments);
    }

    function betterEquipment(e1: Equipment, e2: Equipment): Boolean {
        return higherFc(e1, e2) && samePart(e1, e2);
    }

    function higherFc(e1: Equipment, e2: Equipment): Boolean {
        return EquipUtils.getFc(e1) > EquipUtils.getFc(e2)
    }

    function _removeE (e: Equipment, list: Immutable.List<Equipment>): Immutable.List<Equipment> {
       return list.filter(x => !samePart(x, e));
    }

    function samePart(e1: Equipment, e2: Equipment): Boolean {
        let p1 = EquipUtils.getProto(e1);
        let p2 = EquipUtils.getProto(e2);
        return p1.valid && p2.valid && p2.val.part == p1.val.part;
    }

    export function getE () : Optional<Equipment> {
        return new Optional<Equipment>(equipments.first());
    }

    export function clearE () {
        equipments = equipments.clear()
    }
}
