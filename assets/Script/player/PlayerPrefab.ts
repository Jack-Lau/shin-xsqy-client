import PlayerData from "../data/PlayerData";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import { CommonUtils } from "../utils/CommonUtils";
import { Equipment, Fashion, FashionDye } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";
import { ResUtils } from "../utils/ResUtils";
import { TitleConfig } from "./title/TitleConfig";
import FashionModel from "../gameplay/fashion/FashionModel";

const {ccclass, property} = cc._decorator;


// 角色Prefab
@ccclass
export default class PlayerPrefab extends cc.Component {
    @property(cc.Sprite)
    player: cc.Sprite = null;

    @property(cc.RichText)
    nameLabel: cc.RichText = null;
    // 称号
    @property(cc.RichText)
    titleRT: cc.RichText = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    @property(cc.Sprite)
    weapon: cc.Sprite = null;

    moveStatus: string = "";

    @property(cc.Sprite)
    autoFindPath: cc.Sprite = null;

    @property(FashionModel)
    fashionModel: FashionModel = null;

    initialDirection = 'stand_d'

    isFashion: boolean = false;

    fashion: Optional<Fashion> = Optional.Nothing<Fashion>();


    prefabId: number = 0;
    weaponId: number = 0;

    onLoad () {
        this.autoFindPath.node.active = false;
    }

    start () {

    }

    init () {

    }

    initNameLabel (schoolId: number, name: string) {
        this.nameLabel.string = "<img src=" + "'school_icon_" + schoolId + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + name + "<outline></b></color>";
    }

    async initTitle (titleId: Optional<number>) {
        if (!titleId.valid) {
            this.titleSp.node.active = this.titleRT.node.active = false;
        } else {
            let config = await TitleConfig.getConfigById(titleId.val);
            if (config.type == 1) { // 图片
                this.initPicTitle(config.picId);
            } else {
                this.initTextTitle(config.name);
            }
        }
    }

    private async initPicTitle(picId: number) {
        this.titleSp.node.active = true;
        this.titleRT.node.active = false;
        this.titleSp.spriteFrame = await ResUtils.getTitleIconById(picId);
    }

    private initTextTitle(title: string) {
        this.titleSp.node.active = false;
        this.titleRT.node.active = true;
        this.titleRT.string = "<color=#52A2FF><b><outline color=#131313 width=1>" + title + "<outline></b></color>";
    }

    getMoveStatus() {
        let status = this.moveStatus.split('_')[1]
        if (undefined == status) {
            status = 'D';
        }
        return status.toUpperCase();
    }

    changeMoveStatus(status: string) {
        if (status == this.moveStatus) {
            return;
        }
        this.moveStatus = status;
        if (this.isFashion) {
            this.fashionModel.playAnimation(status);
            return;
        }
        let scaleX = 1;
        if (status.indexOf('l') != -1) {
            status = status.replace('l', 'r');
            scaleX = -1;
        }
        let anchor = MovieclipUtils.getOffset(this.prefabId + '_' + status);
        let animation = this.player.getComponent(cc.Animation);
        animation.pause();
        let onPlay = function () {
            this.player.node.anchorX = anchor.x;
            this.player.node.anchorY = anchor.y;
            this.player.node.scaleX = scaleX;
            animation.off('play', onPlay);
        }.bind(this);
        animation.on('play', onPlay);
        animation.play(this.prefabId + '_' + status, 0);

        let animation2 = this.weapon.getComponent(cc.Animation);
        animation2.pause();
        let onPlay2 = function () {
            this.weapon.node.anchorX = anchor.x;
            this.weapon.node.anchorY = anchor.y;
            this.weapon.node.scaleX = scaleX;
            animation2.off('play', onPlay2);
        }.bind(this);
        animation2.on('play', onPlay2);
        animation2.play(this.weaponId + '_' + status);
    }

    changeToStand() {
        let status = this.moveStatus.replace('run', 'stand');
        this.changeMoveStatus(status);
    }

    initAsFashion (prefabId: number, weaponProtoId: Optional<number>, fashion: Fashion, dye: Optional<FashionDye>) {
        this.fashionModel.initAsNormal(prefabId, weaponProtoId, fashion.definitionId, dye);
    }

    initAnimation(prefabId: number, weaponProtoId: Optional<number>, fashion: Optional<Fashion>, dye: Optional<FashionDye>) {
        if (fashion.valid) {
            this.isFashion = true;
            this.fashionModel.node.active = true;
            this.player.node.active = false;
            this.weapon.node.active = false;
            this.fashion = fashion;
            this.initAsFashion(prefabId, weaponProtoId, fashion.val, dye);
        } else {
            this.isFashion = false;
            this.player.node.active = true;
            this.weapon.node.active = true;
            this.fashionModel.node.active = false;
            this.initMc(prefabId, weaponProtoId);
        }
    }

    initWithSingleDirection(prefabId: number, weaponProtoId: Optional<number>, fashion: Optional<Fashion>, dye: Optional<FashionDye>, direction: string) {
        if (fashion.valid) {
            this.isFashion = true;
            this.fashionModel.node.active = true;
            this.player.node.active = false;
            this.weapon.node.active = false;
            this.fashion = fashion;
            this.fashionModel.initByDirection(prefabId, weaponProtoId, fashion.val.definitionId, direction, dye);
        } else {
            this.isFashion = false;
            this.player.node.active = true;
            this.weapon.node.active = true;
            this.fashionModel.node.active = false;
            this.initMcWithSingleDirection(prefabId, weaponProtoId, direction);
        }
    }

    refreshDye(dye: Optional<FashionDye>) {
        if (this.isFashion && this.fashion.valid) {
            this.fashionModel.setDye(dye, this.fashion.val.definitionId);
        }
    }
	
	randomChangeMoveStatus() {
		let directions = ['stand_u', 'stand_lu', 'stand_ru', 'stand_l', 'stand_r', 'stand_ld', 'stand_rd'];
		let rand = CommonUtils.randomInt(0, 6);
        this.changeMoveStatus(directions[rand]);
	}

    async initMc(prefabId: number, definitionId: Optional<number>) {
        let weaponId = CommonUtils.getWeaponId(prefabId, definitionId);
        this.prefabId = prefabId;
        this.weaponId = weaponId;
        let _this = this;
        let playerMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(prefabId, 'stand_d', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_u', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_r', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_rd', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_ru', 10),
            MovieclipUtils.getMovieclip(prefabId, 'run_d', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_u', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_r', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_rd', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_ru', 15),
        ]);

        let weaponMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(weaponId, 'stand_d', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_u', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_r', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_rd', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_ru', 10),
            MovieclipUtils.getMovieclip(weaponId, 'run_d', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_u', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_r', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_rd', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_ru', 15)
        ]);
        playerMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.player.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });

        weaponMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.weapon.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });
		
		//
		this.randomChangeMoveStatus();
    }

    async initMcWithSingleDirection(prefabId: number, definitionId: Optional<number>, _direction: string) {
        let weaponId = CommonUtils.getWeaponId(prefabId, definitionId);
        this.prefabId = prefabId;
        this.weaponId = weaponId;
        let _this = this;
        let realDirection = 'stand_' + _direction;
        
        if (_direction.indexOf('l') != -1) {
            _direction = _direction.replace('l', 'r');
        }
        let direction = 'stand_' + _direction;
        let playerMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(prefabId, direction, 10),
        ]);

        let weaponMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(weaponId, direction, 10),
        ]);
        playerMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.player.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });

        weaponMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.weapon.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });

        this.changeMoveStatus(realDirection);
    }
}
