import CommonPanel from "../../base/CommonPanel";
import { NetUtils } from "../../net/NetUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { SchoolRecord } from "../../net/Protocol";
import GainSpSkill from "./GainSpSkill";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const { ccclass, property } = cc._decorator;

/**
 * 一个panel所需做的是：
 * 1. 定义自己可能会有的状态 （SKILL_n... TALENT_PAGE_n, TALENT_n)， 一个tuple
 * 2. 用事件定义出状态的变化
 * 3. 有一个可以根据当前状态刷新的接口
 * 4. 对于不依据状态变化，根据数据变化的属性，能够通过dataOnChange更新
 */
@ccclass
export default class SchoolSkillPanel extends CommonPanel {
  @property(cc.Button)
  closeBtn: cc.Button = null;
  @property(cc.Button)
  upgradeBtn: cc.Button = null;
  @property(cc.Button)
  upgradeAllBtn: cc.Button = null;
  @property(cc.Label)
  costLabel: cc.Label = null;
  @property(cc.Label)
  ownLabel: cc.Label = null;

  @property(cc.Label)
  nameAndLevel: cc.Label = null;
  @property(cc.Label)
  descLabel0: cc.Label = null;
  @property(cc.Label)
  descLabel1: cc.Label = null;
  @property(cc.Label)
  descLabel2: cc.Label = null;
  @property(cc.Label)
  descLabel3: cc.Label = null;

  @property([cc.Sprite])
  selectedSprites: Array<cc.Sprite> = [];
  @property([cc.Label])
  skillNameLabels: Array<cc.Label> = [];
  @property([cc.Sprite])
  skillIconSprites: Array<cc.Sprite> = [];
  @property([cc.Label])
  skillLevelLabels: Array<cc.Label> = [];

  @property(cc.SpriteAtlas)
  altas: cc.SpriteAtlas = null;

  readonly spSkillIds = [101400, 102200, 103100, 104700];

  readonly INIT_STATE = 0;
  skillConfig = null;
  schoolConfig = null;
  skillCostConfig = null;

  abProp(x) { return R.prop('ablitiesLevelList', x); }
  desc0Prop(x) { return R.prop('commonDescription', x); }
  desc1Prop(x) { return R.prop('activeDescription', x); }
  desc2Prop(x) { return R.prop('passiveDescription', x); }
  desc3Prop(x) { return R.prop('consume', x); }
  nameProp(x) { return R.prop('name', x); }
  costProp(x) { return R.prop(x, this.skillCostConfig); };
  extraLevelLimitProp(x) { return R.prop('extra_ability_level_limit', x); }

  @property(cc.Sprite)
  titleSp: cc.Sprite = null;
  @property(cc.SpriteFrame)
  titleSpfs: cc.SpriteFrame[] = [];

  @property(cc.Button)
  helpBtn: cc.Button = null;
  @property(cc.Node)
  schoolNode: cc.Node = null;
  @property(cc.Node)
  talentNode: cc.Node = null;
  @property(cc.Node)
  emptyNode: cc.Node = null;
  @property(cc.Node)
  cultivationNode: cc.Node = null;
  @property(cc.Toggle)
  toggles: cc.Toggle[] = [];

  async start() {
    this.talentNode.active = false;
    await this.init();
  }

  // init data & state
  async init() {
    this.initEvents()
    this.skillConfig = await ConfigUtils.getConfigJson('SchoolAbilityInformation');
    this.schoolConfig = await ConfigUtils.getConfigJson('SchoolInformation');
    this.skillCostConfig = await ConfigUtils.getConfigJson('SchoolAbilityConsumption');
    this.setState(this.INIT_STATE); // 设置初始状态
    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/school/view/myself', []) as any;
    if (response.status === 0) {
      this.initData(response.content);
    }
  }

