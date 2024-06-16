import { Equipment, CurrencyStack, PetDetail } from "../../net/Protocol";

export enum WalletState { Withdraw, Charge };
export enum ItemType { Currency, Equipment, Pet }
export enum WalletItemState {Normal, Selected, Operating}

export interface SelectInfo {
    type: ItemType,
    from: WalletState, 
    data: Equipment | CurrencyStack | PetDetail,
    tokenId?: number,
}