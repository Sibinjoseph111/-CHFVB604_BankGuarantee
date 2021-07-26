/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { GuaranteeContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('GuaranteeContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new GuaranteeContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"guarantee 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"guarantee 1002 value"}'));

        ctx.stub.getState.withArgs('B1').resolves(Buffer.from('{"credibility":"good"}'));
        ctx.stub.getState.withArgs('G1').resolves(Buffer.from('{"beneficiary": "B1", "amount": "100000", "status": "created"}'));
        ctx.stub.getState.withArgs('G2').resolves(Buffer.from('{"beneficiary": "new Beneficiary", "amount": "100000", "status": "claimed", "originalOwner":"B1"}'));
    });

    describe('#guaranteeExists', () => {

        it('should return true for a guarantee', async () => {
            await contract.guaranteeExists(ctx, 'G1').should.eventually.be.true;
        });

        it('should return false for a guarantee that does not exist', async () => {
            await contract.guaranteeExists(ctx, 'G3').should.eventually.be.false;
        });

    });

    describe('#createGuarantee', () => {

        it('should create a guarantee', async () => {
            var value = await contract.createGuarantee(ctx, 'G2', 'B1', '100000');
            console.log(value);
            // ctx.stub.putState.should.have.been.calledWithExactly('G1', Buffer.from('{"value":"guarantee 1003 value"}'));
        });

        // it('should throw an error for a guarantee that already exists', async () => {
        //     await contract.createGuarantee(ctx, '1001', 'myvalue').should.be.rejectedWith(/The guarantee 1001 already exists/);
        // });

    });

    describe('#readGuarantee', () => {

        it('should return a guarantee', async () => {
            await contract.readGuarantee(ctx, 'G1').should.eventually.deep.equal({ bankMSP: "BankOneMSP", beneficiary: 'B1', status: 'created' });
        });

        it('should throw an error for a guarantee that does not exist', async () => {
            await contract.readGuarantee(ctx, '1003').should.be.rejectedWith(/The guarantee 1003 does not exist/);
        });

    });

    describe('#changeOwnership', () => {

        it('should change ownership', async () => {
            var value = await contract.changeOwnership(ctx, 'G1', 'B1', 'new Beneficiary');
            console.log(value);
            // ctx.stub.putState.should.have.been.calledWithExactly('G1', Buffer.from('{"value":"guarantee 1003 value"}'));
        });

    });

    describe('#claimGuarantee', () => {

        it('should claim guarantee', async () => {
            var value = await contract.claimGuarantee(ctx, 'G2');
            console.log(value);
        });

    });


    describe('#cancelGuarantee', () => {

        it('should cancel a guarantee', async () => {
            var value = await contract.cancelGuarantee(ctx, 'G2');
            console.log(value);

            // ctx.stub.deleteState.should.have.been.calledOnceWithExactly('G1');
        });

        // it('should throw an error for a guarantee that does not exist', async () => {
        //     await contract.deleteGuarantee(ctx, '1003').should.be.rejectedWith(/The guarantee 1003 does not exist/);
        // });

    });

    describe('#updateBeneficiaryCredibility', () => {

        it('should update beneficiary credibility', async () => {
            var value = await contract.updateBeneficiaryCredibility(ctx, 'B1', 'bad');
            console.log(value);
            // ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"guarantee 1001 new value"}'));
        });

        // it('should throw an error for a guarantee that does not exist', async () => {
        //     await contract.updateGuarantee(ctx, '1003', 'guarantee 1003 new value').should.be.rejectedWith(/The guarantee 1003 does not exist/);
        // });

    });

});