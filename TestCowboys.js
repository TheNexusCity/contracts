const { expect } = require('chai');

describe('cowboy contract', async function()  {
    let addr1, addr2, addr3,addr4;
    let Cowboys,cowboys;

    it('Deployment ', async function()  {
    //beforeEach( async function()  {
        [addr1, addr2, addr3, addr4] = await ethers.getSigners();

        Cowboys = await ethers.getContractFactory('Cowboys');
        cowboys = await Cowboys.deploy(addr2.address);

        await cowboys.deployed(addr2.address);
        

        expect(await cowboys.totalSupply()).to.equal(0);

        const balance = await cowboys.balanceOf(addr1.address);
        expect(balance).to.equal(0);
    });

    it('Mint cowbboy should mint for own address', async function()  {
        await cowboys.mint(10,{ value: ethers.utils.parseEther("0.88") });
        const tknBal = await cowboys.balanceOf(addr1.address);
        expect(tknBal).to.equal(10);
    });

    it('Mint cowbboy should ERC721 for treasury address', async function()  {
        //await cowboys.connect(addr2.address).mintForAddress(10,addr2.address,{ value: ethers.utils.parseEther("0.88") });
        await cowboys.mintForAddress(10,addr2.address,{ value: ethers.utils.parseEther("0.88") });
        const tknBal = await cowboys.balanceOf(addr1.address);
        expect(tknBal).to.equal(10);
    });

    describe('Transactions ',async () => {
        it('Should transfer from owner to other address', async function()  {
            await cowboys.transferFrom(addr1.address,addr3.address,0);
            const tknBal = await cowboys.balanceOf(addr1.address);
            expect(tknBal).to.equal(9);
        });

        it('Should transfer from treasury to other address', async function()  {
            await cowboys.connect(addr2.address).transferFrom(addr2.address,addr3.address,11);
            const tknBal = await cowboys.balanceOf(addr2.address);
            expect(tknBal).to.equal(9);
        });
    });

    describe('Approval ',async () => {
        it('owner Should approve other account to transfer NFT', async function()  {
            await cowboys.approve(addr3.address,2);
            expect( await cowboys.getApproved(2)).to.equal(addr3.address);
        });
    });

});