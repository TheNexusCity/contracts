const { expect } = require('chai');

describe('cowboy contract', async function()  {
    let addr1, addr2, addr3,addr4,addr5,addr6,addr7,addr8,addr9,addr10,addr11,addr12,addr13,addr14,addr15;
    let Cryptosabers,cryptosabers;
    let totalSp = 0;

    it('Deployment ', async function()  {
        [addr1, addr2, addr3, addr4, addr5,addr6,addr7,addr8,addr9,addr10,addr11,addr12,addr13,addr14,addr15] = await ethers.getSigners();

        Cryptosabers = await ethers.getContractFactory('Cryptosabers');

        cryptosabers = await Cryptosabers.deploy(addr2.address);
        await cryptosabers.deployed(addr2.address);

        expect(await cryptosabers.totalSupply()).to.equal(0);
    });

    describe('Failure Test',async () => {
        it('Mint should not work with third party address', async function()  {
            await expect(cryptosabers.connect(addr3)["mint(uint256)"](10)).to.be.revertedWith('invalidaccess');
        });

        it('should not Mint Cryptosabers because quantity is greater than 2', async function()  {
            await expect( cryptosabers["mint(uint256)"](10,{ value: ethers.utils.parseEther("1") })).to.be.revertedWith('q<=2');
        });

        it('should not Mint Cryptosabers because quantity is 0', async function()  {
            await expect( cryptosabers["mint(uint256)"](0,{ value: ethers.utils.parseEther("1") })).to.be.revertedWith('q>0');
        });
    });

    describe('MINT',async () => {
        it('Owner should mint Cryptosabers for own address', async function()  {
            await cryptosabers["mint(uint256)"](2,{ value: ethers.utils.parseEther("1") });
            const tknBal = await cryptosabers.balanceOf(addr1.address);
            totalSp = totalSp + 2;
            expect(tknBal).to.equal(2);
        });

        it('Total supply should increase', async function()  {
            expect( await cryptosabers.totalSupply()).to.equal(totalSp);
        });
    });

    describe('Transfers',async () => {
        it('Owner should transfers its own token', async function()  {
            await cryptosabers.transferFrom(addr1.address,addr3.address,0);
            const tknBal = await cryptosabers.balanceOf(addr1.address);
            expect(tknBal).to.equal(1);
        });

        it('Owner should safe transfers its own token', async function()  {
            await cryptosabers.connect(addr3)["safeTransferFrom(address,address,uint256)"](addr3.address,addr4.address,0);
            const tknBal = await cryptosabers.balanceOf(addr3.address);
            expect(tknBal).to.equal(0);
        });

        it('Checks token owner', async function()  {
            expect(await cryptosabers.ownerOf(0)).to.equal(addr4.address);
        });

        it('Owner should approve other address to transfer token', async function()  {
            await cryptosabers.connect(addr4).approve(addr5.address,0);
            expect(await cryptosabers.getApproved(0)).to.equal(addr5.address);
        });

        it('approved address should send cryptosabers NFT', async function()  {
            await cryptosabers.connect(addr5).transferFrom(addr4.address,addr6.address,0);
            const tknBal = await cryptosabers.balanceOf(addr6.address);
            expect(tknBal).to.equal(1);
        });

        
        it('Admin approves all to be able mint cryptosabers NFT', async function()  {
            await cryptosabers.setOpenMint(true);
        });
        
        it('Other address should mint cryptosabers NFT', async function()  {
            await cryptosabers.connect(addr5)["mint(uint256)"](2,{ value: ethers.utils.parseEther("1") });
            const tknBal = await cryptosabers.balanceOf(addr5.address);
            totalSp = totalSp + 2;
            expect(tknBal).to.equal(2);
        });

        
    });

});