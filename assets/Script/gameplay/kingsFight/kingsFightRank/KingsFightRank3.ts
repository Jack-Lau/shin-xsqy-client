
const {ccclass, property} = cc._decorator;

@ccclass
export default class KingsFightRank3 extends cc.Component {
    @property(cc.Sprite)
    rankSp: cc.Sprite = null;
    @property([cc.Sprite])
    stars: Array<cc.Sprite> = [];
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    start () {

    }

    init (rank2: number, rank3: number) {
        this.rankSp.spriteFrame = this.atlas.getSpriteFrame(`font_${rank2}`);
        this.stars.forEach((star, index) => {
            star.node.active = index < rank3;
        });
    }
}
