import NpcConfig from "../config/NpcConfig";
import NpcSelectionPrefab from "./NpcSelectionPrefab";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";
import { ResUtils } from "../utils/ResUtils";
import { Notify } from "../config/Notify";
import { QuestManager } from "../quest/QuestManager";
import ProgressBar from "../quest/ProgressBar";
import NpcSelection from "../config/NpcSelection";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import SelectionEventHandler from "./SelectionEventHandler";
import Optional from "../cocosExtend/Optional";
import { Npc } from "../config/Npc";
import { ConfigUtils } from "../utils/ConfigUtil";
import JgtManager from "../gameplay/jinguangta/JgtManager";
import ItemFrame from "../base/ItemFrame";
import Item from "../base/Item";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";
import BagData from "../bag/BagData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NpcPanel extends cc.Component {
    // ------------------------
    @property(cc.Layout)
    npcpanel: cc.Layout = null;

    @property(cc.Layout)
    npcpanelWithSelection: cc.Layout = null;

    @property(cc.Layout)
    voiceOver: cc.Layout = null;
    //
    @property(cc.RichText)
    contentDown: cc.RichText = null;

    @property(cc.Sprite)
    playerSprite: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    // ----------------- WithSelection
    @property(cc.Button)
    closeButton: cc.Button = null;
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.RichText)
    contentCenter: cc.RichText = null;
    @property(cc.Label)
    nameLabelUp: cc.Label = null;
    @property(cc.Prefab)
    npcSelectionPrefab: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    // submit Item
    @property(cc.Node)
    smtNode: cc.Node = null;
    @property(cc.Button)
    smtCloseBtn: cc.Button = null;
    @property(cc.Sprite)
    smtIconSprite: cc.Sprite = null;
    @property(cc.RichText)
    smtText: cc.RichText = null;
    @property(cc.Label)
    smtNameLabel: cc.Label = null;
    @property(cc.Sprite)
    smtBlockBg: cc.Sprite = null;
    @property(ItemFrame)
    smtItemFrame: ItemFrame = null;
    @property(Item)
    smtItem: Item = null;
    @property(cc.Button)
    smtConfirmBtn: cc.Button = null;
    @property(cc.Button)
    smtCancelBtn: cc.Button = null;

    // voice over
    @property(cc.RichText)
    contentDownOver: cc.RichText = null;

    @property(cc.Sprite)
    blockBgOver: cc.Sprite = null;

    selectionId: number = -1;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.panelOnClick.bind(this));
        this.blockBgOver.node.on(cc.Node.EventType.TOUCH_END, this.panelOnClick.bind(this));
        this.closeButton.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.smtCancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.smtCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.bgSprite.node.on(cc.Node.EventType.TOUCH_END, () => { });
        this.smtBlockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    async next(npcName: string, prefabId: number, selectionId: number) {
        this.selectionId = selectionId;
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        let textId = selection.npcTextIdArray[0];
        let text = NpcConfig.getInstance().npcTexts[textId];

        this.nameLabel.string = npcName;
        this.contentDown.string = CommonUtils.textToRichText(text.replace('[name]', PlayerData.getInstance().playerName));
        let spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + prefabId) as cc.SpriteFrame;
        this.playerSprite.spriteFrame = spriteFrame;
    }

    // ===============

    async initWithSelection(npcId: number) {
        let npc = NpcConfig.getInstance().npcs[npcId];
        this.showAsWithSelection();
        let chatId: number = npc.getChatId();
        let text = "";
        if (chatId != -1) {
            text = NpcConfig.getInstance().npcTexts[chatId];
        }
        this.contentCenter.string = CommonUtils.textToRichText(text);
        this.nameLabelUp.string = npc.name;
        // 设置选项
        this.scrollView.content.removeAllChildren();
        let selectionIdArray = npc.extraSelectionIdArray.concat(npc.selectionIdArray);
        if (selectionIdArray.length == 0) {
            selectionIdArray = [1];
        }
        this.showSelections(selectionIdArray);

        this.iconSprite.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + npc.prefabId) as cc.SpriteFrame;
    }

    async initSubmitItem(selectionId: number) {
        this.selectionId = selectionId;
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        if (!selection) { return; }
        let npcId = selection.npcId;

        this.voiceOver.node.active = false;
        this.npcpanel.node.active = this.npcpanelWithSelection.node.active = false;
        this.smtNode.active = true;
        let npc = NpcConfig.getInstance().npcs[npcId];
        let currencyId = selection.smtCurrencyId;
		let display = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId);
        const currencyName = display.fmap(x => x.name).getOrElse("")
        let amount = selection.smtCurrencyId == 151 ? CommonUtils.toCKb(selection.smtCurrencyAmount) : selection.smtCurrencyAmount;
        this.smtText.string = `确定给予 <color=#356D0A>${amount}个${currencyName}</color> ?`;
        this.smtItemFrame.init(display.fmap(x => x.quality).getOrElse(ItemQuality.Blue), display.val.showBorderEffect);
        this.smtItem.init(currencyId, BagData.getInstance().getCurrencyNum(currencyId));
        this.smtNameLabel.string = npc.name;
        this.smtIconSprite.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + npc.prefabId) as cc.SpriteFrame;

        this.smtConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.submitItem.bind(this));
    }

    async initSmtForJgt(params) {
        this.voiceOver.node.active = false;
        this.npcpanel.node.active = false;
        this.npcpanelWithSelection.node.active = false;
        this.smtNode.active = true;
        let npcId = R.prop('npcId', params);
        let currencyId = R.prop('currencyId', params);
        let amount = R.prop('amount', params);
        
        let npc = NpcConfig.getInstance().npcs[npcId];
		let display = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId);
        let currencyName = display.fmap(x => x.name).getOrElse("")
        this.smtText.string = `确定给予 <color=#356D0A>${amount}个${currencyName}</color> ?`;
        this.smtItemFrame.init(display.fmap(x => x.quality).getOrElse(ItemQuality.Blue), display.val.showBorderEffect);
        this.smtItem.init(currencyId, BagData.getInstance().getCurrencyNum(currencyId));
        this.smtNameLabel.string = npc.name;
        this.smtIconSprite.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + npc.prefabId) as cc.SpriteFrame;

        this.smtConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, function() { 
            R.prop('cb', params)();
            this.closePanel();
        }.bind(this));
    }

    async initForJgt(params) {
        let selectionId = R.prop('selectionId', params);
        let npcId = R.prop('npcId', params);
        let chatText = R.prop('chatText', params);
        let selectioIdArray = R.prop('selectionIdArray', params);

        this.showAsWithSelection();
        let npc = new Optional<Npc>(NpcConfig.getInstance().npcs[npcId]);
        let npcName = npc.fmap(x => x.name);
        if (npcName.isValid()) this.nameLabelUp.string = npcName.getValue();
        let prefabId = npc.fmap(x => x.prefabId);
        if (prefabId.isValid()) this.iconSprite.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + prefabId.getValue());

        if (selectioIdArray.length === 0) {
            selectioIdArray = [1];
        }
        this.scrollView.content.removeAllChildren();
        if (selectionId === 2071) {
            let config = await ConfigUtils.getConfigJson('GoldTowerQuestions');
            let questionId = JgtManager.getInstance().param1;
            let question = R.prop(questionId, config);
            chatText = R.prop('description', question);
            selectioIdArray.forEach((ele, index) => {
                let text = R.prop('selectionDesc_' + (index + 1), question);
                let selection = cc.instantiate(this.npcSelectionPrefab);
                let npcSelection = selection.getComponent(NpcSelectionPrefab);
                npcSelection.init(text, ele);
                npcSelection.node.parent = this.scrollView.content;
                npcSelection.node.on(cc.Node.EventType.TOUCH_END, this.selectionOnClick(ele).bind(this));
            });
        } else {
            this.showSelections(selectioIdArray);
        }
        this.contentCenter.string = CommonUtils.textToRichText(chatText);
    }

    async nextWithSelection(selectionId: number) {
        this.scrollView.content.removeAllChildren();
        this.selectionId = selectionId;
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        let npc = NpcConfig.getInstance().npcs[selection.npcId];
        this.nameLabelUp.string = npc.name;
        this.iconSprite.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + npc.prefabId) as cc.SpriteFrame;
        let text = NpcConfig.getInstance().npcTexts[selection.npcTextIdArray[0]];
        let selectionIds = selection.subSelectionIdArray;
        this.showSelections(selectionIds);
        this.contentCenter.string = CommonUtils.textToRichText(text);
    }

    private showSelections(selectionIds: Array<number>): void {
        for (let i = 0; i < selectionIds.length; ++i) {
            let selectionId = selectionIds[i];
            let selectionInfo = NpcConfig.getInstance().npcSelections[selectionId];
            let text = NpcConfig.getInstance().npcTexts[selectionInfo.textId];
            let id = selectionId;
            let selection = cc.instantiate(this.npcSelectionPrefab);
            let npcSelection = selection.getComponent(NpcSelectionPrefab);
            npcSelection.init(text, id);
            npcSelection.node.parent = this.scrollView.content;
            npcSelection.node.on(cc.Node.EventType.TOUCH_END, this.selectionOnClick(selectionId).bind(this));
        }
    }
    // =========
    nextVoiceOver(selectionId) {
        this.selectionId = selectionId;
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        let textId = selection.npcTextIdArray[0];
        let text = NpcConfig.getInstance().npcTexts[textId];
        this.contentDownOver.string = CommonUtils.textToRichText(text);
    }

    selectionOnClick(selectionId) {
        return () => {
            this.doBeforeNext(selectionId);
        }
    }

    panelOnClick() {
        this.doBeforeNext();
    }

    doBeforeNext(selectioId?) {
        if (!selectioId) {
            selectioId = this.selectionId;
        }
        
        let selection = NpcConfig.getInstance().npcSelections[selectioId];
        console.log(selection, selectioId)
        if (selection.toBattle) { // 开启战斗
            QuestManager.sendBattleRequest(selection.battleId, selection.questId, selection.battleObjectiveIndex);
        } else if (selection.findNpcActionIsEnd) { // 寻人任务结束
            if (selection.progressId == 0) {
                QuestManager.finishQuest(selection.questId, selection.npcObjectiveIndex);
            } else {
                this.showProgressBar(selection);
            }
        } else if (selection.toSumbitItem) {
            this.initSubmitItem(selectioId);
            return ;
        } else if (selection.clickEventType) {
            this.nextSelection(selection.goto);
            SelectionEventHandler.getInstance().handleEvents(selectioId);
            return;
        }
        this.nextSelection(selection.goto);
    }

    async showProgressBar(selection: NpcSelection) {
        EventDispatcher.dispatch(Notify.HIDE_MAIN_UI, {});
        let prefab = await CommonUtils.getPanelPrefab('quest/progressbar') as cc.Prefab;
        let bar = cc.instantiate(prefab).getComponent(ProgressBar);
        bar.node.x = 0;
        bar.node.y = 0;
        bar.node.height = CommonUtils.getViewHeight();
        bar.block();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: bar });
        if (bar) {
            await bar.startBar(selection.progressId);
            QuestManager.finishQuest(selection.questId, selection.npcObjectiveIndex);
            EventDispatcher.dispatch(Notify.SHOW_MAIN_UI, {});
        }
    }

    nextSelection(selectionId) {
        if (selectionId == null) {
            this.closePanel();
            return;
        }
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        this.showNode(selectionId);
        if (selection.subSelectionIdArray.length === 0) {   // 无选项
            if (selection.npcId == -1) {                    // 玩家
                this.next(PlayerData.getInstance().playerName, PlayerData.getInstance().prefabId, selectionId);
            } else if (selection.npcId == -2) {             // 旁白
                this.nextVoiceOver(selectionId);
            } else {                                        // npc对话
                let npc = NpcConfig.getInstance().npcs[selection.npcId];
                this.next(npc.name, npc.prefabId, selectionId);
            }
        } else {                                            // 有选项
            this.nextWithSelection(selectionId);
        }
    }

    closePanel() {
        EventDispatcher.dispatch(Notify.SHOW_MAIN_UI, {});
        this.node.parent.removeChild(this.node);
    }

    showNode(selectionId) {
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        this.voiceOver.node.active = selection.subSelectionIdArray.length === 0 && selection.npcId == -2;
        this.npcpanelWithSelection.node.active = selection.subSelectionIdArray.length > 0;
        this.npcpanel.node.active = selection.subSelectionIdArray.length === 0 && selection.npcId != -2;
    }

    showAsWithSelection() {
        this.npcpanelWithSelection.node.active = true;
        this.voiceOver.node.active = this.npcpanel.node.active = false;
    }

    submitItem() {
        let selection = NpcConfig.getInstance().npcSelections[this.selectionId];
        QuestManager.finishQuest(selection.questId, selection.itemObjectiveIndex);
        this.closePanel()
    }

    // update (dt) {}
}
