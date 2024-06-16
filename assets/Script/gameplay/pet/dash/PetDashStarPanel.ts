import Optional from "../../../cocosExtend/Optional";
import { PetDetail, Pet, PetEnhanceResult, CurrencyRecord } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import PagingControl from "../../../base/PagingControl";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { TipsManager } from "../../../base/TipsManager";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { ItemQuality, PetQuality, ItemCategory } from "../../../bag/ItemConfig";
import ItemFrame from "../../../base/ItemFrame";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import ChooseSkillsBox from "../skill/ChooseSkillsBox";
import PetAttributeModelling from "../attribute/PetAttributeModelling";
import ItemTips from "../../bag/ItemTips";
import BagItem from "../../../bag/BagItem";
import PetPanel from "../PetPanel";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

interface PetAddStar {
    id: number;
    currencyId: number;
    amount: number;
    starLevel: number;
    pomotion: number;
    rate: number;
    starStage: number;
    name: string;
    description: string;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetDashStarPanel extends cc.Component {

    @property(cc.Sprite)
    icons: Array<cc.Sprite> = [];
    @property(ItemFrame)
    pinziIcons: Array<ItemFrame> = [];
    @property(cc.Toggle)
    toggles: Array<cc.Toggle> = [];
    @property(cc.Node)
    toPlayIcons: Array<cc.Node> = [];
    @property(cc.Label)
    showRankLabels: Array<cc.Label> = [];

    @property(PagingControl)
    page: PagingControl = null;
    @property(PetAttributeModelling)
    petModelling: PetAttributeModelling = null;

    @property(cc.Label)
    successRateLabel: cc.Label = null;
    @property(cc.Animation)
    energyAnims: Array<cc.Animation> = [];
    @property(cc.Button)
    dashStarBtn: cc.Button = null;
    @property(cc.Animation)
    dashStarAnims: Array<cc.Animation> = [];
    @property(cc.Animation)
    succeedAnim: cc.Animation = null;
    @property(cc.Animation)
    failureAnim: cc.Animation = null;
    @property(cc.Node)
    addAttributeNode: cc.Node = null;
    @property(cc.Node)
    maxAttributeNode: cc.Node = null;

    @property(cc.Label)
    qixue: cc.Label = null;
    @property(cc.Label)
    atkName: cc.Label = null;
    @property(cc.Label)
    atk: cc.Label = null;
    @property(cc.Label)
    wufang: cc.Label = null;
    @property(cc.Label)
    fafang: cc.Label = null;
    @property(cc.Label)
    sudu: cc.Label = null;
    @property(cc.Label)
    combatLabel: cc.Label = null;

    @property(cc.Label)
    qixue2: cc.Label = null;
    @property(cc.Label)
    atkName2: cc.Label = null;
    @property(cc.Label)
    atk2: cc.Label = null;
    @property(cc.Label)
    wufang2: cc.Label = null;
    @property(cc.Label)
    fafang2: cc.Label = null;
    @property(cc.Label)
    sudu2: cc.Label = null;
    @property(cc.Label)
    combatLabel2: cc.Label = null;

    @property(cc.Label)
    describeLabel: cc.Label = null;

    @property(cc.Button)
    helpBtn: cc.Button = null;

    //Tips 属性提示
    @property(cc.Node)
    wufTip: cc.Node = null;
    @property(cc.Node)
    fafTip: cc.Node = null;
    @property(cc.Node)
    hpTip: cc.Node = null;
    @property(cc.Node)
    atkTip: cc.Node = null;
    @property(cc.Node)
    sudTip: cc.Node = null;
    @property(cc.Node)
    wufTip2: cc.Node = null;
    @property(cc.Node)
    fafTip2: cc.Node = null;
    @property(cc.Node)
    hpTip2: cc.Node = null;
    @property(cc.Node)
    atkTip2: cc.Node = null;
    @property(cc.Node)
    sudTip2: cc.Node = null;

    //消耗
    @property(cc.Node)
    currencyTips: cc.Node = null;
    @property(cc.Label)
    currencyPlayerLabel: cc.Label = null;
    @property(cc.Label)
    consumptionLabel: cc.Label = null;

    @property(cc.Node)
    disableMask: cc.Node = null;

    isMagic: boolean = false;

    pageData: Array<Optional<PetDetail>> = [];

    isToPlay: boolean = true;

    selected: number = 0;

    battlePets: Array<number> = [0, 0, 0];

    from: PetPanel = null;

    addStarConfigs: Array<Optional<PetAddStar>> = [];

    rankProgress: number = 0;

    isRuning = false;

    currencyPlayer: number = 0;

    onLoad() {

    }
	
    start() {
        this.disableMask.active = false;
        this.initEvents();
    }

    async init(currentPage = 1, selected = 0) {

        if (PetData.getPetMaxPage() == 0) {
            TipsManager.showMessage('没有获得宠物');
            return;
        }
        await this.initAddStarConfig();
        this.selected = selected;

        this.page.init(PetData.getPetMaxPage(), this.updatePage.bind(this), currentPage);
        this.updatePage(currentPage, false);

    }

    async initAddStarConfig() {
        this.addStarConfigs = [];
        let config = await ConfigUtils.getConfigJson('PetAddStar');
        for (let key in config) {
            let value = R.prop(key, config);
            this.addStarConfigs.push(new Optional<PetAddStar>(value));
        }
    }

    initEvents() {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.updateSelected.bind(this, index));
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 16));
        this.dashStarBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onDashStarBtn.bind(this)));
        this.currencyTips.on(cc.Node.EventType.TOUCH_END, this.showCurrencyTips.bind(this));
        EventDispatcher.on(Notify.PET_DATA_CHANGE, this.onPetDataChange);

        this.atkTip.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isMagic) {
                this.showTextTips(5);
            } else {
                this.showTextTips(3);
            }
        });
        this.hpTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 1));
        this.wufTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 4));
        this.fafTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 6));
        this.sudTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 7));

        this.atkTip2.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isMagic) {
                this.showTextTips(5);
            } else {
                this.showTextTips(3);
            }
        });
        this.hpTip2.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 1));
        this.wufTip2.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 4));
        this.fafTip2.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 6));
        this.sudTip2.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 7));
    }

    async showCurrencyTips(event: cc.Event.EventTouch) {
        let bagItem = new BagItem();
        let date = {} as CurrencyRecord;
        date.currencyId = 158;
        date.amount = this.currencyPlayer;
        date.accountId = PlayerData.getInstance().accountId;
        bagItem.category = ItemCategory.Currency;
        bagItem.data = date;
        let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
        panel.init(bagItem.getItemDisplay(), R.prop('amount', bagItem.data), false);
        let location = event.getLocationInView();
        let func = R.compose(
            R.min(768 / 2 - panel.tipNode.width / 2),
            R.max(panel.tipNode.width / 2 - 768 / 2)
        );
        panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
        panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async showTextTips(id: number) {
        let config = await ConfigUtils.getConfigJson("AttributesShow");
        TipsManager.showMessage(config[id].description);
    }

    async updatePage(page: number, isInit = true) {

        let data = await PetData.getPetsByPage(page - 1);
        if (data == null || data.length == 0) {
            return;
        }
        this.pageData = data;
        this.icons.forEach((icon, index) => {
            icon.spriteFrame = null;
            this.pinziIcons[index].node.active = false;
            this.toggles[index].node.active = false;
        });
        data.forEach(async (item, index) => {
            this.toggles[index].node.active = true;
            if (item.isValid()) {
				let rank = item.getValue().pet.rank;
                if (rank > 0) {
                    this.showRankLabels[index].string = '+' + rank.toString();
                } else {
                    this.showRankLabels[index].string = '';
                }
				//
                let config = await PetData.getConfigById(item.getValue().pet.definitionId);
                if (config.isValid()) {
                    let iconID = config.getValue().prefabId;
                    this.icons[index].spriteFrame = await ResUtils.getPetHeadIconById(iconID);
                    await this.toColor(this.pinziIcons[index], config.getValue().color, rank);
                }
            }
        });

        this.battlePets[0] = PlayerData.getInstance().battlePetId1.getValue();
        this.battlePets[1] = PlayerData.getInstance().battlePetId2.getValue();
        this.battlePets[2] = PlayerData.getInstance().battlePetId3.getValue();
        this.toPlayIcons.forEach((icon, index) => {
            if (page == 1 && index < this.pageData.length && this.isBattle(this.pageData[index].fmap(x => x.pet).fmap(x => x.id).getOrElse(0))) {
                icon.active = true;
            } else {
                icon.active = false;
            }
        });
        this.from.currentPage = page;
        this.page.setPage(page);
        if (isInit) {
            await this.updateSelected(0);
        } else {
            await this.updateSelected(this.selected);
        }

    }
	
    async toColor(effect, color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                effect.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                effect.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                effect.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                effect.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                effect.node.active = false;
                break;
        }
        effect.node.active = true;
    }

    isBattle(ID: number) {
        return this.battlePets.indexOf(ID) != -1;
    }

    async updateSelected(select: number) {
        this.selected = select;
        if (this.pageData.length <= select) {
            this.selected = 0;
        }
        this.from.selected = this.selected;
        this.toggles[this.selected].check();
        if (!this.pageData[this.selected].isValid()) {
            console.error(this.selected + ' 数据错误');
            return;
        }
        let petDetail = this.pageData[this.selected].getValue();
        await this.petModelling.setData(petDetail, this);
        this.dashStarAnims.forEach((anim, index) => {
            if (index < petDetail.pet.maxRank) {
                anim.node.active = true;
                anim.node.getComponent(cc.Sprite).spriteFrame = null;
            } else {
                anim.node.active = false;
            }
        });

        let successRateConfig = this.getAddRateConfig(petDetail.pet);
        this.successRateLabel.string = CommonUtils.numMulti(successRateConfig.fmap(x => x.rate).getOrElse(0), 100).toString().replace('.', 'p') + '%';
        this.rankProgress = petDetail.pet.rankProgress;
        this.describeLabel.string = successRateConfig.fmap(x => x.description).getOrElse('');
        this.setAttributeList(petDetail);
        this.setEnergyProgress();
        this.setConsumption(successRateConfig);
    }

    async setConsumption(successRateConfig: Optional<PetAddStar>) {
        if (successRateConfig.fmap(x => x.amount).isValid()) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${158}`, []) as any;
            if (response.status === 0) {
                this.currencyPlayer = R.prop('amount', response.content);
            }
            if (this.currencyPlayer < successRateConfig.getValue().amount) {
                this.currencyPlayerLabel.node.color = cc.color(255, 80, 80);
            } else {
                this.currencyPlayerLabel.node.color = cc.color(24, 113, 34);
            }
            this.currencyPlayerLabel.string = this.currencyPlayer.toString();
            this.consumptionLabel.string = successRateConfig.getValue().amount.toString();
        }
    }

    setEnergyProgress() {
        this.energyAnims.forEach((energy, index) => {
            if (index < this.rankProgress) {
                energy.node.active = true;
            } else {
                energy.node.active = false;
            }
        });

    }

    getAddRateConfig(pet: Pet) {
        let isSuccess = (config: Optional<PetAddStar>) => {
            if (config.fmap(x => x.starLevel).getOrElse(0) == pet.rank && config.fmap(x => x.starStage).getOrElse(0) == pet.rankProgress) {
                return true;
            }
            return false;
        };
        return R.find(isSuccess, this.addStarConfigs) as Optional<PetAddStar>;
    }

    async setAttributeList(petDetail: PetDetail) {
        let pet = petDetail.pet;
        let mData = await PetData.getAttributes(petDetail);

        let config = await PetData.getConfigById(pet.definitionId);
        this.isMagic = config.isValid() ? config.getValue().isMagic : false;
        if (this.isMagic) {
            this.atkName.string = '内伤  ';
        } else {
            this.atkName.string = '外伤  ';
        }
        this.atk.string = Math.floor(mData.atk).toString();
        this.wufang.string = Math.floor(mData.pDef).toString();
        this.fafang.string = Math.floor(mData.mDef).toString();
        this.sudu.string = Math.floor(mData.spd).toString();
        this.qixue.string = Math.floor(mData.hp).toString();

        this.combatLabel.string = this.petModelling.powerlabel.string;

        await CommonUtils.wait(0.1);
        let lifting = 0;
        let currentLifting = R.add(1)(this.getAddRateConfig(pet).fmap(x => x.pomotion).getOrElse(-1));
        if (pet.rank < pet.maxRank) {
            this.addAttributeNode.active = true;
            this.maxAttributeNode.active = false;
            let index1 = this.addStarConfigs.indexOf(this.getAddRateConfig(pet)) + 1;
            if (index1 >= this.addStarConfigs.length) {
                index1 = this.addStarConfigs.length - 1;
            }
            lifting = R.add(1)(this.addStarConfigs[index1].fmap(x => x.pomotion).getOrElse(0));
        } else if (pet.rank >= pet.maxRank) {
            this.addAttributeNode.active = false;
            this.maxAttributeNode.active = true;

            this.describeLabel.string = '厉害了！已达到最高星级了！';
        }

        if (this.isMagic) {
            this.atkName2.string = '内伤  ';
        } else {
            this.atkName2.string = '外伤  ';
        }
        this.atk2.string = this.getAttributeByDash(mData.atk, currentLifting, lifting, pet.aptitudeAtk, 400, 10, 0.018, 200).toString();
        this.wufang2.string = this.getAttributeByDash(mData.pDef, currentLifting, lifting, pet.aptitudePdef, 400, 10, 0.011, 130).toString();
        this.fafang2.string = this.getAttributeByDash(mData.mDef, currentLifting, lifting, pet.aptitudeMdef, 400, 10, 0.011, 130).toString();
        this.sudu2.string = this.getAttributeByDash(mData.spd, currentLifting, lifting, pet.aptitudeSpd, 400, 10, 0.0055, 20).toString();
        this.qixue2.string = this.getAttributeByDash(mData.hp, currentLifting, lifting, pet.aptitudeHp, 400, 10, 0.086, 1000).toString();

        let fcDaskStar = this.getFCByDash(mData.fc, currentLifting, lifting, petDetail);
        this.combatLabel2.string = fcDaskStar.toString();
    }

    async onDashStarBtn() {
        let petDetail = this.pageData[this.selected];
        if (!petDetail.isValid()) {
            console.error(this.selected + ' 数据错误');
            return;
        }
        if (petDetail.fmap(x => x.pet).fmap(x => x.rank).getOrElse(0) >= petDetail.fmap(x => x.pet).fmap(x => x.maxRank).getOrElse(0)) {
            TipsManager.showMessage('该宠物冲星已达最高等级');
            return;
        }
        if (this.currencyPlayer < parseInt(this.consumptionLabel.string)) {
            TipsManager.showMsgFromConfig(1087);
            //TipsManager.showMessage('冲星灵丹不足');
            return;
        }
        //播动画 
        this.isRuning = true;
        this.disableMask.active = true;
        this.energyAnims[this.rankProgress].node.active = true;
        let animStart = this.energyAnims[this.rankProgress].play('repairGuoc');
        await CommonUtils.wait(animStart.duration);
        this.energyAnims[this.rankProgress].node.active = false;
        if (petDetail.fmap(x => x.pet).fmap(x => x.id).isValid()) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/enhance', [petDetail.getValue().pet.id]) as any;
            if (response.status === 0) {
                let data: PetEnhanceResult = response.content;
                if (data.success) {
                    this.rankProgress += 1;
                    this.showSucceedAnim();
                    if (this.rankProgress == 5) {
                        this.setEnergyProgress();
                        await CommonUtils.wait(0.5);
                        this.rankProgress = 0;
                        this.setEnergyProgress();
                        await CommonUtils.wait(0.05);
                        let state = this.dashStarAnims[petDetail.getValue().pet.rank].play();
                        await CommonUtils.wait(state.duration);
                        this.breakthroughTips(data.pet);
                    }
                } else {
                    this.showFailureAnim();
                }
                PetData.updatePetInfo({ pet: data.pet, parameters: [] });
                PlayerData.getInstance().updateFc();
            }
        }
        this.disableMask.active = false;
        this.isRuning = false;
    }

    async breakthroughTips(pet: Pet) {
        if (pet.rankProgress == 0) {
            switch (pet.rank) {
                case 4:
                    let rareId = 0;
                    pet.abilities.forEach((id) => {
                        if (id.toString().indexOf('3101') > -1) {
                            rareId = id;
                        }
                    });
                    let rareConfig = await PetData.getPetSkillInfoById(rareId);
                    if (rareConfig.isValid()) {
                        TipsManager.showMessage(`成功激活绝世技能 <color=#4EFF00>${rareConfig.getValue().name}</c>！`)
                    }
                    break;
                case 7:
                    TipsManager.showMessage('成功激活炼妖系统！');
                    break;
                case 10:
                    let petConfig = await PetData.getConfigById(pet.definitionId);
                    let skillId = petConfig.fmap(x => x.activeSkill.snd).getOrElse(0);
                    let skillConfig = await PetData.getPetSkillInfoById(skillId);
                    if (skillConfig.isValid()) {
                        TipsManager.showMessage(`成功激活主动技能 <color=#4EFF00>${skillConfig.getValue().name}</c>！`)
                    }
                    break;
            }
        }
    }

    async showSucceedAnim() {
        this.succeedAnim.node.active = true;
        let state = this.succeedAnim.play();
        await CommonUtils.wait(state.duration);
        this.succeedAnim.node.active = false;
    }

    async showFailureAnim() {
        this.failureAnim.node.active = true;
        let state = this.failureAnim.play();
        await CommonUtils.wait(state.duration);
        this.failureAnim.node.active = false;
    }

    // update (dt) {}
    onDestroy() {
        EventDispatcher.off(Notify.PET_DATA_CHANGE, this.onPetDataChange);
    }

    onPetDataChange = async function (event) {
        await this.updatePage(event.detail.page, false);
    }.bind(this);


    //获取对应属性
    getAttributeByDash(attribute: number, currentLifting: number, lifting: number, qualification: number, p1: number, p2: number, p3: number, p4: number) {
        let a1 = (PlayerData.getInstance().playerLevel + p1) * (qualification + p2) * p3 + p4;
        let skill = attribute - (currentLifting * a1);
        return Math.floor(lifting * a1 + skill);
    }

    //获取战力
    getFCByDash(fc: number, currentLifting: number, lifting: number, petDetail: PetDetail) {
        let s1 = (PlayerData.getInstance().playerLevel + 400) * (petDetail.pet.aptitudeHp * 1.7 + petDetail.pet.aptitudeMdef * 1.9
            + petDetail.pet.aptitudeAtk * 2.5 + petDetail.pet.aptitudePdef * 1.9 + petDetail.pet.aptitudeSpd * 2 + 100) * 0.004 + 490;
        let skill = fc - Math.floor(currentLifting * s1);
        return Math.floor((lifting * s1) + skill);
    }

    getSkillFc(petDetail: PetDetail) {
        let lowNumber = 0;
        let heightNumber = 0;
        let skills = petDetail.pet.abilities;
        skills.forEach((id) => {
            if (id.toString().indexOf('3101') > -1) {
                heightNumber += 1;
            } else {
                lowNumber += 1;
            }
        });

        return Math.floor(heightNumber * 650 + lowNumber * 250);
    }

}
