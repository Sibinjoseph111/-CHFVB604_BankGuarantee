const {clientApp} = require('./client');

let bankOneClient = new clientApp();

bankOneClient.setRoleAndIdentity('banktwo','admin');
bankOneClient.initChannelAndChaincode('channel1','Chaincode');
// bankOneClient.generatedAndSubmitTxn("createGuarantee","G006","B002","500000").then(result => {
//     console.log(result.toString());
// });
const transientData = {
    userId: Buffer.from('B003'),
    value: Buffer.from('7000000')
};

// bankOneClient.generatedAndSubmitTxn("readPrivateAsset","PA005").then(result => {
//     console.log(result.toString());
// });

bankOneClient.submitPrivateDataTxn("createPrivateAsset", "PA008", transientData).then(result => {
    console.log(result.toString());
});