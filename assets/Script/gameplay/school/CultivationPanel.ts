import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { ResUtils } from "../../utils/ResUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PlayerData from "../../data/PlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CultivationPanel extends cc.Component {

	@property(cc.Node)
	cultivationNode_1: cc.Node = null;
	@property(cc.Node)
	cultivationNode_2: cc.Node = null;
	@property(cc.Node)
	cultivationNode_3: cc.Node = null;
	@property(cc.Node)
	cultivationNode_4: cc.Node = null;
	@property(cc.Node)
	cultivationNode_5: cc.Node = null;

	@property(cc.Label)
	cultivationName_1: cc.Label = null;
	@property(cc.Label)
	cultivationName_2: cc.Label = null;
	@property(cc.Label)
	cultivationName_3: cc.Label = null;
	@property(cc.Label)
	cultivationName_4: cc.Label = null;
	@property(cc.Label)
	cultivationName_5: cc.Label = null;

	@property(cc.Sprite)
	cultivationProgress_1: cc.Sprite = null;
	@property(cc.Sprite)
	cultivationProgress_2: cc.Sprite = null;
	@property(cc.Sprite)
	cultivationProgress_3: cc.Sprite = null;
	@property(cc.Sprite)
	cultivationProgress_4: cc.Sprite = null;
	@property(cc.Sprite)
	cultivationProgress_5: cc.Sprite = null;

	@property(cc.Label)
	cultivationExp_1: cc.Label = null;
	@property(cc.Label)
	cultivationExp_2: cc.Label = null;
	@property(cc.Label)
	cultivationExp_3: cc.Label = null;
	@property(cc.Label)
	cultivationExp_4: cc.Label = null;
	@property(cc.Label)
	cultivationExp_5: cc.Label = null;

	@property(cc.Button)
	cultivate_1: cc.Button = null;
	@property(cc.Button)
	cultivate_2: cc.Button = null;
	@property(cc.Button)
	cultivate_3: cc.Button = null;
	@property(cc.Button)
	cultivate_4: cc.Button = null;
	@property(cc.Button)
	cultivate_5: cc.Button = null;

	@property(cc.Label)
	currency_own: cc.Label = null;
	@property(cc.Label)
	currency_cost: cc.Label = null;

	@property(cc.Button)
	helpBtn: cc.Button = null;

	cultivationRecord = null;
	cultivationConsumption = null;

	myCurrency = 0;
	currencyPerCost = 0;

	start() {
		this.init();
		this.initEvents();
	}

	async init() {
		this.cultivationConsumption = [];
		let config = await ConfigUtils.getConfigJson('SchoolCultivationConsumption');
		for (let key in config) {
			let value = config[key];
			this.cultivationConsumption.push(value);
		}
		//
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/cultivation/get', []) as any;
		if (response.status === 0) {
			this.cultivationRecord = response.content;
		}
		//
		this.refreshCultivationRecord();
		this.refreshCurrency();
	}

	initEvents() {
		this.cultivationNode_1.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivationNode.bind(this, 1)));
		this.cultivationNode_2.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivationNode.bind(this, 2)));
		this.cultivationNode_3.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivationNode.bind(this, 3)));
		this.cultivationNode_4.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivationNode.bind(this, 4)));
		this.cultivationNode_5.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivationNode.bind(this, 5)));
		//
		this.cultivate_1.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivate.bind(this, 1)));
		this.cultivate_2.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivate.bind(this, 2)));
		this.cultivate_3.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivate.bind(this, 3)));
		this.cultivate_4.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivate.bind(this, 4)));
		this.cultivate_5.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onCultivate.bind(this, 5)));
		//
		this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 39));
	}

	async onCultivationNode(index: number) {
		switch (index) {
			case 1: {
				TipsManager.showMessage('自身招式力提升' + this.cultivationRecord.playerAtkLevel * 0.1 + '%');
				break;
			}
			case 2: {
				TipsManager.showMessage('自身抵抗力提升' + this.cultivationRecord.playerDefLevel * 0.1 + '%');
				break;
			}
			case 3: {
				TipsManager.showMessage('出战宠物招式力提升' + this.cultivationRecord.petAtkLevel * 0.1 + '%');
				break;
			}
			case 4: {
				TipsManager.showMessage('出战宠物抵抗力提升' + this.cultivationRecord.petDefLevel * 0.1 + '%');
				break;
			}
			case 5: {
				TipsManager.showMessage('自身神佑率提升' + this.cultivationRecord.playerReviveLevel * 0.04 + '%');
				break;
			}
		}
	}

	async onCultivate(index: number) {
		switch (index) {
			case 1: {
				this.currencyPerCost = Math.round(this.cultivationRecord.playerAtkLevel / 20 + 1) * 4;
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/cultivation/make`, [index, this.currencyPerCost]) as any;
				if (response.status === 0) {
					let record = response.content;
					if (this.cultivationRecord.playerAtkLevel < record.playerAtkLevel) {
						TipsManager.showMessage('恭喜！您的招式力修炼等级提升了！！！');
						PlayerData.getInstance().updateFc();
					} else {
						TipsManager.showMessage('您的招式力修炼经验增加了' + this.currencyPerCost * 10 + '点！');
					}
					this.cultivationRecord = record;
				}
				break;
			}
			case 2: {
				this.currencyPerCost = Math.round(this.cultivationRecord.playerDefLevel / 20 + 1) * 2;
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/cultivation/make`, [index, this.currencyPerCost]) as any;
				if (response.status === 0) {
					let record = response.content;
					if (this.cultivationRecord.playerDefLevel < record.playerDefLevel) {
						TipsManager.showMessage('恭喜！您的抵抗力修炼等级提升了！！！');
						PlayerData.getInstance().updateFc();
					} else {
						TipsManager.showMessage('您的抵抗力修炼经验增加了' + this.currencyPerCost * 10 + '点！');
					}
					this.cultivationRecord = record;
				}
				break;
			}
			case 3: {
				this.currencyPerCost = Math.round(this.cultivationRecord.petAtkLevel / 20 + 1) * 12;
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/cultivation/make`, [index, this.currencyPerCost]) as any;
				if (response.status === 0) {
					let record = response.content;
					if (this.cultivationRecord.petAtkLevel < record.petAtkLevel) {
						TipsManager.showMessage('恭喜！您的御兽招式力修炼等级提升了！！！');
						PlayerData.getInstance().updateFc();
					} else {
						TipsManager.showMessage('您的御兽招式力修炼经验增加了' + this.currencyPerCost * 10 + '点！');
					}
					this.cultivationRecord = record;
				}
				break;
			}
			case 4: {
				this.currencyPerCost = Math.round(this.cultivationRecord.petDefLevel / 20 + 1) * 6;
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/cultivation/make`, [index, this.currencyPerCost]) as any;
				if (response.status === 0) {
					let record = response.content;
					if (this.cultivationRecord.petDefLevel < record.petDefLevel) {
						TipsManager.showMessage('恭喜！您的御兽抵抗力修炼等级提升了！！！');
						PlayerData.getInstance().updateFc();
					} else {
						TipsManager.showMessage('您的御兽抵抗力修炼经验增加了' + this.currencyPerCost * 10 + '点！');
					}
					this.cultivationRecord = record;
				}
				break;
			}
			case 5: {
				this.currencyPerCost = Math.round(this.cultivationRecord.playerReviveLevel / 20 + 1) * 24;
				let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, `/cultivation/make`, [index, this.currencyPerCost]) as any;
				if (response.status === 0) {
					let record = response.content;
					if (this.cultivationRecord.playerReviveLevel < record.playerReviveLevel) {
						TipsManager.showMessage('恭喜！您的再临修炼等级提升了！！！');
						PlayerData.getInstance().updateFc();
					} else {
						TipsManager.showMessage('您的再临修炼经验增加了' + this.currencyPerCost * 10 + '点！');
					}
					this.cultivationRecord = record;
				}
				break;
			}
		}
		//
		this.refreshCultivationRecord();
		this.refreshCurrency();
	}

	async refreshCultivationRecord() {
		this.cultivationName_1.string = '招式力修炼 等级' + this.cultivationRecord.playerAtkLevel + '/' + this.cultivationConsumption.length;
		this.cultivationName_2.string = '抵抗力修炼 等级' + this.cultivationRecord.playerDefLevel + '/' + this.cultivationConsumption.length;
		this.cultivationName_3.string = '御兽招式力修炼 等级' + this.cultivationRecord.petAtkLevel + '/' + this.cultivationConsumption.length;
		this.cultivationName_4.string = '御兽抵抗力修炼 等级' + this.cultivationRecord.petDefLevel + '/' + this.cultivationConsumption.length;
		this.cultivationName_5.string = '再临修炼 等级' + this.cultivationRecord.playerReviveLevel + '/' + this.cultivationConsumption.length;
		//
		if (this.cultivationRecord.playerAtkLevel == this.cultivationConsumption.length) {
			this.cultivationProgress_1.node.width = 283;
		} else {
			this.cultivationProgress_1.node.width = 283 * (this.cultivationRecord.playerAtkCurrentExp / this.cultivationConsumption[this.cultivationRecord.playerAtkLevel].player_atk_exp);
		}
		if (this.cultivationRecord.playerDefLevel == this.cultivationConsumption.length) {
			this.cultivationProgress_2.node.width = 283;
		} else {
			this.cultivationProgress_2.node.width = 283 * (this.cultivationRecord.playerDefCurrentExp / this.cultivationConsumption[this.cultivationRecord.playerDefLevel].player_def_exp);
		}
		if (this.cultivationRecord.petAtkLevel == this.cultivationConsumption.length) {
			this.cultivationProgress_3.node.width = 283;
		} else {
			this.cultivationProgress_3.node.width = 283 * (this.cultivationRecord.petAtkCurrentExp / this.cultivationConsumption[this.cultivationRecord.petAtkLevel].pet_atk_exp);
		}
		if (this.cultivationRecord.petDefLevel == this.cultivationConsumption.length) {
			this.cultivationProgress_4.node.width = 283;
		} else {
			this.cultivationProgress_4.node.width = 283 * (this.cultivationRecord.petDefCurrentExp / this.cultivationConsumption[this.cultivationRecord.petDefLevel].pet_def_exp);
		}
		if (this.cultivationRecord.playerReviveLevel == this.cultivationConsumption.length) {
			this.cultivationProgress_5.node.width = 283;
		} else {
			this.cultivationProgress_5.node.width = 283 * (this.cultivationRecord.playerReviveCurrentExp / this.cultivationConsumption[this.cultivationRecord.playerReviveLevel].player_revive_exp);
		}
		//
		if (this.cultivationRecord.playerAtkLevel == this.cultivationConsumption.length) {
			this.cultivationExp_1.string = '0 / 114514';
		} else {
			this.cultivationExp_1.string = this.cultivationRecord.playerAtkCurrentExp + ' / ' + this.cultivationConsumption[this.cultivationRecord.playerAtkLevel].player_atk_exp;
		}
		if (this.cultivationRecord.playerDefLevel == this.cultivationConsumption.length) {
			this.cultivationExp_2.string = '0 / 114514';
		} else {
			this.cultivationExp_2.string = this.cultivationRecord.playerDefCurrentExp + ' / ' + this.cultivationConsumption[this.cultivationRecord.playerDefLevel].player_def_exp;
		}
		if (this.cultivationRecord.petAtkLevel == this.cultivationConsumption.length) {
			this.cultivationExp_3.string = '0 / 114514';
		} else {
			this.cultivationExp_3.string = this.cultivationRecord.petAtkCurrentExp + ' / ' + this.cultivationConsumption[this.cultivationRecord.petAtkLevel].pet_atk_exp;
		}
		if (this.cultivationRecord.petDefLevel == this.cultivationConsumption.length) {
			this.cultivationExp_4.string = '0 / 114514';
		} else {
			this.cultivationExp_4.string = this.cultivationRecord.petDefCurrentExp + ' / ' + this.cultivationConsumption[this.cultivationRecord.petDefLevel].pet_def_exp;
		}
		if (this.cultivationRecord.playerReviveLevel == this.cultivationConsumption.length) {
			this.cultivationExp_5.string = '0 / 114514';
		} else {
			this.cultivationExp_5.string = this.cultivationRecord.playerReviveCurrentExp + ' / ' + this.cultivationConsumption[this.cultivationRecord.playerReviveLevel].player_revive_exp;
		}
	}

	async refreshCurrency() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${185}`, []) as any;
		if (response.status === 0) {
			this.myCurrency = R.prop('amount', response.content);
		}
		if (this.myCurrency < this.currencyPerCost) {
			this.currency_own.node.color = cc.color(255, 26, 0);
		} else {
			this.currency_own.node.color = cc.color(6, 127, 40);
		}
		this.currency_own.string = this.myCurrency.toString();
		this.currency_cost.string = '/' + this.currencyPerCost.toString();
	}

	// update (dt) {}
}