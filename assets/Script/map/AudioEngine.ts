import { CommonUtils } from "../utils/CommonUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioEngine extends cc.Component {
    @property(cc.AudioClip)
    audioClip: cc.AudioClip = null;

    current = null;

    onLoad () {
        
    }

    play (clip) {
        this.stop();
        this.audioClip = clip;
        this._play();
    }

    _play () {
        this.current = cc.audioEngine.play(this.audioClip, true, 1);
    }

    stop () {
        if (this.current != undefined) {
            cc.audioEngine.stop(this.current);
        }
    }

    onDestroy () {
        this.stop();
    }
}   