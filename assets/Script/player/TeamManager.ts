import Optional from "../cocosExtend/Optional";
import Partner from "./Partner";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { StepDirection } from "../map/PathStep";
import { NetUtils } from "../net/NetUtils";
import { PartyComplex, PlayerDetail, Equipment, Fashion, FashionDye } from "../net/Protocol";
import { CommonUtils } from "../utils/CommonUtils";

export interface StepRecord {
    deltaX: number;
    deltaY: number;
    direction: StepDirection;
    isMasked: boolean;
}

export default class TeamManager {
    private static _instance: TeamManager = null;
    partner1: Optional<Partner> = new Optional<Partner>();
    partner2: Optional<Partner> = new Optional<Partner>();

    stepRecords: Array<StepRecord> = [];
    readonly P1_INDEX: number = 14;
    readonly P2_INDEX: number = 29;
    readonly MAX_LENGTH: number = 30;

    private constructor() {
        EventDispatcher.on(Notify.TEAMMATE_CHANGED, this.onTeammateChange);
    }
    
    public static getInstance(): TeamManager {
        if (!this._instance) {
            this._instance = new TeamManager();
        }
        return this._instance;
    }

    async init() {
        let node1 = this.partner1.monadBind(x => x.getNode());
        if (node1.isValid()) {
            CommonUtils.safeRemove(node1.getValue());
        }
        let node2 = this.partner2.monadBind(x => x.getNode());
        if (node2.isValid()) {
            CommonUtils.safeRemove(node2.getValue());
        }
        this.partner1 = new Optional<Partner>();
        this.partner2 = new Optional<Partner>();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/party/view/myself', []);
        if (response.status === 0) {
            let info = response.content as PartyComplex;
            let ids = info.supportRelations.map(x => x.supporterAccountId);
            if (ids.length > 0) {
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewDetail', [ids.join(',')]);
                if (response2.status === 0) {
                    let partnerInfo = response2.content as Array<PlayerDetail>;
                    await CommonUtils.asyncForEach(partnerInfo, async (ele: PlayerDetail, index) => {
                        let info = {
                            'accountId': ele.player.accountId,
                            'playerName': ele.player.playerName,
                            'prefabId': ele.player.prefabId,
                            'schoolId': new Optional<number>(ele.schoolId),
                            'weaponId': new Optional<Equipment>(R.prop(0, R.filter(x => R.prop('id', x) == ele.playerRelation.handEquipmentId, ele.equipments))).fmap(x => x.definitionId),
                            'level': ele.player.playerLevel,
                            'fc': ele.player.fc,
                            'title': ele.title,
                            'fashion': new Optional<Fashion>(ele.fashion),
                            'fashionDye': new Optional<FashionDye>(ele.fashionDye)
                        }
                        if (index == 0) {
                            let p = new Partner();
                            await p.init(info);
                            this.partner1 = new Optional<Partner>(p);
                        } else if (index == 1) {
                            let p = new Partner();
                            await p.init(info);
                            this.partner2 = new Optional<Partner>(p);
                        }
                    });
                    EventDispatcher.dispatch(Notify.REFRESH_TEAM_PARTNER, {});
                    this.stepRecords.length = 0;
                }
            }
        }
    }

    getStepRecord(index): Optional<StepRecord> {
        return new Optional<StepRecord>(R.prop(index, this.stepRecords));
    }

    addPathRecord(stepRecord: StepRecord) {
        let r1 = this.getStepRecord(this.P1_INDEX);
        let r2 = this.getStepRecord(this.P2_INDEX);
        if (!this.partner1.isValid() && !this.partner1.isValid()) {
            return;
        }
        if (r1.isValid() && this.partner1.isValid()) {
            this.partner1.getValue().move(r1.getValue());
        }
        if (r2.isValid() && this.partner2.isValid()) {
            this.partner2.getValue().move(r2.getValue());
        }
        while (this.stepRecords.length > this.MAX_LENGTH) {
            this.stepRecords.pop();
        }
        this.stepRecords.unshift(stepRecord);
    } 

    changeToStand() {
        if (this.partner1.isValid()) {
            this.partner1.getValue().player.changeToStand();
        }
        if (this.partner2.isValid()) {
            this.partner2.getValue().player.changeToStand();
        }
    }

    clearRecord() {
        this.stepRecords.length = 0;
    }

    onTeammateChange = function() {
        this.init();
    }.bind(this);
}