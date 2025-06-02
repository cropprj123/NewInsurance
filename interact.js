const { ethers } = require("ethers");
const abi = require("./abi/Counter.json"); // path to your ABI file

const CONTRACT_ADDRESS = "0x356Bca8D67CCC0F686A2982480105014F8cdf8B0"; // from deployment
const PRIVATE_KEY =
  "0x7388c3a9028c2465631658543856e670079ccc067698dd96ce76d071cafdd954"; // from Ganache
const GANACHE_URL = "http://127.0.0.1:7545";

async function main() {
  // 1. Connect to provider (Ganache)
  const provider = new ethers.JsonRpcProvider(GANACHE_URL);

  // 2. Create signer using private key
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // 3. Create contract instance
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // 4. Call a view function
  let count = await contract.getCount();
  console.log("Before increment:", count.toString());

  // 5. Send a transaction to increment()
  const tx = await contract.increment();
  await tx.wait(); // wait for mining

  // 6. Check updated value
  count = await contract.getCount();
  console.log("After increment:", count.toString());
}

main().catch(console.error);
