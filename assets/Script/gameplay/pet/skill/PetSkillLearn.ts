// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import Optional from "../../../cocosExtend/Optional";
import { PetDetail, Pet, CurrencyRecord } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import PagingControl from "../../../base/PagingControl";
import { PetData, PetAbilityStudy } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { TipsManager } from "../../../base/TipsManager";
import PetAttributeModelling from "../attribute/PetAttributeModelling";
import PassiveItem from "../attribute/PassiveItem";
import PetRadarMap from "../attribute/PetRadarMap";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import ItemConfig, { ItemQuality, PetQuality } from "../../../bag/ItemConfig";
import ItemFrame from "../../../base/ItemFrame";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import ChooseSkillsBox from "./ChooseSkillsBox";
import PetTips from "../PetTips";
import PetXTips from "./PetXTips";
import PetPanel from "../PetPanel";

const { ccclass, property } = cc._decorator;




@ccclass
export default class PetSkillLearn extends cc.Component {

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
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    learnBtn: cc.Button = null;

    @property(cc.Node)
    disableMask: cc.Node = null;

    //消耗栏的
    @property(cc.Label)
    namela: cc.Label = null;
    @property(cc.Label)
    haveLabel: cc.Label = null;
    @property(cc.Label)
    demandLabel: cc.Label = null;
    @property(cc.Label)
    jilula: cc.Label = null;
    @property(cc.Sprite)
    xIcon: cc.Sprite = null;
    @property(ItemFrame)
    xpBox: ItemFrame = null;
	
    isMagic: boolean = false;

    passiveGroup: Array<PassiveItem> = [];

    pageData: Array<Optional<PetDetail>> = [];
    currencyPetDetail: PetDetail = null;
    selected: number = 0;

    isShowAttributeList: boolean = true;
    battlePets: Array<number> = [0, 0, 0];
    skillNumber: number = 0;
    maxSkillNum = 0;
    currencyData: PetAbilityStudy;
    playCurrency = 0;
    isRuning = false;

    from: PetPanel = null;
    onLoad() {
        this.passiveGroup = this.node.getComponentsInChildren(PassiveItem);
    }


