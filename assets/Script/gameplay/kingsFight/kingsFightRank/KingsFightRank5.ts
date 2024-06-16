
const {ccclass, property} = cc._decorator;

@ccclass
export default class KingsFightRank5 extends cc.Component {

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    startAmountLabel: cc.Label = null;

    start () {

    }

    init (rank2: number, rank3: number) {
        this.startAmountLabel.string = `x${rank3}`;
    }
}
