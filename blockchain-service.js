const FabricUtils = require('./fabric-utils');

class BlockchainService {
    constructor() {
        this.fabricUtils = new FabricUtils();
    }

    async initLedger() {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
            await contract.submitTransaction('InitLedger');
            console.log('*** Result: committed');

            gateway.disconnect();
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    }

    async getAllAssets() {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
            const result = await contract.evaluateTransaction('GetAllAssets');
            console.log(`*** Result: ${result.toString()}`);

            gateway.disconnect();
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            throw error;
        }
    }

    async createAsset(id, color, size, owner, appraisedValue) {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Submit Transaction: CreateAsset');
            await contract.submitTransaction('CreateAsset', id, color, size, owner, appraisedValue);
            console.log('*** Result: committed');

            gateway.disconnect();
            return { success: true, message: 'Asset created successfully' };
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    }

    async readAsset(id) {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Evaluate Transaction: ReadAsset');
            const result = await contract.evaluateTransaction('ReadAsset', id);
            console.log(`*** Result: ${result.toString()}`);

            gateway.disconnect();
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            throw error;
        }
    }

    async updateAsset(id, color, size, owner, appraisedValue) {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Submit Transaction: UpdateAsset');
            await contract.submitTransaction('UpdateAsset', id, color, size, owner, appraisedValue);
            console.log('*** Result: committed');

            gateway.disconnect();
            return { success: true, message: 'Asset updated successfully' };
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    }

    async transferAsset(id, newOwner) {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Submit Transaction: TransferAsset');
            await contract.submitTransaction('TransferAsset', id, newOwner);
            console.log('*** Result: committed');

            gateway.disconnect();
            return { success: true, message: 'Asset transferred successfully' };
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    }

    async deleteAsset(id) {
        try {
            const { contract, gateway } = await this.fabricUtils.connectToNetwork();
            
            console.log('\n--> Submit Transaction: DeleteAsset');
            await contract.submitTransaction('DeleteAsset', id);
            console.log('*** Result: committed');

            gateway.disconnect();
            return { success: true, message: 'Asset deleted successfully' };
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            throw error;
        }
    }
}

module.exports = BlockchainService;
