// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { ResUtils } from "../../utils/ResUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FishingDetailPanel extends cc.Component {
	
	@property([cc.Label])
	fishName: Array<cc.Label> = [];
	@property([cc.Label])
	gram: Array<cc.Label> = [];
	@property([cc.Label])
	gainCurrencyAmount: Array<cc.Label> = [];
	@property(cc.Label)
	currentPage: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	prevBtn: cc.Button = null;
	@property(cc.Button)
	nextBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property([cc.Sprite])
	gainCurrencyType: Array<cc.Sprite> = [];
	
	fishCategory = null;
	fishingOnceRecords = null;
	currentIndex = 1;
	maxIndex = 1;
	
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
		this.prevBtn.node.on(cc.Node.EventType.TOUCH_END, this.prevClick.bind(this));
		this.nextBtn.node.on(cc.Node.EventType.TOUCH_END, this.nextClick.bind(this));
	}

	async init(records : any) {
		this.fishingOnceRecords = records;
		this.fishCategory = await ConfigUtils.getConfigJson('FishCategory');
		//
		if (Math.floor(this.fishingOnceRecords.length / 5) * 5 == this.fishingOnceRecords.length && this.fishingOnceRecords.length > 0) {
			this.maxIndex = Math.floor(this.fishingOnceRecords.length / 5);
		} else {
			this.maxIndex = Math.floor(this.fishingOnceRecords.length / 5 + 1);
		}
		this.refreshPage();
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
	}
	
	async refreshPage() {
		this.currentPage.string = this.currentIndex + '/' + this.maxIndex;
		let recordStart = (this.currentIndex - 1) * 5;
		for (let i = 0; i < 5; i ++) {
			let recordIndex = recordStart + i;
			if (recordIndex < this.fishingOnceRecords.length && this.fishingOnceRecords[recordIndex].finish == true) {
				let record = this.fishingOnceRecords[recordIndex];
				let fc = this.fishCategory[record.fishCategoryId];
				this.fishName[i].string = fc.name;
				this.fishName[i].node.color = cc.Color.fromHEX(this.fishName[i].node.color, CommonUtils.getPetTipColorByColor(fc.color));
				this.gram[i].string = '重 ' + record.gram + '两';
				this.gainCurrencyType[i].spriteFrame = await ResUtils.getSmallCurrencyIconbyId(record.awardCurrencyId);
				this.gainCurrencyAmount[i].string = record.awardCurrencyId == 151 ? record.awardCurrencyAmount / 1000 : record.awardCurrencyAmount;
			} else {
				this.fishName[i].string = '？？？？';
				this.fishName[i].node.color = cc.Color.fromHEX(this.fishName[i].node.color, '#4B0A08');
				this.gram[i].string = '？？？？';
				this.gainCurrencyType[i].spriteFrame = await ResUtils.getSmallCurrencyIconbyId(191);
				this.gainCurrencyAmount[i].string = '？？？？';
			}
		}
	}
	
	async prevClick() {
		this.currentIndex -- ;
		if (this.currentIndex < 1) {
			this.currentIndex = 1;
		}
		this.refreshPage();
	}
	
	async nextClick() {
		this.currentIndex ++ ;
		if (this.currentIndex > this.maxIndex) {
			this.currentIndex = this.maxIndex;
		}
		this.refreshPage();
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
