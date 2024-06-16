import NpcConfig from "../config/NpcConfig";
import NpcSelectionPrefab from "./NpcSelectionPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NpcPanelWithSelection extends cc.Component {
	
    @property(cc.Button)
    closeButton: cc.Button = null;
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.Label)
    contentLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Prefab)
    npcSelectionPrefab: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.scrollView.content

        this.closeButton.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.bgSprite.node.on(cc.Node.EventType.TOUCH_END, () => { });
    }

    init(npcId: number) {
        let npc = NpcConfig.getInstance().npcs[npcId];
        let chatId: number = npc.getChatId();
        let text = "";
        if (chatId != -1) {
            text = NpcConfig.getInstance().npcTexts[chatId];
        }
        this.contentLabel.string = text;
        this.nameLabel.string = npc.name;
        // 设置选项
        this.scrollView.content.removeAllChildren();
        let selectionIdArray = npc.selectionIdArray;
        if (selectionIdArray.length == 0) {
            selectionIdArray = [1];
        }
        this.showSelections(selectionIdArray);
    }

    private showSelections(selectionIds: Array<number>): void {
        for (let i = 0; i < selectionIds.length; ++i) {
            let selectionId = selectionIds[i];
            let selectionInfo = NpcConfig.getInstance().npcSelections[selectionId];
            let text = NpcConfig.getInstance().npcTexts[selectionInfo.textId];
            let id = selectionId;

            // if (npcSelection["selectionArts"] == 1) {
            //     object["res"] = "npcPanel_json.bt_npcxuanxiang2";
            // } else {
            //     object["res"] = "npcPanel_json.bt_npcxuanxiang1";
            // }

            let selection = cc.instantiate(this.npcSelectionPrefab);
            let npcSelection = selection.getComponent(NpcSelectionPrefab);
            npcSelection.init(text, id);
            npcSelection.node.parent = this.scrollView.content;
        }
    }

    closePanel() {
        this.node.active = false;
    }
}
