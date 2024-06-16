import { openBrowser } from "../utils/NativeUtils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UpdateNotify extends cc.Component {
	@property(cc.Label)
	latestVersion: cc.Label = null;
	@property(cc.Button)
	updateBtn: cc.Button = null;

	start() {
		this.initEvents();
	}

	private initEvents() {
		this.updateBtn.node.on(cc.Node.EventType.TOUCH_END, this.goUpdate.bind(this))
	}

	public init(version: string) {
		this.latestVersion.string = `最新版本号  ${version}`
	}

	private goUpdate() {
		openBrowser();
	}

}
