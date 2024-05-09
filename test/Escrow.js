const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender
    let realEstate, escrow

    beforeEach(async () => {
        [buyer, seller, inspector, lender] = await ethers.getSigners() // returns 20 test accounts

        // Deploy Real State
        const RealState = await ethers.getContractFactory('RealEstate')

        realEstate = await RealState.deploy()

        // Mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        let Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        // Approve property
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List property
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {

        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress();
            expect(result).to.equal(realEstate.address)
        })

        it('Returns seller address', async () => {
            const result = await escrow.seller();
            expect(result).to.equal(seller.address)

        })

        it('Returns inspector address', async () => {
            const result = await escrow.inspector();
            expect(result).to.equal(inspector.address)
        })

        it('Returns lender address', async () => {
            const result = await escrow.lender();
            expect(result).to.equal(lender.address)
        })

    })



    describe('Listing', () => {

        it('Updates Ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })

        it('Updates isListed', async () => {
            expect(await escrow.isListed(1)).to.be.equal(true)
        })

        it('Returns buyer', async () => {
            expect(await escrow.buyer(1)).to.be.equal(buyer.address)
        })

        it('Returns purchase price', async () => {
            expect(await escrow.purchasedPrice(1)).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })



    })

    describe('Deposits', () => {

        it('Update contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait();
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Inspection', () => {
        it('Update Inspection Status', async () => {
            const transaction = await escrow.connect(inspector).upddateInspectionStatus(1, true)
            await transaction.wait();
            const result = await escrow.isInspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })

    describe('Approval', () => {
        it('Update Approval Status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait();
            
            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait();
            
            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait();
            
            
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })

        describe('Sale', () => {
            
            beforeEach(async () => {
                let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) });
                await transaction.wait();

                transaction = await escrow.connect(inspector).upddateInspectionStatus(1, true);
                await transaction.wait();

                transaction = await escrow.connect(buyer).approveSale(1);
                await transaction.wait();

                transaction = await escrow.connect(seller).approveSale(1);
                await transaction.wait();

                transaction = await escrow.connect(lender).approveSale(1);
                await transaction.wait();
            
                await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

                transaction = await escrow.connect(buyer).finalizeSale(1);
                await transaction.wait();   
            })

            it('Updates contract balance', async () => {
                expect(await escrow.getBalance()).to.be.equal(0)
            })

            it('Update the Ownership', async () => {
                expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
            })

            it('Cancels the sale', async () => {
                const transaction = await escrow.connect(buyer).cancelSale(1);
                await transaction.wait();
                expect(await escrow.isListed(1)).to.be.equal(false)
            })
        })
    })

})
