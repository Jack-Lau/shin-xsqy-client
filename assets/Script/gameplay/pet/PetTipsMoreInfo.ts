import CommonPanel from "../../base/CommonPanel";
import { PetDetail } from "../../net/Protocol";
import { PetData, PetConfigItem, PetSkillConfigItem } from "./PetData";
import { CommonUtils } from "../../utils/CommonUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetTipsMoreInfo extends CommonPanel {
    //
    @property(cc.Label)
    serialLabel: cc.Label = null;
    @property(cc.Node)
    serialNode: cc.Node = null;
    // 资质
    @property(cc.Label)
    lifeLabel: cc.Label = null;
    @property(cc.Label)
    lifeRangeLabel: cc.Label = null;
    @property(cc.Label)
    atkLabel: cc.Label = null;
    @property(cc.Label)
    atkRangeLabel: cc.Label = null;
    @property(cc.Label)
    pDefLabel: cc.Label = null;
    @property(cc.Label)
    pDefRangeLabel: cc.Label = null;
    @property(cc.Label)
    mDefLabel: cc.Label = null;
    @property(cc.Label)
    mDefRangeLabel: cc.Label = null;
    @property(cc.Label)
    spdLabel: cc.Label = null;
    @property(cc.Label)
    spdRangeLabel: cc.Label = null;

    @property(cc.Label)
    cxMaxLabel: cc.Label = null;
    @property(cc.Label)
    cxMaxRangeLabel: cc.Label = null;

    // skills
    @property([cc.Label])
    skillLabelArr: Array<cc.Label> = [];
    @property([cc.Label])
    skillDesLabelArr: Array<cc.Label> = [];
    
    @property(cc.Label)
    pageLabel: cc.Label = null;

    @property(cc.Label)
    lockedLabel: cc.Label = null;

    // button
    @property(cc.Button)
    prevBtn: cc.Button = null;
    @property(cc.Button)
    nextBtn: cc.Button = null;

    start() {
        this.prevBtn.node.on(cc.Node.EventType.TOUCH_END, this.prevBtnOnClick.bind(this));
        this.nextBtn.node.on(cc.Node.EventType.TOUCH_END, this.nextBtnOnClick.bind(this));
    }

    async init(petDetail: PetDetail) {
        let config = await PetData.getConfigById(petDetail.pet.definitionId);
        this._state.value = 1;
        if (config.valid) {
            this._data.value = {
                petDetail: petDetail,
                config: config.val,
                pageNum: Math.ceil((petDetail.pet.abilities.length + 1) / 3)
            }
        }
    }

    prevBtnOnClick() {
        let pageNum = this._data.value.pageNum;
        let state = this._state.value;
        if (state <= 1) {
            state = pageNum;
        } else {
            state -= 1;
        }
        this._state.value = state;
    }

    nextBtnOnClick() {
        let pageNum = this._data.value.pageNum;
        let state = this._state.value;
        if (state >= pageNum) {
            state = 1;
        } else {
            state += 1;
        }
        this._state.value = state;
    }

    refreshData() {
        this.initAptitude();
        this.initSkills();
        this.initLockLabel();
        super.refreshData();
    }
    
    refreshState() {
        this.initSkills();
        super.refreshState();
    }

    initLockLabel () {
        let petDetail = R.prop('petDetail', this._data.value);
        if (petDetail.pet.nextWithdrawTime != null
            && petDetail.pet.nextWithdrawTime > CommonUtils.getServerTime()) {
            let t =  CommonUtils.getTimeInfo(petDetail.pet.nextWithdrawTime);
            this.lockedLabel.string = `${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}前不能流通`;
            this.lockedLabel.node.active = true;
        } else {
            this.lockedLabel.node.active = false;
        }
    }

    initAptitude() {
        let petDetail = R.prop('petDetail', this._data.value);
        let config = R.prop('config', this._data.value);
        if (petDetail.pet.number) {
            this.serialLabel.string = '专属编号 ' + petDetail.pet.number;
        } else {
            CommonUtils.safeRemove(this.serialNode);
        }
        this.initLifeLabel(petDetail, config);
        this.initAtkLabel(petDetail, config);
        this.initPDefLabel(petDetail, config);
        this.initMDefLabel(petDetail, config);
        this.initSpdLabel(petDetail, config);
        this.initChongxing(petDetail, config);
    }


    initLifeLabel(petDetail: PetDetail, config: PetConfigItem) {
        this.lifeLabel.string = '气血资质 ' + petDetail.pet.aptitudeHp;
        this.lifeRangeLabel.string = R.path(['lifeApt', 'min'], config) + '~' + R.path(['lifeApt', 'max'], config); 
    } 

    initAtkLabel(petDetail: PetDetail, config: PetConfigItem) {
        let isMagic = R.prop('isMagic', config);
        this.atkLabel.string = (isMagic ? '内伤' : '外伤') + '资质 ' + petDetail.pet.aptitudeAtk;
        this.atkRangeLabel.string = R.path(['atkApt', 'min'], config) + '~' + R.path(['atkApt', 'max'], config); 
    }

    initPDefLabel(petDetail: PetDetail, config: PetConfigItem) {
        this.pDefLabel.string = '外防资质 ' + petDetail.pet.aptitudePdef;
        this.pDefRangeLabel.string = R.path(['mDefApt', 'min'], config) + '~' + R.path(['mDefApt', 'max'], config); 
    }

    initMDefLabel(petDetail: PetDetail, config: PetConfigItem) {
        this.mDefLabel.string = '内防资质 ' + petDetail.pet.aptitudeMdef;
        this.mDefRangeLabel.string = R.path(['mDefApt', 'min'], config) + '~' + R.path(['mDefApt', 'max'], config); 
    }

    initSpdLabel(petDetail: PetDetail, config: PetConfigItem) {
        this.spdLabel.string = '速度资质 ' + petDetail.pet.aptitudeSpd;
        this.spdRangeLabel.string = R.path(['spdApt', 'min'], config) + '~' + R.path(['spdApt', 'max'], config); 
    }

    initChongxing(petDetail: PetDetail, config: PetConfigItem) {
        this.cxMaxLabel.string = '冲星上限 ' + petDetail.pet.maxRank;
        this.cxMaxRangeLabel.string = R.path(['star', 'min'], config) + '~' + R.path(['star', 'max'], config); 
    }

    initSkills() {
        let petDetail = R.prop('petDetail', this._data.value);
        let pageNum = R.prop('pageNum', this._data.value);
        let config = R.prop('config', this._data.value);
        let page = this._state.value;
        this.pageLabel.string = `${page}/${pageNum}`;
        let skills = petDetail.pet.abilities;
        let activeSkillId = (petDetail.pet.rank >= 10) ? config.activeSkill.snd : config.activeSkill.fst;
        let skillIds = R.slice((page - 1) * 3, page * 3, R.prepend(activeSkillId, skills));
        R.concat(skillIds, R.repeat(null, 3 - skillIds.length)).forEach((id, index) => {
            this.initSkill(id, index);
        });
    }

    async initSkill(skillId: number, index: number) {
        this.skillLabelArr[index].node.active = skillId != undefined;
        this.skillDesLabelArr[index].node.active = skillId != undefined;
        if (!skillId) {
            return;
        }
        let config = await PetData.getPetSkillInfoById(skillId);
        if (!config.valid) return;
            
        this.skillDesLabelArr[index].string = config.val.description;
        this.skillLabelArr[index].string = config.val.name;

        this.skillLabelArr[index].node.color = cc.Color.fromHEX(this.skillLabelArr[index].node.color, config.val.isActive ? '#FFE267' : '#4EFF00')
        // this.skillLabelArr[index].node.color = cc.hexToColor(config.val.isActive ? '#FFE267' : '#4EFF00');
    }
}