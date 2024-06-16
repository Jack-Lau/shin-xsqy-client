import { MentorUtils } from "./MentorUtils";
import { ResUtils } from "../../utils/ResUtils";
import { DailyPracticeRecord } from "../../net/Protocol";
import { Record } from "immutable";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class DisciplePracticeItem extends cc.Component {
    @property(cc.Node)
    selectedNode: cc.Node = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    iconSp: cc.Sprite = null;
    @property(cc.Node)
    getNode: cc.Node = null;
    @property(cc.Node)
    gotNode: cc.Node = null;

    record: Optional<DailyPracticeRecord> = new  Optional<DailyPracticeRecord>();

    start () {

    }

    async init (config: MentorUtils.MentorAchievement, record: Optional<DailyPracticeRecord>) {
        this.nameLabel.string = config.name;
        this.iconSp.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/mentor/mentor_achievement_icon', String(config.icon));
        this.gotNode.active = record.fmap(x => x.status == "REWARDED").getOrElse(false)
        this.getNode.active = record.fmap(x => x.status == "COMPLETED").getOrElse(false);
        this.record = record;
    }

    get selected(): boolean {
        return this.selectedNode.active;
    }

    set selected(value: boolean) {
        this.selectedNode.active = value;
    }
}
