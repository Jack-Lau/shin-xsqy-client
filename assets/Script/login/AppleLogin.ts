import { loginWithTaptap, signinWithApple } from "../utils/NativeUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AppleLogin extends cc.Component {
    @property(cc.Button)
    taptapLoginBtn: cc.Button = null
    @property(cc.Button)
    appleLoginBtn: cc.Button = null

    start() {
      this.taptapLoginBtn.node.on(cc.Node.EventType.TOUCH_END, loginWithTaptap)
      this.appleLoginBtn.node.on(cc.Node.EventType.TOUCH_END, signinWithApple)
    }
}
