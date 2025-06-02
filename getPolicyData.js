const { ethers } = require("ethers");
const abi = require("./abi/InsuranceContract.json").abi;

const CONTRACT_ADDRESS = "0x356Bca8D67CCC0F686A2982480105014F8cdf8B0"; // Replace with your deployed address

const RPC_URL = "http://127.0.0.1:7545"; // Or your actual RPC URL

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  // Replace 0 with the actual policy ID you want to fetch
  const policyId = 8;
  const policy = await contract.getPolicy(policyId);

  // Format and print the policy details
  const formattedPolicy = {
    policyId: policy[0].toNumber(),
    senderAddress: policy[1],
    farmerName: policy[2],
    thresholdValue: policy[3].toNumber(),
    startDate: new Date(policy[4].toNumber() * 1000).toLocaleString(),
    endDate: new Date(policy[5].toNumber() * 1000).toLocaleString(),
    //  isActive: policy[6],
  };
  console.log("Policy details:", formattedPolicy);
}

main().catch(console.error);
