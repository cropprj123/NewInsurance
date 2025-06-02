const { ethers } = require("ethers");
const abi = require("./abi/InsuranceContract.json").abi; // Update path if needed

const CONTRACT_ADDRESS = "0x356Bca8D67CCC0F686A2982480105014F8cdf8B0"; // Replace with your deployed address
const PRIVATE_KEY =
  "0x7388c3a9028c2465631658543856e670079ccc067698dd96ce76d071cafdd954"; // Replace with your Ganache account private key
const RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC

async function main() {
  //   const provider = new ethers.JsonRpcProvider(RPC_URL);
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // Example: Call a view function (no gas cost)
  const policyCount = await contract.getFarmerPolicies(wallet.address);
  console.log(
    "Policy IDs for this wallet:",
    policyCount.map((p) => p.toString())
  );

  // Example: Send a transaction (costs gas)
  const tx = await contract.createPolicy(
    wallet.address,
    "Wheat", // cropType
    50, // thresholdValue
    Math.floor(Date.now() / 1000), // startDate (now)
    Math.floor(Date.now() / 1000) + 86400 // endDate (1 day later)
  );
  await tx.wait();
  console.log("Policy created!");

  //   const policy = await contract.getPolicy(0);
  //   console.log(policy);

  //fromated policay data
  const policy = await contract.getPolicy(5);
  const formattedPolicy = {
    policyId: policy[0].toNumber(),
    farmerAddress: policy[1],
    cropType: policy[2],
    thresholdValue: policy[3].toNumber(),
    startDate: new Date(policy[4].toNumber() * 1000).toLocaleString(),
    endDate: new Date(policy[5].toNumber() * 1000).toLocaleString(),
    isActive: policy[6],
  };
  console.log("Policy details:", formattedPolicy);
}

main().catch(console.error);
