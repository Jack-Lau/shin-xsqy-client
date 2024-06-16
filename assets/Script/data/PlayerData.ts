import { KbdzpRecord, Equipment, PlayerDetail, Title, Fashion, FashionDye } from "../net/Protocol";
import { NetUtils } from "../net/NetUtils";
import DataObject from "./DataObject";
import { Binder } from "./Binder";
import { ReddotUtils } from "../utils/ReddotUtils";
import { CommonUtils } from "../utils/CommonUtils";
import FcUpEffect from "../base/effect/FcUpEffect";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import Optional from "../cocosExtend/Optional";
import BagData from "../bag/BagData";
import ItemConfig, { EquipmentPart } from "../bag/ItemConfig";
import { GameConfig } from "../config/GameConfig";


export default class PlayerData extends DataObject {
	
    private static _instance: PlayerData = null;
	
    prefabId: number = 4000002;
    playerName: string = '玩家名字';
    playerLevel: number = 0;
    genesis: boolean = false;
    _kbRecord: any = {};
    accountId: number = -1;
    schoolId: number = null;
    inviteCode: string = "";
    serialNumber: number = 1;
    samsaraCount = 0;
    createTime = null;
    onlineTimeCount = 0;
    
    // equipments

    _ybAmount = Binder.genProcedure(0, []);
    _kbAmount = Binder.genProcedure(0, []);
    phoneNumber = null;
    _fc: Binder.BindableObject = new Binder.BindableObject(0, []);
    _hyAmount: Binder.BindableObject = new Binder.BindableObject(0, []);

    equipments = {
        'weapon': new Optional<Equipment>(), 
        'head': new Optional<Equipment>(),
        'necklace': new Optional<Equipment>(),
        'clothes': new Optional<Equipment>(), 
        'belt': new Optional<Equipment>(), 
        'shoes': new Optional<Equipment>(), 
    }
    battlePetId1: Optional<number> = new Optional<number>();
    battlePetId2: Optional<number> = new Optional<number>();
    battlePetId3: Optional<number> = new Optional<number>();
    title: Optional<Title> = new Optional<Title>();
    fashion: Optional<Fashion> = Optional.Nothing<Fashion>();
    fashionDye: Optional<FashionDye> = Optional.Nothing<FashionDye>();
    equipedIds = [];

    inGame: boolean = false;
    effect_603: boolean = false;


    private constructor() {
        super(null);
        // setInterval(this.updateKbRecord.bind(this), 120 * 1000);
        EventDispatcher.on(Notify.PLYAER_WEAPON_CHANGE, this.updateFc.bind(this));
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlayerData();
        }
        return this._instance;
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/view/myself/detail', []) as any;
        if (response.status === 0) {
            let playerDetail = response.content as PlayerDetail;
            this.accountId = playerDetail.player.accountId;
            this.playerName = playerDetail.player.playerName;
            this.prefabId = playerDetail.player.prefabId;
            this.genesis = playerDetail.player.genesis;
            this.playerLevel = playerDetail.player.playerLevel;
            this.fc = playerDetail.player.fc;
            this.serialNumber = playerDetail.player.serialNumber;
            this.createTime = playerDetail.player.createTime;
            this.onlineTimeCount = playerDetail.player.onlineTimeCount;

            this.schoolId = playerDetail.schoolId;
            this.title = new Optional<Title>(playerDetail.title);
            this.fashion = new Optional<Fashion>(playerDetail.fashion);
            this.fashionDye = new Optional<FashionDye>(playerDetail.fashionDye);

            // 初始化装备
            playerDetail.equipments.forEach(ele => {
                let id = ele.id;
                this.equipedIds.push(id);
                let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(ele.definitionId);
                if (prototype.isValid()) {
                    let part = prototype.getValue().part;
                    switch (part) {
                        case EquipmentPart.Belt: { this.equipments['belt'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Clothes: { this.equipments['clothes'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Head: { this.equipments['head'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Necklace: { this.equipments['necklace'] = new Optional<Equipment>(ele); break; }
                        case EquipmentPart.Shoes: { 
                            this.equipments['shoes'] = new Optional<Equipment>(ele); 
                            this.checkEffect603(EquipmentPart.Shoes, ele);
                            break; 
                        }
                        case EquipmentPart.Weapon: { this.equipments['weapon'] = new Optional<Equipment>(ele); break; }
                    }
                }
            });

            // 初始化宠物战斗
            this.battlePetId1 = new Optional<number>(playerDetail.playerRelation.battlePetId1);
            this.battlePetId2 = new Optional<number>(playerDetail.playerRelation.battlePetId2);
            this.battlePetId3 = new Optional<number>(playerDetail.playerRelation.battlePetId3)
        }
    }


    async updateKbRecord() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/kbdzp/recoverEnergy', []) as any;
        if (response.content) {
            let kbRecord = response.content.record;
            kbRecord['energy'] = response.content.currencyRecord.amount;
            PlayerData.getInstance().kbRecord = kbRecord;
        }
    }

    async updateFc() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/player/updateFc', []) as any;
        if (response.status == 0) {
            let newFc = parseInt(response.content);
            if (this.fc != 0 && newFc > this.fc) {
                this.fc = newFc;
                this.showFcEffect()
            } else {
                this.fc = newFc;
            }
        }
    }

    async showFcEffect() {
        let prefab = await CommonUtils.getPanelPrefab('base/effect/fcUpEffect') as cc.Prefab;
        let fcUpEffect = cc.instantiate(prefab).getComponent(FcUpEffect);
        [fcUpEffect.node.x, fcUpEffect.node.y] = [0, -0.118 * CommonUtils.getViewHeight()];
        EventDispatcher.dispatch(Notify.SHOW_BONUS_EFFECT, {effect: fcUpEffect});
        fcUpEffect.play();
    }

    bind(attr, func) {
        this[attr] = Binder.addListener(this[attr], func);
    }


    set kbRecord(record) {
        ReddotUtils.checkKbWheel(record.energy);
        this._kbRecord = record;
    }

    get kbRecord() {
        return this._kbRecord;
    }

    get kbAmount() {
        return Math.floor(this._kbAmount("get") / 1000);
    }

    set kbAmount(value) {
        this._kbAmount = this._kbAmount("set", value);
    }

    get ybAmount() {
        return this._ybAmount("get");
    }

    set ybAmount(value) {
        this._ybAmount = this._ybAmount("set", value);
    }

    get fc() {
        return this._fc.getValue();
    }

    set fc(newVal) {
        this._fc.setValue(newVal);
    }

    get hyAmount() {
        return this._hyAmount.getValue();
    }

    set hyAmount(newValue) {
        this._hyAmount.setValue(newValue);
    }

    newBind(attr: string, func) {
        let obj = this[attr];
        if (obj instanceof Binder.BindableObject) {
            obj.addListener(func);
        }
    }

    checkEffect603(part: EquipmentPart, e: Equipment) {
        if (part == EquipmentPart.Shoes) {
            this.effect_603 = e.effectsText.indexOf('603') != -1;
        }
    }

    recheck() {
        this.effect_603 = this.equipments.shoes.fmap(x => x.effectsText.indexOf('603') != -1).getOrElse(false);
    }

    getSpeed() {
        if (this.effect_603) {
            return 1.2 * GameConfig.RUN_SPEED;
        } else {
            return GameConfig.RUN_SPEED;
        }
    } 

    setName (name: string) {
        this.playerName = name;
        EventDispatcher.dispatch(Notify.PLAYER_REFRESH_NAME, {name: name})
    }
}
