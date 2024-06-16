import TalentItem from "./TalentItem";
import TalentStar from "./TalentStar";
import { PerkRing, Perk } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import { TipsManager } from "../../base/TipsManager";
import TalentNextText from "./TalentNextText";
import TalentSwitchTips from "./TalentSwitchTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import TalentSelectTips from "./TalentSelectTips";
import EarningBox from "../bag/effects/EarningBox";

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

export interface Talent {
    id: number;
    schoolId: number;
    constant: number;
    oneCoefficient: number;
    incrParam: string;
    position: number;
    talent: {
        description: string,
        oneCoefficient2: number,
        oneCoefficient1: number,
        name2: string,
        name1: string,
        nextLevel: string,
        constant1: number,
        constant2: number
    }[];
}

export interface TalentModel {
    id: number;
    positionStar1: number;
    positionStar2: number;
    positionStar3: number;
    positionStar4: number;
    positionStar5: number;
    positionStar6: number;
    positionStar7: number;
    positionStar8: number;
    positionStar9: number;
}

@ccclass
export default class TalentSkillPanel extends cc.Component {

    @property(TalentItem)
    talentItems: TalentItem[] = [];
    @property(cc.Node)
    titleBgs: cc.Node[] = [];
    @property(cc.Sprite)
    titleSprite: cc.Sprite = null;
    @property(cc.Sprite)
    titleSprite2: cc.Sprite = null;
    //中间内容的
    @property(cc.Label)
    effectLabel: cc.Label = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;

    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Button)
    nextBtn: cc.Button = null;

    @property(cc.Node)
    starBgs: cc.Node[] = [];
    @property(cc.Sprite)
    starSprite: cc.Sprite = null;
    @property(cc.Sprite)
    starSprite2: cc.Sprite = null;
    @property(TalentStar)
    talentStar: TalentStar = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    progressLabel: cc.Label = null;

    @property(cc.Label)
    currencyLabel: cc.Label = null;
	@property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Button)
    cultivateBtn: cc.Button = null;

    @property(TalentNextText)
    nextNode: TalentNextText = null;

    @property(cc.Button)
    helpBtn: cc.Button = null;

    @property(cc.Prefab)
    earningBox: cc.Prefab = null;
    @property(cc.Node)
    earningNode: cc.Node = null;

    myCurrency: number = 0;
	currencyPerCost: number = 1;

    perkRing: PerkRing = null;
    perks: Perk[] = [];

    talentConfigs: Talent[] = [];
    modelConfigs: TalentModel[] = [];
    attributesConfig = null;
    modelindex = 0;

    currentModel: TalentModel = null;

    currentLocation = 0;

    titleFrameNames = ['font_riyao', 'font_yueyao', 'font_huoyao', 'font_shuiyao', 'font_muyao', 'font_jinyao', 'font_tuyao', 'font_luohou', 'font_jidu'];

    selected = 0;

    start() {
        this.init();
        this.initEvents();
    }

    async init() {
        this.currentModel = {} as TalentModel;
        this.currentModel.positionStar1 = 0;
        this.currentModel.positionStar2 = 0;
        this.currentModel.positionStar3 = 0;
        this.currentModel.positionStar4 = 0;
        this.currentModel.positionStar5 = 0;
        this.currentModel.positionStar6 = 0;
        this.currentModel.positionStar7 = 0;
        this.currentModel.positionStar8 = 0;
        this.currentModel.positionStar9 = 0;
        this.attributesConfig = await ConfigUtils.getConfigJson('Attributes');
        let mconfig = (await ConfigUtils.getConfigJson('TalentTrainModel'));
        this.modelConfigs = [];
        for (let key in mconfig) {
            let value = mconfig[key];
            this.modelConfigs.push(value);
        }
        let tconfig = (await ConfigUtils.getConfigJson('Talent'));
        this.talentConfigs = [];
        for (let key in tconfig) {
            let value = tconfig[key] as Talent;
            if (value.schoolId == PlayerData.getInstance().schoolId) {
                this.talentConfigs.push(value);
            }
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/perk/ring/myself', []) as any;
        if (response.status === 0) {
            this.perkRing = response.content.perkRing;
        } else if (response.status === 404) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/perk/ring/create', []) as any;
            if (response.status === 0) {
                this.perkRing = response.content.perkRing;
            }
        }
        this.setCurrentModel();
        //检查 
        for (let i = 1; i < 10; i++) {
            if (this.perkRing['perkSelection_' + i] == 'NONE') {
                if ((this.currentModel['positionStar' + i]) >= 10) {
                    let panel = await CommonUtils.getPanel('gameplay/school/TalentSelectTips', TalentSelectTips) as TalentSelectTips;
                    await panel.init(i - 1, this.talentConfigs[i - 1], this);
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                    return;
                }
            }
        }
    }

    initEvents() {
        this.talentItems.forEach((ele, index) => {
            ele.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onItem.bind(this, index)));
        });
        this.switchBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSwitchBtn.bind(this)));
        this.nextBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onNextBtn.bind(this)));
        this.cultivateBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivateBtn.bind(this)));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 28));
    }

    async onItem(index: number) {
        this.talentItems.forEach((item, ind) => {
            if (ind == index) {
                item.toSelected();
            } else {
                item.celSelected();
            }
        });

        await this.setContent(index);
    }

    async onSwitchBtn() {
        let panel = await CommonUtils.getPanel('gameplay/school/TalentSwitchTips', TalentSwitchTips) as TalentSwitchTips;
        await panel.init(Math.floor(this.currentModel['positionStar' + (this.selected + 1)] / 10), this.selected, this.perkRing['perkSelection_' + (this.selected + 1)], this.talentConfigs[this.selected], this);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async onNextBtn() {
        if (this.perkRing['perkSelection_' + (this.selected + 1)] == 'YANG') {
            let data = this.talentConfigs[this.selected].talent[0];
            this.nextNode.show(Math.floor(this.currentModel['positionStar' + (this.selected + 1)] / 10) + 1, data.description);
        } else {
            let data = this.talentConfigs[this.selected].talent[1];
            this.nextNode.show(Math.floor(this.currentModel['positionStar' + (this.selected + 1)] / 10) + 1, data.description);
        }

    }

    async onCultivateBtn() {
        if (this.modelindex == this.modelConfigs.length) {
            TipsManager.showMsgFromConfig(1155);
            return;
        }
        if (this.myCurrency < this.currencyPerCost) {
            TipsManager.showMsgFromConfig(1153);
            return;
        }
        await this.onItem(this.currentLocation);

        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/perk/ring/myself/makeProgress`, [this.currencyPerCost]) as any;
        if (response.status === 0) {
            this.setCurrency();
            let newPerRing = response.content.perkRing;
            let earning = newPerRing.progress - this.perkRing.progress;
            this.addEarning(earning);
            this.perkRing = newPerRing;
            if (this.setProgress()) {
                let model: TalentModel = null;
                for (let config of this.modelConfigs) {
                    if (this.perkRing.progress >= config.id) {
                        model = config;
                    }
                }
                if (model.id != this.currentModel.id) {
                    
                    let rank = model['positionStar' + (this.currentLocation + 1)] - this.currentModel['positionStar' + (this.currentLocation + 1)];
                    for (let i = 1; i <= rank; i++) {
                        TipsManager.showMessage('培养成功，天赋星级+1！');
                        await this.talentStar.anim(this.currentModel['positionStar' + (this.currentLocation + 1)] % 10 + i);                        
                    }
                    PlayerData.getInstance().updateFc();
                    if ((this.currentModel['positionStar' + (this.currentLocation + rank)] % 10 + 1) == 10) {
                        TipsManager.showMessage('恭喜！天赋等级提升！');
                    }
                    if (this.perkRing['perkSelection_' + (this.currentLocation + 1)] == 'NONE') {
                        if ((this.currentModel['positionStar' + (this.currentLocation + rank)] % 10 + 1) == 10) {
                            let panel = await CommonUtils.getPanel('gameplay/school/TalentSelectTips', TalentSelectTips) as TalentSelectTips;
                            await panel.init(this.selected, this.talentConfigs[this.selected], this);
                            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                            await CommonUtils.wait(1);
                            return;
                        }
                    }
                }
                this.setCurrentModel();
            }
        }
    }

    async addEarning(earning: number) {
        let nodeEarn = cc.instantiate(this.earningBox);
        nodeEarn.parent = this.earningNode;
        let nodeComn = nodeEarn.getComponent(EarningBox);
        nodeComn.init(0.1, earning, false);
    }

    async setCurrency() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${168}`, []) as any;
        if (response.status === 0) {
            this.myCurrency = R.prop('amount', response.content);
        }
        if (this.myCurrency < this.currencyPerCost) {
            this.currencyLabel.node.color = cc.color(255, 26, 0);
        } else {
            this.currencyLabel.node.color = cc.color(6, 127, 40);
        }
        this.currencyLabel.string = this.myCurrency.toString();
    }

    async setCurrentModel() {
        this.modelindex = 0;
        for (let config of this.modelConfigs) {
            if (this.perkRing.progress >= config.id) {
                this.currentModel = config;
                this.modelindex += 1;
            }
        }

        this.talentItems.forEach((ele, index) => {
            ele.init(this.perkRing['perkSelection_' + (index + 1)], Math.floor(this.currentModel['positionStar' + (index + 1)] / 10));
        });

        await this.onTurn();

        let x = 3;
        switch (this.perkRing['perkSelection_' + (this.currentLocation + 1)]) {
            case 'NONE':
                x = 3;
                this.starBgs[0].active = true;
                this.starBgs[1].active = false;
                this.starBgs[2].active = false;
                break;
            case 'YIN':
                x = 1;
                this.starBgs[0].active = false;
                this.starBgs[1].active = true;
                this.starBgs[2].active = false;
                break;
            case 'YANG':
                x = 2;
                this.starBgs[0].active = false;
                this.starBgs[1].active = false;
                this.starBgs[2].active = true;
                break;
        }
        this.starSprite.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[this.currentLocation] + x);
        this.starSprite2.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', 'font_wei' + x);
        this.talentStar.show(this.currentModel['positionStar' + (this.currentLocation + 1)] % 10);

        this.onItem(this.currentLocation);
    }

    async setContent(select: number) {
        this.selected = select;
        let x = 3;
        switch (this.perkRing['perkSelection_' + (select + 1)]) {
            case 'NONE':
                x = 3;
                this.titleBgs[0].active = true;
                this.titleBgs[1].active = false;
                this.titleBgs[2].active = false;

                this.descriptionLabel.node.parent.active = false;
                this.effectLabel.node.color = new cc.Color(0, 1, 1);
                this.titleLabel.node.color = new cc.Color(0, 1, 1);
                break;
            case 'YIN':
                x = 1;
                this.titleBgs[0].active = false;
                this.titleBgs[1].active = true;
                this.titleBgs[2].active = false;

                this.descriptionLabel.node.parent.active = true;
                this.effectLabel.node.color = new cc.Color(5, 50, 92);
                this.titleLabel.node.color = new cc.Color(5, 50, 92);
                this.titleLabel.string = '太阴之力  效果';
                break;
            case 'YANG':
                x = 2;
                this.titleBgs[0].active = false;
                this.titleBgs[1].active = false;
                this.titleBgs[2].active = true;

                this.descriptionLabel.node.parent.active = true;
                this.effectLabel.node.color = new cc.Color(146, 48, 29);
                this.titleLabel.node.color = new cc.Color(146, 48, 29);
                this.titleLabel.string = '太阳之力  效果';
                break;
        }

        this.titleSprite.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', this.titleFrameNames[select] + x);
        this.titleSprite2.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/school/TalentSkillPanel', 'font_wei' + x);

        let effect = '';
        let level = this.currentModel['positionStar' + (select + 1)];
        let LV = Math.floor(level / 10);
        if (x != 3) {
            let type = 0;
            if (x == 2) {
                type = 0
            } else {
                type = 1;
            }

            let data = this.talentConfigs[select].talent[type];
            let description = data.description;
            this.descriptionLabel.string = CommonUtils.evalDescription(description, null, LV);
        }

        let aConfig = null;
        for (let key in this.attributesConfig) {
            let value = this.attributesConfig[key];
            if (R.prop('name', value) == this.talentConfigs[select].incrParam) {
                aConfig = value;
                break;
            }
        }
        let constant = CommonUtils.numMulti(this.talentConfigs[select].oneCoefficient, level) + this.talentConfigs[select].constant;
        if (R.prop('percentage', aConfig) == 1) {
            effect = this.talentConfigs[select].incrParam + "+" + CommonUtils.numMulti(constant, 100).toFixed(R.prop('decimal', aConfig)) + '%';
        } else {
            effect = this.talentConfigs[select].incrParam + "+" + Math.floor(constant);
        }
        this.effectLabel.string = CommonUtils.replaceAttributeName('等级 ' + LV + '    ' + effect);
		this.currencyPerCost = LV + 1;
		this.costLabel.string = '/' + this.currencyPerCost;
        this.setProgress();
		this.setCurrency();
    }

    setProgress() {
        let m1 = this.perkRing.progress - this.currentModel.id;
        let m2 = this.modelConfigs[this.modelindex].id - this.currentModel.id;
        this.progressBar.progress = m1 / m2;
        this.progressLabel.string = m1 + " / " + m2;
        return m1 >= m2;
    }

    async onTurn() {
        let location = 0;
        for (let i = 1; i < 10; i++) {
            if (i == 1) {
                if (this.currentModel['positionStar' + i] == 0 || this.currentModel['positionStar' + i] % 10 != 0) {
                    location = i - 1;
                    break;
                }
            } else {
                if (this.currentModel['positionStar' + (i - 1)] % 10 == 0 && this.currentModel['positionStar' + (i - 1)] > this.currentModel['positionStar' + i]) {
                    location = i - 1;
                    break;
                }
            }

        }
        let rotat = (location - this.currentLocation) * 40;
        //动画
        this.talentItems.forEach(async (item) => {
            item.toRotation(0.5, -rotat);
        });
        let actionBy = cc.rotateBy(0.5, rotat);
        this.talentItems[0].node.parent.runAction(actionBy);
        await CommonUtils.wait(0.5);
        this.currentLocation = location;
    }

    // update (dt) {}
}
