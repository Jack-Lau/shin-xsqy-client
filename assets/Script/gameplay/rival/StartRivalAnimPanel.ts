import RivalAnimItem from "./RivalAnimItem";
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
export default class StartRivalAnimPanel extends cc.Component {

    @property(cc.Label)
    playerFcLabel: cc.Label = null;
    @property(cc.Label)
    enemyFcLabel: cc.Label = null;
    @property(RivalAnimItem)
    playerList: RivalAnimItem[] = [];
    @property(RivalAnimItem)
    enemyList: RivalAnimItem[] = [];

    @property(cc.Animation)
    anim: cc.Animation = null;

    animState: cc.AnimationState = null;

    start() {
        
    }

    async init(playerTeam: any[], enemyTeam: any[]) {

        this.playerList.forEach((ele, index) => {
            ele.init(new Optional<any>(playerTeam[index]));
        });

        this.enemyList.forEach((ele, index) => {
            ele.init(new Optional<any>(enemyTeam[index]));
        });

        let playerFcMax = 0;
        playerTeam.forEach((ele: any) => {
            playerFcMax += ele.fc;
        });
        this.playerFcLabel.string = playerFcMax.toString();
        let enemyFcMax = 0;
        enemyTeam.forEach((ele: any) => {
            enemyFcMax += ele.fc;
        });
        this.enemyFcLabel.string = enemyFcMax.toString();

    }

    async playTween() {
        this.animState = this.anim.play();
        await CommonUtils.wait(this.animState.duration + 1.1);
    }
}
