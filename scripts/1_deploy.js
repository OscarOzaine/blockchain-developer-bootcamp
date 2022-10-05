const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log('Preparing deployment...');
  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange = await hre.ethers.getContractFactory("Exchange");

  const accounts = await ethers.getSigners();

  const user1 = accounts[0];
  const user2 = accounts[0];

  console.log(`Accounts fetched:\n${user1.address}\n${user2.address}`);

  const dapp = await Token.deploy('Dapp', 'DAPP', '1000000');
  await dapp.deployed();
  console.log("DAPP deployed to:", dapp.address);

  const mETH = await Token.deploy('mETH', 'mETH', '1000000');
  await mETH.deployed();
  console.log("mETH deployed to:", mETH.address);

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
  await mDAI.deployed();
  console.log("mDAI deployed to:", mDAI.address);

  const exchange = await Exchange.deploy(user1.address, 10);
  await exchange.deployed();

  console.log(`Exchange deployed to: ${exchange.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  