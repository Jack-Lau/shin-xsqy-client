import Optional from "../../../cocosExtend/Optional";
import { PetDetail, Pet } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import PagingControl from "../../../base/PagingControl";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { TipsManager } from "../../../base/TipsManager";
import PetAttributeModelling from "./PetAttributeModelling";
import PassiveItem from "./PassiveItem";
import PetRadarMap from "./PetRadarMap";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { ItemQuality, PetQuality } from "../../../bag/ItemConfig";
import ItemFrame from "../../../base/ItemFrame";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import ChooseSkillsBox from "../skill/ChooseSkillsBox";
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

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetAttributePanel extends cc.Component {
    @property(cc.Node)
    shuxingBtn: cc.Node = null;
    @property(cc.Node)
    ziziBtn: cc.Node = null;
    @property(cc.Sprite)
    chuzhanicon: cc.Sprite = null;
    @property(cc.Sprite)
    xiuxiicon: cc.Sprite = null;
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
    @property(PetRadarMap)
    petRadarMap: PetRadarMap = null;

    //attributeList
    @property(cc.Node)
    attributeList: cc.Node = null;
    @property(cc.Label)
    tuijiandu: cc.Label = null;
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
    wufZZTip: cc.Node = null;
    @property(cc.Node)
    fafZZTip: cc.Node = null;
    @property(cc.Node)
    hpZZTip: cc.Node = null;
    @property(cc.Node)
    atkZZTip: cc.Node = null;
    @property(cc.Node)
    sudZZTip: cc.Node = null;
    @property(cc.Node)
    tuiJTip: cc.Node = null;
	
    isMagic: boolean = false;

    passiveGroup: Array<PassiveItem> = [];

    pageData: Array<Optional<PetDetail>> = [];

    isToPlay: boolean = true;

    selected: number = 0;

    isShowAttributeList: boolean = true;
    battlePets: Array<number> = [0, 0, 0];

    from: PetPanel = null;
    isRuning = false;

    onLoad() {
        this.passiveGroup = this.node.getComponentsInChildren(PassiveItem);
    }
    start() {
        this.isHasSillSelect();
        this.initEvents();
    }

    init(currentPage = 1, selected = 0) {
        if (PetData.getPetMaxPage() == 0) {
            TipsManager.showMessage('没有获得宠物');
            return;
        }
        this.selected = selected;

        this.page.init(PetData.getPetMaxPage(), this.updatePage.bind(this), currentPage);
        this.updatePage(currentPage, false);
        this.petRadarMap.node.active = false;
        this.attributeList.active = true;
        this.isShowAttributeList = false;
        this.ziziBtn.active = true;
        this.shuxingBtn.active = false;


    }
    initEvents() {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.updateSelected.bind(this, index));
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 8));
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
        this.tuiJTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 50));
        this.atkZZTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 51));
        this.hpZZTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 52));
        this.fafZZTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 53));
        this.sudZZTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 54));
        this.wufZZTip.on(cc.Node.EventType.TOUCH_END, this.showTextTips.bind(this, 55));
    }

    async showTextTips(id: number) {
        let config = await ConfigUtils.getConfigJson("AttributesShow");
        TipsManager.showMessage(config[id].description);
    }

    async onIsToPlay() {
        if (this.isToPlay) {
            this.setBattlePets(this.pageData[this.selected].getValue().pet.id);
        } else {
            if (this.selected == 0) {
                this.battlePets[0] = this.battlePets[1];
                this.battlePets[1] = this.battlePets[2];
                this.battlePets[2] = 0;
            } else if (this.selected == 1) {
                this.battlePets[0] = this.battlePets[0];
                this.battlePets[1] = this.battlePets[2];
                this.battlePets[2] = 0;
            } else if (this.selected == 2) {
                this.battlePets[2] = 0;
            }
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/modifyBattleList', [this.battlePets.filter(x => x != 0).join(',')]) as any;
        if (response.status === 0) {
            PlayerData.getInstance().battlePetId1 = new Optional<number>(this.battlePets[0] == 0 ? null : this.battlePets[0]);
            PlayerData.getInstance().battlePetId2 = new Optional<number>(this.battlePets[1] == 0 ? null : this.battlePets[1]);
            PlayerData.getInstance().battlePetId3 = new Optional<number>(this.battlePets[2] == 0 ? null : this.battlePets[2]);
            if (this.isToPlay) {
                TipsManager.showMessage('出战成功');
            } else {
                TipsManager.showMessage('休息成功');
            }
            PlayerData.getInstance().updateFc();
            await PetData.updatePetIds();
            this.updatePage(1);

        }
    }

    setBattlePets(id: number) {
        if (this.battlePets.indexOf(id) != -1) {
            return;
        }
        this.battlePets = R.take(3, R.prepend(id, this.battlePets));
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
                }else{
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
        this.petModelling.setData(petDetail, this);
        this.setAttributeList(petDetail);
        this.petRadarMap.init(petDetail);

        let petconfig = (await PetData.getConfigById(petDetail.pet.definitionId));
        let maxSkillNum = petconfig.isValid() ? petconfig.getValue().maxSkillNum : 0;

        let abilities = petDetail.pet.abilities;
        this.passiveGroup.forEach((passive, index) => {
            passive.toNull();
            if (index < maxSkillNum) {
                if (petDetail.pet.maxRank >= 4 && index == maxSkillNum - 1 && petDetail.pet.rank < 4) {
                    passive.toUnknown();
                }
                if (index < abilities.length) {
                    passive.toSkill(abilities[index]);
                }
            } else {
                passive.tolock();
            }
        });

        if (this.isBattle(petDetail.pet.id)) {
            this.isToPlay = false;
            this.chuzhanicon.node.active = false;
            this.xiuxiicon.node.active = true;
        } else {
            this.isToPlay = true;
            this.chuzhanicon.node.active = true;
            this.xiuxiicon.node.active = false;
        }
    }

    async setAttributeList(petDetail: PetDetail) {
        let pet = petDetail.pet;
        this.tuijiandu.string = `推荐度  ${pet.sortingIndex}`;
        let mData = await PetData.getAttributes(petDetail);
        this.qixue.string = Math.floor(mData.hp).toString();
        let config = await PetData.getConfigById(pet.definitionId);
        this.isMagic = config.isValid() ? config.getValue().isMagic : false;
        if (this.isMagic) {
            this.atkName.string = '内 伤';
        } else {
            this.atkName.string = '外 伤';
        }
        this.atk.string = Math.floor(mData.atk).toString();;
        this.wufang.string = Math.floor(mData.pDef).toString();;
        this.fafang.string = Math.floor(mData.mDef).toString();;
        this.sudu.string = Math.floor(mData.spd).toString();;
    }

    switchSpecific() {
        if (this.isShowAttributeList) {
            this.petRadarMap.node.active = false;
            this.attributeList.active = true;
            this.isShowAttributeList = false;
            this.ziziBtn.active = true;
            this.shuxingBtn.active = false;
        } else {
            this.attributeList.active = false;
            this.petRadarMap.node.active = true;
            this.isShowAttributeList = true;
            this.ziziBtn.active = false;
            this.shuxingBtn.active = true;
        }
    }

    // update (dt) {}
    onDestroy() {
        EventDispatcher.off(Notify.PET_DATA_CHANGE, this.onPetDataChange);
    }

    onPetDataChange = async function (event) {
        await this.updatePage(event.detail.page, false);

    }.bind(this);


    async isHasSillSelect() {
        let datas: Array<number> = [];
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewMineHasCandidateAbilitiesIds', []) as any;
        if (response.status === 0) {
            let allPetIds = PetData.getAllPetIds();
            datas = response.content.filter(x => allPetIds.indexOf(x) != -1);
            let pets: Array<PetDetail> = await PetData.requestPetInfo(datas);
            pets.forEach(async (pet) => {
                if (pet.pet.candidateAbilities.length > 0) {
                    await this.showSillSelect(pet);
                    let index = allPetIds.indexOf(pet.pet.id);
                    this.selected = index % 4;
                    let page = Math.ceil((index + 1) / 4);
                    this.page.switchPage(page);
                    this.init(page, this.selected);
                }
            });
        }
    }

    async showSillSelect(data: PetDetail) {
        let panel = await CommonUtils.getPanel('gameplay/pet/ChooseSkillsBox', ChooseSkillsBox) as ChooseSkillsBox;
        panel.init(data);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }


}
