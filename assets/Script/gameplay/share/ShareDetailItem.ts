// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareDetailItem extends cc.Component {

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    @property(cc.Sprite)
    rankImg: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    rankLabel: cc.Label = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    amountLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    @property(cc.SpriteFrame)
    energysf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    kbsf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rank1sf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rank2sf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rank3sf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bgOdd: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bgEven: cc.SpriteFrame = null;

    rank1Color = '#bf5347';
    rank2Color = '#44457e';
    rank3Color = '#4a8c67';
    rank4_10Color = '#5e3906';
    rankEmptyColor = '#636363';

    start() {

    }

    init(rank, info, isKb: boolean = false) {
        if (rank == 1) {
            this.rankImg.spriteFrame = this.rank1sf;
            this.rankLabel.node.active = false;
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, this.rank1Color)
            this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, this.rank1Color)
        } else if (rank == 2) {
            this.rankImg.spriteFrame = this.rank2sf;
            this.rankLabel.node.active = false;
            // let color = cc.hexToColor(this.rank2Color);
            // this.nameLabel.node.color = this.amountLabel.node.color = color;
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, this.rank2Color)
            this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, this.rank2Color)
        } else if (rank == 3) {
            this.rankImg.spriteFrame = this.rank3sf;
            this.rankLabel.node.active = false;
            // let color = cc.hexToColor(this.rank3Color);
            // this.nameLabel.node.color = this.amountLabel.node.color = color;
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, this.rank3Color)
            this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, this.rank3Color)
        } else {
            this.rankImg.node.active = false;
            this.rankLabel.string = rank + '';
        }
        if (!info) {
            this.amountLabel.node.active = this.itemIcon.node.active = false;
            this.nameLabel.node.color = this.rankLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color = this.rankLabel.node.color, this.rankEmptyColor);
            this.nameLabel.string = '虚位以待'
        } else {
            this.nameLabel.string = info.playerName;
            this.amountLabel.string = info.sum + '';
        }

        if (rank % 2 == 0) {
            this.bgSprite.spriteFrame = this.bgEven;
        } else {
            this.bgSprite.spriteFrame = this.bgOdd;
        }

        if (isKb) {
            this.itemIcon.spriteFrame = this.kbsf;
        }
    }

    // update (dt) {}
}
