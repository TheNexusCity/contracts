const { expect } = require('chai');

describe('Cryptosabers Contract Tests', async function()  {
    let owner, addr1, addr2;
    let Cryptosabers,cryptosabers;

    it('Deployment', async function()  {
        [owner, addr1, addr2] = await ethers.getSigners();

        Cryptosabers = await ethers.getContractFactory('Cryptosabers');

        cryptosabers = await Cryptosabers.deploy(owner.address);

        await cryptosabers.deployed(owner.address);
        
        expect(await cryptosabers.totalSupply()).to.equal(0);

        const balance = await cryptosabers.balanceOf(addr1.address);

        expect(balance).to.equal(0);
    });

    it('Mint cryptosaber for own address', async function()  {
        [addr1, addr2] = await ethers.getSigners();

        Cryptosabers = await ethers.getContractFactory('Cryptosabers');

        cryptosabers = await Cryptosabers.deploy(addr2.address);

        await cryptosabers.deployed(addr2.address);

        expect(await cryptosabers.totalSupply()).to.equal(0);

        const test = addr1.address;
        const testBytes = ethers.utils.arrayify(test);
        const messageHash = ethers.utils.hashMessage(testBytes);
        const messageHashBytes = ethers.utils.arrayify(messageHash);
        const signature = await owner.signMessage(messageHashBytes);
        //Recover the address from signature
        const recoveredAddress = ethers.utils.verifyMessage(messageHashBytes, signature);
        //Expect the recovered address is equal to the address of signer 
        expect(recoveredAddress).to.equal(owner.address);
        console.log("singerAddress                   :", owner.address);
        console.log("recovered address from ethers   :", recoveredAddress);

        //Recover the address from contract TestSign
        const split = ethers.utils.splitSignature(signature);


        await cryptosabers.balanceOf(addr1.address);
        expect(await cryptosabers.totalSupply()).to.equal(0);

        await cryptosabers.connect(addr1)["mint(uint256,uint8,bytes32,bytes32)"](1,split.v,split.r,split.s);
    });

    it('Total supply should increase', async function()  {
        expect(await cryptosabers.totalSupply()).to.equal(1);
    });

    describe('Transactions ', async () => {
        it('Should transfer from owner to other address', async function()  {
            await cryptosabers.connect(addr1).transferFrom(addr1.address,addr2.address,0);
            const tknBal = await cryptosabers.balanceOf(addr1.address);
            expect(tknBal).to.equal(0);
        });

        it('Should transfer from treasury to other address', async function()  {
            await cryptosabers.connect(addr2).transferFrom(addr2.address,addr1.address,0);
            const tknBal = await cryptosabers.balanceOf(addr2.address);
            expect(tknBal).to.equal(0);
        });
    });


    describe('Approval ',async () => {
        it('Owner should approve other account to transfer NFT', async function()  {
            await cryptosabers.approve(addr2.address,0);
            expect( await cryptosabers.getApproved(0)).to.equal(addr2.address);
        });
    });

    describe('Third party ',async () => {
        it('Other address should transfer cryptosaber', async function()  {
            await cryptosabers.connect(addr2).transferFrom(addr1.address,addr2.address,0);
            const tknBal = await cryptosabers.balanceOf(addr2.address);
            expect(tknBal).to.equal(1);
        });
    });

    describe('Owner set contract ',async () => {
        it('Owner should set the contract to be mintable for everybody ', async function()  {
            await cryptosabers.connect(owner).setOpenMint(true);

            await cryptosabers.connect(addr1)["mint(uint256)"](1);

            const tknBal = await cryptosabers.balanceOf(addr1.address);
            expect(tknBal).to.equal(1);
        });

        it('Total supply should increase', async function()  {
            expect(await cryptosabers.totalSupply()).to.equal(2);
        });
    });
});