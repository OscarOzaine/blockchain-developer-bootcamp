const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => ethers.utils.parseUnits(n, 'ether');

describe('Token', () => {
    let token;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Hello Token', 'FOO', '1000000');
    });

    describe('Deployment', () => {
        it('has a name', async () => {
            expect(await token.name()).to.equal('Hello Token');
        })
    
        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal('FOO');
        })
    
        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal(18);
        })
    
        it('has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(tokens('1000000'));
        })
    });
});