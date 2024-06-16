import { CommonUtils } from "../../utils/CommonUtils";
import { Web3Utils } from "../../net/Web3Utils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import AmountWidget from "../../base/AmountWidget";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import BagData from "../../bag/BagData";
import { Equipment, CurrencyStack, Pet, PetDetail, EquipmentWithdrawRequest, WithdrawRequest, DepositRequest, EquipmentDepositRequest, EquipmentDetail, PetWithdrawRequest, PetDepositRequest } from "../../net/Protocol";
import { ItemQuality } from "../../bag/ItemConfig";
import { WalletState, SelectInfo, ItemType, WalletItemState } from "./WalletPanelDataStructure";
import WalletChainItem from "./WalletChainItem";
import WalletBagItem from "./WalletBagItem";
import { EquipUtils } from "../../gameplay/equipment/utils/EquipmentUtils";
import { PetData } from "../../gameplay/pet/PetData";
import { PetUtils } from "../../gameplay/pet/PetUtils";
const { ccclass, property } = cc._decorator;


@ccclass
export default class WalletPanel extends cc.Component {
    @property(cc.Sprite)
    bagBg: cc.Sprite = null;
    @property(cc.Sprite)
    chainBg: cc.Sprite = null;
    @property(cc.ScrollView)
    chainScroll: cc.ScrollView = null;
    @property(cc.ScrollView)
    bagScroll: cc.ScrollView = null;
    @property(cc.Button)
    backBtn: cc.Button = null;
    @property(cc.Button)
    infoBtn: cc.Button = null;

    @property(cc.Prefab)
    chainItemPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    bagItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    amountWidget: cc.Node = null;
    @property(cc.Label)
    feeLabel: cc.Label = null;
    @property(cc.Label)
    totalLabel: cc.Label = null;

    @property(cc.Button)
    withdrawBtn: cc.Button = null;
    @property(cc.Button)
    chargeBtn: cc.Button = null;

    @property(cc.Sprite)
    upArrow: cc.Sprite = null;
    @property(cc.Sprite)
    downArrow: cc.Sprite = null;

    // 提现二次确认框
    @property(cc.Node)
    secondConfirm: cc.Node = null;
    @property(cc.Label)
    formulaLabel: cc.Label = null;
    @property(cc.Label)
    opWithdrawLabel: cc.Label = null;
    @property(cc.Label)
    opFeeLabel: cc.Label = null;
    @property(cc.Label)
    opTotalLabel: cc.Label = null;
    @property(cc.Button)
    opCancelBtn: cc.Button = null;
    @property(cc.Button)
    opConfirmBtn: cc.Button = null;
    @property(cc.Button)
    opCloseBtn: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.ToggleContainer)
    toggleContainer: cc.ToggleContainer = null;

    @property(cc.Sprite)
    bagEmptyFlag: cc.Sprite = null;

    @property(cc.Sprite)
    chainEmptyFlag: cc.Sprite = null;

    @property(cc.SpriteFrame)
    walletInfoTitle: cc.SpriteFrame = null;

    bagEmpty: boolean = false;
    chainEmpty: boolean = false;

    from: cc.Node = null;
    state: WalletState = WalletState.Withdraw;


    myChainBalance: number = 0;
    selectedData: PetDetail | Equipment | CurrencyStack = null;
    selectedType: ItemType = null;  // 当前选择的页签
    selectedState: WalletItemState = WalletItemState.Normal;
    withdrawEquipments: Array<EquipmentWithdrawRequest> = [];
    chargeEquipments: Array<EquipmentDepositRequest> = [];
    withdrawPets: Array<PetWithdrawRequest> = [];
    chargePets: Array<PetDepositRequest> = [];
    withdrawCurrencies: Array<WithdrawRequest> = [];
    chargeCurrencies: Array<DepositRequest> = [];

    start() {
        this.bagBg.node.height = (CommonUtils.getViewHeight() - 1366) / 2 + 490;
        this.chainBg.node.height = (CommonUtils.getViewHeight() - 1366) / 2 + 560;
        this.chainScroll.content.y = this.chainScroll.node.height / 2;
        this.bagScroll.content.y = this.bagScroll.node.height / 2;
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.opCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSecondConfirmBox.bind(this));
        this.opCancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSecondConfirmBox.bind(this));
        this.opConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.withdrawConfirm.bind(this));
        this.withdrawBtn.node.on(cc.Node.EventType.TOUCH_END, this.withdrawBtnOnClick.bind(this));
        this.chargeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.chargeBtnOnClick.bind(this)));
        this.infoBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(this.walletInfoTitle, 1));
        this.amountWidget.getComponent(AmountWidget).init(0, PlayerData.getInstance().kbAmount, this.amountOnChange.bind(this));
        EventDispatcher.on(Notify.WALLET_ITEM_ON_CLICK, this.walletItemOnClick);

        EventDispatcher.on(Notify.WALLET_OPERATION_COMPLETE, this.operationComplete);

        this.toggleContainer.toggleItems[0].node.on('toggle', this.showMaterial.bind(this));
        this.toggleContainer.toggleItems[1].node.on('toggle', this.showEquipments.bind(this));
        this.toggleContainer.toggleItems[2].node.on('toggle', this.showPets.bind(this));

        this.init();
    }

    async init() {
        await this.initAppendingData();
        this.showMaterial();

        this.feeLabel.string = '0';
        this.totalLabel.string = PlayerData.getInstance().kbAmount + '';
    }

    async initAppendingData() {
        let r1, r2, r3, r4, r5, r6;
        [r1, r2, r3, r4, r5, r6] = await Promise.all([
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingEquipmentWithdrawRequests', []),
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingEquipmentDepositRequests', []),
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingPetWithdrawRequests', []),
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingPetDepositRequests', []),
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingWithDrawRequests', []),
            NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/ethereumExchange/viewPendingDepositRequests', []),
        ]);
        this.withdrawEquipments = r1.content;
        this.chargeEquipments = r2.content;
        this.withdrawPets = r3.content;
        this.chargePets = r4.content;
        this.withdrawCurrencies = r5.content;
        this.chargeCurrencies = r6.content;
    }

    // 根据挂起中的状态更新
    showAppendingState() {
        if (this.withdrawCurrencies.length > 0 && this.selectedType == ItemType.Currency) {
            let item = this.bagScroll.content.children[0].getComponent(WalletBagItem);
            item.state = WalletItemState.Operating;
            item.refresh();
        }
        if (this.chargeCurrencies.length > 0 && this.selectedType == ItemType.Currency) {
            let item = this.chainScroll.content.children[0].getComponent(WalletChainItem);
            item.states[0] = WalletItemState.Operating;
            item.refresh();
        }
        if (this.withdrawEquipments.length > 0 && this.selectedType == ItemType.Equipment) {
            // 在装备数据中加入当前挂起的装备数据
            let equipmentIds = this.withdrawEquipments.map(x => x.equipmentId)
        }
        if (this.chargeEquipments.length > 0 && this.selectedType == ItemType.Equipment) {
            console.log(this.chargeEquipments)
        }
    }

    refreshState() {
        let widget = this.amountWidget.getComponent(AmountWidget);
        widget.setAmount(0);
        this.feeLabel.string = '0';
        if (this.state == WalletState.Withdraw) {
            this.withdrawBtn.node.active = true;
            this.chargeBtn.node.active = false;
            this.upArrow.node.active = true;
            this.downArrow.node.active = false;

            let kbAmount = PlayerData.getInstance().kbAmount;
            widget.max = kbAmount;
        } else {
            this.withdrawBtn.node.active = false;
            this.chargeBtn.node.active = true;
            this.upArrow.node.active = false;
            this.downArrow.node.active = true;
            widget.max = this.myChainBalance;
        }
    }

    amountOnChange(value) {
        if (this.state == WalletState.Withdraw) {
            this.feeLabel.string = Web3Utils.coinConfig['151'].fee(value) + '';
        }
    }

    async withdrawBtnOnClick() {
        if (PlayerData.getInstance().playerLevel < 50) {
            TipsManager.showMessage('提现需要角色 [DD4444]等级≥50[ffffff]');
            return;
        }
        if (PlayerData.getInstance().fc < 20000) {
            TipsManager.showMessage('提现需要角色当前 [DD4444]战斗力≥20000[ffffff]');
            return;
        }
        if (this.selectedData == null) {
            TipsManager.showMessage('没有选中东西哦');
            return;
        }
        if (this.selectedState == WalletItemState.Operating) {
            TipsManager.showMessage('正在提现中..., 请稍后');
            return;
        }
        if (this.bagEmptyFlag.node.active) {
            TipsManager.showMessage('背包中空空如也~');
            return;
        }

        if (this.selectedType == ItemType.Currency) {
            let amount = (this.amountWidget.getComponent(AmountWidget)).getCurrentAmount();
            if (amount < 100) {
                TipsManager.showMessage('单次最低提现 100 仙石');
                return;
            } else if (PlayerData.getInstance().kbAmount < 110) {
                TipsManager.showMessage('提现后余额不足以支付手续费（最低10仙石）');
                return;
            }
            // 弹出二次确认框 input: amount
            this.secondConfirm.active = true;
            this.initSecondConfirmBox(amount);
        } else if (this.selectedType == ItemType.Equipment) {
            let callback = async () => {
                let response = await CommonUtils.getCaptchaResponse();
                // if (!response.ticket) {
                //     TipsManager.showMessage('验证失败, 请再次验证');
                //     return;
                // }
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/ethereumExchange/withdrawEquipment', [
                    R.prop('id', this.selectedData),
                    Web3Utils.getMyAccount(),
                    response.ticket,
                    response.randstr
                ]);
                if (response2.status === 0) {
                    BagData.getInstance().removeEquipmentFromBag(this.selectedData as Equipment);
                    TipsManager.showMessage('提现成功');
                    await this.initAppendingData();
                    this.selectedType = null;
                    this.showEquipments();
                }
            }
            let nextWithdrawTime = R.prop('nextWithdrawTime', this.selectedData);
            let serverTime = CommonUtils.getServerTime();
            if (nextWithdrawTime && nextWithdrawTime > serverTime) {
                let t = CommonUtils.getTimeInfo(nextWithdrawTime);
                TipsManager.showMessage(`在${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}后方可提现`);
                return;
            }

            let proto = EquipUtils.getProto(this.selectedData as Equipment);
            let quality = proto.fmap(x => x.quality).getOrElse(ItemQuality.Blue)
            let equipmentName = EquipUtils.getDisplay(this.selectedData as Equipment).fmap(x => x.name).getOrElse("");
            let own = PlayerData.getInstance().kbAmount;
            let price = 5;
            if (quality == ItemQuality.Blue) {
                price = 5;
            } else if (quality == ItemQuality.Purple) {
                price = 16;
            } else if (quality == ItemQuality.Orange) {
                price = 250;
            } else if (quality === ItemQuality.Gold) {
                price = 1000;
            }
            CommonUtils.showRichSCBox(
                `是否花费<img src='currency_icon_151'/>${price}提现<color=#187122>${equipmentName}</c>？`,
                `(当前拥有<img src='currency_icon_151'/>${own})`,
                null,
                callback
            );
        } else if (this.selectedType == ItemType.Pet) {
            let callback = async () => {
                let response = await CommonUtils.getCaptchaResponse();
                // if (!response.ticket) {
                //     TipsManager.showMessage('验证失败, 请再次验证');
                //     return;
                // }
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/ethereumExchange/withdrawPet', [
                    R.path(['pet', 'id'], this.selectedData),
                    Web3Utils.getMyAccount(),
                    response.ticket,
                    response.randstr
                ]);
                if (response2.status === 0) {
                    PetData.updatePetIds();
                    TipsManager.showMessage('提现成功');
                    await this.initAppendingData();
                    this.selectedType = null;
                    this.showPets();
                }
            }
            let nextWithdrawTime = R.path(['pet', 'nextWithdrawTime'], this.selectedData);
            let serverTime = CommonUtils.getServerTime();
            if (nextWithdrawTime && nextWithdrawTime > serverTime) {
                let t = CommonUtils.getTimeInfo(nextWithdrawTime);
                TipsManager.showMessage(`在${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}后方可提现`);
                return;
            }
            let info  = this.selectedData as PetDetail;
            let petName = info.pet.petName;
            let config = await PetData.getConfigById(info.pet.definitionId);
            let quality = config.fmap(x => x.color).fmap(PetData.getQualityByColor).getOrElse(ItemQuality.Blue);
            let own = PlayerData.getInstance().kbAmount;
            let price = 10;
            if (quality == ItemQuality.Blue) {
                price = 10;
            } else if (quality == ItemQuality.Purple) {
                price = 40;
            } else if (quality == ItemQuality.Orange) {
                price = 750;
            } else if (quality == ItemQuality.Gold) {
                price = 3000;
            }
            CommonUtils.showRichSCBox(
                `是否花费<img src='currency_icon_151'/>${price}提现<color=#187122>${petName}</c>？`,
                `(当前拥有<img src='currency_icon_151'/>${own})`,
                null,
                callback
            ); 
        }
    }

    async chargeBtnOnClick() {
        if (this.selectedData == null) {
            TipsManager.showMessage('没有选中东西哦');
            return;
        }
        if (this.selectedState == WalletItemState.Operating) {
            TipsManager.showMessage('正在提现中..., 请稍后');
            return;
        }
        if (this.chainEmptyFlag.node.active) {
            TipsManager.showMessage('钱包中空空如也~');
            return;
        }
        if (this.selectedType == ItemType.Currency) {
            let amount = (this.amountWidget.getComponent(AmountWidget)).getCurrentAmount();
            if (amount === 0) {
                TipsManager.showMessage('单次最低取回 1 仙石');
                return;
            }
            let result = await CommonUtils.getCaptchaResponse() as any;
            // if (!result.ticket) {
            //     TipsManager.showMessage('验证失败, 请再次验证');
            //     return;
            // }
            await Web3Utils.assureAllowance(amount);
            let response = await NetUtils.sendHttpRequest(
                NetUtils.RequestType.POST,
                '/ethereumExchange/depositKuaibi',
                [amount * 1000, Web3Utils.getMyAccount(), result.ticket, result.randstr]
            ) as any;
            if (response.status == 0) {
                TipsManager.showMessage('取回成功');
                await this.initAppendingData();
                this.selectedType = null;
                this.showMaterial();
            }
        } else if (this.selectedType == ItemType.Equipment) {
            let result = await CommonUtils.getCaptchaResponse() as any;
            // if (!result.ticket) {
            //     TipsManager.showMessage('验证失败, 请再次验证');
            //     return;
            // }
            await Web3Utils.assureApprove(R.prop('tokenId', this.selectedData));
            let _this = this;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/ethereumExchange/depositEquipment', [
                (_this.selectedData as Equipment).nftId,
                Web3Utils.getMyAccount(),
                result.ticket,
                result.randstr
            ]);
            if (response.status === 0) {
                TipsManager.showMessage('取回成功');
                await _this.initAppendingData();
                _this.selectedType = null;
                _this.showEquipments();
            }
        } else if (this.selectedType == ItemType.Pet) {
            let result = await CommonUtils.getCaptchaResponse() as any;
            // if (!result.ticket) {
            //     TipsManager.showMessage('验证失败, 请再次验证');
            //     return;
            // }
            await Web3Utils.assurePetApprove(R.prop('tokenId', this.selectedData));
            let _this = this;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/ethereumExchange/depositPet', [
                (_this.selectedData as PetDetail).pet.nftId,
                Web3Utils.getMyAccount(),
                result.ticket,
                result.randstr
            ]);
            if (response.status === 0) {
                TipsManager.showMessage('取回成功');
                await _this.initAppendingData();
                _this.selectedType = null;
                _this.showPets();
            }
        }
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        EventDispatcher.off(Notify.WALLET_ITEM_ON_CLICK, this.walletItemOnClick);
        EventDispatcher.off(Notify.WALLET_OPERATION_COMPLETE, this.operationComplete);
        CommonUtils.safeRemove(this.node);
    }

    async updateChainNumber() {
        this.myChainBalance = await Web3Utils.getBlance() as number;
        this.showChain();
    }

    showChain() {
        let isEmpty = this.chainEmpty = this.myChainBalance === 0;
        this.chainScroll.node.active = !isEmpty;
        this.chainEmptyFlag.node.active = isEmpty;
    }

    async showMaterial() {
        if (this.selectedType == ItemType.Currency) return;
        this.totalLabel.string = '' + PlayerData.getInstance().kbAmount;
        this.selectedType = ItemType.Currency;
        this.selectedData = null;
        this.selectedState = WalletItemState.Normal;
        this.feeLabel.string = '0';
        this.amountWidget.active = true;
        // chain 
        await this.showChainMaterial();
        // bag
        await this.showBagMaterial();
        this.showAppendingState();

    }

    async showChainMaterial() {
        this.chainScroll.content.removeAllChildren();
        try {
            let myBalance = await Web3Utils.getBlance() as number;
            this.myChainBalance = myBalance;
            let instance = cc.instantiate(this.chainItemPrefab);
            let chainItem = instance.getComponent(WalletChainItem);
            chainItem.initByCurrency(R.of({ currencyId: 151, amount: myBalance }));
            chainItem.node.x = 0;
            chainItem.node.parent = this.chainScroll.content;
            this.showChain();
        } catch (err) {
            console.error(err);
        }
    }

    async showBagMaterial() {
        let isEmpty = this.bagEmpty = PlayerData.getInstance().kbAmount === 0;
        this.bagScroll.node.active = !isEmpty;
        this.bagEmptyFlag.node.active = isEmpty;
        this.bagScroll.content.removeAllChildren();
        let kbAmount = PlayerData.getInstance().kbAmount;
        let instance = cc.instantiate(this.bagItemPrefab)
        let bagItem = instance.getComponent(WalletBagItem);
        bagItem.initByCurrency({ currencyId: 151, amount: kbAmount });
        bagItem.node.parent = this.bagScroll.content;
        this.bagEmpty = kbAmount === 0;
    }


    showPet() {
        if (this.selectedType == ItemType.Pet) return;
        this.feeLabel.string = '0';
        this.amountWidget.active = false;
        this.selectedType = ItemType.Pet;
        // chain
        this.chainScroll.node.active = false;
        this.chainEmptyFlag.node.active = true;
        // bag
        this.bagScroll.node.active = false;
        this.bagEmptyFlag.node.active = true;
    }

    /**
     * 在钱包界面展示equipments 
     */
    async showEquipments() {
        if (this.selectedType == ItemType.Equipment) return;
        this.totalLabel.string = '' + PlayerData.getInstance().kbAmount;
        this.selectedData = null;
        this.selectedState = WalletItemState.Normal;
        this.selectedType = ItemType.Equipment;
        this.feeLabel.string = '0';
        this.amountWidget.active = false;
        await this.showBagEquipments();
        await this.showChainEquipments();
        this.showAppendingState();
    }

    async showBagEquipments() {
        this.bagScroll.content.removeAllChildren();
        let equipments = BagData.getInstance().getAllEquipments()
            .filter(
                x => x.getPrototype().fmap(y => y.quality != ItemQuality.Green).getOrElse(false)
            );

        let promiseArray = this.withdrawEquipments.map(x => x.equipmentId).map(y => NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [y]));
        let appendingEquipmnets = [];
        if (promiseArray.length > 0) {
            appendingEquipmnets = await Promise.all(promiseArray);
        }
        let empty = equipments.length == 0 && appendingEquipmnets.length == 0;
        this.bagScroll.node.active = !empty;
        this.bagEmptyFlag.node.active = empty;
        appendingEquipmnets.map(x => x.content).forEach(ele => {
            let instance = cc.instantiate(this.bagItemPrefab)
            let bagItem = instance.getComponent(WalletBagItem);
            bagItem.initByEquipment(ele, WalletItemState.Operating);
            bagItem.node.parent = this.bagScroll.content;
        })
        equipments.forEach(ele => {
            let instance = cc.instantiate(this.bagItemPrefab)
            let bagItem = instance.getComponent(WalletBagItem);
            bagItem.initByEquipment(ele.data as Equipment);
            bagItem.node.parent = this.bagScroll.content;
        });
    }

    async showChainEquipments() {
        let tokenIds = await Web3Utils.getAllEquipments();
        let promiseArray = tokenIds.map(y => NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/kxyEquipment/detail/{nftId}', [y, 'raw']));
        let chainEquipmnets: Array<EquipmentDetail> = [];
        if (promiseArray.length > 0) {
            chainEquipmnets = await Promise.all<any>(promiseArray);
        }
        let isPending = (equipmnetId) => {
            return this.chargeEquipments.map(x => x.equipmentId).indexOf(equipmnetId) != -1
        }

        this.chainScroll.content.removeAllChildren();
        let empty = chainEquipmnets.length == 0;
        let equipments = chainEquipmnets.map(x => x.equipment).map((ele, index) => {
            return R.assoc('isPending', isPending(ele.id), R.assoc('tokenId', tokenIds[index], ele));
        });
        let arr = CommonUtils.splitArray(equipments, 4);

        this.chainScroll.node.active = !empty;
        this.chainEmptyFlag.node.active = empty;
        arr.forEach(ele => {
            let instance = cc.instantiate(this.chainItemPrefab)
            let chainItem = instance.getComponent(WalletChainItem);
            chainItem.initByEquipments(ele);
            chainItem.node.parent = this.chainScroll.content;
        });
    }

    async showPets() {
        if (this.selectedType == ItemType.Pet) return;
        this.totalLabel.string = '' + PlayerData.getInstance().kbAmount;
        this.selectedData = null;
        this.selectedState = WalletItemState.Normal;
        this.selectedType = ItemType.Pet;
        this.feeLabel.string = '0';
        this.amountWidget.active = false;
        await this.showBagPets();
        await this.showChainPets();
        this.showAppendingState();
    }

    async showBagPets() {
        this.bagScroll.content.removeAllChildren();
        let allPets = await PetData.getAllPets();
        await PetData.initPetConfig();

        let pets = allPets
            .filter(
                pet => pet.monadBind(x => PetData.syncGetConfig(x.pet.definitionId)).fmap(y => y.color > 2).getOrElse(false)
                    && !pet.fmap(x => PetUtils.isInBattle(x.pet.id)).getOrElse(false)
            );

        let pendingPetIds = this.withdrawPets.map(x => x.petId).join(',');
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [pendingPetIds]) as any;
        if (response.status == 0) {
	          let pendingPets = response.content;
            let empty = pets.length == 0 // && appendingEquipmnets.length == 0;
            this.bagScroll.node.active = !empty;
            this.bagEmptyFlag.node.active = empty;
            pendingPets.forEach(ele => {
                let instance = cc.instantiate(this.bagItemPrefab)
                let bagItem = instance.getComponent(WalletBagItem);
                bagItem.initByPet(ele, WalletItemState.Operating);
                bagItem.node.parent = this.bagScroll.content;
            })
        }
        pets.forEach(ele => {
            if (!ele.valid) return;
            let instance = cc.instantiate(this.bagItemPrefab)
            let bagItem = instance.getComponent(WalletBagItem);
            bagItem.initByPet(ele.val);
            bagItem.node.parent = this.bagScroll.content;
        });
    }

    async showChainPets() {
        let tokenIds = await Web3Utils.getAllPets();
        let promiseArray = tokenIds.map(y => NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/kxyPet/detail/{nftId}', [y, 'raw']));
        let chainPets: Array<PetDetail> = [];
        if (promiseArray.length > 0) {
            chainPets = await Promise.all<any>(promiseArray);
        }
        let isPending = (petId) => {
            return this.chargePets.map(x => x.petId).indexOf(petId) != -1
        }

        this.chainScroll.content.removeAllChildren();
        let empty = chainPets.length == 0;
        let pets = chainPets.map((ele, index) => {
            return R.assoc('isPending', isPending(ele.pet.id), R.assoc('tokenId', tokenIds[index], ele));
        });
        let arr = CommonUtils.splitArray(pets, 4);
        this.chainScroll.node.active = !empty;
        this.chainEmptyFlag.node.active = empty;
        arr.forEach(ele => {
            let instance = cc.instantiate(this.chainItemPrefab)
            let chainItem = instance.getComponent(WalletChainItem);
            chainItem.initByPets(ele);
            chainItem.node.parent = this.chainScroll.content;
        });
    }


    // 二次确认框
    initSecondConfirmBox(amount) {
        let kbAmount = PlayerData.getInstance().kbAmount
        let real = this.getRealNumber(amount, kbAmount);
        let cost = Web3Utils.coinConfig['151'].fee(real);
        let total = real + cost;
        let remain = kbAmount - total;
        this.opWithdrawLabel.string = real.toString();
        this.opFeeLabel.string = cost.toString();
        this.opTotalLabel.string = total.toString();
        this.formulaLabel.string = `${kbAmount} - ${total} = ${remain}`;
    }

    hideSecondConfirmBox() {
        this.secondConfirm.active = false;
    }

    async withdrawConfirm() {
        let amount = parseInt(this.opWithdrawLabel.string) * 1000;
        let result = await CommonUtils.getCaptchaResponse() as any;
        // if (!result.ticket) {
        //     TipsManager.showMessage('验证失败, 请再次验证');
        //     return;
        // }
        this.hideSecondConfirmBox();
        let response = await NetUtils.sendHttpRequest(
            NetUtils.RequestType.POST,
            '/ethereumExchange/withdrawKuaibi',
            [amount, Web3Utils.getMyAccount(), result.ticket, result.randstr]
        ) as any;
        if (response.status === 0) {
            TipsManager.showMessage('提现成功');
            await this.initAppendingData();
            this.selectedType = null;
            this.showMaterial();
        }
    }

    operationComplete = async function (event: EventDispatcher.NotifyEvent) {
        await this.initAppendingData();
        if (this.selectedType == ItemType.Currency) {
            this.selectedType = null;
            this.showMaterial();
        } else if (this.selectedType == ItemType.Equipment) {
            this.selectedType = null;
            this.showEquipments();
        } else {
            this.selectedType = null;
            this.showPets();
        }
    }.bind(this);

    // utils
    getRealNumber(input, max) {
        let fee = Web3Utils.coinConfig['151'].fee;
        let cost = fee(input);
        if (cost + input > max) {
            // if (max <= 1000) {
            //     return max - 100;
            // } else {
            return Math.floor(max * 10 / 11)
            // }
        } else {
            return input;
        }
    }

    walletItemOnClick = function (event: EventDispatcher.NotifyEvent) {
        let detail = event.detail;
        let itemInfo = detail.info as SelectInfo;
        this.state = itemInfo.from;
        this.selectedData = itemInfo.data;
        this.selectedType = itemInfo.type;
        this.withdrawBtn.node.active = itemInfo.from == WalletState.Withdraw;
        this.chargeBtn.node.active = itemInfo.from == WalletState.Charge;

        this.amountWidget.getComponent(AmountWidget).setAmount(0);
        if (itemInfo.type == ItemType.Currency) {
            if (itemInfo.from == WalletState.Charge) {
                this.amountWidget.getComponent(AmountWidget).setMax(this.myChainBalance);
            } else {
                this.amountWidget.getComponent(AmountWidget).setMax(PlayerData.getInstance().kbAmount);
            }
        }

        // 清除所有选中状态
        this.chainScroll.content.children.forEach(ele => {
            let item = ele.getComponent(WalletChainItem)
            item.states = R.map(x => x == WalletItemState.Operating ? x : WalletItemState.Normal, item.states);
            item.refresh();
        });
        this.bagScroll.content.children.forEach(ele => {
            let item = ele.getComponent(WalletBagItem);
            item.state = item.state == WalletItemState.Operating ? item.state : WalletItemState.Normal;
            item.refresh();
        })
        this.showAppendingState();

        if (this.selectedData) {
            if (this.selectedType == ItemType.Equipment && itemInfo.from == WalletState.Withdraw) {
                this.setEquipmentFee(this.selectedData);
            } else if (this.selectedType == ItemType.Pet && itemInfo.from == WalletState.Withdraw) {
                this.setPetFee(this.selectedData);
            } else {
                this.feeLabel.string = '0';
            }
        } else {
            this.feeLabel.string = '0';
        }
    }.bind(this);

    setEquipmentFee(e: Equipment) {
        let proto = EquipUtils.getProto(e);
        let quality = proto.fmap(x => x.quality).getOrElse(ItemQuality.Blue)
        let price = 5;
        if (quality == ItemQuality.Blue) {
            price = 5;
        } else if (quality == ItemQuality.Purple) {
            price = 16;
        } else if (quality == ItemQuality.Orange) {
            price = 250;
        } else if (quality == ItemQuality.Gold) {
            price = 1000;
        }
        this.feeLabel.string = String(price);
    }

    async setPetFee(petDeial: PetDetail) {
        let proto = await PetData.getConfigById(petDeial.pet.definitionId);
        let quality = proto.fmap(x => x.color).fmap(PetData.getQualityByColor).getOrElse(ItemQuality.Blue)
        let price = 10;
        if (quality == ItemQuality.Blue) {
            price = 10;
        } else if (quality == ItemQuality.Purple) {
            price = 40;
        } else if (quality == ItemQuality.Orange) {
            price = 750;
        } else if (quality == ItemQuality.Gold) {
            price = 3000;
        }
        this.feeLabel.string = String(price);
    }
}
