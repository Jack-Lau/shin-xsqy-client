import Item from "../base/Item";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import { ResUtils } from "../utils/ResUtils";
import { CommonUtils } from "../utils/CommonUtils";
import { PlayerBaseInfo } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";
import { TitleConfig } from "../player/title/TitleConfig";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class MyChatItem extends cc.Component {
    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.RichText)
    contentRichText: cc.RichText = null;

    @property(Item)
    iconItem: Item = null;

    @property(cc.Sprite)
    timeBg: cc.Sprite = null;

    @property([cc.AnimationClip])
    aniArr: Array<cc.AnimationClip> = [];

    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    playerBaseInfo: PlayerBaseInfo = null;

    start () {
        this.contentRichText.maxWidth = 315;
        let _this = this;
        this.iconItem.node.on(cc.Node.EventType.TOUCH_END, async () => {
            if (!_this.playerBaseInfo) { return; }
            CommonUtils.showViewPlayerBox(_this.playerBaseInfo);
        });
    }

    async init (emojiIdArray: number[], playerInfo: PlayerBaseInfo, time: number) {
        this.contentRichText.maxWidth = 313;
        let date = new Date(time);
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        this.playerBaseInfo = playerInfo;
        this.initTitle(new Optional<number>(playerInfo.titleDefinitionId))

        this.timeLabel.string = this.numToString(month) + '-' + this.numToString(day) + ' ' 
                                + this.numToString(hour) + ':' + this.numToString(minute);

        this.nameLabel.string = playerInfo.player.playerName;
        this.iconItem.iconImage.spriteFrame = await ResUtils.loadSpriteFromAltas('original/icon/icon_model', 'icon_model-head_rect_' + playerInfo.player.prefabId) as cc.SpriteFrame;

        let arr = (this.contentRichText as any)._labelSegments;
        let extraLine = 0;
        if (this.contentRichText.node.height > 60) {
            extraLine = 1;
        }

        let index = 0;
        arr.forEach((item) => {
            if (item.name === "RICHTEXT_Image_CHILD") {
                let emoji = this.genEmoji(item, emojiIdArray[index], extraLine);
                index ++;
                this.contentRichText.node.addChild(emoji);
                // emoji.parent = this.contentRichText.node;
            }
        });
    }

    genEmoji(img, emojiId: number, extraLine: number = 0) {
        let emoji = new cc.Node('emoji');
        [emoji.anchorX, emoji.anchorY] = [0.5, 0.5];
        console.log(this.contentRichText.node)
        emoji.x = img.x - (img.anchorX * 60) + 30 + this.contentRichText.node.width/2
        emoji.y = img.y - (img.anchorY * 40) + 20 - (extraLine + 1) * 21;
        
        // emoji.x = img.x + this.contentRichText.node.width/2 + img.width/2;
        // emoji.y = img.y - img.height / 2 - 20 * extraLine;

        console.log(`emoji(${emoji.x},${emoji.y})  img(${img.x},${img.y}) height: ${this.contentRichText.node.height}  extraline: ${extraLine}`)
        let sprite = emoji.addComponent(cc.Sprite);
        sprite.addComponent(cc.Animation);
        let animation = sprite.getComponent(cc.Animation);
        this.aniArr[emojiId - 1].name = "emoji_" + emojiId;
        animation.addClip(this.aniArr[emojiId - 1], "emoji_" + emojiId);
        animation.play("emoji_" + emojiId);
        return emoji;
    }


    numToString(num: number) {
        if (num < 0 || num >= 10) {
            return num.toString();
        } else {
            return '0' + num.toString();
        }
    }

    async initTitle(definitionId: Optional<number>) {
        if (!definitionId.valid) {
            this.titleSp.node.active = false;
        } else {
            let title = await TitleConfig.getConfigById(definitionId.val);
            let isPic = title.type == 1;
            this.titleSp.node.active = isPic;
            if (isPic) {
                this.titleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
            } 
        }
    }
}
