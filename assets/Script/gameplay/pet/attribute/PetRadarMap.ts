import { Pet, PetDetail } from "../../../net/Protocol";
import { PetData, PetConfigItem } from "../PetData";

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
export default class PetRadarMap extends cc.Component {

    @property(cc.Label)
    qixue: cc.Label = null;
    @property(cc.Label)
    atkName: cc.Label = null;
    @property(cc.Label)
    atk: cc.Label = null;
    @property(cc.Label)
    wufang: cc.Label = null;
    @property(cc.Label)
    fafang: cc.Label = null;
    @property(cc.Label)
    sudu: cc.Label = null;

    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property(cc.Node)
    maxPoints: Array<cc.Node> = [];

    onLoad() {
        cc.view.enableAntiAlias(true);
    }
    async init(petDetail: PetDetail) {
        let pet = petDetail.pet;
        this.qixue.string = '3333';
        let config = await PetData.getConfigById(pet.definitionId);
        let isMagic = config.isValid() ? config.getValue().isMagic : false;
        if (isMagic) {
            this.atkName.string = '攻击';
        } else {
            this.atkName.string = '攻击';
        }
        this.qixue.string = pet.aptitudeHp.toString();
        this.atk.string = pet.aptitudeAtk.toString();
        this.wufang.string = pet.aptitudePdef.toString();
        this.fafang.string = pet.aptitudeMdef.toString();
        this.sudu.string = pet.aptitudeSpd.toString();
        this.toGraphics(pet);
    }

    async toGraphics(pet: Pet) {
        this.graphics.clear();
        let targetpoint;
        let startPoint;
        let config = await PetData.getConfigById(pet.definitionId);
        if (config.isValid()) {
            let petcoy = config.getValue();
            this.maxPoints.forEach((point, index) => {
                switch (index) {
                    case 0:
                        targetpoint = this.getTargetPoint(this.maxPoints[index].position, pet.aptitudeAtk, petcoy.atkApt.max, petcoy.atkApt.min);
                        break;
                    case 1:
                        targetpoint = this.getTargetPoint(this.maxPoints[index].position, pet.aptitudePdef, petcoy.pDefApt.max, petcoy.atkApt.min);
                        break;
                    case 2:
                        targetpoint = this.getTargetPoint(this.maxPoints[index].position, pet.aptitudeSpd, petcoy.spdApt.max, petcoy.atkApt.min);
                        break;
                    case 3:
                        targetpoint = this.getTargetPoint(this.maxPoints[index].position, pet.aptitudeMdef, petcoy.mDefApt.max, petcoy.atkApt.min);
                        break;
                    case 4:
                        targetpoint = this.getTargetPoint(this.maxPoints[index].position, pet.aptitudeHp, petcoy.lifeApt.max, petcoy.atkApt.min);
                        break;
                }
                if (index == 0) {
                    this.graphics.moveTo(targetpoint.x, targetpoint.y);
                    startPoint = point;
                } else {
                    this.graphics.lineTo(targetpoint.x, targetpoint.y);
                }
            });
            this.graphics.fillColor = this.getColorByColor(petcoy.color);
            this.graphics.fill();
            //this.graphics.lineTo(startPoint.x,startPoint.y);
            //this.graphics.stroke();
        }


    }

    getTargetPoint(maxPoint: cc.Vec2 | cc.Vec3, m: number, maxAptitude: number, minAptitude: number) {
        let target = (m - minAptitude) / (maxAptitude - minAptitude);
        let pointX = maxPoint.x - 0;
        let pointy = maxPoint.y - 0;
        return cc.v2(pointX * target, pointy * target);
    }

    getColorByColor(color: number) {
        const getHex = (color: number) => {
            switch (color) {
                case 2: return '#8bf457'
                case 3: return '#81e6ff'
                case 4: return '#df99ff'
                case 5: return '#ffc170'
                case 6: return '#fffd6d'
                default: return '#ffffff'
            }
        }
        let result = new cc.Color();
        result = cc.Color.fromHEX(result, getHex(color))
        return result;
    }
}