    init(currentPage = 1, selected = 0) {
        if (PetData.getPetMaxPage() == 0) {
            TipsManager.showMessage('没有获得宠物');
            return;
        }
        this.selected = selected;
        this.page.init(PetData.getPetMaxPage(), this.updatePage.bind(this), currentPage);
        this.updatePage(currentPage, false);
        this.initEvents();
        this.isShowAttributeList = false;
    }
    initEvents() {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.updateSelected.bind(this, index));
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 12));
        this.xIcon.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
        this.learnBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSkillLearn.bind(this)));
        EventDispatcher.on(Notify.PET_DATA_CHANGE, this.onPetDataChange);
    }

    async updatePage(page: number, isInit = true) {
        this.disableMask.active = false;
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
            console.error('error');
            return;
        }
        let petDetail = this.pageData[this.selected].getValue();
        this.currencyPetDetail = petDetail;
        this.petModelling.setData(petDetail, this);

        let petconfig = (await PetData.getConfigById(petDetail.pet.definitionId));
        this.maxSkillNum = petconfig.isValid() ? petconfig.getValue().maxSkillNum : 0;

        let abilities = petDetail.pet.abilities;
        this.skillNumber = 0;
        this.passiveGroup.forEach((passive, index) => {
            passive.toNull();
            passive.toLearn();
            if (index < this.maxSkillNum) {
                if (petDetail.pet.maxRank >= 4 && index == this.maxSkillNum - 1 && petDetail.pet.rank < 4) {
                    passive.toUnknown();
                }
                if (index < abilities.length) {
                    passive.toSkill(abilities[index]);
                    this.skillNumber += 1;
                }
            } else {
                passive.tolock();
            }
        });
        if (petDetail.pet.maxRank >= 4 && petDetail.pet.rank < 4) {
            this.skillNumber += 1;
        }
        this.updateXiaohao();
    }

    async updateXiaohao() {
        let config = await PetData.getPetAbilityStudy();
        if (config.isValid()) {
            let value = config.getValue();
            this.currencyData = R.find(R.propEq('abilityAmount', this.skillNumber))(value) as PetAbilityStudy;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${this.currencyData.currencyId}`, []) as any;
            if (response.status === 0) {
                this.playCurrency = R.prop('amount', response.content);
            }
            this.xIcon.spriteFrame = await ResUtils.getCurrencyIconbyId(this.currencyData.currencyId);
            let display = await ItemConfig.getInstance().getItemDisplayById(this.currencyData.currencyId, PlayerData.getInstance().prefabId);
            if (display.isValid()) {
                // this.xpBox.init(display.getValue().priority, false);
                this.xpBox.init(ItemQuality.Blue, false);
            } else {
                this.xpBox.init(null, false);
            }

            this.namela.string = this.currencyData.currencyName;
            this.demandLabel.string = this.currencyData.amount.toString();
            this.haveLabel.string = this.playCurrency.toString();
            if (this.playCurrency < this.currencyData.amount) {
                this.haveLabel.node.color = cc.color(255, 26, 0);
            } else {
                this.haveLabel.node.color = cc.color(6, 127, 40);
            }

            this.jilula.string = CommonUtils.numMulti(this.currencyData.successRate, 100).toString().replace('.', 'p') + '%';
        }
    }

    async showTips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/pet/PetXTips', PetXTips) as PetXTips;
        let config = await ItemConfig.getInstance().getItemDisplayById(this.currencyData.currencyId, null);
        if (config.isValid()) {
            panel.init(config, this.playCurrency, this.jilula.string);
        }
        let location = event.getLocationInView();
        let func = R.compose(
            R.min(768 / 2 - panel.tipNode.width / 2),
            R.max(panel.tipNode.width / 2 - 768 / 2)
        );
        panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
        panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async onSkillLearn() {
        if (!this.pageData[this.selected].isValid()) {
            console.error('error');
            return;
        }
        if (this.currencyPetDetail.pet.candidateAbilities.length > 0) {
            return;
        } else if (this.maxSkillNum - this.skillNumber <= 0) {
            TipsManager.showMessage('技能位已满');
            return;
        } else if (this.isRuning) {
            TipsManager.showMessage('技能学习中');
            return;
        } else if (this.playCurrency < this.currencyData.amount) {
            TipsManager.showMessage('灵宠要诀不足，去获得些再来学习吧');
            return;
        }
        this.isRuning = true;
        this.disableMask.active = true;
        let petDetail = this.pageData[this.selected].getValue();
        if (petDetail.pet.maxRank < 4 || petDetail.pet.rank >= 4) {
            await CommonUtils.wait(this.passiveGroup[this.skillNumber].showAnim());
        } else {
            await CommonUtils.wait(this.passiveGroup[this.skillNumber - 1].showAnim());
        }
        let petId = petDetail.pet.id;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/pet/action/${petId}/gachaAbility`, [petId]) as any;
        if (response.status === 0) {
            let data = response.content as PetDetail;
            if (data.pet.candidateAbilities.length > 0) {
                TipsManager.showMessage('学习成功！请选择想要学习的技能');
                await this.showSillSelect(data);
                await CommonUtils.wait(0.2);//瞬间出两次问题
            } else {
                TipsManager.showMessage('技能学习失败');
                this.updateXiaohao();
            }
            this.isRuning = false;
        } else {
            this.isRuning = false;
        }
        this.disableMask.active = false;
    }

    async showSillSelect(data: PetDetail) {
        let panel = await CommonUtils.getPanel('gameplay/pet/ChooseSkillsBox', ChooseSkillsBox) as ChooseSkillsBox;
        panel.init(data);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    onDestroy() {
        EventDispatcher.off(Notify.PET_DATA_CHANGE, this.onPetDataChange);
    }

    onPetDataChange = async function (event) {
        await this.updatePage(event.detail.page, false);
    }.bind(this);

}
