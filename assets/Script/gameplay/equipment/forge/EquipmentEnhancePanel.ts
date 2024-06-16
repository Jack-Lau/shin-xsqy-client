
import CommonPanel from "../../../base/CommonPanel";
import PagingControl from "../../../base/PagingControl";
import ItemWithEffect from "../../../base/ItemWithEffect";
import Optional from "../../../cocosExtend/Optional";
import { Equipment, CurrencyStack } from "../../../net/Protocol";
import { ResUtils } from "../../../utils/ResUtils";
import ItemConfig, { ItemQuality, EquipmentPart } from "../../../bag/ItemConfig";
import PlayerData from "../../../data/PlayerData";
import Either from "../../../cocosExtend/Either";
import { CommonUtils } from "../../../utils/CommonUtils";
import { EquipUtils } from "../utils/EquipmentUtils";
import BagData from "../../../bag/BagData";
import BagItem from "../../../bag/BagItem";
import { TipsManager } from "../../../base/TipsManager";
import { NetUtils } from "../../../net/NetUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import EnhanceConfirmBox from "./EnhanceConfirmBox";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";

const { ccclass, property } = cc._decorator;

/** 
 * { equiped: boolean, page: number}
 */
 type EquipmentEnhanceRightState = { page: number, index: number }

@ccclass
export default class EquipmentEnhancePanel extends CommonPanel {
	
