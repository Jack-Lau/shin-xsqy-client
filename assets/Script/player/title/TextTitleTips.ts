import ItemWithEffect from "../../base/ItemWithEffect";
import { ItemQuality } from "../../bag/ItemConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import { PetData } from "../../gameplay/pet/PetData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class TextTitleTips extends cc.Component {
    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    qualityLabel: cc.Label = null;
    
    @property(cc.Label)
    attr1Label: cc.Label = null;
    @property(cc.Label)
    attr1ValueLabel: cc.Label = null;
    @property(cc.Label)
    attr2Label: cc.Label = null;
    @property(cc.Label)
    attr2ValueLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    fcValueLabel: cc.Label = null;
    
    @property(cc.RichText)
    descriptionRT: cc.RichText = null;
    
    start() {
    
    }
    
    async init(config, serialNumber) {
        let quality = PetData.getQualityByColor(config.color);
        this.item.frame.init(quality, quality == ItemQuality.Orange);
        this.initByQuality(quality);
        
        this.nameLabel.string = config.name;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(quality))
        this.attr1Label.string = R.path(['attribute', 0, 'name'], config)
        	.replace('最大生命', '气血')
        	.replace("物伤", "外伤")
        	.replace("物防", "外防")
        	.replace("法伤", "内伤")
        	.replace("法防", "内防")
        	.replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
			.replace("格挡率", "招架率")
            .replace("暴击效果", "暴效");
        this.attr1ValueLabel.string = '+' + (R.path(['attribute', 0, 'value'], config) < 1 
        	? R.path(['attribute', 0, 'value'], config) * 100 + '%' : R.path(['attribute', 0, 'value'], config));
        
        this.attr2Label.string = R.path(['attribute', 1, 'name'], config)
        	.replace('最大生命', '气血')
        	.replace("物伤", "外伤")
        	.replace("物防", "外防")
        	.replace("法伤", "内伤")
        	.replace("法防", "内防")
        	.replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
			.replace("格挡率", "招架率")
            .replace("暴击效果", "暴效") ;
        this.attr2ValueLabel.string = '+' + (R.path(['attribute', 1, 'value'], config) < 1 
        	? R.path(['attribute', 1, 'value'], config) * 100 + '%' : R.path(['attribute', 1, 'value'], config));
        
        this.fcLabel.string = '战力';
        this.fcValueLabel.string = '+' + R.prop('fc', config);
        this.descriptionRT.string = config.description;
    }
    
    initByQuality(color: number) {
        switch (color) {
            case 1: {
                this.qualityLabel.string = '普通品质';
                break;
            }
            case 2: {
                this.qualityLabel.string = '优秀品质';
                break;
            }
            case 3: {
                this.qualityLabel.string = '精良品质';
                break;
            }
            case 4: {
                this.qualityLabel.string = '史诗品质';
                break;
            }
            case 5: {
                this.qualityLabel.string = '传说品质';
                break;
            }
            case 6: {
                this.qualityLabel.string = '无双品质';
                break;
            }
            default: {
                this.qualityLabel.string = '普通品质';
            }
        }
    }
}
