import { NetUtils } from "../net/NetUtils";
import PlayerAttributeItem from "./PlayerAttributeItem";
import { CommonUtils } from "../utils/CommonUtils";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import PlayerData from "../data/PlayerData";
import { ConfigUtils } from "../utils/ConfigUtil";
import { TipsManager } from "../base/TipsManager";
import ExchangeEquipmentPanel from "../gameplay/equipment/exchange/ExchangeEquipmentPanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import ItemConfig, { EquipmentPart, EquipmentPrototype, ItemDisplay, ItemCategory } from "../bag/ItemConfig";
import { Equipment, PetDetail, PlayerDetail, Title, FashionDye, Fashion, PlayerBaseInfo } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";
import { ResUtils } from "../utils/ResUtils";
import BagItem from "../bag/BagItem";
import EquipmentTips from "../gameplay/equipment/tips/EquipmentTips";
import ItemFrame from "../base/ItemFrame";
import TitlePanel from "./title/TitlePanel";
import { TitleConfig } from "./title/TitleConfig";
import TitleTips from "./title/TitleTips";
import FashionMainPanel from "../gameplay/fashion/FashionMainPanel";
import FashionModel from "../gameplay/fashion/FashionModel";
import FashionTips from "../gameplay/fashion/FashionTips";
import { FashionConfig } from "../gameplay/fashion/FashionConfig";
import FashionExhibitePanel from "../gameplay/fashion/FashionExhibitPanel";
import PlayerRenameBox from "./PlayerRenameBox";
import PlayerUsedNameTips from "./PlayerUsedNamesTips";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    moreAttrBtn: cc.Button = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    expLabel: cc.Label = null;
    @property(cc.Sprite)
    expSp: cc.Sprite = null;
    @property(cc.Sprite)
    weaponSp: cc.Sprite = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;

    @property(cc.Button)
    titleBtn: cc.Button = null;
    @property(cc.Button)
    fashionBtn: cc.Button = null;
    
    @property(cc.Sprite)
    equip: cc.Sprite = null;
    @property(cc.Sprite)
    head: cc.Sprite = null;
    @property(cc.Sprite)
    belt: cc.Sprite = null;
    @property(cc.Sprite)
    necklace: cc.Sprite = null;
    @property(cc.Sprite)
    clothes: cc.Sprite = null;
    @property(cc.Sprite)
    shoes: cc.Sprite = null;
    
    @property(ItemFrame)
    equipFrame: ItemFrame = null;
    @property(ItemFrame)
    headFrame: ItemFrame = null;
    @property(ItemFrame)
    beltFrame: ItemFrame = null;
    @property(ItemFrame)
    necklaceFrame: ItemFrame = null;
    @property(ItemFrame)
    clothesFrame: ItemFrame = null;
    @property(ItemFrame)
    shoesFrame: ItemFrame = null;
    
    @property(cc.Label)
    headLvLabel: cc.Label = null;
    @property(cc.Label)
    weaponLvLabel: cc.Label = null;
    @property(cc.Label)
    beltLvLabel: cc.Label = null;
    @property(cc.Label)
    necklaceLvLabel: cc.Label = null;
    @property(cc.Label)
    clothesLvLabel: cc.Label = null;
    @property(cc.Label)
    shoesLvLabel: cc.Label = null;
    
    @property(cc.Label)
    life: cc.Label = null;
    @property(cc.Label)
    lucky: cc.Label = null;
    @property(cc.Label)
    pAtk: cc.Label = null;
    @property(cc.Label)
    pDef: cc.Label = null;
    @property(cc.Label)
    mAtk: cc.Label = null;
    @property(cc.Label)
    mDef: cc.Label = null;
    @property(cc.Label)
    spd: cc.Label = null;
    
    @property(cc.Sprite)
    playerMc: cc.Sprite = null;
    @property(cc.Sprite)
    weapon: cc.Sprite = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(FashionModel)
    fashionModel: FashionModel = null;
    
    @property(cc.Node)
    lifeBg: cc.Node = null;
    @property(cc.Node)
    luckyBg: cc.Node = null;
    @property(cc.Node)
    pAtkBg: cc.Node = null;
    @property(cc.Node)
    pDefBg: cc.Node = null;
    @property(cc.Node)
    mAtkBg: cc.Node = null;
    @property(cc.Node)
    mDefBg: cc.Node = null;
    @property(cc.Node)
    spdBg: cc.Node = null;
    
    @property(cc.Sprite)
    nameBg: cc.Sprite = null;
    
    // 更多属性
    @property(cc.Node)
    moreAttr: cc.Node = null;
    @property(cc.Button)
    moreAttrCloseBtn: cc.Button = null;
    @property(cc.Button)
    moreAttrConfirmBtn: cc.Button = null;
    @property(cc.ScrollView)
    moreAttrScroll: cc.ScrollView = null;
    @property(cc.Prefab)
    attrItem: cc.Prefab = null;
    
    @property(cc.Sprite)
    blockImage: cc.Sprite = null;
    @property(cc.Sprite)
    maBlockImage: cc.Sprite = null;
    
    @property(cc.Button)
    editNameBtn: cc.Button = null;
    @property(cc.Button)
    usedNameBtn: cc.Button = null;
    
    @property(cc.SpriteAtlas)
    schoolIconAtlas: cc.SpriteAtlas = null;
    
    params = {};
    isMyself: boolean = true;
    schoolId = null;
    prefabId = null;
    accountId = null;
    title: Optional<Title> = new Optional<Title>();
    detail: PlayerDetail = null;
    
    equipments = {
        'weapon': new Optional<Equipment>(), 
        'head': new Optional<Equipment>(),
        'necklace': new Optional<Equipment>(),
        'clothes': new Optional<Equipment>(), 
        'belt': new Optional<Equipment>(), 
        'shoes': new Optional<Equipment>(), 
    }
    
    async start () {
        this.moreAttrBtn.node.on(cc.Node.EventType.TOUCH_END, this.openMoreAttr.bind(this));
        this.moreAttrCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeMoreAttr.bind(this));
        this.moreAttrConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeMoreAttr.bind(this));
        this.blockImage.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.maBlockImage.node.on(cc.Node.EventType.TOUCH_END, () => {});
        let _this = this;
        this.nameBg.node.on(cc.Node.EventType.TOUCH_END, function() {
            let msg = '';
            switch (_this.schoolId) {
                case 101: {
                    msg = '当前门派为凌霄殿';
                    break; 
                }
                case 102: {
                    msg = '当前门派为普陀山';
                    break; 
                }
                case 103: {
                    msg = '当前门派为盘丝洞';
                    break; 
                }
                case 104: {
                    msg = '当前门派为五庄观';
                    break; 
                }
                default: {
                    msg = '当前门派为无门派';
                }
            }
            TipsManager.showMessage(msg);
        });
    
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    
        let config = await ConfigUtils.getConfigJson('AttributesShow');
        this.lifeBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[1].description) });
        this.luckyBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[8].description) });
        this.pAtkBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[3].description) });
        this.pDefBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[4].description) });
        this.mAtkBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[5].description) });
        this.mDefBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[6].description) });
        this.spdBg.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage(config[7].description) });
        this.editNameBtn.node.on(cc.Node.EventType.TOUCH_END, this.openEditNamePanel.bind(this));
        this.usedNameBtn.node.on(cc.Node.EventType.TOUCH_END, this.openUsedNameTips.bind(this));
    }
    
    initAsMyself() {
        this.editNameBtn.node.active = true;
        this.usedNameBtn.node.active = false;
        this.init(PlayerData.getInstance().accountId);
        EventDispatcher.on(Notify.PLYAER_WEAPON_CHANGE, this.updateInfo);
        EventDispatcher.on(Notify.PLAYER_REFRESH_NAME, this.updatePlayerName);
        let _this = this;
        this.titleBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            let panel = await CommonUtils.getPanel('player/title/titlePanel', TitlePanel) as TitlePanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        });
        this.fashionBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            let r1 = (await NetUtils.get<Array<Fashion>>('/fashion/getByAccountId', [])).getOrElse([]).length;
            if (r1 == 0) { 
                TipsManager.showMessage('你还未拥有任何时装呢');
                // let panel = await CommonUtils.getPanel('gameplay/fashion/fashionExhibitPanel', FashionExhibitePanel) as FashionExhibitePanel;
                // EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            } else {
                let panel = await CommonUtils.getPanel('gameplay/fashion/fashionMainPanel', FashionMainPanel) as FashionMainPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
				_this.closePanel();
            }
        });
        this.head.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Head).bind(this)));
        this.belt.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Belt).bind(this)));
        this.necklace.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Necklace).bind(this)));
        this.shoes.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Shoes).bind(this)));
        this.clothes.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Clothes).bind(this)));
        this.equip.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchangePanel(EquipmentPart.Weapon).bind(this)));
    }


    async initAsOthers(accountId: number) {
        this.editNameBtn.node.active = false;
        this.usedNameBtn.node.active = true;
        this.accountId = accountId;
        await this.init(accountId);
        let _this = this;
        this.titleBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            if (!_this.title.valid) { 
                TipsManager.showMessage('该玩家没有装备任何称号');
                return ; 
            }
            let panel = await CommonUtils.getPanel('player/title/titleTips', TitleTips) as TitleTips;
            panel.initTitle(_this.title.val);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        });
        this.fashionBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            if (_this.detail) {
                if (_this.detail.fashion) {
                    FashionConfig.showFashionTips(_this.detail.fashion, _this.prefabId);
                } else {
                    TipsManager.showMessage('该玩家没有穿戴任何时装');
                }
            }
        });
        this.head.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Head).bind(this)));
        this.belt.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Belt).bind(this)));
        this.necklace.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Necklace).bind(this)));
        this.shoes.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Shoes).bind(this)));
        this.clothes.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Clothes).bind(this)));
        this.equip.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showEquipmentTips(EquipmentPart.Weapon).bind(this)));    
    }
    
    async init (accountId: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/view/{id}/detail', [accountId]) as any;
        if (response.status == 0) {
            let info = response.content as PlayerDetail;
            this.detail = info;
            let params = {};
            for (let p of info.parameters) {
                params[p.name] = p.value;
            }
            if (!params["内伤"]) {
                params["内伤"] = params["法伤"]
                params["外伤"] = params["物伤"]
                params["内防"] = params["法防"]
                params["外防"] = params["物防"]
            }
    
            this.nameLabel.string = info.player.playerName;
            this.levelLabel.string = info.player.playerLevel.toString() + '级';
            
            this.life.string = Math.floor(params['最大生命']).toString(); params['最大生命'] = null; delete params['最大生命'];
            this.lucky.string = Math.floor(params['幸运']).toString(); params['幸运'] = null; delete params['幸运'];
            this.pAtk.string = Math.floor(params['外伤']).toString(); params['外伤'] = null; delete params['外伤'];
            this.pDef.string = Math.floor(params['外防']).toString(); params['外防'] = null; delete params['外防'];
            this.mAtk.string = Math.floor(params['内伤']).toString(); params['内伤'] = null; delete params['内伤'];
            this.mDef.string = Math.floor(params['内防']).toString(); params['内防'] = null; delete params['内防'];
            this.spd.string = Math.floor(params['速度']).toString(); params['速度'] = null; delete params['速度'];
            this.params = params;

            let schoolId = info.schoolId;
            if  (schoolId == undefined) {
                schoolId = 0;
            }
            this.schoolIcon.spriteFrame = this.schoolIconAtlas.getSpriteFrame('school_icon_' + schoolId);
    
            // init equipments
            this.equipments = {
                'weapon': new Optional<Equipment>(), 
                'head': new Optional<Equipment>(),
                'necklace': new Optional<Equipment>(),
                'clothes': new Optional<Equipment>(), 
                'belt': new Optional<Equipment>(), 
                'shoes': new Optional<Equipment>(), 
            }
            info.equipments.forEach(ele => {
                let id = ele.id;
                let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(ele.definitionId);
                if (prototype.isValid()) {
                    let part = prototype.getValue().part;
                    switch (part) {
                        case EquipmentPart.Belt: { this.equipments['belt'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Clothes: { this.equipments['clothes'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Head: { this.equipments['head'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Necklace: { this.equipments['necklace'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Shoes: { this.equipments['shoes'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Weapon: { this.equipments['weapon'] = new Optional<Equipment>(ele); break; }
                    }
                }
            });
            this.schoolId = info.schoolId;
            this.fcLabel.string = info.player.fc + '';
            let prefabId = info.player.prefabId;
            this.prefabId = prefabId;
            let weaponId = CommonUtils.getWeaponId(prefabId, this.equipments['weapon'].fmap(x => x.definitionId));
            this.initAnimation(prefabId, weaponId, this.equipments['weapon'].fmap(x => x.definitionId), (new Optional<Fashion>(info.fashion)).fmap(x => x.definitionId), new Optional(info.fashionDye))
            this.initEquipments(prefabId);
    
            let title = new Optional<Title>(info.title);
            this.title = title;
            this.initTitle(title.fmap(t => t.definitionId));
        }
    
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [
            accountId,
            153
        ]) as any;
        if (response2.status == 0) {
            let exp = response2.content.amount;
            let config = await ConfigUtils.getConfigJson('PlayerLevelupExp');
            let levelUpExp = config[this.detail.player.playerLevel] === undefined ? 191981000 : config[this.detail.player.playerLevel].exp;
            this.expLabel.string = exp + ' / ' + levelUpExp;
            this.expSp.node.width = Math.min(390, 390 * exp / levelUpExp);
        }
    }
    
    async initTitle(definitionId: Optional<number>) {
        if (!definitionId.valid) {
            this.titleLabel.node.active = false;
            this.titleSp.node.active = false;
        } else {
            let title = await TitleConfig.getConfigById(definitionId.val);
            let isPic = title.type == 1;
            this.titleLabel.node.active = !isPic;
            this.titleSp.node.active = isPic;
            if (isPic) {
                this.titleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
            } else {
                this.titleLabel.string = title.name;
            }
        }
    }
    
    initAnimation(prefabId: number, weaponId: number, woid: Optional<number>, definitionId: Optional<number>, dye: Optional<FashionDye>) {
        if (definitionId.valid) {
            this.fashionModel.node.active = true;
            this.playerMc.node.active = false;
            this.weapon.node.active = false;
            this.fashionModel.initByDirection(prefabId, woid, definitionId.val, "d", dye);
        } else {
            this.playerMc.node.active = true;
            this.weapon.node.active = true;
            this.fashionModel.node.active = false;
            this.initMc(prefabId, weaponId);
        }
    }
    
    async initMc(prefabId: number, weaponId: number) {
        let playerClip = await MovieclipUtils.getMovieclip(prefabId, 'stand_d', 10) as cc.AnimationClip;
        let weaponClip = await MovieclipUtils.getMovieclip(weaponId, 'stand_d', 10) as cc.AnimationClip;
        this.playerMc.getComponent(cc.Animation).addClip(playerClip, 'stand_d');
        this.weapon.getComponent(cc.Animation).addClip(weaponClip, 'stand_d');
        let anchor = MovieclipUtils.getOffset(prefabId + "_stand_d");
        this.playerMc.node.anchorX = anchor.x;
        this.playerMc.node.anchorY = anchor.y;
        this.weapon.node.anchorX = anchor.x;
        this.weapon.node.anchorY = anchor.y;
        this.playerMc.getComponent(cc.Animation).play('stand_d');
        this.weapon.getComponent(cc.Animation).play('stand_d');
    }
    
    async initEquipments(prefabId: number) {
        this.initEquipment(EquipmentPart.Head, this.headFrame, this.head, prefabId);
        this.initEquipment(EquipmentPart.Weapon, this.equipFrame, this.equip, prefabId)
        this.initEquipment(EquipmentPart.Belt, this.beltFrame, this.belt, prefabId)
        this.initEquipment(EquipmentPart.Necklace, this.necklaceFrame, this.necklace, prefabId)
        this.initEquipment(EquipmentPart.Clothes, this.clothesFrame, this.clothes, prefabId)
        this.initEquipment(EquipmentPart.Shoes, this.shoesFrame, this.shoes, prefabId)
    }
    
    async initEquipment(part: EquipmentPart, frame: ItemFrame, icon: cc.Sprite, prefabId: number) {
        let e = this.equipments[part];
        let pt = this.getPrototye(e);
        let dp = this.getItemDisplay(e, prefabId);
        if (e.isValid() && pt.isValid() && dp.isValid()) {
            frame.init(pt.getValue().quality, dp.getValue().showBorderEffect || (e.val.enhanceLevel >= 10 ? true : false))
            icon.spriteFrame = await ResUtils.getEquipmentIconById(dp.getValue().iconId);
            this.getEnhanceLevelByPart(part).string = e.val.enhanceLevel > 0 ? `+${e.val.enhanceLevel}` : '';
        } else {
            frame.itemFrame.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/basic/base_panel', 'bg_zhuangbeige');
            frame.effectSprite.node.active = false;
            icon.spriteFrame = await ResUtils.getEmptyEquipmentIconByPart(part);
            this.getEnhanceLevelByPart(part).string = ''
        }
    }
    
    getEnhanceLevelByPart (part: EquipmentPart): cc.Label {
        switch (part) {
            case EquipmentPart.Head: return this.headLvLabel;
            case EquipmentPart.Weapon: return this.weaponLvLabel;
            case EquipmentPart.Belt: return this.beltLvLabel;
            case EquipmentPart.Necklace: return this.necklaceLvLabel;
            case EquipmentPart.Clothes: return this.clothesLvLabel;
            case EquipmentPart.Shoes: return this.shoesLvLabel;
            default: return this.headLvLabel;
        }
    }
    
    getPrototye(e: Optional<Equipment>) {
        if (!e.isValid()) {
            return new Optional<EquipmentPrototype>();
        } else {
            return ItemConfig.getInstance().getEquipmentPrototypeById(e.getValue().definitionId)
        }
    }
    
    getItemDisplay(e: Optional<Equipment>, prefabId: number) {
        if (!e.isValid()) {
            return new Optional<ItemDisplay>();
        } else {
            return ItemConfig.getInstance().getItemDisplayById(e.getValue().definitionId, prefabId)
        }
    }
    
    openMoreAttr() {
        this.moreAttr.active = true;
        this.moreAttrScroll.content.removeAllChildren();
    
        let arr = [
            '招式力', '抵抗力', 
			'御兽招式力', '御兽抵抗力',
			'连击率', '吸血率', 
			'暴击率', '暴击效果',
            '格挡率', '神佑率'
        ];
        let attrIds = [
            9, 10, 
			42, 43,
			11, 12, 
			13, 14, 
			15, 16
        ]
    
        arr.forEach((ele, index) => {
            let attrItem = cc.instantiate(this.attrItem).getComponent(PlayerAttributeItem);
            attrItem.valueLabel.string = (this.params[ele] * 100).toFixed(2) + '%';
            attrItem.attrLabel.string = ele.toString();
            if (attrItem.attrLabel.string == '格挡率') {
            	attrItem.attrLabel.string = '招架率'
            }
            attrItem.init(attrIds[index]);
            attrItem.node.parent = this.moreAttrScroll.content;
            attrItem.bgSprite.node.active = index % 2 == 0;
        });
    
        // for (let key in this.params) {
        //     if (key == '战斗力') continue;
        //     let attrItem = cc.instantiate(this.attrItem).getComponent(PlayerAttributeItem);
        //     if (key.indexOf('率') != -1 || key == '暴击效果') {
        //         attrItem.valueLabel.string = (this.params[key] * 100).toString() + '%';
        //     } else {
        //         attrItem.valueLabel.string = (this.params[key]).toString();
        //     }
        //     attrItem.attrLabel.string = key.toString();
            
        //     attrItem.node.parent = this.moreAttrScroll.content;
        // }
    }
    
    // 打开更换装备界面
    openExchangePanel(part: EquipmentPart) {
        return async function () {
            let oBagItem = PlayerData.getInstance().equipments[part].fmap(e => {
                let bagItem = new BagItem();
                bagItem.data = e;
                bagItem.category = ItemCategory.Equipment;
                return bagItem;
            });
            if (oBagItem.isValid()) {
                let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
                panel.leftBase.armBtn.node.active = false;
                panel.init(oBagItem.getValue());
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
            } else {
                let panel = await CommonUtils.getPanel('gameplay/equipment/exchangeEquipmentPanel', ExchangeEquipmentPanel) as ExchangeEquipmentPanel;
                panel.init(part);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            }
        }.bind(this);
    }
    
    // 展示装备tips
    showEquipmentTips(part: EquipmentPart) {
        return async function () {
            let oBagItem = this.equipments[part].fmap(e => {
                let bagItem = new BagItem();
                bagItem.data = e;
                bagItem.category = ItemCategory.Equipment;
                return bagItem;
            });
            if (oBagItem.isValid()) {
                let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
                panel.init(oBagItem.getValue(), this.prefabId);
                panel.removeButtons();
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
            }
        }.bind(this);
    }
    
    closeMoreAttr() {
        this.moreAttr.active = false;
    }
    
    updateInfo = function() {
        this.init(PlayerData.getInstance().accountId);
    }.bind(this);
    
    updatePlayerName = function() {
        this.nameLabel.string = PlayerData.getInstance().playerName;
    }.bind(this);


    closePanel () {
        EventDispatcher.off(Notify.PLYAER_WEAPON_CHANGE, this.updateInfo);
        EventDispatcher.off(Notify.PLAYER_REFRESH_NAME, this.updatePlayerName);
        CommonUtils.safeRemove(this.node);
    }
    
    async openEditNamePanel () {
        let panel = await CommonUtils.getPanel('player/playerRenameBox', PlayerRenameBox) as PlayerRenameBox;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    async openUsedNameTips () {
        if (!this.accountId) {
            return;
        }
        let panel = await CommonUtils.getPanel('player/playerUsedNameTips', PlayerUsedNameTips) as PlayerUsedNameTips;
        await panel.init(this.accountId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    // update (dt) {}
}
