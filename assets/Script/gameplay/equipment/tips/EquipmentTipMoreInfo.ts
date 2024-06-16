import BagItem from "../../../bag/BagItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import { ItemQuality, EquipmentPart } from "../../../bag/ItemConfig";
import CommonPanel from "../../../base/CommonPanel";
import { Equipment } from "../../../net/Protocol";
import { EquipUtils } from "../utils/EquipmentUtils";


const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipmentTipMoreInfo extends CommonPanel {
    @property(cc.Label)
    typeLabel: cc.Label = null;

    // 基础属性
    @property(cc.Label)
    attr1Label: cc.Label = null;
    @property(cc.Label)
    attr1RangeLabel: cc.Label = null;
    @property(cc.Label)
    attr2Label: cc.Label = null;
    @property(cc.Label)
    attr2RangeLabel: cc.Label = null;
    @property(cc.Label)
    maxEnhanceLabel: cc.Label = null;
    @property(cc.Label)
    maxEnhanceRangeLabel: cc.Label = null;

    // 特效
    @property([cc.Label])
    skillLabelArr: Array<cc.Label> = [];
    @property([cc.Label])
    skillDesLabelArr: Array<cc.Label> = [];

    // 翻页
    @property(cc.Node)
    buttonNode: cc.Node = null;
    @property(cc.Button)
    prevBtn: cc.Button = null;
    @property(cc.Button)
    nextBtn: cc.Button = null;
    @property(cc.Label)
    pageLabel: cc.Label = null;

    // 分割线
    @property(cc.Node)
    splitNode1: cc.Node = null;

    // creatorname
    @property(cc.Label)
    creatorName: cc.Label = null;

    // 技能描述
    @property(cc.Label)
    skillEnhanceDescLabel: cc.Label = null;
    @property(cc.Label)
    lockedLabel: cc.Label = null;

    @property(cc.Node)
    splitNode2: cc.Node = null;

    start () {
        this.prevBtn.node.on(cc.Node.EventType.TOUCH_END, this.prevBtnOnClick.bind(this));
        this.nextBtn.node.on(cc.Node.EventType.TOUCH_END, this.nextBtnOnClick.bind(this));
    }

    init(bagItem: BagItem) {
        this.initState(bagItem);
        this.initBase(bagItem);
    }

    initBase(bagItem: BagItem) {
        let itemDisplay = bagItem.getItemDisplay();
        let equipmentPrototype = bagItem.getPrototype();
        if (!itemDisplay.isValid() || !equipmentPrototype.isValid()) {
            return;
        }
        let display = itemDisplay.getValue();
        let prototype = equipmentPrototype.getValue();

        this.typeLabel.string = '类型 ' + this.getNameByPart(prototype.part)

        // 基础属性
        this.attr1Label.string = 
            R.path(['baseParameters', 0, 'name'], bagItem.data).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + '+' + R.path(['baseParameters', 0, 'value'], bagItem.data);
        this.attr2Label.string = 
            R.path(['baseParameters', 1, 'name'], bagItem.data).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + '+' + R.path(['baseParameters', 1, 'value'], bagItem.data);
        this.attr1RangeLabel.string = prototype.attr1.min + '~' + prototype.attr1.max;
        this.attr2RangeLabel.string = prototype.attr2.min + '~' + prototype.attr2.max;
        this.maxEnhanceLabel.string = '最大强化等级 ' + R.prop('maxEnhanceLevel', bagItem.data);
        this.maxEnhanceRangeLabel.string = this.getRange(prototype.quality);

        // 技能强化
        let enhanceId = this._data.value.enhanceId;
        if (!enhanceId) {
            CommonUtils.safeRemove(this.skillEnhanceDescLabel.node);
            CommonUtils.safeRemove(this.splitNode2);
        } else {
            let config = EquipUtils.getEnhanceSkill(enhanceId);
            this.skillEnhanceDescLabel.string = `${config.description}`;
        }

        // 打造者
        this.creatorName.string = R.path(['data', 'creatorName'], bagItem);

        let equipment = bagItem.data as Equipment;
        if (equipment.nextWithdrawTime != null
            && R.prop('nextWithdrawTime', equipment) > CommonUtils.getServerTime()) {
            let t =  CommonUtils.getTimeInfo(R.prop('nextWithdrawTime', equipment));
            this.lockedLabel.string = `${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}前不能流通`;
            this.lockedLabel.node.active = true;
        } else {
            this.lockedLabel.node.active = false;
        }
    }

    refreshState () {
        this.initSpSkills();
        super.refreshState();
    }

    initSpSkills () {
        let data = this._data.value;
        let spSkillIds = data.spSkillIds;
        let pageNum = Math.max(1, data.pageNum);
        let page = this._state.value;
        this.pageLabel.string = `${page}/${pageNum}`;
        let skillIds = R.slice((page - 1) * 3, page * 3, spSkillIds);
        R.concat(skillIds, R.repeat(null, 3 - skillIds.length)).forEach((id, index) => {
            this.initSkill(id, index);
        });
    }

    initSkill(skillId: number, index: number) {
        this.skillLabelArr[index].node.active = skillId != undefined;
        this.skillDesLabelArr[index].node.active = skillId != undefined;
        if (!skillId) {
            return;
        }
        let config = EquipUtils.getSpSkill(skillId);
        this.skillDesLabelArr[index].string = config.description;
        this.skillLabelArr[index].string = config.name;
        this.skillLabelArr[index].node.color = cc.Color.fromHEX(this.skillLabelArr[index].node.color, "#4EEF00")
        // this.skillLabelArr[index].node.color = cc.hexToColor('#4EFF00');
    }

    initState(bagItem: BagItem) {
        let equipment = bagItem.data as Equipment;
        let effectIds = equipment.effectsText.split(',').map(x => parseInt(x));
        let spSkillIds = effectIds.filter(x => x >= 600);
        let enhanceId = R.find(x => x < 600, effectIds);
        this._state.value = 1;
        this._data.value = {
            enhanceId: enhanceId,
            spSkillIds: spSkillIds,
            pageNum: Math.ceil(spSkillIds.length / 3),
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

    getNameByPart(part: EquipmentPart) {
        let name = '武器';
        switch (part) {
            case EquipmentPart.Weapon: { name = '武器'; break; }
            case EquipmentPart.Head: { name = '帽子'; break; }
            case EquipmentPart.Necklace: { name = '项链'; break; }
            case EquipmentPart.Belt: { name = '腰带'; break; }
            case EquipmentPart.Shoes: { name = '鞋子'; break; }
            case EquipmentPart.Clothes: { name = '衣服'; break; }
        }
        return name;
    }

}
