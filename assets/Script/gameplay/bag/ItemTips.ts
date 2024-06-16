import { TipsManager } from "../../base/TipsManager";
import { CommonUtils } from "../../utils/CommonUtils";
import { ItemDisplay, ItemQuality } from "../../bag/ItemConfig";
import Optional from "../../cocosExtend/Optional";
import { ResUtils } from "../../utils/ResUtils";
import { PetData } from "../pet/PetData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import BagPanel from "./BagPanel";
import { QuickUseItem } from "../rightdown/QuickUseItem";
import ItemWithEffect from "../../base/ItemWithEffect";
import EquipmentForgePanel from "../equipment/forge/EquipmentForgePanel";
import { BroadcastHandler } from "../../mainui/BroadcastHandler";
import { CurrencyId } from "../../config/CurrencyId";
import PetPanel from "../pet/PetPanel";
import { ShopUtils } from "../../shop/ShopUtils";
import { NetUtils } from "../../net/NetUtils";
import { Fashion } from "../../net/Protocol";
import FashionMainPanel from "../fashion/FashionMainPanel";
import PlayerRenameBox from "../../player/PlayerRenameBox";
import SchoolSkillPanel from "../school/SchoolSkillPanel";
import PlayerData from "../../data/PlayerData";
import AccountantOfficePanel from "../casino/AccountantOfficePanel";
import SjjsPanel from "../sjjs/SjjsPanel";
import KbWheel from "../kbwheel/KbWheel";
import TradingPanel from "../trading/TradingPanel";
import GodBeastTrainPanel from "../pet/godBeast/GodBeastTrainPanel";
import MapManager from "../../map/MapManager";
import FishingPanel from "../fishing/FishingPanel";
import DigOrePanel from "../digOre/DigOrePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemTips extends cc.Component {
    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    category: cc.Label = null;
    @property(cc.RichText)
    description: cc.RichText = null;
    @property(cc.Button)
    useBtn: cc.Button = null;
    
    dataId: number = 0;
    start() {
        this.useBtn.node.on(cc.Node.EventType.TOUCH_END, this.useBtnOnClick.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }
    
    async init(display: Optional<ItemDisplay>, amount: number, isUse = true) {
        this.useBtn.node.active = isUse;
        if (display.isValid()) {
            this.category.string = '数量 ' + amount;
            this.nameLabel.string = display.getValue().name;
            // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getTipColorByQuality(display.val.quality));
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(display.val.quality))
            this.description.string = display.getValue().description;
            this.dataId = display.getValue().prototypeId;
            this.item.initWithCurrency({ currencyId: this.dataId, amount: amount });
        }
    }
    
    async initForPetSkill(skillId: number) {
        CommonUtils.safeRemove(this.useBtn.node);
        let info = await PetData.getPetSkillInfoById(skillId);
        if (info.valid) {
            this.nameLabel.string = info.val.name;
            this.description.string = info.val.description;
            this.category.string = info.val.isActive ? '主动技能' : '被动技能';
            this.item.iconImage.spriteFrame = await ResUtils.getPetSkillIconById(info.val.icon);
            this.item.frame.init(null, false);
        }
    }
    
    async initJustShow(display: Optional<ItemDisplay>, amount: number, isBig = true) {
        this.useBtn.node.active = false;
        if (display.isValid()) {
            this.category.string = '数量 ' + amount;
            this.nameLabel.string = display.getValue().name;
            // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getTipColorByQuality(display.val.quality));
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(display.val.quality))
            this.description.string = display.getValue().description;
            this.dataId = display.getValue().prototypeId;
            this.item.initWithJustShow({ currencyId: this.dataId, amount: amount }, isBig);
        }
    }
    
    useBtnOnClick() {
        if (this.dataId == 20001) {
            EventDispatcher.dispatch(Notify.OPEN_DIG_TREASURE, { name: 'DIG' });
            this.closePanel();
            let canvas = cc.find('Canvas');
            let bag = canvas.getComponentInChildren(BagPanel);
            if (bag != null) {
                CommonUtils.safeRemove(bag.node);
            }
        } else if (this.dataId > 20000 && this.dataId < 29999) {
            QuickUseItem.use(this.dataId);
            this.closePanel();
        } else {
            this.handleUseCurrency(this.dataId);
        }
    }
    
    isHandling: boolean = false;
    async handleUseCurrency(currencyId: number) {
        if (this.isHandling) { return; }
        this.isHandling = true;
        switch (currencyId) {
            case CurrencyId.强化石: {
                BroadcastHandler.handle(7)
                break
            }
            case CurrencyId.冲星灵丹: {
                BroadcastHandler.handle(9);
                break;
            }
            case CurrencyId.灵宠要诀: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('gameplay/pet/petPanel', PetPanel) as PetPanel;
                panel.toggles[1].check();
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.强化保护卡: {
                BroadcastHandler.handle(7);
                break;
            }
            case CurrencyId.玉石: {
                BroadcastHandler.handle(10);
                break;
            }
            case CurrencyId.斗战券: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
                ShopUtils.openShopPanel(4489001);
                break;
            }
            case CurrencyId.名剑币: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
                ShopUtils.openShopPanel(4489002);
                break;
            }
            case CurrencyId.染色剂: {
                let r1 = (await NetUtils.get<Array<Fashion>>('/fashion/getByAccountId', [])).getOrElse([]).length;
                if (r1 == 0) {
                    TipsManager.showMsgFromConfig(1182);
                } else {
                    let panel = await CommonUtils.getPanel('gameplay/fashion/fashionMainPanel', FashionMainPanel) as FashionMainPanel;
                    // panel.switchToDye();
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                }
                break;
            }
            case CurrencyId.改名卡: {
                let panel = await CommonUtils.getPanel('player/playerRenameBox', PlayerRenameBox) as PlayerRenameBox;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.九灵仙丹: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('gameplay/school/schoolSkillPanel', SchoolSkillPanel) as SchoolSkillPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                await CommonUtils.wait(0.3);
                panel.onToggle(null, '1');
                break;
            }
            case CurrencyId.金坷垃: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('gameplay/school/schoolSkillPanel', SchoolSkillPanel) as SchoolSkillPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                await CommonUtils.wait(0.3);
                panel.onToggle(null, '2');
                break;
            }
            case CurrencyId.腾根A:
            case CurrencyId.腾根B:
            case CurrencyId.腾根C:
            case CurrencyId.腾根D:
            case CurrencyId.腾根E:
            case CurrencyId.六耳猕猴A:
            case CurrencyId.六耳猕猴B:
            case CurrencyId.六耳猕猴C:
            case CurrencyId.六耳猕猴D:
            case CurrencyId.六耳猕猴E: {
        		EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
        		let panel = await CommonUtils.getPanel('gameplay/pet/dogBeast/GodBeastTrainPanel', GodBeastTrainPanel) as GodBeastTrainPanel;
        		EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.坊金: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
                let panel = await CommonUtils.getPanel('gameplay/casino/accountantOfficePanel', AccountantOfficePanel) as AccountantOfficePanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.拜年红包1: {
                TipsManager.showMessage('向地图上的角色拜年换取好礼吧');
                break;
            }
            case CurrencyId.元宝: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('gameplay/trading/TradingPanel', TradingPanel) as TradingPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.活跃点: {
                if (PlayerData.getInstance().playerLevel < 40) {
            		TipsManager.showMessage('提升至40级即可开放三界经商');
        		} else {
        			EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                	let panel = await CommonUtils.getPanel('gameplay/sjjs/sjjsPanel', SjjsPanel) as SjjsPanel;
                	EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        		}
                break;
            }
            case CurrencyId.能量: {
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('kbWheel', KbWheel) as KbWheel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case CurrencyId.仙石: {
				TipsManager.showMessage('仙石总量为一亿个噢！');
                break;
            }
            case CurrencyId.翡翠原石凡:
            case CurrencyId.翡翠原石般:
            case CurrencyId.翡翠原石上:
            case CurrencyId.翡翠原石特:
            case CurrencyId.翡翠原石凤: {
				TipsManager.showMessage('听说长乐坊的烟扬在收购此物，去找他看看吧');
                break;
            }
            case CurrencyId.钓鱼点: {
				TipsManager.showMessage('去野外的猎户黄大虎那里可以兑换好东西噢');
                break;
            }
            case CurrencyId.钓竿般:
            case CurrencyId.钓竿上: {
				if (PlayerData.getInstance().playerLevel < 70) {
                    TipsManager.showMessage('少侠需要修为达到70级方可驱使钓竿噢！');
                    return;
                }
				if (MapManager.getInstance().currentMapId == 2
					&& (MapManager.getInstance().currentXPos >= 400 && MapManager.getInstance().currentXPos <= 1350)
					&& (MapManager.getInstance().currentYPos >= 1600 && MapManager.getInstance().currentYPos <= 2000)) {
					//
					EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
					let panel = await CommonUtils.getPanel('gameplay/fishing/FishingPanel', FishingPanel) as FishingPanel;
					EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
				} else {
					TipsManager.showMessage('要在野外的湖边才能钓鱼呀');
				}
                break;
            }
            case CurrencyId.长乐贡牌: {
				TipsManager.showMessage('将其投入长乐坊的聚宝盆能获得海量坊金奖励噢！');
                break;
            }
            case CurrencyId.代金券: {
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1195);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/digOre/DigOrePanel', DigOrePanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});				
                break;
            }
            case CurrencyId.魂晶: {
				TipsManager.showMessage('在装备或宠物的附魂界面使用即可提升附魂等级');
                break;
            }
            case CurrencyId.门贡: {
				if (PlayerData.getInstance().schoolId == null) {
                    TipsManager.showMessage('少侠尚未拜入门派，暂时无法使用门贡噢！');
                    return;
                }
                EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
                let panel = await CommonUtils.getPanel('gameplay/school/schoolSkillPanel', SchoolSkillPanel) as SchoolSkillPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            default: {
                TipsManager.showMessage('敬请期待');
            }
        }
        this.isHandling = false;
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
