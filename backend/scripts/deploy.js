const hre = require("hardhat");

//* How to change this file
/*
- Fill in the `ContractName` with your contract name.
- Uncomment the verification process if you want to verify your contract but make sure to uncomment the same in the `hardhat.config.js` and change the values as required.

You can pass in values into your contract like doing the following :
ex : Asssume you have a string and a number to pass
` const lock = await Lock.deploy("hello", 5);`
*/

//* Sample Deployment
/*
  const Lock = await hre.ethers.getContractFactory("ContractName");
  const lock = await Lock.deploy();

  await lock.deployed();

  console.log("Contract Deployed to : ", lock.address);

  console.log("Sleeping...");
  await sleep(50000);
  await hre.run("verify:verify", {
    address: lock.address,
    constructorArguments: [],
  });
*/

async function main() {
  // Write your deployment files here
  const E_Voting = await ethers.getContractFactory("E_Voting");
  const e_voting = await E_Voting.deploy();

  await e_voting.deployed();
  console.log("Contract Deployed to : ", e_voting.address);

  //console.log("Sleeping...");
  /*await sleep(50000);
  await hre.run("verify:verify", {
    address: e_voting.address,
    constructorArguments: [],
  });*/


}

// Async Sleep function
/*function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}*/

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