  initEvents() {
    this.skillIconSprites.forEach((ele, index) => {
      ele.node.on(cc.Node.EventType.TOUCH_END, this.skillOnClick(index));
    });
    this.upgradeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.learnOnce.bind(this)));
    this.upgradeAllBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.learnAll.bind(this)));
    this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 28));
  }

  // state change
  skillOnClick(state) {
    return function () {
      this.setState(state);
    }.bind(this);
  }

  // data change
  async learnOnce() {
    if (PlayerData.getInstance().playerLevel + this.extraLevelLimitProp(this._data.value) <= this.getSkillLevelByState(this._state.value)) {
      TipsManager.showMessage("门派技能等级不可超过人物等级，快努力升级吧");
      return;
    }
    let index = this._state.value;
    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/school/levelup', [index]) as any;
    if (response.status === 0) {
      let result = response.content as SchoolRecord;
      let skillId = this.getSkillIdByState(index);
      if (R.contains(skillId, this.spSkillIds)) {
        let beforeLevel = R.path(['ablitiesLevelList', index], this._data.value);
        let afterLevel = R.path(['ablitiesLevelList', index], result);
        if (beforeLevel < 30 && afterLevel >= 30) {
          this.showGainSpSkill(skillId);
        }
      }
      this.initData(result);
      let name = this.nameProp(R.prop(this.getSkillIdByState(index), this.skillConfig));
      let level = this.getSkillLevelByState(index);
      TipsManager.showMessage(`学习门派技能成功，${name}提升至了${level}级！`)
      PlayerData.getInstance().updateFc();
    }
    await CommonUtils.wait(1.5);
  }

  async learnAll() {
    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/school/levelupAMAP', []) as any;
    if (response.status === 0) {
      let result = response.content as SchoolRecord;
      R.range(0, 7).forEach(index => {
        let skillId = this.getSkillIdByState(index);
        if (R.contains(skillId, this.spSkillIds)) {
          let beforeLevel = R.path(['ablitiesLevelList', index], this._data.value);
          let afterLevel = R.path(['ablitiesLevelList', index], result);
          if (beforeLevel < 30 && afterLevel >= 30) {
            this.showGainSpSkill(skillId);
          }
        }
      });
      this.initData(response.content);
      TipsManager.showMessage('一键学习全部门派技能成功');
      PlayerData.getInstance().updateFc();
    }
    await CommonUtils.wait(1.5);
  }

  async showGainSpSkill(skillId: number) {
    let panel = await CommonUtils.getPanel('gameplay/school/gainSpSkill', GainSpSkill) as GainSpSkill;
    panel.init(skillId);
    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
  }

  /**
   * update all data refers to state
   */
  refreshState() {
    let state = this._state.value;
    // 更新选中
    this.selectedSprites.forEach((ele, index) => {
      ele.node.active = state === index;
    });
    // 更新描述
    let skillId = this.getSkillIdByState(state);
    let skillInfo = R.prop(skillId, this.skillConfig);
    let skillLevel = this.getSkillLevelByState(state);
    this.nameAndLevel.string = this.nameProp(skillInfo) + ' ' + skillLevel + '级';
    this.descLabel0.string = this.desc0Prop(skillInfo);
    this.descLabel1.string = CommonUtils.evalDescription(this.desc1Prop(skillInfo), 0, skillLevel);
    this.descLabel2.string = CommonUtils.evalDescription(this.desc2Prop(skillInfo), 0, skillLevel);
    this.descLabel3.string = this.desc3Prop(skillInfo);
    this.costLabel.string = R.prop('contribution', this.costProp(this.getSkillLevelByState(this._state.value)));

    super.refreshState();
  }

  async refreshData() {
    this.skillIconSprites.forEach((ele, index) => {
      ele.spriteFrame = this.altas.getSpriteFrame(this.getSkillIdByState(index));
    });
    this.skillLevelLabels.forEach((ele, index) => {
      ele.string = this.getSkillLevelByState(index).toString();
    });
    this.skillNameLabels.forEach((ele, index) => {
      let skillId = this.getSkillIdByState(index);
      let skillInfo = R.prop(skillId, this.skillConfig);
      ele.string = this.nameProp(skillInfo);
    });
	//
	let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${196}`, []) as any;
	if (response.status === 0) {
		this.ownLabel.string = R.prop('amount', response.content).toString();
	}
    this.costLabel.string = R.prop('contribution', this.costProp(this.getSkillLevelByState(this._state.value)));
	//
    super.refreshData();
  }

  getSkillIdByState(state) {
    return R.path([PlayerData.getInstance().schoolId, 'ability', state, 'abilityId'], this.schoolConfig);
  }

  getSkillLevelByState(state) {
    return R.prop(state, this.abProp(this._data.value));
  }

  onToggle(tle, index = '') {
    let indexNumber = parseInt(index)
    this.titleSp.spriteFrame = this.titleSpfs[indexNumber];
    this.toggles.forEach((elm, idx) => elm.isChecked = indexNumber === idx)
    const playLevelGq60 = PlayerData.getInstance().playerLevel >= 60
    this.talentNode.active = indexNumber === 1 && playLevelGq60
    this.emptyNode.active = indexNumber === 1 && !playLevelGq60
    this.schoolNode.active = indexNumber === 0
    this.cultivationNode.active = indexNumber === 2
  }

  closePanel() {
    CommonUtils.safeRemove(this.node);
  }
}
