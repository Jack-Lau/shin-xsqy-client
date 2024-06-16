import { EquipUtils } from "../../utils/EquipmentUtils";
import { ResUtils } from "../../../../utils/ResUtils";
import ItemWithEffect from "../../../../base/ItemWithEffect";
import CommonPanel from "../../../../base/CommonPanel";
import Optional from "../../../../cocosExtend/Optional";
import { Equipment, FusionResult } from "../../../../net/Protocol";
import PlayerData from "../../../../data/PlayerData";
import { NetUtils } from "../../../../net/NetUtils";
import { TipsManager } from "../../../../base/TipsManager";
import { EquipmentPart } from "../../../../bag/ItemConfig";
import { CommonUtils } from "../../../../utils/CommonUtils";
import EquipmentRecastSelectPanel from "./EquipmentRecastSelectPanel";
import { EventDispatcher } from "../../../../utils/event/EventDispatcher";
import { Notify } from "../../../../config/Notify";
import BagData from "../../../../bag/BagData";
import EquipmentEffectItem from "./EquipmentEffectItem";
import { MovieclipUtils } from "../../../../utils/MovieclipUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class EquipmentRecastPanel extends CommonPanel {
	
    // 主装备
    @property(cc.Sprite)
    mainIcon: cc.Sprite = null;
    @property(cc.Label)
    mainNameLabel: cc.Label = null;
    
    // 材料
    @property(cc.Label)
    materialNameLabel: cc.Label = null;
    @property(ItemWithEffect)
    materialItem: ItemWithEffect = null;
    @property(cc.Node)
    noneMaterialNode: cc.Node = null;
    @property(cc.Button)
    addMaterialBtn: cc.Button = null;
    
    // TIP
    @property(cc.Sprite)
    tipSp: cc.Sprite = null;
    
    // 特效
    @property([EquipmentEffectItem])
    mainEffectItems: Array<EquipmentEffectItem> =[];
    @property(cc.Layout)
    materialEffectGroup:cc.Layout = null;
    @property(cc.Sprite)
    recastEffect: cc.Sprite = null;
    
    @property([ItemWithEffect])
    items: Array<ItemWithEffect> = [];
    @property([cc.Sprite])
    itemBgs: Array<cc.Sprite> = [];
    @property([cc.Node])
    effectNodes: Array<cc.Node> = [];
    @property([cc.Node])
    flagNodes: Array<cc.Node> = [];
    
    @property(cc.Prefab)
    effectItemPrefab: cc.Prefab = null;
    
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Button)
    recastBtn: cc.Button = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    // data
    materialEquipment: Optional<Equipment> = new Optional<Equipment>();
    
    start() {
        this.initEvents();
    }
    
    init () {
        this.initEquipmentItems();
        this._state.value = 0;
    }
    
    initEvents () {
        let _this = this;
        this.items.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, () => {
                if (index != _this._state.value) {
                    _this._state.value = index;
                }
            });
        });
        this.recastBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.recast.bind(this)));
        this.addMaterialBtn.node.on(cc.Node.EventType.TOUCH_END, this.addMaterial.bind(this));
        this.mainIcon.node.on(cc.Node.EventType.TOUCH_END, () => {
            let equipment = PlayerData.getInstance().equipments[this.getPart(_this._state.value)];
            if (!equipment.valid) {
                TipsManager.showMessage('尚未选中装备');
            } else {
                EquipUtils.showEquipmentTips(equipment.val)();
            }
        });
        this.materialItem.node.on(cc.Node.EventType.TOUCH_END, this.addMaterial.bind(this));
        this.itemBgs.forEach((bg, index) => {
            bg.node.on(cc.Node.EventType.TOUCH_END, () => {
                if (!_this.mainEffectItems[index].node.active) {
                    TipsManager.showMsgFromConfig(1121);
                }
            });
        })
    }
    
    refreshState () {
        let index = this._state.value;
        let equipment = PlayerData.getInstance().equipments[this.getPart(index)]
        this.initMain(equipment);
        this.materialEquipment = Optional.Nothing<Equipment>();
        this.initMaterial(this.materialEquipment);
        this.initEffects(equipment, this.materialEquipment);
        this.initCost();
        this.flagNodes.forEach((node, nIndex) => {
            node.active = index == nIndex;
        });
        super.refreshState();
    }
    
    initEquipmentItems() {
        let arr = R.values(PlayerData.getInstance().equipments);
        if (arr.length < 6) { return; }
        this.items.forEach((item, index) => {
            let equipment = arr[index];
            this.initEquipmentItem(item, equipment, index);
        });
    }
    
    async initEquipmentItem(item: ItemWithEffect, equipment: Optional<Equipment>, index: number) {
        let display = equipment.monadBind(EquipUtils.getDisplay);
        let prototype = equipment.monadBind(EquipUtils.getProto);
        let iconSf = null;
        if (!equipment.valid) {
            let part = this.getPart(index);
            iconSf = await ResUtils.getEmptyEquipmentIconByPart(part);
        } else {
            iconSf = await ResUtils.getEquipmentIconById(display.val.iconId);
        }
        let desc = equipment.fmap(x => x.enhanceLevel).fmap(x => x == 0 ? '' : '+' + x.toString());
        let color = prototype.fmap(x => x.quality)
        let showEffect = display.fmap(x => x.showBorderEffect).getOrElse(false);
		if (equipment.valid) {
			showEffect = showEffect || (equipment.val.enhanceLevel >= 10 ? true : false)
		}

        let info = {
            iconSf: iconSf,
            desc: desc.getOrElse(''),
            color: color.getOrElse(null),
            showEffect,
            cb: null
        }
        item.init(info);
    }
    
    async initMain(equipment: Optional<Equipment>) {
        let config = equipment.monadBind(EquipUtils.getDisplay);
        if (equipment.valid && config.valid) {
            let info = equipment.val;
            this.mainIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/icon/equipment_tip_icon', '' + config.val.iconId)
            this.mainNameLabel.string = config.val.name;
        } else {
            this.mainIcon.spriteFrame = this.atlas.getSpriteFrame('bg_zhuangbeijianying');
            this.mainNameLabel.string = '请选择装备';
        }
    }
    
    async initMaterial(equipment: Optional<Equipment>) {
        this.materialEquipment = equipment;
        let config = equipment.monadBind(EquipUtils.getDisplay);
        let isValid = equipment.valid && config.valid;
        this.materialItem.node.active = isValid;
        this.noneMaterialNode.active = !isValid;
        if (isValid) {
            this.materialItem.initWithEquipment(equipment.val);
            this.materialNameLabel.string = config.val.name;
        } else {
            this.materialNameLabel.string = '';
        }
        this.initTips();
        this.initMaterialEffects(equipment);
    }
    
    initTips() {
        let b = this.materialEquipment.fmap(EquipUtils.getEffectIds).getOrElse([]).length;
        let index = this._state.value;
        let a = PlayerData.getInstance().equipments[this.getPart(index)].fmap(EquipUtils.getEffectIds).getOrElse([]).length;
        if (a < 6 && b == 1) {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_2');
        } else if (a < 6 && a + b <= 6) {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_3');
        } else if (a < 6 && b > 1 && a + b > 6) {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_5');
        } else if (a == 6 && b == 1) {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_4');
        } else if (a == 6 && b > 1) {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_1');
        } else {
            this.tipSp.spriteFrame = this.atlas.getSpriteFrame('font_2');
        }
    }
    
    initMaterialEffects(equipment: Optional<Equipment>) {
        let effectIds = equipment.fmap(EquipUtils.getEffectIds).getOrElse([])
        let mainEffectIds = PlayerData.getInstance().equipments[this.getPart(this._state.value)].fmap(EquipUtils.getEffectIds).getOrElse([]);
        this.materialEffectGroup.node.removeAllChildren();
        effectIds.forEach(id => {
            if (mainEffectIds.indexOf(id) != -1) {
                return;
            }
            let effectItem = cc.instantiate(this.effectItemPrefab).getComponent(EquipmentEffectItem)
            effectItem.init(parseInt(id));
            effectItem.node.parent = this.materialEffectGroup.node;
        })
    }
    
    initEffects(mainEquipment: Optional<Equipment>, materialEquipment: Optional<Equipment>) {
        let mainEffectIds = mainEquipment.fmap(EquipUtils.getEffectIds).getOrElse([]);
        let length = mainEffectIds.length;
        this.mainEffectItems.forEach((item, index) => {
            item.node.active = index < length;
            if (index < length) {
                item.init(parseInt(mainEffectIds[index]));
            }
        })
        this.initMaterialEffects(materialEquipment);
    }
    
    getEffectNameArray(equipment: Equipment) {
        return EquipUtils.getEffectIds(equipment).map(x => EquipUtils.getSpSkill(x).name);
    }
    
    initCost() {
        let own = PlayerData.getInstance().ybAmount;
        this.ownLabel.string = String(own);
        const cost = 10000;
        this.costLabel.string = '/' + cost;
        // this.ownLabel.node.color = cc.hexToColor(cost > own ? '#ff5050' : '#0C6D08');
        this.ownLabel.node.color = cc.Color.fromHEX(this.ownLabel.node.color, cost > own ? '#ff5050' : '#0C6D08')
    }
    
    async recast() {
        let index = this._state.value;
        let equipment = PlayerData.getInstance().equipments[this.getPart(index)]
        if (!equipment.valid) {
            TipsManager.showMessage('尚未选择任何装备');
            return;
        }
        if (!this.materialEquipment.valid) {
            TipsManager.showMessage('请选择材料装备');
            return;
        }
        if (equipment.valid && equipment.val.highestEnhanceLevelEver < 7 ) {
            TipsManager.showMessage('该装备还未激活重铸系统');
            return;
        }
        const COST = 10000;
        if (PlayerData.getInstance().ybAmount < COST) {
            TipsManager.showMessage('所需的元宝不足，快去赚些吧');
            return;
        }
        let result = await NetUtils.post<FusionResult>('/equipment/action/{id}/fusion', [equipment.val.id, this.materialEquipment.val.id]);
        if (result.isRight) {
            BagData.getInstance().removeEquipmentFromBag(this.materialEquipment.val);
            
            let droppedEffects = result.right.droppedEffectIds.map(EquipUtils.getSpSkill).map(x => x.name).join(',');
            let newEffects = result.right.newEffectIds.map(EquipUtils.getSpSkill).map(x => x.name).join(',');
    
            this.recastEffect.node.active = true;
            this.recastEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.5);
            this.recastEffect.node.active = false;
            if (newEffects == '') {
                TipsManager.showMessage('重铸失败');
            } else {
                TipsManager.showMessage('重铸成功');
                // TipsManager.showMessage(`获得特效 ${newEffects}`)
                PlayerData.getInstance().updateFc();
            }
            // if (droppedEffects != '') {
            //     TipsManager.showMessage(`失去特效 ${droppedEffects}`)
            // }
            let info = result.right;
            let equipment2 = result.right.equipmentDetail.equipment;
            PlayerData.getInstance().equipments[this.getPart(index)] = new Optional<Equipment>(equipment2);
            if (info.newEffectIds.length > 0) {
                this.materialEffectGroup.node.runAction(cc.fadeTo(0.5, 0));
                if (info.droppedEffectIds.length > 0) {
                    this.effectNodes.forEach(node => {
                        node.active = true;
                        node.getComponent(cc.Animation).play();
                    })
                    await CommonUtils.wait(1.4);
                    this.refreshState();
                    this.effectNodes.forEach(node => node.active = false);
                } else {
                    let ownEffectNum = equipment.fmap(EquipUtils.getEffectIds).getOrElse([]).length;
                    info.newEffectIds.forEach((effectId, index) => {
                        let trueIndex = index + ownEffectNum;
                        let item = this.mainEffectItems[trueIndex]
                        item.init(effectId);
                        item.node.opacity = 0;
                        item.node.active = true;
                        item.node.runAction(cc.fadeTo(0.5, 255));
                        this.effectNodes[trueIndex].active = true;
                        this.effectNodes[trueIndex].getComponent(cc.Animation).play();
                    });
                    await CommonUtils.wait(1.4);
                    this.effectNodes.forEach(node => node.active = false);
                }
            }
            this.materialEquipment = new Optional<Equipment>();
            this.materialEffectGroup.node.opacity = 255;
            this.initMaterial(this.materialEquipment);
            this.initCost();
        }
    }
    
    async addMaterial() {
        let panel = await CommonUtils.getPanel('gameplay/equipment/recast/equipmentRecastSelectPanel', EquipmentRecastSelectPanel) as EquipmentRecastSelectPanel;
        let index = this._state.value;
        let part = this.getPart(index);
        let effectIdArray = PlayerData.getInstance().equipments[part].fmap(EquipUtils.getEffectIds).getOrElse([]);
        panel.init(this.getPart(index), effectIdArray, this.initMaterial.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    getPart(index: number) {
        switch (index) {
            case 0: return EquipmentPart.Weapon;
            case 1: return EquipmentPart.Head;
            case 2: return EquipmentPart.Necklace;
            case 3: return EquipmentPart.Clothes;
            case 4: return EquipmentPart.Belt;
            case 5: return EquipmentPart.Shoes;
            default: return EquipmentPart.Weapon;
        }
    }
	
} 
