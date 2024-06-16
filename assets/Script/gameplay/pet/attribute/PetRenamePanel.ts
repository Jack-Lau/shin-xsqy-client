import { CommonUtils } from "../../../utils/CommonUtils";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
import { PetData } from "../PetData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetRenamePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.EditBox)
    input: cc.EditBox = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    petId = null;

    start () {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.renamePet.bind(this)));
    }

    init(petId: number) {
        this.petId = petId;
    }

    nameInputCenter() {
        CommonUtils.editBoxCenter(this.input);
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    async renamePet () {
        if (!this.petId) {
            return;
        }
        let newName = this.input.string;
        if (newName == "") {
            TipsManager.showMessage('输入的名字不可为空');
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/rename', [this.petId, newName]);
        if (response.status === 0) {
            TipsManager.showMessage('修改成功!');
            PetData.updatePetInfo({pet: response.content});
            this.closePanel();
        }
    }
}