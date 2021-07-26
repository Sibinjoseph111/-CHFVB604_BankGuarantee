const express = require('express');
const bodyParser = require('body-parser');

const {clientApp} = require('./client');

var app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'origin,x-auth,content-type,Accept,X-Requested-With,X-Content-Type-Options');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Expose-Headers','x-auth, content-type');

    next();
});

app.post('/create_guarantee',(req,res)=> {

    var role = req.body.role;
    var guaranteeId = req.body.guaranteeId;
    var beneficiaryId = req.body.beneficiaryId;
    var value = req.body.value;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("createGuarantee",guaranteeId,beneficiaryId,value).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });
});

app.post('/create_beneficiary',(req,res)=>{

    var role = req.body.role;
    var beneficiaryId = req.body.beneficiaryId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("createBeneficiary",beneficiaryId).then(result => {
        console.log(result);
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }
        // else res.status(400).send('Something went wrong');
    }).catch(err=>{
        console.log(err);
        res.status(400).send(err);
    });

});

app.post('/view_guarantee',(req,res)=>{

    var role = req.body.role;
    var guaranteeId = req.body.guaranteeId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("viewGuarantee",guaranteeId).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });

});

app.post('/view_beneficiary',(req,res)=>{

    var role = req.body.role;
    var beneficiaryId = req.body.beneficiaryId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("viewBeneficiary",beneficiaryId).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });

});

app.post('/change_ownership',(req,res)=>{

    var role = req.body.role;
    var beneficiaryId = req.body.beneficiaryId;
    var guaranteeId = req.body.guaranteeId;
    var newBeneficiary = req.body.newBeneficiary;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("changeOwnership",guaranteeId,beneficiaryId,newBeneficiary).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });

});

app.post('/claim_guarantee', (req,res)=>{

    var role = req.body.role;
    var guaranteeId = req.body.guaranteeId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("claimGuarantee",guaranteeId).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });

});

app.post('/cancel_guarantee', (req,res)=>{

    var role = req.body.role;
    var guaranteeId = req.body.guaranteeId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("cancelGuarantee",guaranteeId).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });
});

app.post('/update_credibility', (req,res)=>{

    var role = req.body.role;
    var beneficiaryId = req.body.beneficiaryId;
    var credibility = req.body.credibility;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("updateBeneficiaryCredibility",beneficiaryId,credibility).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });
});

app.post('/create_private_asset', (req,res)=>{

    var role = req.body.role;
    var assetId = req.body.assetId;
    var userId = req.body.userId;
    var value = req.body.value;

    const transientData = {
        userId: Buffer.from(userId),
        value: Buffer.from(value)
    };

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.submitPrivateDataTxn("createPrivateAsset", assetId, transientData).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });
});

app.post('/read_private_asset', (req,res)=>{

    var role = req.body.role;
    var assetId = req.body.assetId;

    let client = new clientApp();
    client.setRoleAndIdentity(role,'admin');
    client.initChannelAndChaincode('channel1','Chaincode');
    client.generatedAndSubmitTxn("readPrivateAsset", assetId).then(result => {
        if(result != null){
            console.log(result.toString());
            res.send(result.toString());
        }else res.status(400).send('Something went wrong');
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });