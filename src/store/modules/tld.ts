import { ethers } from 'ethers';
import TldAbi from '../../abi/PunkTLD.json';
import MinterAbi from "../../abi/Minter.json";
import useChainHelpers from "../../hooks/useChainHelpers";
import { useEthers } from 'vue-dapp';

const { getFallbackProvider } = useChainHelpers();
const { address, chainId, isActivated } = useEthers();

export default {
  namespaced: true,
  
  state: () => ({ 
    balance: 0, // user's domain balance
    discountPercentage: 0,
    tldName: ".testzksoul",
    tldAddress: "0xD15316d5D6Ce29Db5d1bE3191398F7F2C5e31CAA", // TODO
    tldContract: null,
    tldChainId: 280,
    tldChainName: "zkSync Era Testnet",
    minterAddress: "0xd013787d60fc5966b512EdEAb91085aEA5e287f0", // TODO
    minterContract: null,
    minterLoadingData: false,
    minterPaused: true,
    minterTldPrice1: 1,
    minterTldPrice2: 0.1,
    minterTldPrice3: 0.01,
    minterTldPrice4: 0.001,
    minterTldPrice5: 0.0001,
    referralFee: 1000
  }),

  getters: { 
    getMinterDiscountPercentage(state) {
      return state.discountPercentage;
    },
    getTldAddress(state) {
      return state.tldAddress;
    },
    getTldContract(state) {
      return state.tldContract;
    },
    getTldChainId(state) {
      return state.tldChainId;
    },
    getTldChainName(state) {
      return state.tldChainName;
    },
    getTldName(state) {
      return state.tldName;
    },
    getMinterAddress(state) {
      return state.minterAddress;
    },
    getMinterContract(state) {
      return state.minterContract;
    },
    getMinterLoadingData(state) {
      return state.minterLoadingData;
    },
    getMinterPaused(state) {
      return state.minterPaused;
    },
    getMinterTldPrice1(state) {
      return state.minterTldPrice1;
    },
    getMinterTldPrice2(state) {
      return state.minterTldPrice2;
    },
    getMinterTldPrice3(state) {
      return state.minterTldPrice3;
    },
    getMinterTldPrice4(state) {
      return state.minterTldPrice4;
    },
    getMinterTldPrice5(state) {
      if (isActivated.value && state.balance > 0) {
        return state.minterTldPrice5;
      } else {
        return 0;
      }
    },
    getReferralFee(state) {
      return state.referralFee;
    }
  },

  mutations: {
    setBalance(state, balance) {
      state.balance = balance;
    },

    setTldContract(state) {
      let fProvider = getFallbackProvider(state.tldChainId);

      const tldIntfc = new ethers.utils.Interface(TldAbi);
      state.tldContract = new ethers.Contract(state.tldAddress, tldIntfc, fProvider);
    },

    setMinterContract(state, contract) {
      state.minterContract = contract;
    },

    setDiscountPercentage(state, percentage) {
      state.discountPercentage = percentage;
    },

    setMinterLoadingData(state, loading) {
      state.minterLoadingData = loading;
    },

    setMinterPaused(state, paused) {
      state.minterPaused = paused;
    },

    setMinterTldPrice1(state, price) {
      state.minterTldPrice1 = price;
    },
    setMinterTldPrice2(state, price) {
      state.minterTldPrice2 = price;
    },
    setMinterTldPrice3(state, price) {
      state.minterTldPrice3 = price;
    },
    setMinterTldPrice4(state, price) {
      state.minterTldPrice4 = price;
    },
    setMinterTldPrice5(state, price) {
      state.minterTldPrice5 = price;
    },
    setReferralFee(state, fee) {
      state.referralFee = Number(fee);
    },
  },

  actions: {
    async checkUserDomainBalance({commit, state}) {
      let fProvider = getFallbackProvider(chainId.value);

      const tldIntfc = new ethers.utils.Interface(TldAbi);
      const tldContract = new ethers.Contract(state.tldAddress, tldIntfc, fProvider);

      const balance = await tldContract.balanceOf(address.value);
      commit("setBalance", balance);
    },

    async fetchMinterContractData({commit, state}) {
      commit("setMinterLoadingData", true);

      let fProvider = getFallbackProvider(state.tldChainId);

      // minter contract
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContract = new ethers.Contract(state.minterAddress, minterIntfc, fProvider);

      // check if TLD contract is paused
      const paused = await minterContract.paused();
      commit("setMinterPaused", paused);

      // get price for 1 char
      const priceWei1 = await minterContract.price1char();
      const domainPrice1 = ethers.utils.formatEther(priceWei1);
      commit("setMinterTldPrice1", domainPrice1);
      // get price for 2 chars
      const priceWei2 = await minterContract.price2char();
      const domainPrice2 = ethers.utils.formatEther(priceWei2);
      commit("setMinterTldPrice2", domainPrice2);
      // get price for 3 chars
      const priceWei3 = await minterContract.price3char();
      const domainPrice3 = ethers.utils.formatEther(priceWei3);
      commit("setMinterTldPrice3", domainPrice3);
      // get price for 4 chars
      const priceWei4 = await minterContract.price4char();
      const domainPrice4 = ethers.utils.formatEther(priceWei4);
      commit("setMinterTldPrice4", domainPrice4);
      // get price for 5 chars
      const priceWei5 = await minterContract.price5char();
      const domainPrice5 = ethers.utils.formatEther(priceWei5);
      commit("setMinterTldPrice5", domainPrice5);

      // fetch referral fee
      const refFee = await minterContract.referralFee();
      commit("setReferralFee", refFee);

      commit("setMinterLoadingData", false);
    }
  }
};