import { ResUtils } from "../../utils/ResUtils";
import { RankingElement, PlayerBaseInfo } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";

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
export default class PaiHangBJGTItem extends cc.Component {

    @property(cc.Label)
    rankingLa: cc.Label = null;
    @property(cc.Sprite)
    rankingIcon: cc.Sprite = null;
    @property(cc.Sprite)
    head: cc.Sprite = null;
    @property(cc.Sprite)
    bgItem: cc.Sprite = null;
    @property(cc.Sprite)
    bgTitle: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    titleLal: cc.Label = null;
    @property(cc.Label)
    levelLal: cc.Label = null;
    @property(cc.Label)
    layerLal: cc.Label = null;

    // data
    playerBaseInfo: Optional<PlayerBaseInfo> = new Optional<PlayerBaseInfo>();

    start() {
        let _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.playerBaseInfo.valid) {
                CommonUtils.showViewPlayerBox(_this.playerBaseInfo.val);
            }
        });
    }

    async init(data) {
        let element = data as RankingElement;
        if (element == null) {
            return;
        }
        this.playerBaseInfo = new Optional<PlayerBaseInfo>(element.playerBaseInfo);
        this.setBGRanking(element.currentRank);
        this.titleLal.string = element.playerBaseInfo.player.playerName;
        this.layerLal.string = `${element.rankValue}层`;
        this.levelLal.string = `${element.playerBaseInfo.player.playerLevel}级`;
        this.head.spriteFrame = await ResUtils.loadSpriteFromAltas('original/icon/icon_model', `icon_model-head_rect_${element.playerBaseInfo.player.prefabId}`);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(data.playerBaseInfo.schoolId));
    }

    async setBGRanking(ranking: number) {
        let bgItemFrame = null;
        let bgTitleFrame = null;
        if (ranking < 4) {
            bgItemFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', `bg_paihangbangdi${ranking}`);
            bgTitleFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', `bg_paihangbangmingzidi${ranking}`);
            this.rankingIcon.node.active = true;
            this.rankingLa.node.active = false;
            this.rankingIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', `icon_paihang${ranking}`);

        } else {
            bgItemFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', 'bg_paihangbangdi');
            bgTitleFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', 'bg_paihangbangmingzidi');
            this.rankingIcon.node.active = false;
            this.rankingLa.node.active = true;
            if (ranking >= 1000) {
                this.rankingIcon.node.active = true;
                this.rankingLa.node.active = false;
                this.rankingIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/jinguangta/jinguangta', 'font_weishangbang');
            }
            else
                this.rankingLa.string = ranking.toString();
        }
        this.bgItem.spriteFrame = bgItemFrame;
        this.bgTitle.spriteFrame = bgTitleFrame;

    }
    // update (dt) {}
}
