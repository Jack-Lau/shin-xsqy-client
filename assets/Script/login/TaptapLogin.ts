import { loginWithTaptap } from "../utils/NativeUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaptapLogin extends cc.Component {
    // 氪星球登录
    @property(cc.Button)
    loginBtn: cc.Button = null;


    start() {
      this.loginBtn.node.on(cc.Node.EventType.TOUCH_END, loginWithTaptap);
    }
}
