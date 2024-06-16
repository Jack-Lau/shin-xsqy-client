import { CommonUtils } from "../../../utils/CommonUtils";
import { NetUtils } from "../../../net/NetUtils";
import { QuestRecord } from "../../../net/Protocol";
import { TipsManager } from "../../../base/TipsManager";
import { NewYearChallengeData } from "./NewYearChallengeData";
import { ResUtils } from "../../../utils/ResUtils";
import NewYearChallengePanel from "./NewYearChallengePanel";
import { QuestManager } from "../../../quest/QuestManager";
import { QuestProxy } from "../../../quest/QuestProxy";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class NewYearChallengePopup extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    prefabSp: cc.Sprite = null;
    @property(cc.Sprite)
    nameSp: cc.Sprite = null;
    @property(cc.RichText)
    description: cc.RichText = null;
    @property(cc.Button)
    challengeBtn: cc.Button = null;
    @property(cc.Layout)
    startGroup: cc.Layout = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    from: NewYearChallengePanel = null;
    questId: number = null;

    id2source = {
        4100001: 'fushen',
        4100005: 'luxing',
        4100012: 'shouxing',
        4100007: 'xishen'
    }

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.challengeBtn.node.on(cc.Node.EventType.TOUCH_END, this.challenge.bind(this));
    }

    /******* start events *******/
    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    async init (questId: number) {
        this.questId = questId;
        let config = await NewYearChallengeData.getDisplayByQuestId(questId);
        if (config) {
            this.startGroup.node.children.forEach((node, index) => node.active = index < config.starLevel);
            this.description.string = CommonUtils.textToRichText(config.description);
            this.prefabSp.spriteFrame = await ResUtils.loadSprite('ui/gameplay/newYear/challenge/bg_' + this.id2source[config.prefabId]);
            this.nameSp.spriteFrame = this.atlas.getSpriteFrame('font_' + this.id2source[config.prefabId])
        }
    }

    async challenge() {
        if (this.from) {
            this.from.closePanel();
        }
        this.closePanel();
    }
    /******** end events ********/
}