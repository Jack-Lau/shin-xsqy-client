import { CommonUtils } from "../../../utils/CommonUtils";
import GodBeastPanel from "./GodBeastPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GodBeastTrainPanel extends cc.Component {
  @property(cc.Button)
  closeButton: cc.Button = null
  @property(GodBeastPanel)
  raw: GodBeastPanel = null

  start() {
    this.closeButton.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this))
    this.raw.from = this;
  }

  closePanel() {
    CommonUtils.safeRemove(this.node)
  }

}