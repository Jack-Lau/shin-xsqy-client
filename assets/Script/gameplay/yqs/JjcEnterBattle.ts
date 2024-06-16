import { CommonUtils } from "../../utils/CommonUtils";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { PitDetail } from "../../net/Protocol";
import { YqsData } from "./YqsData";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import Optional from "../../cocosExtend/Optional";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JjcEnterBattle extends cc.Component {
    // up
    @property(cc.Sprite)
    upBustSp: cc.Sprite = null;
    @property(cc.Sprite)
    upSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    upRankLabel: cc.Label = null;
    @property(cc.Node)
    upNode: cc.Node = null;
    @property(cc.Label)
    upNameLabel: cc.Label = null;

    @property(cc.Sprite)
    vsSp: cc.Sprite = null;
    @property(cc.Node)
    vsNode: cc.Node = null;


    // down
    @property(cc.Sprite)
    downBustSp: cc.Sprite = null;
    @property(cc.Sprite)
    downSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    downRankLabel: cc.Label = null;
    @property(cc.Node)
    downNode: cc.Node = null;
    @property(cc.Label)
    downNameLabel: cc.Label = null;

    async start () {
        
    }

    async init () {
        if (!YqsData.challenging) return;
        this.upNameLabel.string = YqsData.challenging.playerName;
        this.upRankLabel.string = YqsData.challenging.rank + '';
        this.upBustSp.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + YqsData.challenging.prefabId);
        this.upSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(YqsData.challenging.schoolId)

        this.downNameLabel.string =PlayerData.getInstance().playerName;
        this.downRankLabel.string = YqsData.myInfo.pit.pit.position + '';
        this.downBustSp.spriteFrame = await ResUtils.loadSprite('original/bust/original_model-bust_' + PlayerData.getInstance().prefabId);
        this.downSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(PlayerData.getInstance().schoolId))

        let clip = await MovieclipUtils.getEffectClipData('ui/effect/jjc_enter_battle', 24);
        clip.wrapMode = cc.WrapMode.Normal;
        let animation = this.vsSp.getComponent(cc.Animation)
        animation.addClip(clip, 'tween');
        
    }

    async playTween () {
        this.vsSp.getComponent(cc.Animation).play('tween');
        this.upBustSp.node.x = 800;
        let upAction1 = cc.sequence([
            cc.moveTo(0.45, -300, 397),
            cc.moveTo(1, -300, 397),
            cc.moveTo(0.25, -1100, 397)
        ]);
        this.upBustSp.node.runAction(upAction1);

        this.upNode.x = 1100;
        let upAction2 = cc.sequence([
            cc.moveTo(0.45, 0, 200),
            cc.moveTo(1, 0, 200),
            cc.moveTo(0.25, -800, 200)
        ]);
        this.upNode.runAction(upAction2);
        

        this.downBustSp.node.x = -800;
        let downAction1 = cc.sequence([
            cc.moveTo(0.45, 300, -113),
            cc.moveTo(1, 300, -113),
            cc.moveTo(0.25, 1100, -113)
        ]);
        this.downBustSp.node.runAction(downAction1);

        this.downNode.x = -1100;
        let downAction2 = cc.sequence([
            cc.moveTo(0.45, 0, -210),
            cc.moveTo(1, 0, -210),
            cc.moveTo(0.25, 800, -210)
        ]);
        this.vsNode.active = false;
        this.downNode.runAction(downAction2);
        
        await CommonUtils.wait(0.45);
        this.vsNode.active = true;
        await CommonUtils.wait(1);
        this.vsNode.active = false;
        await CommonUtils.wait(0.25);
    }
}