import { CommonUtils } from "../../utils/CommonUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelUpNotification extends cc.Component {
  static ListenLevels = [20, 30, 35, 40, 45, 50, 60, 70]
  @property(cc.Node)
  level20: cc.Node
  @property(cc.Node)
  level30: cc.Node
  @property(cc.Node)
  level35: cc.Node
  @property(cc.Node)
  level40: cc.Node
  @property(cc.Node)
  level45: cc.Node
  @property(cc.Node)
  level50: cc.Node
  @property(cc.Node)
  level60: cc.Node
  @property(cc.Node)
  level70: cc.Node

  @property(cc.Sprite)
  bgLighting: cc.Sprite;

  @property(cc.Button)
  fourCloseBtn: cc.Button
  @property(cc.Button)
  otherCloseBtn: cc.Button 
  @property(cc.Node)
  bgNode: cc.Node;

  levelUpNodes: cc.Node[] = []

  start () {
    this.levelUpNodes = [
      this.level20,
      this.level30,
      this.level35,
      this.level40,
      this.level45,
      this.level50,
      this.level60,
      this.level70,
    ]
    const action = cc.repeatForever(cc.rotateTo(0.5, 360))
    this.bgLighting.node.runAction(action)
    this.bgNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick)
    this.fourCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    this.otherCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
  }

  init(level: number) {
    this.levelUpNodes.forEach(node => node.active = false)
    this.fourCloseBtn.node.active = level === 50
    this.otherCloseBtn.node.active = level !== 50
    switch (level) {
      case 20: {
        this.level20.active = true
        break
      }
      case 30: {
        this.level30.active = true
        break
      }
      case 35: {
        this.level35.active = true
        break
      }
      case 40: {
        this.level40.active = true
        break
      }
      case 45: {
        this.level45.active = true
        break
      }
      case 50: {
        this.level50.active = true
        break
      }
      case 60: {
        this.level60.active = true
        break
      }
      case 70: {
        this.level70.active = true
        break
      }
    }
  }

  closePanel() {
    CommonUtils.safeRemove(this.node);
  }
}