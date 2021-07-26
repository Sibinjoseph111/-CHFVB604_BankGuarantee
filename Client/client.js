const {profile} = require('./profile');
const {FileSystemWallet, Gateway} = require('fabric-network');

class clientApp{

    setRoleAndIdentity(role, identityLabel){
        this.Profile = profile[role.toLowerCase()];
        let wallet = new FileSystemWallet(this.Profile["Wallet"]);
        this.connectionOptions = {
            identity : identityLabel,
            wallet : wallet,
            discovery : {
                enabled : true,
                asLocalhost : true
            }
        }
    }

    initChannelAndChaincode(channelName,contractName){
        this.channel = channelName;
        this.contractName = contractName;
    }

    async generatedAndSubmitTxn(txnName, ...args){
        let gateway = new Gateway();
        

        try{

            await gateway.connect(this.Profile["CCP"], this.connectionOptions);
            let channel = await gateway.getNetwork(this.channel);
            let contract = await channel.getContract(this.contractName);

            let result = await contract.submitTransaction(txnName, ...args).catch(err => {
                console.log(`Error Occoured \n${err}`);
            });
            return result;

        }catch(err){
            console.log(`Error Occoures \n${err}`);
        }finally{
            console.log('Txn Complete... Disconnecting');
            gateway.disconnect();
        }
    }

    async submitPrivateDataTxn(txnName, assetId, transientData){
        
        let gateway = new Gateway();

        try{

            await gateway.connect(this.Profile["CCP"], this.connectionOptions);
            let channel = await gateway.getNetwork(this.channel);
            let contract = await channel.getContract(this.contractName);

            let result = await contract.createTransaction(txnName).setTransient(transientData).submit(assetId);
            return result;

        }catch(err){
            console.log(`Error Occoures \n${err}`);
        }finally{
            console.log('Txn Complete... Disconnecting');
            gateway.disconnect();
        }

    }

}

module.exports = { clientApp }