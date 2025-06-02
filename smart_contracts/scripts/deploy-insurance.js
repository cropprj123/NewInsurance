const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const InsuranceContract = await hre.ethers.getContractFactory(
    "InsuranceContract"
  );

  // Deploy the contract
  console.log("Deploying Insurance Contract...");
  const insurance = await InsuranceContract.deploy();
  console.log("Insurance Contract deployed to:", insurance.target);

  // You can now interact with the contract using the insurance object
  const policyCount = await insurance.policyCount();
  console.log("Initial policy count:", policyCount.toString());
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
