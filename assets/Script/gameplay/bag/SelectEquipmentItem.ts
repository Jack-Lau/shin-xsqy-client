import ArticleItem from "./ArticleItem";
import BagItem from "../../bag/BagItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SelectEquipmentItem extends cc.Component {
    @property(cc.Sprite)
    flag: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(ArticleItem)
    item: ArticleItem = null;
    
    init (bagItem: BagItem) {
        let selected = R.prop('selected', bagItem);
        this.flag.node.active = (selected === true);
        this.item.init(bagItem);
        this.item.showStrengthening(bagItem);
        this.fcLabel.string = R.path(['data', 'baseFc'], bagItem)
        let name = bagItem.getItemDisplay().fmap(d => d.name);
        if (name.isValid()) {
            this.nameLabel.string = name.getValue();
        }
    }
}