import { ResUtils } from "../utils/ResUtils";
import { skillFonts } from "./BattleConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillItem extends cc.Component{
  @property(cc.Sprite)
  activeBg: cc.Sprite;

  @property(cc.Sprite)
  inactiveBg: cc.Sprite;

  @property(cc.Sprite)
  skillNameSp: cc.Sprite;

  @property(cc.Sprite)
  skillIconSp: cc.Sprite;

  skillId!: number;

  active: boolean = false;

  init(skillId: number) {
    this.skillId = skillId
    ResUtils.loadSprite(`ui/revive/battle/${skillFonts[skillId] ?? skillFonts[100101]}`).then(sp => {
      this.skillNameSp.spriteFrame = sp
    })
    ResUtils.loadSpriteFromAltas(`ui/icon/school_skill_icon`, String(skillId - 1)).then(sp => {
      this.skillIconSp.spriteFrame = sp;
    })
  }

  setActive(status: boolean) {
    this.active = status
    this.activeBg.node.active = this.active
    this.inactiveBg.node.active = !this.active
  }
  
}