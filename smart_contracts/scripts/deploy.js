const hre = require("hardhat");

async function main() {
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy(); // deploys to Ganache
  await counter.waitForDeployment(); // <- this is the correct method now

  const address = await counter.getAddress();
  console.log(`Counter deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
