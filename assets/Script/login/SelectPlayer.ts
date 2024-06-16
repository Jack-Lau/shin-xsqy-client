import { MovieclipUtils } from "../utils/MovieclipUtils";
import { ResUtils } from "../utils/ResUtils";
import { nameDict } from "./NameConfig";
import { CommonUtils } from "../utils/CommonUtils";
import { NetUtils } from "../net/NetUtils";
import PlayerData from "../data/PlayerData";
import { TipsManager } from "../base/TipsManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectPlayer extends cc.Component {
    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    @property(cc.Sprite)
    playerSprite: cc.Sprite = null;

    @property(cc.Sprite)
    bgEffect: cc.Sprite = null;

    @property(cc.Sprite)
    handEffect: cc.Sprite = null;

    @property(cc.ToggleContainer) 
    toggleContainer: cc.ToggleContainer = null; 

    @property(cc.Button)
    backBtn: cc.Button = null;

    @property(cc.Button)
    inviteBtn: cc.Button = null;

    @property(cc.Button)
    randomNameBtn: cc.Button = null;

    @property(cc.Sprite)
    characterName: cc.Sprite = null;

    @property(cc.Sprite)
    description1: cc.Sprite = null;

    @property(cc.Sprite)
    description2: cc.Sprite = null;

    @property(cc.Button)
    createPlayerBtn: cc.Button = null;
    
    @property(cc.EditBox)
    playerName: cc.EditBox = null;
    // LIFE-CYCLE CALLBACKS:

    @property([cc.SpriteFrame])
    cnSource: Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    cd_1_Source: Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    cd_2_Source: Array<cc.SpriteFrame> = [];

    @property(cc.Layout)
    inviteCode: cc.Layout = null;

    @property(cc.EditBox)
    codeInput: cc.EditBox = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Button)
    codeCloseBtn: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    // onLoad () {}
	
    isMale: boolean = true;
    prefabId: number = 0;

    locations = {
        '4000001': {
            'hand': new cc.Vec2(-82.6, 290),
            'bg': new cc.Vec2(36, -17),
            'playerX': 25
        },
        '4000002': {
            'hand': new cc.Vec2(-236.4, 161.2),
            'bg': new cc.Vec2(0, 0),
            'playerX': 40
        },
        '4000003': {
            'hand': new cc.Vec2(-38, -58),
            'bg': new cc.Vec2(0, 0),
            'playerX': 58
        },
        '4000004': {
            'hand': new cc.Vec2(182, -173),
            'bg': new cc.Vec2(0, 0),
            'playerX': 55
        }
    }

    async start () {
        let prefabId = Math.floor(Math.random() * 4 + 4000001);
        this.prefabId = prefabId;
        PlayerData.getInstance().prefabId = prefabId;
        this.selectPlayer(prefabId)();
        this.toggleContainer.toggleItems[0].isChecked = false;
        this.toggleContainer.toggleItems[(prefabId - 4000001)].isChecked = true;
		//
        this.toggleContainer.toggleItems[0].node.on('toggle', this.selectPlayer(4000001));
        this.toggleContainer.toggleItems[1].node.on('toggle', this.selectPlayer(4000002));
        this.toggleContainer.toggleItems[2].node.on('toggle', this.selectPlayer(4000003));
        this.toggleContainer.toggleItems[3].node.on('toggle', this.selectPlayer(4000004));
        this.randomNameBtn.node.on(cc.Node.EventType.TOUCH_START, this.randomName.bind(this));
        this.createPlayerBtn.node.on(cc.Node.EventType.TOUCH_START, CommonUtils.aloneFunction(this.createPlayer.bind(this)));
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, this.backToHome.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.randomName();
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmCode.bind(this));
        this.codeCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeCodeInput.bind(this));
        this.inviteBtn.node.on(cc.Node.EventType.TOUCH_END, this.openCodeInput.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.nameInputCenter();
		//
        let height = CommonUtils.getViewHeight();
        this.node.height = height;
		this.node.opacity = 0;
        if (height > 1366) {
            [this.bgSprite.node.height, this.bgSprite.node.width] = [height, height / 1366 * 768];
        }
		//
		let fadeAction = cc.fadeTo(0.5, 255);
		this.node.runAction(fadeAction);
    }

    selectPlayer(prefabId) {
        return async function() {
            this.prefabId = prefabId;
            PlayerData.getInstance().prefabId = prefabId;
            // bgEffect
            this.bgEffect.node.x = this.locations[prefabId + ''].bg.x;
            this.bgEffect.node.y = this.locations[prefabId + ''].bg.y;
            
            let clipName = 'bgEffect_' + prefabId;
            let loaded: boolean = false;
            let animation = this.bgEffect.getComponent(cc.Animation);
            for (let clip of animation.getClips()) {
                if (clip.name == clipName) {
                    loaded = true;
                    break;
                }
            }
            if (!loaded) {
                let movieclip = await MovieclipUtils.getEffectClipData('ui/login/createPlayer/createPlayer' + prefabId + '_1', 10) as cc.AnimationClip;
                movieclip.name = clipName;
                animation.addClip(movieclip, clipName);
            }
            animation.play(clipName);

            // handEffect
            this.handEffect.node.x = this.locations[prefabId + ''].hand.x;
            this.handEffect.node.y = this.locations[prefabId + ''].hand.y;
            let clipName2 = 'handEffect_' + prefabId;
            let loaded2: boolean = false;
            let animation2 = this.handEffect.getComponent(cc.Animation) as cc.Animation;
            for (let clip of animation2.getClips()) {
                if (clip.name == clipName2) {
                    loaded2 = true;
                    break;
                }
            }
            if (!loaded2) {
                let movieclip = await MovieclipUtils.getEffectClipData('ui/login/createPlayer/createPlayer' + prefabId + '_2', 10) as cc.AnimationClip;
                movieclip.name = clipName2;
                animation2.addClip(movieclip, clipName2);
            }
            animation2.play(clipName2);

            // playerSprite
            this.playerSprite.node.x = this.locations[prefabId].playerX;
            this.playerSprite.spriteFrame = await ResUtils.loadSprite('ui/login/model_' + prefabId) as cc.SpriteFrame;
			//
            this.description1.spriteFrame = this.cd_1_Source[prefabId - 4000001];
            this.description2.spriteFrame = this.cd_2_Source[prefabId - 4000001];
            this.characterName.spriteFrame = this.cnSource[prefabId - 4000001];
			//
            this.isMale = prefabId % 2 == 1;
			//
			let action = cc.fadeTo(0.2, 255);
			this.bgEffect.node.opacity = 0;
			this.handEffect.node.opacity = 0;
			this.playerSprite.node.opacity = 0;
			this.description1.node.opacity = 0;
			this.description2.node.opacity = 0;
			this.characterName.node.opacity = 0;
			//
			this.bgEffect.node.runAction(action.clone());
			this.handEffect.node.runAction(action.clone());
			this.playerSprite.node.runAction(action.clone());
			this.description1.node.runAction(action.clone());
			this.description2.node.runAction(action.clone());
			this.characterName.node.runAction(action.clone());
        }.bind(this);
    }

    randomName() {
        let firstName = '';
        if (this.isMale) {
            firstName = CommonUtils.randomSelectOne(nameDict.maleName)
        } else {
            firstName = CommonUtils.randomSelectOne(nameDict.femaleName)
        }
        this.playerName.string = CommonUtils.randomSelectOne(nameDict.lastName) + firstName; 
    }

    loaded = false

    async createPlayer() {
        if (this.loaded) {
            return
        }
        let playerName = this.playerName.string;
        let prefabId = this.prefabId;
        let code = "";
        if (PlayerData.getInstance().inviteCode) {
            code = PlayerData.getInstance().inviteCode;
        }

        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/player/createWithInvitation', [playerName, prefabId, code]) as any;
        if (response.status == 0) {
            PlayerData.getInstance().prefabId = response.content.prefabId;
            PlayerData.getInstance().playerName = response.content.playerName;
            PlayerData.getInstance().genesis = response.content.genesis;
            PlayerData.getInstance().playerLevel = response.content.playerLevel;
            PlayerData.getInstance().serialNumber = response.content.serialNumber;
            if (window['TDGA']) {
                TDGA.onEvent("创角", {accountId: PlayerData.getInstance().accountId});
                TDGA.Account({
                    accountId : PlayerData.getInstance().accountId,
                    level : 1,
                    gameServer : 'Server 1',
                    accountType : 1,
                    age : 24,
                    accountName : playerName,
                    gender : 1
                });
            }
            this.loaded = true
            CommonUtils.loadSceneWithProgress('mapscene');
        }
    }

    backToHome() {
        this.node.parent.removeChild(this.node);
    }

    nameInputCenter() {
        CommonUtils.editBoxCenter(this.playerName);
    }

    async confirmCode() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/invitation/verify', [this.codeInput.string]) as any;
        if (response.status == 0) {
            PlayerData.getInstance().inviteCode = this.codeInput.string;
            TipsManager.showMessage("邀请码填写成功");
            this.inviteCode.node.active = false;
        }
    }

    closeCodeInput() {
        this.inviteCode.node.active = false;
    }

    openCodeInput() {
        if (PlayerData.getInstance().inviteCode) {
            this.codeInput.string = PlayerData.getInstance().inviteCode + '';
        }
        this.inviteCode.node.active = true;
    }

    // update (dt) {}
}