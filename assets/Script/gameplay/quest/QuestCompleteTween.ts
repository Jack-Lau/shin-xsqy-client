import { CommonUtils } from "../../utils/CommonUtils";
import QuestConfig from "../../quest/QuestConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class QuestCompleteTween extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;
    @property(cc.Sprite)
    typeSp: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    start () {

    }

    init (questId: number) {
        let _this = this;
        let config = QuestConfig.getInstance().getQCTConfig(questId);
        this.titleSp.spriteFrame = this.getSf(config.questNameResource + '');
        this.typeSp.spriteFrame = this.getSf(config.questTypeResource + '');
        this.animation.on('finished', function() {
            _this.closePanel();
        })
        this.animation.play();
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    getSf (key: string) {
        return this.atlas.getSpriteFrame(key);
    }
}
