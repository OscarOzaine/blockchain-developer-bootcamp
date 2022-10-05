const hre = require("hardhat");
const config = require('../src/config.json');

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function main() {
    const accounts = await ethers.getSigners();

    const { chainId } = await ethers.provider.getNetwork();

    const Dapp = await ethers.getContractAt('Token', config[chainId].DApp.address);
    console.log(`Dapp Token fetched: ${Dapp.address}`);

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
    console.log(`mETH Token fetched: ${mETH.address}`);

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address);
    console.log(`mDAI Token fetched: ${mDAI.address}`);

    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log(`Exchange fetched: ${exchange.address}`);

    const sender = accounts[0];
    const receiver = accounts[1];

    let amount = tokens(10000);

    let transaction, result;

    transaction = await mETH.connect(sender).transfer(receiver.address, amount);
    console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`);

    const user1 = accounts[0];
    const user2 = accounts[1];
    amount = tokens(10000);

    transaction =  await Dapp.connect(user1).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} tokens from ${user1.address}\n`);

    transaction =  await exchange.connect(user1).depositToken(Dapp.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`);

    // user 2 approves mEth
    transaction =  await mETH.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} tokens from ${user2.address}\n`);

    // user 2 deposits mEth
    transaction =  await exchange.connect(user2).depositToken(mETH.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} tokens from ${user2.address}\n`);

    // seed a cancelled order
    let orderId;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5))
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    // user 1 cancels order
    orderId = result.events[0].args.id;
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    result = await transaction.wait();
    console.log(`Cancelled order from: ${user1.address}\n`);

    await wait(1);

    // user 1 makes order
    transaction =  await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    // user 2 fills order
    orderId = result.events[0].args.id;
    transaction =  await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    await wait(1);

    // user 1 makes order
    transaction =  await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    // user 2 fills order
    orderId = result.events[0].args.id;
    transaction =  await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    await wait(1);

    // user 1 makes order
    transaction =  await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    // user 2 fills order
    orderId = result.events[0].args.id;
    transaction =  await exchange.connect(user2).fillOrder(orderId);
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);

    await wait(1);

    // user 1 makes 10 orders
    for(let i = 1; i < 10; i++) {
        transaction =  await exchange.connect(user1).makeOrder(mETH.address, tokens(i * 10), Dapp.address, tokens(10));
        result = await transaction.wait();
        console.log(`Made orders from ${user1.address}\n`);
        await wait(1);
    }

    // user 2 makes 10 orders
    for(let i = 1; i < 10; i++) {
        transaction =  await exchange.connect(user2).makeOrder(Dapp.address, tokens(10), mETH.address, tokens(i * 10));
        result = await transaction.wait();
        console.log(`Made orders from ${user1.address}\n`);
        await wait(1);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  