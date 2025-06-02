const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// Load contract ABI - Fix the import to access the abi array correctly
const { abi } = require("../abi/InsuranceContract.json");
const contractAddress = process.env.CONTRACT_ADDRESS;

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    this.contract = new ethers.Contract(
      contractAddress,
      abi, // Use the abi array directly
      this.provider
    );
  }

  async createPolicy(
    farmerAddress,
    cropType,
    thresholdValue,
    startDate,
    endDate,
    privateKey
  ) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.createPolicy(
        farmerAddress,
        cropType,
        thresholdValue,
        startDate,
        endDate
      );

      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error creating policy:", error);
      throw error;
    }
  }

  async submitClaim(policyId, weatherValue, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.submitClaim(policyId, weatherValue);
      await tx.wait();

      return true;
    } catch (error) {
      console.error("Error submitting claim:", error);
      throw error;
    }
  }

  async processClaim(claimId, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      const tx = await contractWithSigner.processClaim(claimId);
      await tx.wait();

      return true;
    } catch (error) {
      console.error("Error processing claim:", error);
      throw error;
    }
  }

  async getPolicy(policyId) {
    try {
      const policy = await this.contract.getPolicy(policyId);
      return {
        policyId: policy[0].toNumber(),
        farmerAddress: policy[1],
        cropType: policy[2],
        thresholdValue: policy[3].toNumber(),
        startDate: policy[4].toNumber(),
        endDate: policy[5].toNumber(),
        isActive: policy[6],
      };
    } catch (error) {
      console.error("Error getting policy:", error);
      throw error;
    }
  }

  async getClaim(claimId) {
    try {
      const claim = await this.contract.getClaim(claimId);
      return {
        claimId: claim[0].toNumber(),
        policyId: claim[1].toNumber(),
        claimDate: claim[2].toNumber(),
        weatherValue: claim[3].toNumber(),
        isApproved: claim[4],
        status: claim[5],
      };
    } catch (error) {
      console.error("Error getting claim:", error);
      throw error;
    }
  }

  async getFarmerPolicies(farmerAddress) {
    try {
      const policyIds = await this.contract.getFarmerPolicies(farmerAddress);
      return policyIds.map((id) => id.toNumber());
    } catch (error) {
      console.error("Error getting farmer policies:", error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
