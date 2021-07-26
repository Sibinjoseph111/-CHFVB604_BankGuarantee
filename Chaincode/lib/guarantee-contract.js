/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class GuaranteeContract extends Contract {    

    async guaranteeExists(ctx, guaranteeId) {
        const buffer = await ctx.stub.getState(guaranteeId);
        return (!!buffer && buffer.length > 0);
    }

    async beneficiaryExists(ctx, beneficiaryId) {
        const buffer = await ctx.stub.getState(beneficiaryId);
        return (!!buffer && buffer.length > 0);
    }

    async createGuarantee(ctx, guaranteeId, beneficiaryId, amount) {
        const guaranteeExists = await this.guaranteeExists(ctx, guaranteeId);
        if (guaranteeExists) {
            throw new Error(`The guarantee ${guaranteeId} already exists`);
        }
        
        const beneficiaryExists = await this.beneficiaryExists(ctx, beneficiaryId);
        if (beneficiaryExists) {
            console.log('Beneficiary Exists');
            const beneficiaryBuffer = await ctx.stub.getState(beneficiaryId);
            const beneficiaryAsset = JSON.parse(beneficiaryBuffer.toString());

            if(beneficiaryAsset.credibility == 'bad'){
                throw new Error(`The credibility of beneficiary ${beneficiaryId} is bad`);
            }
        }else {
           await this.createBeneficiary(ctx,beneficiaryId);
        }

        const bankMSP = await ctx.clientIdentity.getMSPID();

        const asset = { 
            bankMSP : bankMSP,
            beneficiary : beneficiaryId,
            amount: amount,
            status : 'created'

         };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(guaranteeId, buffer);
        return asset;
    }

    async createBeneficiary(ctx, beneficiaryId){

        const beneficiaryExists = await this.beneficiaryExists(ctx, beneficiaryId);
        if (beneficiaryExists) {
            throw new Error(`The beneficiary ${beneficiaryId} already exists`);
        }

        const beneficiaryAsset = {credibility: 'good'};
        const beneficiaryBuffer = Buffer.from(JSON.stringify(beneficiaryAsset));
        await ctx.stub.putState(beneficiaryId, beneficiaryBuffer);
    }

    async viewGuarantee(ctx, guaranteeId) {
        const exists = await this.guaranteeExists(ctx, guaranteeId);
        if (!exists) {
            throw new Error(`The guarantee ${guaranteeId} does not exist`);
        }
        const buffer = await ctx.stub.getState(guaranteeId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async viewBeneficiary(ctx, beneficiaryId) {
        const exists = await this.beneficiaryExists(ctx, beneficiaryId);
        if (!exists) {
            throw new Error(`The beneficiary ${beneficiaryId} does not exist`);
        }
        const buffer = await ctx.stub.getState(beneficiaryId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async changeOwnership(ctx, guaranteeId, beneficiaryId ,newBeneficiary) {
        const exists = await this.guaranteeExists(ctx, guaranteeId);
        if (!exists) {
            throw new Error(`The guarantee ${guaranteeId} does not exist`);
        }

        const currentMSP = await ctx.clientIdentity.getMSPID();
        const guaranteeBuffer = await ctx.stub.getState(guaranteeId);
        const guaranteeAsset = JSON.parse(guaranteeBuffer.toString());
        if(guaranteeAsset.bankMSP != currentMSP){
            throw new Error(`Your organistion ${currentMSP} is not authorised for this operation`);
        }

        if(guaranteeAsset.beneficiary != beneficiaryId){
            throw new Error(`The beneficiary ${beneficiaryId} doesnot match this guarantee`);
        }

         guaranteeAsset.beneficiary = newBeneficiary;
         guaranteeAsset.status = 'ownership_changed';
         guaranteeAsset.originalOwner = beneficiaryId;

         const newBuffer = Buffer.from(JSON.stringify(guaranteeAsset));
         await ctx.stub.putState(guaranteeId, newBuffer);
         return guaranteeAsset;

    }

    async claimGuarantee(ctx, guaranteeId){
        const exists = await this.guaranteeExists(ctx, guaranteeId);
        if (!exists) {
            throw new Error(`The guarantee ${guaranteeId} does not exist`);
        }

        const currentMSP = await ctx.clientIdentity.getMSPID();
        const guaranteeBuffer = await ctx.stub.getState(guaranteeId);
        const guaranteeAsset = JSON.parse(guaranteeBuffer.toString());
        if(guaranteeAsset.bankMSP != currentMSP){
            throw new Error(`Your organistion ${currentMSP} is not authorised for this operation`);
        }

        if(guaranteeAsset.status == 'claimed' || guaranteeAsset.status == 'canceled'){
            throw new Error(`Guarantee ${guaranteeId} has already been claimed / canceled`)
        }

        const beneficiaryExists = await this.beneficiaryExists(ctx, guaranteeAsset.originalOwner);
        if(!beneficiaryExists){
            throw new Error(`Error original owner not found`);
        }
        
        const beneficiaryBuffer = await ctx.stub.getState(guaranteeAsset.originalOwner);
        const beneficiaryAsset = JSON.parse(beneficiaryBuffer.toString());

        beneficiaryAsset.credibility = 'bad';
        guaranteeAsset.status = 'claimed';

        const newGuaranteeBuffer = Buffer.from(JSON.stringify(guaranteeAsset));
        const newBeneficiaryBuffer = Buffer.from(JSON.stringify(beneficiaryAsset));

        await ctx.stub.putState(guaranteeId, newGuaranteeBuffer);
        await ctx.stub.putState(guaranteeAsset.originalOwner, newBeneficiaryBuffer);

        return guaranteeAsset;
    }

    async cancelGuarantee(ctx, guaranteeId) {
        const exists = await this.guaranteeExists(ctx, guaranteeId);
        if (!exists) {
            throw new Error(`The guarantee ${guaranteeId} does not exist`);
        }

        const currentMSP = await ctx.clientIdentity.getMSPID();
        const guaranteeBuffer = await ctx.stub.getState(guaranteeId);
        const guaranteeAsset = JSON.parse(guaranteeBuffer.toString());
        if(guaranteeAsset.bankMSP != currentMSP){
            throw new Error(`Your organistion ${currentMSP} is not authorised for this operation`);
        }

        if(guaranteeAsset.status == 'claimed' || guaranteeAsset.status == 'canceled'){
            throw new Error(`Guarantee ${guaranteeId} has already been claimed / canceled`)
        }

        guaranteeAsset.status = 'canceled';
        const newBuffer = Buffer.from(JSON.stringify(guaranteeAsset));

        await ctx.stub.putState(guaranteeId,newBuffer);
        return guaranteeAsset;
    }

    async updateBeneficiaryCredibility(ctx, beneficiaryId, credibility) {
    const exists = await this.beneficiaryExists(ctx, beneficiaryId);
    if (!exists) {
        throw new Error(`The beneficiary ${beneficiaryId} does not exist`);
    }
    
    const buffer = await ctx.stub.getState(beneficiaryId);
    const asset = JSON.parse(buffer.toString());

    asset.credibility = credibility;

    const newBuffer = Buffer.from(JSON.stringify(asset));
    await ctx.stub.putState(beneficiaryId, newBuffer);

    return asset;

    }

    //PrivateDataCollection

    async getCollectionName(ctx){
        var collectionName;
        const currentMSP = await ctx.clientIdentity.getMSPID();
        switch(currentMSP){
            case 'BankOneMSP': 
                collectionName = 'BankOneCollection'
                break;
            case 'BankTwoMSP': 
            collectionName = 'BankTwoCollection'
            break;
        }
        console.log(collectionName);
        return collectionName;
    }

    async privateDataExists(ctx, privateAssetId){

        var collectionName = await this.getCollectionName(ctx);

        const buffer = await ctx.stub.getPrivateDataHash(collectionName,privateAssetId);
        return (!!buffer && buffer.length > 0);
    }

    async createPrivateAsset(ctx,privateAssetId){

        var collectionName = await this.getCollectionName(ctx);

        const exists =  await this.privateDataExists(ctx,privateAssetId);
        if(exists){
            throw new Error(`The private asset ${privateAssetId} already exists`);
        }

        var privateAsset = {};
        const transientData = ctx.stub.getTransient();

        if(transientData.size == 0 || !transientData.has("value")){
            throw new Error(`Transient data was not mentioned`);
        }

        privateAsset.userId = transientData.get("userId").toString("utf8");
        privateAsset.value = transientData.get("value").toString("utf8");
        console.log(privateAsset.toString);

        var buffer = Buffer.from(JSON.stringify(privateAsset));

        await ctx.stub.putPrivateData(collectionName,privateAssetId,buffer);
        return privateAsset;
    }

    async readPrivateAsset(ctx, privateAssetId){
        var collectionName = await this.getCollectionName(ctx);

        const exists =  await this.privateDataExists(ctx,privateAssetId);
        if(!exists){
            throw new Error(`The private asset ${privateAssetId} doesnot exist`);
        }

        const privateData = await ctx.stub.getPrivateData(collectionName,privateAssetId);

        return JSON.parse(privateData.toString());
    }

}

module.exports = GuaranteeContract;
