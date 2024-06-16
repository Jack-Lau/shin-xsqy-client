import { SimpleBehaviorSubject } from "./SimpleBehaviorSubject"

const ROBOT_MC_VISIBLE = "robot_mc_visible"

let robotMcVisible = cc.sys.localStorage.getItem(ROBOT_MC_VISIBLE) ?? 'true'

export const Setting = {
  music: new SimpleBehaviorSubject(false),
  robotMcVisible: new SimpleBehaviorSubject('true' === robotMcVisible)
}

Setting.robotMcVisible.subscribe(visible => {
  cc.sys.localStorage.setItem(ROBOT_MC_VISIBLE, visible)
})