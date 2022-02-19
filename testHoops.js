const { expect } = require('chai');

describe('cowboy contract', async function()  {
    let addr1, addr2, addr3,addr4,addr5,addr6,addr7,addr8,addr9,addr10,addr11,addr12,addr13,addr14,addr15;
    let hoops,Hoops;
    let totalSp = 0;

    it('Deployment ', async function()  {
        [addr1, addr2, addr3, addr4, addr5,addr6,addr7,addr8,addr9,addr10,addr11,addr12,addr13,addr14,addr15] = await ethers.getSigners();

        Hoops = await ethers.getContractFactory('Hoops');

        hoops = await Hoops.deploy(addr2.address);
        await hoops.deployed(addr2.address);
        

        expect(await hoops.totalSupply()).to.equal(0);
    });

    
    describe('Failure Test',async () => {
        it('Withdrawal should not work', async function()  {
            await expect (hoops.connect(addr3).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Mint should not work with third party address', async function()  {
            await expect(hoops.connect(addr3)["mint(uint256)"](10)).to.be.revertedWith('invalidaccess');;
        });

        it('Other address should not transfer ownership', async function()  {
            await expect(hoops.connect(addr3).transferOwnership(addr3.address)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should fail when any address calls tokenOfOwnerByIndex when no token is been created', async function()  {
            await expect( hoops.connect(addr3).tokenOfOwnerByIndex(addr1.address,1)).to.be.revertedWith('oIdx>bnds');
        });
        
        it('Should fail when any owner mints 0 hoops', async function()  {
            await expect( hoops["mint(uint256)"](0,{ value: ethers.utils.parseEther("1") })).to.be.revertedWith('Quantity cannot be 0');
        });

        it('Should fail when any owner mints 21 hoops', async function()  {
            await expect( hoops["mint(uint256)"](21,{ value: ethers.utils.parseEther("1") })).to.be.revertedWith('Quantity exceeds mint max');
        });

        it('Should fail when any owner mints hoops with low balance', async function()  {
            await expect( hoops["mint(uint256)"](10,{ value: ethers.utils.parseEther("0.1") })).to.be.revertedWith('Insufficient funds!');
        });

        it('Treasury should not mint hoops for Treasury address', async function()  {
            await expect(hoops.connect(addr2)["mint(uint256)"](10,{ value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith('invalidaccess');
        });
    });

    describe('Mint',async () => {
        it('Owner should mint hoops for own address', async function()  {
            await hoops["mint(uint256)"](10,{ value: ethers.utils.parseEther("1") });
            const tknBal = await hoops.balanceOf(addr1.address);
            totalSp = totalSp + 10;
            expect(tknBal).to.equal(10);
        });

        it('Total supply should increase', async function()  {
            expect(await hoops.totalSupply()).to.equal(totalSp);
        });

        it('Owner should mint hoops for other access', async function()  {
            await hoops["mintForAddress(uint256,address)"](10,addr3.address,{ value: ethers.utils.parseEther("1") });
            const tknBal = await hoops.balanceOf(addr3.address);
            totalSp = totalSp + 10;
            expect(tknBal).to.equal(10);
        });

        it('Total supply should increase', async function()  {
            expect(await hoops.totalSupply()).to.equal(totalSp);
        });

        it('Owner should mint hoops for other treasury', async function()  {
            await hoops["mintForAddress(uint256,address)"](10,addr2.address,{ value: ethers.utils.parseEther("1") });
            const tknBal = await hoops.balanceOf(addr2.address);
            totalSp = totalSp + 10;
            expect(tknBal).to.equal(10);
        });

        it('Total supply should increase', async function()  {
            expect(await hoops.totalSupply()).to.equal(totalSp);
        });
        
    });

    describe('Transfers',async () => {
        it('Owner should transfer ownership', async function()  {
            await hoops.transferOwnership(addr3.address);
            await expect(hoops.setOpenMint(true)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Owner should transfer ownership', async function()  {
            await hoops.connect(addr3).transferOwnership(addr1.address);
            await expect(hoops.connect(addr3).setOpenMint(true)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Owner should transfer some hoops', async function()  {
            await hoops.transferFrom(addr1.address,addr3.address,1);
            await expect(await hoops.ownerOf(1)).to.equal(addr3.address);
        });

        it('Owner should approve all hoops on this wallet to other address', async function()  {
            await hoops.setApprovalForAll(addr3.address,true);
            await expect(hoops.connect(addr3).setOpenMint(true)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Treasury should approve other address to transfer token', async function()  {
            await hoops.connect(addr2).approve(addr4.address,24);
            await expect(await hoops.connect(addr4).getApproved(24)).to.equal(addr4.address);
        });

        it('Address 3 should transfer owner hoops', async function()  {
            await hoops.connect(addr3).transferFrom(addr1.address, addr3.address,2);
            await expect(await hoops.ownerOf(2)).to.equal(addr3.address);
        });

        it('Address 3 should safe transfer hoops', async function()  {
            await hoops.connect(addr3)["safeTransferFrom(address,address,uint256)"](addr3.address, addr15.address,2);
            await expect(await hoops.ownerOf(2)).to.equal(addr15.address);
        });

        it('Address 4 should transfer treasury hoops', async function()  {
            await hoops.connect(addr4).transferFrom(addr2.address, addr4.address,24);
            await expect(await hoops.ownerOf(24)).to.equal(addr4.address);
        });
    });

    describe('Functional test',async () => {
        it('Owner should set the URL', async function()  {
            await hoops.setUriSuffix("http:testurl.com");
        });

        it('Royalty should return treasury address', async function()  {
            let result = await hoops.connect(addr3).royaltyInfo(10,100);
            expect( result.receiver, result.royaltyAmount).to.equal(addr2.address,10);
        });

        it('owner should set any address to mint hoops', async function()  {
            await hoops.setOpenMint(true);
            await hoops.connect(addr4)["mint(uint256)"](10,{ value: ethers.utils.parseEther("1") });
            const tknBal = await hoops.balanceOf(addr4.address);
            totalSp = totalSp + 10;
            expect(tknBal).to.equal(11);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr5)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr5.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr6)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr6.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr7)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr7.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr8)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr8.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr9)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr9.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr10)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr10.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr11)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr11.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr12)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr12.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 1000 hoops', async function()  {
            for(let i =1; i<=50; i++){
                await hoops.connect(addr13)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr13.address);
            expect(tknBal).to.equal(1000);
        });

        it('Should mints 960 hoops', async function()  {
            for(let i =1; i<=48; i++){
                await hoops.connect(addr14)["mint(uint256)"](20,{ value: ethers.utils.parseEther("2") });
                totalSp = totalSp + 20;
            }
            const tknBal = await hoops.balanceOf(addr14.address);
            expect(tknBal).to.equal(960);
        });
    });

    describe('Failure Test2',async () => {
        it('Should fail when 10000 have been minted', async function()  {
            await expect( hoops["mint(uint256)"](10,{ value: ethers.utils.parseEther("1") })).to.be.revertedWith('Not enough Hoops left!');
        });
    });

    
});