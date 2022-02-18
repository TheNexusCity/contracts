const { expect } = require('chai');

describe('Cowboys Contract Tests', async function()  {
    let owner, addr1, addr2;
    let Cowboys, cowboys;
    let price;
    it('Deployment', async function()  {
        [owner, addr1, addr2] = await ethers.getSigners();

        Cowboys = await ethers.getContractFactory('Cowboys');

        cowboys = await Cowboys.deploy(owner.address);

        await cowboys.deployed(owner.address);
        
        expect(await cowboys.totalSupply()).to.equal(0);

        const balance = await cowboys.balanceOf(addr1.address);

        expect(balance).to.equal(0);
    });

    it('Mint cowboy for own address', async function()  {
        [addr1, addr2] = await ethers.getSigners();

        Cowboys = await ethers.getContractFactory('Cowboys');

        cowboys = await Cowboys.deploy(addr2.address);

        await cowboys.deployed(addr2.address);

        expect(await cowboys.totalSupply()).to.equal(0);

        await cowboys.balanceOf(addr1.address);

        price = await cowboys.getMintPrice();
            
        await cowboys["mint(uint256)"](1, {
            value: price,
          });
    });

    it('Total supply should increase', async function()  {
        expect(await cowboys.totalSupply()).to.equal(1);
    });

    it('Mint cowboy for treasury address', async function()  {
        const price = await cowboys.getMintPrice();
        await cowboys["mintForAddress(uint256,address)"](1,addr2.address,{ value: price });
        const tknBal = await cowboys.balanceOf(addr2.address);
        expect(tknBal).to.equal(1);
        expect(await cowboys.totalSupply()).to.equal(2);
    });

    it('Total supply should increase', async function()  {
        expect(await cowboys.totalSupply()).to.equal(2);
    });

    describe('Transactions ',async () => {
        it('Should transfer from owner to other address', async function()  {
            await cowboys.transferFrom(addr1.address,addr2.address,0);
            const tknBal = await cowboys.balanceOf(addr1.address);
            expect(tknBal).to.equal(0);
        });

        it('Should transfer from treasury to other address', async function()  {
            await cowboys.connect(addr2).transferFrom(addr2.address,addr1.address,1);
            const tknBal = await cowboys.balanceOf(addr2.address);
            expect(tknBal).to.equal(1);
        });
    });

    describe('Approval ',async () => {
        it('Owner should approve other account to transfer NFT', async function()  {
            await cowboys.approve(addr2.address,1);
            expect( await cowboys.getApproved(1)).to.equal(addr2.address);
        });
    });

    describe('Third party ',async () => {
        it('Other address should transfer cowboy', async function()  {
            await cowboys.connect(addr2).transferFrom(addr1.address,addr2.address,1);
            const tknBal = await cowboys.balanceOf(addr2.address);
            expect(tknBal).to.equal(2);
        });
    });

    describe('Owner set contract ',async () => {
        it('Owner should set the contract to be mintable for everybody ', async function()  {
            await cowboys.connect(owner).setOpenMint(true);
            let nonWhitelistPrice = await cowboys.getMintPrice();
            await cowboys.connect(addr1)["mint(uint256)"](1, {
                value: nonWhitelistPrice,
              });

            const tknBal = await cowboys.balanceOf(addr1.address);
            expect(tknBal).to.equal(1);
        });

        it('Total supply should increase', async function()  {
            expect(await cowboys.totalSupply()).to.equal(3);
        });
    });
});