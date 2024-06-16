import CommonPanel from "../../../base/CommonPanel";
import { Equipment } from "../../../net/Protocol";
import ItemConfig, { ItemQuality, ItemCategory, EquipmentPrototype, EquipmentPart } from "../../../bag/ItemConfig";
import { ResUtils } from "../../../utils/ResUtils";
import { CommonUtils } from "../../../utils/CommonUtils";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
import PlayerData from "../../../data/PlayerData";
import BagData from "../../../bag/BagData";
import EquipmentTips from "../tips/EquipmentTips";
import BagItem from "../../../bag/BagItem";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import EquipmentPrototypeTips from "../tips/EquipmentPrototypeTips";
import ItemFrame from "../../../base/ItemFrame";
import EquipmentEnhancePanel from "./EquipmentEnhancePanel";
import EquipmentRecastPanel from "./recast/EquipmentRecastPanel";
import EquipmentSoulPanel from "./EquipmentSoulPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipmentForgePanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    forgeBtn: cc.Button = null;

    // 顶部24个 绿 蓝 紫 橙 装备
    @property(cc.Node)
    group: cc.Node = null;
    @property(cc.Node)
    targetNode: cc.Node = null;
    
    // 中部滚动信息
    @property(cc.RichText)
    consRT: cc.RichText = null;
    
    // 打造结果展示信息
    @property(cc.Node)
    leftNode: cc.Node = null; // 左边结果信息
    @property(cc.Node)
    rightNode: cc.Node = null; // 右边结果信息
    @property(cc.Node)
    leftEmpty: cc.Node = null;
    @property(cc.Node)
    rightEmpty: cc.Node = null;
    
    @property(ItemFrame)
    frame: ItemFrame = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    qualityLabel: cc.Label = null;
    @property(cc.Label)
    maxEnhanceLabel: cc.Label = null;
    @property(cc.Sprite)
    forgeEffect: cc.Sprite = null;
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    @property(cc.Label)
    attr1NameLabel: cc.Label = null;
    @property(cc.Label)
    attr1ValueLabel: cc.Label = null;
    @property(cc.Label)
    attr2NameLabel: cc.Label = null;
    @property(cc.Label)
    attr2ValueLabel: cc.Label = null;
    
    @property(cc.Node)
    starGroup: cc.Node = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    
    // 消耗
    @property(cc.Label)
    costXSLabel: cc.Label = null;
    @property(cc.Label)
    costYBLabel: cc.Label = null;
    
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    
    currentPrice: number = 0;

    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property(cc.Node)
    forgeNode: cc.Node = null;
	
    // enhance
    @property(EquipmentEnhancePanel)
    enhancePanel: EquipmentEnhancePanel = null;
    
    // recast 
    @property(EquipmentRecastPanel)
    recastPanel: EquipmentRecastPanel = null;
	
	// soul
	@property(EquipmentSoulPanel)
    soulPanel: EquipmentSoulPanel = null;
    
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;
    @property(cc.SpriteFrame)
    forgeSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    enhanceSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    recastSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    soulSf: cc.SpriteFrame = null;
    
    start () {
        this.init();
        this.initEvents();
    }
    
    async init() {
        this.initPrice();
    
        // 初始化24件装备
        this.initEquipment(this.targetNode, 10002);
        let prototypeIds = [ 
                   21002, 22002, 23002, 24002, 25002,
            10003, 21003, 22003, 23003, 24003, 25003,
            10004, 21004, 22004, 23004, 24004, 25004,
            10005, 21005, 22005, 23005, 24005, 25005,
        ];
        prototypeIds.forEach(ele => {
            let node = cc.instantiate(this.targetNode);
            this.initEquipment(node, ele);
            node.parent = this.group;
        });
    
        this.schedule(this.updateForgeRecord, 15);
        this.showForgeRecord();
        await this.updateForgeRecord();
    }
    
    async initPrice() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/forgePrice', []);
        if (response.status === 0) {
            this.currentPrice = response.content;
			this.costXSLabel.string = '50';
            this.costYBLabel.string = this.currentPrice.toString();
        }
        this.initXSYBAmount();
    }
    
    initXSYBAmount() {
        if (PlayerData.getInstance().kbAmount < 50) {
            this.costXSLabel.node.color = cc.Color.fromHEX(this.costXSLabel.node.color, '#ff0000')
        }
        if (PlayerData.getInstance().ybAmount < this.currentPrice) {
            this.costYBLabel.node.color = cc.Color.fromHEX(this.costYBLabel.node.color, '#ff0000')
        }
    }
    
    async initEquipment(node: cc.Node, prototypeId: number) {
        let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(prototypeId);
        let display = ItemConfig.getInstance().getItemDisplayById(prototypeId, PlayerData.getInstance().prefabId);
        if (display.isValid() && prototype.isValid()) {
            node.on(cc.Node.EventType.TOUCH_END, this.showPrototypeTips(prototypeId).bind(this));
            node.getComponentInChildren(cc.Sprite).spriteFrame = await ResUtils.getEquipmentIconById(display.getValue().iconId);
            node.getComponent(ItemFrame).init(prototype.getValue().quality, display.getValue().showBorderEffect);
        }
    }
    
    initEvents() {
		const action = cc.repeatForever(cc.rotateTo(0.5, 360))
		this.bgLighting.node.runAction(action)
		//
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchToForge.bind(this));
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchToEnhance.bind(this));
        this.container.toggleItems[2].node.on(cc.Node.EventType.TOUCH_END, this.switchToSoul.bind(this));
		this.container.toggleItems[3].node.on(cc.Node.EventType.TOUCH_END, this.switchToRecast.bind(this));
        this.forgeBtn.node.on(cc.Node.EventType.TOUCH_END, this.forgeBtnOnClick.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.frame.node.on(cc.Node.EventType.TOUCH_END, this.showForgedTips.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.enhancePanel.node.active) {
                CommonUtils.showInfoPanel(null, 10)();
            } else if (this.forgeNode.active) {
                CommonUtils.showInfoPanel(null, 4)();
            } else if (this.recastPanel.node.active) {
                CommonUtils.showInfoPanel(null, 23)();
            } else {
				CommonUtils.showInfoPanel(null, 42)();
			}
        }.bind(this));
        this.forgeEffect.getComponent(cc.Animation).on('finished', function() {
            this.forgeEffect.node.active = false;
        }.bind(this), this);
    }
    
    switchToForge () {
        this.forgeNode.active = true;
        this.enhancePanel.node.active = false;
        this.recastPanel.node.active = false;
		this.soulPanel.node.active = false;
        this.titleSp.spriteFrame = this.forgeSf;
    }
    
    switchToEnhance () {
        this.forgeNode.active = false;
        this.enhancePanel.node.active = true;
        this.recastPanel.node.active = false;
		this.soulPanel.node.active = false;
		this.titleSp.spriteFrame = this.enhanceSf;
        this.enhancePanel.switchToLeft();
        this.enhancePanel.container.toggleItems[0].check();
    }
    
    switchToRecast() {
        this.forgeNode.active = false;
        this.enhancePanel.node.active = false;
        this.recastPanel.node.active = true;
		this.soulPanel.node.active = false;
        this.titleSp.spriteFrame = this.recastSf;
        this.recastPanel.init();
    }
	
	switchToSoul() {
        this.forgeNode.active = false;
        this.enhancePanel.node.active = false;
        this.recastPanel.node.active = false;
		this.soulPanel.node.active = true;
		this.titleSp.spriteFrame = this.soulSf;
		this.soulPanel.init();
	}
     
    async refreshData() {
        let equipment = this._data.value as Equipment;
        this.leftEmpty.active = this.rightEmpty.active = equipment == undefined;
        this.leftNode.active = this.rightNode.active = equipment != undefined;
        if (!equipment) {
            return;
        } else {
            let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(equipment.definitionId);
            let display = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
            if (!prototype.isValid() || !display.isValid()) return;
            let quality = prototype.getValue().quality
    
            this.nameLabel.string = display.getValue().name;
            this.frame.init(quality, display.getValue().showBorderEffect);
            this.icon.spriteFrame = await ResUtils.getEquipmentIconById(display.getValue().iconId); 
            
            this.qualityLabel.string = this.getQualityName(quality);
            // this.qualityLabel.node.color = cc.hexToColor(CommonUtils.getForgeColorByQuality(quality));
            this.qualityLabel.node.color = cc.Color.fromHEX(this.qualityLabel.node.color, CommonUtils.getForgeColorByQuality(quality))
            this.maxEnhanceLabel.string = equipment.maxEnhanceLevel.toString();
    
            this.attr1NameLabel.string = R.path(['baseParameters', 0, 'name'], equipment)
            	.replace('最大生命', '气血')
            	.replace("物伤", "外伤")
            	.replace("物防", "外防")
            	.replace("法伤", "内伤")
            	.replace("法防", "内防");
            this.attr1ValueLabel.string = '+' + R.path(['baseParameters', 0, 'value'], equipment);
    
            this.attr2NameLabel.string = R.path(['baseParameters', 1, 'name'], equipment)
            	.replace('最大生命', '气血')
            	.replace("物伤", "外伤")
            	.replace("物防", "外防")
            	.replace("法伤", "内伤")
            	.replace("法防", "内防");
            this.attr2ValueLabel.string = '+' + R.path(['baseParameters', 1, 'value'], equipment);
    
            this.starGroup.children.forEach((ele, index) => {
                ele.active = index < equipment.maxEnhanceLevel;
            });
            this.fcLabel.string = equipment.baseFc.toString();
        }
        super.refreshData();
    }
    
    getQualityName(quality: ItemQuality) {
        switch (quality) {
            case ItemQuality.White: { return '白色品质'; }
            case ItemQuality.Green: { return '绿色品质'; }
            case ItemQuality.Blue: { return '蓝色品质'; }
            case ItemQuality.Purple: { return '紫色品质'; }
            case ItemQuality.Orange: { return '橙色品质'; }
            case ItemQuality.Gold: { return '金色品质'; }
            default: { return '绿色品质';  }
        }
    }
    
    getRange(quality: ItemQuality) {
        let getMin = _ => (_ - 2) * 3 + 1;
        let getMax = _ => (_ - 1) * 3;
        switch (quality) {
            case ItemQuality.Green: { return getMin(2) + '~' + getMax(2); }
            case ItemQuality.Blue: { return getMin(3) + '~' + getMax(3); }
            case ItemQuality.Purple: { return getMin(4) + '~' + getMax(4); }
            case ItemQuality.Orange: { return getMin(5) + '~' + getMax(5); }
            default: { return getMin(2) + '~' + getMax(2); }
        }
    }
    
    async forgeBtnOnClick() {
        if (PlayerData.getInstance().kbAmount < 50) {
            TipsManager.showMsgFromConfig(1028);
            return;
        }
        if (PlayerData.getInstance().ybAmount < this.currentPrice) {
            TipsManager.showMsgFromConfig(1578);
            return;
        }
        if (this.isShowTween) {
            TipsManager.showMessage('打造中...');
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/forge', [this.currentPrice]) as any;
        if (response.status === 0) {
            let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(response.content.definitionId);
            if (prototype.isValid()) {
                let part = prototype.getValue().part;
                let quality = prototype.getValue().quality;
                let arr = R.of(this.getIndexByPartAndQuality(part, quality));
                if (quality !== ItemQuality.Orange) {
                    arr.push(this.getIndexByPartAndQuality(this.randomPart(), ItemQuality.Orange));
                }
                this.showTween(arr, R.range(0,24), true, response.content);
            }
        } else {
            this.initPrice();
        }
    }
    
    // 动画相关
    parts = [
        EquipmentPart.Weapon, EquipmentPart.Head, 
        EquipmentPart.Clothes, EquipmentPart.Shoes,
        EquipmentPart.Belt, EquipmentPart.Necklace
    ];
    qualities = [
        ItemQuality.Green, ItemQuality.Blue,
        ItemQuality.Purple, ItemQuality.Orange
    ];


    isShowTween = false;
    async showTween(indexArr: Array<number>, remain: Array<number>, start: boolean, equipment: Equipment) {
        if (start && this.isShowTween) return;
        this.isShowTween = true;
        if (remain.length === 1) {
            this.forgeEffect.node.active = true;
            this.forgeEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(0.5);
            this.isShowTween = false;
            let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(equipment.definitionId);
            let display = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
            if (prototype.isValid() && display.isValid()) {
                let equipmentName = 
                '<color=' +
                CommonUtils.getTipColorByQuality(prototype.getValue().quality) +
                '>' + display.getValue().name + '</color>';
                TipsManager.showMessage('打造成功! 恭喜获得' + equipmentName + '!');
            } else {
                TipsManager.showMessage('打造成功!');
            }
            this.initXSYBAmount();
            this._data.value = equipment;
            BagData.getInstance().pushEquipmentToBag(equipment);
            this.group.children.forEach(ele => {
                // ele.color = cc.hexToColor('#ffffff');
                ele.color = cc.Color.fromHEX(ele.color, '#ffffff')
                ele.children.forEach(ele2 => {
                    ele2.color = cc.Color.fromHEX(ele2.color, '#ffffff')
                    // ele2.color = cc.hexToColor('#ffffff');
                });
            })
            return ;
        } else if (remain.length === 3 && indexArr.length > 1) {
            indexArr.pop();
        }
        let rand = CommonUtils.randomInt(0, remain.length);
        while (indexArr.indexOf(remain[rand]) !== -1) {
            rand = CommonUtils.randomInt(0, remain.length);
        }
        this.group.children.forEach((ele, index) => {
            if (index === remain[rand]) {
                // ele.color = cc.hexToColor('#666666');
                ele.color = cc.Color.fromHEX(ele.color, '#666666')
                console.log(">>>>> ", ele.color)
                ele.children.forEach(ele2 => {
                    ele2.color = cc.Color.fromHEX(ele2.color, '#666666')
                    // ele2.color = cc.hexToColor('#666666');
                });
            }
        })
        await CommonUtils.wait(0.1);
        this.showTween(indexArr, R.remove(rand, 1, remain), false, equipment);
    }
    
    randomPart() {
        let rand = CommonUtils.randomInt(0, 5);
        return this.parts[rand];
    }
    
    getIndexByPartAndQuality(part: EquipmentPart, quality: ItemQuality) {
        return this.qualities.indexOf(quality) * 6 + this.parts.indexOf(part);
    }
    
    async showForgedTips() {
        if (!this._data.value) return;
        let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
        CommonUtils.safeRemove(panel.leftBase.exchangeBtn.node);
        let bagItem = new BagItem();
        bagItem.data = this._data.value;
        bagItem.category = ItemCategory.Equipment;
        panel.init(bagItem);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
    }
    
    showPrototypeTips(prototypeId: number) {
        return async function() {
            let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentPrototypeTips', EquipmentPrototypeTips) as EquipmentPrototypeTips;
            let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(prototypeId);
            if (!prototype.isValid()) return;
            panel.init(prototype.getValue());
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
        }.bind(this)
    }
    
    closePanel() {
        if (this.isShowTween) {
            TipsManager.showMessage('打造中...');
            return;
        }
        EventDispatcher.off(Notify.BAG_CURRENCY_NUM_CHANGE, this.enhancePanel.initBHK);
        this.unschedule(this.updateForgeRecord);
        CommonUtils.safeRemove(this.node);
    }
    
    // 历史优质打造记录
    forgeRecords = [];
    forgeRecordIndex = 0;
    showGoodForgeIsOn: boolean = false;
    async showForgeRecord() {
        if (this.showGoodForgeIsOn) {
            return;
        }
        if (!this.node.parent) {
            return;
        }
        if (this.forgeRecords.length == 0) {
            this.consRT.string = '<color=#4B0A08>神兵利器，打造即出！</color>';
            return;
        }
        this.showGoodForgeIsOn = true;
        if (this.forgeRecordIndex >= this.forgeRecords.length) {
            this.forgeRecordIndex = 0;
        }
        let record = this.forgeRecords[this.forgeRecordIndex];
        this.forgeRecordIndex += 1;
    
        let playerName = '<color=#912716>' + record.playerName + '</color>';
        let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(record.equipmentDefinitionId);
        let display = ItemConfig.getInstance().getItemDisplayById(record.equipmentDefinitionId, record.prefabId);
        if (!prototype.isValid() || !display.isValid()) return;
        let equipmentName = 
            '<color=' +
            CommonUtils.getForgeColorByQuality(prototype.getValue().quality) +
            '>' + display.getValue().name + '</color>';
        let content = '<color=#4B0A08>恭喜 </color>' + playerName + '<color=#4B0A08> 打造出稀世装备 </color>' + equipmentName;
    
        let action1 = cc.spawn(cc.moveTo(0.2, 0, 30), cc.fadeTo(0.2, 0));
        this.consRT.node.runAction(action1);
        await CommonUtils.wait(0.3);
        this.consRT.string = content;
        this.consRT.node.y = -30;
        let action2 = cc.spawn(cc.moveTo(0.2, 0, 0), cc.fadeTo(0.2, 255));
        this.consRT.node.runAction(action2);
        await CommonUtils.wait(4.22);
        this.showGoodForgeIsOn = false;
        this.showForgeRecord();
    }
    
    async updateForgeRecord() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/lastestInterestingForgings', []) as any;
        if (response.status == 0 && response.content) {
            this.forgeRecords = response.content;
            this.forgeRecordIndex = 0;
            this.showForgeRecord();
        }
    } 
    // update (dt) {}
}
