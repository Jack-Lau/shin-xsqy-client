// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { PetData } from "../PetData";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
import PlayerData from "../../../data/PlayerData";
import PetAttributeModelling from "../attribute/PetAttributeModelling";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PetSoulWashPanel extends cc.Component {
	
	@property(PetAttributeModelling)
    petModelling: PetAttributeModelling = null;
	
    @property(cc.Label)
    attr1Label: cc.Label = null;	
    @property(cc.Label)
    attr2Label: cc.Label = null;	
    @property(cc.Label)
    attr3Label: cc.Label = null;
    @property(cc.Label)
    attr4Label: cc.Label = null;	
    @property(cc.Label)
    attr5Label: cc.Label = null;	
    @property(cc.Label)
    attr6Label: cc.Label = null;
	
    @property(cc.Label)
    newAttr1Label: cc.Label = null;	
    @property(cc.Label)
    newAttr2Label: cc.Label = null;	
    @property(cc.Label)
    newAttr3Label: cc.Label = null;
    @property(cc.Label)
    newAttr4Label: cc.Label = null;	
    @property(cc.Label)
    newAttr5Label: cc.Label = null;	
    @property(cc.Label)
    newAttr6Label: cc.Label = null;
	
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;

	@property(cc.Button)
	washBtn: cc.Button = null;
	@property(cc.Button)
	closeBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property(cc.Sprite)
    washEffect: cc.Sprite = null;
	
	petDetail = null;
	pet = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.washBtn.node.on(cc.Node.EventType.TOUCH_END, this.wash.bind(this));
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
	}
	
	async init(petDetail: any) {
		this.pet = petDetail.pet;
		this.setModel(petDetail);
		this.refresh(this.pet);
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
	}
	
	async setModel(petDetail: any) {
		this.petDetail = petDetail;
		await this.petModelling.setData(petDetail, this);
	}
	
	async refresh(pet: any) {
		let petSoulLevel = await ConfigUtils.getConfigJson('PetSoulLevel');
		let petSoulName = await ConfigUtils.getConfigJson('PetSoulName');
		let level = pet.soulLevel;
		//
		let soulName_1 = pet.soulName_1;
		if (soulName_1 != null) {
			let soulNameId_1 = (pet.soulNameId_1 != null ? pet.soulNameId_1 : 0);
			this.newAttr1Label.string = soulName_1;
			this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_1].color));
		} else {
			this.newAttr1Label.string = '无';
			this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_2 = pet.soulName_2;
		if (soulName_2 != null) {
			let soulNameId_2 = (pet.soulNameId_2 != null ? pet.soulNameId_2 : 0);
			this.newAttr2Label.string = soulName_2;
			this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_2].color));
		} else {
			this.newAttr2Label.string = '无';
			this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_3 = pet.soulName_3;
		if (soulName_3 != null) {
			let soulNameId_3 = (pet.soulNameId_3 != null ? pet.soulNameId_3 : 0);
			this.newAttr3Label.string = soulName_3;
			this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_3].color));
		} else {
			this.newAttr3Label.string = '无';
			this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_4 = pet.soulName_4;
		if (soulName_4 != null) {
			let soulNameId_4 = (pet.soulNameId_4 != null ? pet.soulNameId_4 : 0);
			this.newAttr4Label.string = soulName_4;
			this.newAttr4Label.node.color = cc.Color.fromHEX(this.newAttr4Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_4].color));
		} else {
			this.newAttr4Label.string = '无';
			this.newAttr4Label.node.color = cc.Color.fromHEX(this.newAttr4Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_5 = pet.soulName_5;
		if (soulName_5 != null) {
			let soulNameId_5 = (pet.soulNameId_5 != null ? pet.soulNameId_5 : 0);
			this.newAttr5Label.string = soulName_5;
			this.newAttr5Label.node.color = cc.Color.fromHEX(this.newAttr5Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_5].color));
		} else {
			this.newAttr5Label.string = '无';
			this.newAttr5Label.node.color = cc.Color.fromHEX(this.newAttr5Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_6 = pet.soulName_6;
		if (soulName_6 != null) {
			let soulNameId_6 = (pet.soulNameId_6 != null ? pet.soulNameId_6 : 0);
			this.newAttr6Label.string = soulName_6;
			this.newAttr6Label.node.color = cc.Color.fromHEX(this.newAttr6Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_6].color));
		} else {
			this.newAttr6Label.string = '无';
			this.newAttr6Label.node.color = cc.Color.fromHEX(this.newAttr6Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		//
		soulName_1 = this.pet.soulName_1;
		if (soulName_1 != null) {
			soulNameId_1 = (this.pet.soulNameId_1 != null ? this.pet.soulNameId_1 : 0);
			this.attr1Label.string = soulName_1;
			this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_1].color));
		} else {
			this.attr1Label.string = '无';
			this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		soulName_2 = this.pet.soulName_2;
		if (soulName_2 != null) {
			soulNameId_2 = (this.pet.soulNameId_2 != null ? this.pet.soulNameId_2 : 0);
			this.attr2Label.string = soulName_2;
			this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_2].color));
		} else {
			this.attr2Label.string = '无';
			this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		soulName_3 = this.pet.soulName_3;
		if (soulName_3 != null) {
			soulNameId_3 = (this.pet.soulNameId_3 != null ? this.pet.soulNameId_3 : 0);
			this.attr3Label.string = soulName_3;
			this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_3].color));
		} else {
			this.attr3Label.string = '无';
			this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		soulName_4 = this.pet.soulName_4;
		if (soulName_4 != null) {
			soulNameId_4 = (this.pet.soulNameId_4 != null ? this.pet.soulNameId_4 : 0);
			this.attr4Label.string = soulName_4;
			this.attr4Label.node.color = cc.Color.fromHEX(this.attr4Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_4].color));
		} else {
			this.attr4Label.string = '无';
			this.attr4Label.node.color = cc.Color.fromHEX(this.attr4Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		soulName_5 = this.pet.soulName_5;
		if (soulName_5 != null) {
			soulNameId_5 = (this.pet.soulNameId_5 != null ? this.pet.soulNameId_5 : 0);
			this.attr5Label.string = soulName_5;
			this.attr5Label.node.color = cc.Color.fromHEX(this.attr5Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_5].color));
		} else {
			this.attr5Label.string = '无';
			this.attr5Label.node.color = cc.Color.fromHEX(this.attr5Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		soulName_6 = this.pet.soulName_6;
		if (soulName_6 != null) {
			soulNameId_6 = (this.pet.soulNameId_6 != null ? this.pet.soulNameId_6 : 0);
			this.attr6Label.string = soulName_6;
			this.attr6Label.node.color = cc.Color.fromHEX(this.attr6Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_6].color));
		} else {
			this.attr6Label.string = '无';
			this.attr6Label.node.color = cc.Color.fromHEX(this.attr6Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		//
        let own = PlayerData.getInstance().ybAmount;
        this.ownLabel.string = String(own);
        const cost = 10000;
        this.costLabel.string = '/' + cost;
        this.ownLabel.node.color = cc.Color.fromHEX(this.ownLabel.node.color, cost > own ? '#ff5050' : '#0C6D08')
		//
		this.pet = pet;
	}
	
	async wash() {
        const COST = 10000;
        if (PlayerData.getInstance().ybAmount < COST) {
            TipsManager.showMessage('所需的元宝不足，快去赚些吧');
            return;
        }
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/wash', [this.pet.id]);
		if (response.status === 0) {
            this.washEffect.node.active = true;
            this.washEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.5);
            this.washEffect.node.active = false;
			//
			TipsManager.showMessage('洗炼成功，附魂的级别和种类发生了变化！');
            PetData.updatePetInfo({ pet: response.content, parameters: [] });
            PlayerData.getInstance().updateFc();
			this.refresh(response.content);
		}
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.2, 1);
		this.node.runAction(cc.sequence(fadeAction, cc.callFunc(this.closePanel.bind(this))));
	}
	
	closePanel() {
		CommonUtils.safeRemove(this.node);
	}

    // update (dt) {}
}