    @property(cc.Sprite)
    selectedIcon: cc.Sprite = null;
    @property(cc.Label)
    selectedNameLabel: cc.Label = null;
    @property(cc.Layout)
    selectedStarGroup: cc.Layout = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.Sprite)
    enhanceEffect: cc.Sprite = null;
    @property(cc.Node)
    flagNode: cc.Node = null;
    @property(cc.Node)
    flagBgNode: cc.Node = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    @property(cc.Label)
    attr1: cc.Label = null;
    @property(cc.Label)
    attr2: cc.Label = null;
    @property(cc.Label)
    attr1NameLabel: cc.Label = null;
    @property(cc.Label)
    attr1EnhanceLabel: cc.Label = null;
    @property(cc.Label)
    attr2NameLabel: cc.Label = null;
    @property(cc.Label)
    attr2EnhanceLabel: cc.Label = null;
    
    @property(cc.Label)
    successRateLabel: cc.Label = null;
    
    @property(cc.Label)
    spSkillLabel: cc.Label = null;
    @property(cc.Node)
    spNode: cc.Node = null;
    
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Node)
    pageConrtrolNode: cc.Node = null;
    
    @property([ItemWithEffect])
    items: Array<ItemWithEffect> = [];
    @property([cc.Node])
    flagNodes: Array<cc.Node> = [];
    
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    
    @property(cc.Button)
    enhanceBtn: cc.Button = null;
    
    @property(cc.Sprite)
    maxLevelSp: cc.Sprite = null;
    
    readonly PAGE_SIZE = 6;


    start() {
        this.switchToLeft();
        this.init();
        this.initEvents();
    }
    
    init() {
        let max = Math.ceil(BagData.getInstance().getAllEquipments().length / this.PAGE_SIZE);
        this.pageControl.init(max, this.changeToPage.bind(this));
        this.initBHK();
    }
    
    initEvents() {
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchToLeft.bind(this));
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchToRight.bind(this));
        this.enhanceBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.enhanceOnClick.bind(this)));
        this.flagBgNode.on(cc.Node.EventType.TOUCH_END, this.flagBgNodeOnClick.bind(this));
        EventDispatcher.on(Notify.BAG_CURRENCY_NUM_CHANGE, this.initBHK);
    
        let _this = this;
        this.item.node.on(cc.Node.EventType.TOUCH_END, (e) => {
            CommonUtils.showCurrencyTips(_this.item.data as CurrencyStack, false)(e);
        });
        this.selectedIcon.node.on(cc.Node.EventType.TOUCH_END, () => {
            let equipment = _this.getSelectedEquipment();
            if (!equipment.valid) {
                TipsManager.showMessage('尚未选中装备');
            } else {
                EquipUtils.showEquipmentTips(equipment.val)();
            }
        });
        this.items.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, () => {
                let state = _this._state.value;
                if (state.isLeft) {
                    _this._state.value = Either.Left<number, EquipmentEnhanceRightState>(index);
                } else {
                    _this._state.value = Either.Right<number, EquipmentEnhanceRightState>({ page: state.val.page, index: index });
                }
            });
        })
    }
    
    switchToLeft() {
        this._data.value = R.values(PlayerData.getInstance().equipments);
        this._state.value = Either.Left<number, EquipmentEnhanceRightState>(0);
    }
    
    switchToRight() {
        this._state.value = Either.Right<number, EquipmentEnhanceRightState>({ page: 1, index: 0 });
        this.changeToPage(1);
    }
    
    changeToPage(page) {
        if (this._state.value.isLeft) return;
        this._state.value = Either.Right<number, EquipmentEnhanceRightState>({ page: page, index: 0 });
        let bagItems = BagData.getInstance().getEquipmentByPage(page - 1, this.PAGE_SIZE);
        let equipments = [];
        R.range(0, 6).forEach(ele => {
            let bagItem = new Optional<BagItem>(R.prop(ele, bagItems));
            equipments.push(bagItem.fmap(R.prop('data')));
        })
        this._data.value = equipments;
    }
    
    async enhanceOnClick() {
        let state = this._state.value as Either<number, EquipmentEnhanceRightState>;
        let index = 0;
        if (state.isLeft) {
            index = state.val as number;
        } else {
            index = R.prop('index', state.val);
        }
        let equipment = R.prop(index, this._data.value);
        if (!equipment.valid) {
            TipsManager.showMessage('尚未选中装备');
            return;
        }
        let own = BagData.getInstance().getCurrencyNum(154);
        let level = equipment.val.enhanceLevel;
        if (level == equipment.maxEnhanceLevel) {
            TipsManager.showMsgFromConfig(1058);
            return;
        }
        let cost = EquipUtils.getPrice(level)
        if (own < cost) {
            TipsManager.showMessage('强化石不足，去变废为宝炼化装备获得吧');
            return;
        }
    
        let showEnhanceConfirmBox = cc.sys.localStorage.getItem('showEnhanceConfirmBox');
        if (showEnhanceConfirmBox != 'false') {
            let confirmBox = await CommonUtils.getPanel('gameplay/equipment/enhanceConfirmBox', EnhanceConfirmBox) as EnhanceConfirmBox;
            confirmBox.init(this.sendEnhanceRequest(equipment.val, state).bind(this));
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: confirmBox});
        } else {
			if (this.flagNode.active == true && R.prop('amount', this.item.data) == 0) {
				TipsManager.showMessage('没有强化保护卡');
				return;
			}
            await this.sendEnhanceRequest(equipment.val, state)();
        }
    }
    
    sendEnhanceRequest(equipment: Equipment, state) {
        return async () => {
            let useInsurance = this.flagNode.active;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/action/{id}/enhance', [equipment.id, useInsurance]);
            if (response.status === 0) {
                this.enhanceEffect.node.active = true;
                this.enhanceEffect.getComponent(cc.Animation).play();
                await CommonUtils.wait(1.5);
                this.enhanceEffect.node.active = false;
                let result = response.content;
                let status = R.prop('status', result);
                if (status === "SUCCESSFUL") {
                    TipsManager.showMessage('强化成功，强化等级 +1！');
                    state.isLeft && PlayerData.getInstance().updateFc();
                } else if (status === "UNCHANGED") {
                    TipsManager.showMessage('险些失败，强化等级未发生变化')
                } else {
                    if (useInsurance) {
                        TipsManager.showMsgFromConfig(1085);
                    } else {
                        TipsManager.showMessage('强化失败，强化等级 -1');
                        state.isLeft && PlayerData.getInstance().updateFc();
                    }
                }
    
                let equipment = R.path(['equipmentDetail', 'equipment'], result);
                let effects = R.prop('newEquipmentEffects', result) as Array<number>;
                let names = effects.map(id => {
                    if (id < 600) {
                        return EquipUtils.getEnhanceSkill(id).parameter;
                    } else {
                        return EquipUtils.getSpSkill(id).name;
                    }
                });
                names.forEach(name => {
                    TipsManager.showMessage(`获得新特效 <color=#4EFF00>${name}</c>！`);
                });
                this.updateEquipmentInfo(equipment);
            }
        }
    }
    
    updateEquipmentInfo(newEquipment) {
        if (this._state.value.isRight) {
            BagData.getInstance().updateEquipmentInfo(newEquipment);
        } else {
            for (let key in PlayerData.getInstance().equipments) {
                let equipment = PlayerData.getInstance().equipments[key];
                if (equipment.getOrElse({ id: null }).id == newEquipment.id) {
                    PlayerData.getInstance().equipments[key] = new Optional<Equipment>(newEquipment);
                }
            }
        }
        this._data.value = this._data.value.map(equip => {
            if (equip.getOrElse({ id: null }).id == newEquipment.id) {
                return new Optional<Equipment>(newEquipment);
            } else {
                return equip;
            }
        })
    }
    
    // 
    
    refreshState() {
        let state = this._state.value as Either<number, EquipmentEnhanceRightState>;
        let index = 0;
        this.pageConrtrolNode.active = state.isRight;
        if (state.isLeft) {
            index = state.val as number;
        } else {
            index = R.prop('index', state.val);
            let page = R.prop('page', state.val);
            this.pageControl.setPage(page);
        }
        let equipment = R.prop(index, this._data.value);
        this.initHead(equipment);
        this.initAttributes(equipment);
        this.initCost(equipment);
        this.flagNodes.forEach((node, nIndex) => {
            node.active = index == nIndex;
        });
    
        super.refreshState();
    }
    
    getSelectedEquipment(): Optional<Equipment> {
        let index = this.getIndex();
        return R.prop(index, this._data.value);
    }
    
    getIndex(): number {
        let state = this._state.value as Either<number, EquipmentEnhanceRightState>;
        let index = 0;
        if (state.isLeft) {
            index = state.val as number;
        } else {
            index = R.prop('index', state.val);
        }
        return index;
    }
    
    refreshData() {
        this.initEquipmentItems(this._data.value);
       // let state = this._state.value as Either<number, EquipmentEnhanceRightState>;
       // if (state.isRight) {
       //     let value = state.val as EquipmentEnhanceRightState;
       //     value.index = 0;
       //     this._state.value = Either.Right<number, EquipmentEnhanceRightState>(value);
       // }
        super.refreshData();
    }
    
    async initHead(equipment: Optional<Equipment>) {
        let config = equipment.monadBind(EquipUtils.getDisplay);
    
        if (equipment.valid && config.valid) {
            let info = equipment.val;
            this.selectedIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/icon/equipment_tip_icon', '' + config.val.iconId)
            this.selectedNameLabel.string = config.val.name;
            let max = info.maxEnhanceLevel;
            let level = info.enhanceLevel;
            this.selectedStarGroup.node.children.forEach((node, index) => {
                node.active = index < max;
                node.getComponent(cc.Sprite).spriteFrame = index < level ? this.atlas.getSpriteFrame('icon_qianghuaxingxing1') : this.atlas.getSpriteFrame('icon_qianghuaxingxing2');
            });
        } else {
            this.selectedIcon.spriteFrame = this.atlas.getSpriteFrame('bg_zhuangbeijianying');
            this.selectedNameLabel.string = '请选择装备';
            this.selectedStarGroup.node.children.forEach(node => node.active = false);
        }
    }
    
    initAttributes(equipment: Optional<Equipment>) {
        let params = equipment.fmap(e => e.baseParameters);
    
        if (params.valid) {
    
            let name1 = R.path([0, 'name']);
            let name2 = R.path([1, 'name']);
            let value1 = R.path([0, 'value']);
            let value2 = R.path([1, 'value']);
            let level = equipment.val.enhanceLevel;
            let extraParams = EquipUtils.getScale(level);
            let scale1 = EquipUtils.getScale(level);
            let toValue = x => scale => Math.floor(x * scale);
            if (level > 0) {
                this.attr1.string = name1(params.val)
            		.replace('最大生命', '气血')
            		.replace("物伤", "外伤")
            		.replace("物防", "外防")
            		.replace("法伤", "内伤")
            		.replace("法防", "内防")
                	+ ' ' + value1(params.val) + '+' + toValue(value1(params.val))(scale1);
                this.attr2.string = name2(params.val)
            		.replace('最大生命', '气血')
            		.replace("物伤", "外伤")
            		.replace("物防", "外防")
            		.replace("法伤", "内伤")
            		.replace("法防", "内防")
                	+ ' ' + value2(params.val) + '+' + toValue(value2(params.val))(scale1);
            } else {
                this.attr1.string = name1(params.val)
            		.replace('最大生命', '气血')
            		.replace("物伤", "外伤")
            		.replace("物防", "外防")
            		.replace("法伤", "内伤")
            		.replace("法防", "内防")
                	+ ' ' + value1(params.val);
                this.attr2.string = name2(params.val)
            		.replace('最大生命', '气血')
            		.replace("物伤", "外伤")
            		.replace("物防", "外防")
            		.replace("法伤", "内伤")
            		.replace("法防", "内防")
                	+ ' ' + value2(params.val);
            }
            const MAX_LEVEL = 12;
            this.maxLevelSp.node.active = level == MAX_LEVEL;
            if (level == MAX_LEVEL) {
                this.attr1NameLabel.string = "";
                this.attr1EnhanceLabel.string = ""
                this.attr2NameLabel.string = ""
                this.attr2EnhanceLabel.string = ""
                this.successRateLabel.string = "s0%"
            } else {
                let scale2 = EquipUtils.getScale(level + 1);
                this.attr1NameLabel.string = CommonUtils.replaceAttributeName(name1(params.val)) + ' ';
                this.attr1EnhanceLabel.string = value1(params.val) + '+' + toValue(value1(params.val))(scale2);
                this.attr2NameLabel.string = CommonUtils.replaceAttributeName(name2(params.val)) + ' '
                this.attr2EnhanceLabel.string = value2(params.val) + '+' + toValue(value2(params.val))(scale2);
                this.successRateLabel.string = 's' + EquipUtils.getSRate(level) + '%';
            }
            let show3 = (level == 3 && 3 == equipment.val.highestEnhanceLevelEver);
            let show6 = (level == 6 && 6 == equipment.val.highestEnhanceLevelEver);
            let show9 = (level == 9 && 9 == equipment.val.highestEnhanceLevelEver);
            let avaiable = equipment.val.maxEnhanceLevel > level;
            this.spNode.active = (show3 || show6 || show9) && avaiable;
            if (show3) { 
                this.spSkillLabel.string = '随机特效';
            } else if (show6) {
                this.spSkillLabel.string = '重铸系统';
            } else if (show9) {
                this.spSkillLabel.string = '技能强化';
            }
        } else {
            this.attr1.string = "";
            this.attr2.string = ""
            this.attr1NameLabel.string = "";
            this.attr1EnhanceLabel.string = ""
            this.attr2NameLabel.string = ""
            this.attr2EnhanceLabel.string = ""
            this.successRateLabel.string = "s0%"
        }
    }
    
    // 必须传入长度为6的数组
    initEquipmentItems(arr: Array<Optional<Equipment>>) {
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
    
    initBHK = function () {
        let amount = BagData.getInstance().getCurrencyNum(161); // 强化保护卡
        let stack = {currencyId: 161, amount: amount};
        this.item.initWithCurrency(stack);
    }.bind(this);
    
    flagBgNodeOnClick () {
        if (R.prop('amount', this.item.data) == 0) {
            this.flagNode.active = false;
            TipsManager.showMessage('没有强化保护卡');
            return;
        }
        this.flagNode.active = !this.flagNode.active;
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
    
    initCost(equipment: Optional<Equipment>) {
        let own = BagData.getInstance().getCurrencyNum(154);
        this.ownLabel.string = String(own);
        let level = equipment.fmap(x => x.enhanceLevel).getOrElse(0);
        let cost = EquipUtils.getPrice(level)
        this.costLabel.string = '/' + cost;
        // this.ownLabel.node.color = cc.hexToColor(cost > own ? '#ff5050' : '#0C6D08');
        this.ownLabel.node.color = cc.Color.fromHEX(this.ownLabel.node.color, cost > own ? '#ff5050' : '#0C6D08')
    }

}
