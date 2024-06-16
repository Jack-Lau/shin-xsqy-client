import { TipsManager } from "../base/TipsManager";
import { CommonUtils } from "../utils/CommonUtils";
import { NetUtils } from "./NetUtils";
import { EquipmentABI } from "./abi/KxyEquipmentAbi";
import { KcABI } from "./abi/KxyKcAbi";
import { KxyPetABI } from "./abi/KxyPetAbi";

export module Web3Utils {
    export const coinConfig = {
        '151': {
            'min': 300,
            'fee': function (x) { return Math.ceil(x * 0.1) }
        }
    }


    // 获取仙石链上合约
    export function getContract(): Contract {
        if (!window['web3']) return null;
        // 测试合约地址
        // let address = "0x67285ab864319dcde0a4fdb3567a70933a540a91";  
        // 正式合约地址
        // let address = "0x2f9294789fa3d2b308a9308465144313a2e4fad5";
        // 138合约地址
        let address = '0x2f492f5c1ad9d4079b429ed16506f76213a56cdf';

        // 通过ABI和地址获取已部署的合约对象
        return window['web3'].eth.contract(KcABI).at(address);
    }

    export function approve(num: number = 100) {
        return new Promise(function (resolve, reject) {
            let myAccout = getMyAccount();
            if (!myAccout) return;
            let bigNumber = (new window['BigNumber'](num)).multipliedBy(new window['BigNumber']('1e18'));

            getContract().approve(SERVER_ACCOUNT, bigNumber.toString(), (err, transactionHash) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(transactionHash);
            });
        });
    }

    export async function isApproveFinished(hash) {
        return new Promise(function (resolve, reject) {
            window['web3'].eth.getTransactionReceipt(hash, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            })
        });
    }

    async function checkFinished(hash, count) {
        if (count == 0) {
            return false;
        } else {
            let isFinished = await isApproveFinished(hash);
            if (isFinished) {
                return true;
            } else {
                await CommonUtils.wait(5);
                return checkFinished(hash, count - 1);
            }
        }
    }

    export async function assureAllowance(amount: number) {
        let allowance = await getAllowance() as number;
        console.log('allowance: ', allowance)
        if (allowance >= amount) {
            return amount;
        } else {
            let hash = await approve(amount);
            let isFinished = await checkFinished(hash, 10);
            if (isFinished) {
                return amount;
            } else {
                TipsManager.showMessage('合约方法调用超时...')
            }
        }
    }

    async function sendCharge(amount: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/ethereumExchange/depositKuaibi', [amount * 1000, getMyAccount()]) as any;
        if (response.status == 0) {
            console.log('OK')
        }
    }

    export function getAllowance() {
        return new Promise(function (resolve, reject) {
            getContract().allowance(getMyAccount(), SERVER_ACCOUNT, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result.dividedBy(1e18).toNumber());
            });
        })
    }

    export function getBlance() {
        return new Promise(function (resolve, reject) {
            getContract().balanceOf(getMyAccount(), (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(Math.floor(result.dividedBy(1e18).toNumber()));
            });
        })
    }

    export function getMyAccount() {
        let account = R.head(window['web3'].eth.accounts);
        console.log(account);
        return account;
    }

    interface Contract {
        approve(spender, value, cb?);
        totalSupply();
        transferFrom(from, to, value, cb);
        balanceOf(who, cb?);
        transfer(to, value, cb);
        allowance(owner, spender, cb);
    }


    /**
     * Equipments
     */

    interface EquipmentContract {
        // EquipmentABI
        approve(spender, tokenId, cb?);
        getApproved(tokenId, cb?);
        balanceOf(address, cb?)
        ownedTokensOf(address, cb?);
    }

    export function getEquipmentContract(): EquipmentContract {
        if (!window['web3']) return null;

        let address = "0x2aa9e687d1c7d5adbec464249d380910d88aeb89";
        return window['web3'].eth.contract(EquipmentABI).at(address);
    }

    export function getAllEquipments() {
        return new Promise<any>(function(resolve, reject) {
            Web3Utils.getEquipmentContract().ownedTokensOf(Web3Utils.getMyAccount(), (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result.map(ele => ele.toNumber()))
            });
        })
    }

    // 提现方法

    

    /**
     * 充值流程
     * 1. approve
     * 2. 发送请求至服务器
     * 3. 根据服务器响应刷新本地数据  操作中...
     * 4. 完成后刷新
     */
    export function eApprove(tokenId: any) {
        return new Promise(function (resolve, reject) {
            let myAccout = getMyAccount();
            if (!myAccout) return;
            // let bigNumber = (new window['BigNumber'](num)).multipliedBy(new window['BigNumber']('1e18'));

            getEquipmentContract().approve(SERVER_ACCOUNT, tokenId, (err, transactionHash) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(transactionHash);
            });
        });
    }


    async function checkEApproveFinished(hash, count) {
        if (count == 0) {
            return false;
        } else {
            let isFinished = await isApproveFinished(hash);
            if (isFinished) {
                return true;
            } else {
                await CommonUtils.wait(5);
                return checkFinished(hash, count - 1);
            }
        }
    }

    export function checkApprove(tokenId) {
        return new Promise(function (resolve, reject) {
            getEquipmentContract().getApproved(tokenId, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        })
    }

    export async function assureApprove(tokenId) {
        let check = await checkApprove(tokenId);
        console.log('check: ', check);
        if (check == SERVER_ACCOUNT) {
            return;
        } else {
            let hash = await eApprove(tokenId);
            let isFinished = await checkEApproveFinished(hash, 10);
            if (isFinished) {
                return;
            } else {
                TipsManager.showMessage('合约方法调用超时...')
            }
        }
    }


    // pet s
    interface PetContract {
        approve(spender, tokenId, cb?);
        getApproved(tokenId, cb?);
        balanceOf(address, cb?)
        ownedTokensOf(address, cb?);
        transfer(from, to, tokenId, cb?)
    }

    export function getPetContract(): PetContract {
        if (!window['web3']) return null;

        let address = "0x7fb7fb08ad62b757dab2ad7778d14caf7dbe10cf";
        return window['web3'].eth.contract(KxyPetABI).at(address);
    }

    export function getAllPets() {
        return new Promise<any>(function(resolve, reject) {
            Web3Utils.getPetContract().ownedTokensOf(Web3Utils.getMyAccount(), (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result.map(ele => ele.toNumber()))
            });
        })
    }

    // 提现方法

    export async function deletePet () {
        let tokenIds = await getAllPets();
        tokenIds.forEach(id => {
            Web3Utils.getPetContract().transfer(Web3Utils.getMyAccount(), 0x0, id, () => {
                console.log(`success: ${id}`)
            })
        })
    }

    

    /**
     * 充值流程
     * 1. approve
     * 2. 发送请求至服务器
     * 3. 根据服务器响应刷新本地数据  操作中...
     * 4. 完成后刷新
     */
    export function petApprove(tokenId: any) {
        return new Promise(function (resolve, reject) {
            let myAccout = getMyAccount();
            if (!myAccout) return;
            getPetContract().approve(SERVER_ACCOUNT, tokenId, (err, transactionHash) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(transactionHash);
            });
        });
    }


    async function checkPetApproveFinished(hash, count) {
        if (count == 0) {
            return false;
        } else {
            let isFinished = await isApproveFinished(hash);
            if (isFinished) {
                return true;
            } else {
                await CommonUtils.wait(5);
                return checkFinished(hash, count - 1);
            }
        }
    }

    export function checkPetApprove(tokenId) {
        return new Promise(function (resolve, reject) {
            getPetContract().getApproved(tokenId, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        })
    }

    export async function assurePetApprove(tokenId) {
        let check = await checkPetApprove(tokenId);
        console.log('check: ', check);
        if (check == SERVER_ACCOUNT) {
            return;
        } else {
            let hash = await petApprove(tokenId);
            let isFinished = await checkPetApproveFinished(hash, 10);
            if (isFinished) {
                return;
            } else {
                TipsManager.showMessage('合约方法调用超时...')
            }
        }
    }


    export const HONG_ACCOUNT = '0x7d408c3254BE25F4De4De5cDb11d7dDE41F94b24';
    const TEST_ACCOUT = '0x847a36ab94ae787bc1558c78045f2fe25348015b';
    // 服务器钱包地址
    const SERVER_ACCOUNT = '0xb098dac4c334c26f2b361fd312e5bb889272571e';
    // 合约ABI
   

}