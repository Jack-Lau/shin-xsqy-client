const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillEffect extends cc.Component {
    @property(cc.Animation)
    ani: cc.Animation = null;

    start () {

    }

    play(ac: cc.AnimationClip) {
        this.ani.addClip(ac, 'animation_clip');
        this.ani.play('animation_clip');
    }
}
