const express = require('express');
const cors = require('cors');
const FabricUtils = require('./fabric-utils');
const BlockchainService = require('./blockchain-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const fabricUtils = new FabricUtils();
const blockchainService = new BlockchainService();

// Initialize the network (simplified - just Org1 for now)
async function initializeNetwork() {
    try {
        console.log('🚀 Initializing Hyperledger Fabric Network...');
        
        // Import pre-enrolled admin for Org1 only
        console.log('📝 Importing Org1 admin...');
        await fabricUtils.importAdminOrg1();
        
        // Optional: Import Org2 admin (comment out if having issues)
        try {
            console.log('📝 Importing Org2 admin...');
            await fabricUtils.importAdminOrg2();
        } catch (error) {
            console.warn('⚠️  Warning: Could not import Org2 admin:', error.message);
            console.log('📝 Continuing with Org1 only...');
        }
        
        // Initialize ledger
        console.log('📚 Initializing ledger...');
        await blockchainService.initLedger('org1');
        
        console.log('✅ Network initialization completed successfully!');
        console.log('🌐 Available organizations: Org1');
        console.log('📊 Channel: mychannel');
        console.log('📦 Chaincode: basic');
        
    } catch (error) {
        console.error('❌ Failed to initialize network:', error);
        // Don't exit, let the server run for debugging
        console.log('🔄 Server will continue running for debugging...');
    }
}

// Routes
app.get('/api/assets', async (req, res) => {
    try {
        const { org = 'org1' } = req.query;
        const assets = await blockchainService.getAllAssets(org);
        res.json({ success: true, data: assets, org });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/assets', async (req, res) => {
    try {
        const { id, color, size, owner, appraisedValue, org = 'org1' } = req.body;
        const result = await blockchainService.createAsset(id, color, size, owner, appraisedValue, org);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        network: 'Hyperledger Fabric',
        organizations: ['org1', 'org2']
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await initializeNetwork();
});

module.exports = app;
