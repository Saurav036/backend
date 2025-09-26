// // server.js
// const express = require('express');
// const { queryLedger, submitTransaction } = require('./hyperledger');

// const app = express();
// app.use(express.json());

// app.get('/query/:key', async (req, res) => {
//   try {
//     const result = await queryLedger(req.params.key);
//     res.json({ value: result });
//   } catch (error) {
//     console.error('Error querying the ledger:', error);
//     res.status(500).json({ error: 'Error querying the ledger' });
//   }
// });

// app.post('/invoke', async (req, res) => {
//   const { from, to, amount } = req.body;
//   try {
//     const result = await submitTransaction(from, to, amount);
//     res.json({ transactionHash: result });
//   } catch (error) {
//     console.error('Error submitting the transaction:', error);
//     res.status(500).json({ error: 'Error submitting the transaction' });
//   }
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });




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

// Initialize the network (enroll admin and register user)
async function initializeNetwork() {
    try {
        console.log('Enrolling admin...');
        await fabricUtils.enrollAdmin();
        
        console.log('Registering user...');
        await fabricUtils.registerUser();
        
        console.log('Initializing ledger...');
        await blockchainService.initLedger();
        
        console.log('Network initialization completed!');
    } catch (error) {
        console.error('Failed to initialize network:', error);
    }
}

// Routes
app.get('/api/assets', async (req, res) => {
    try {
        const assets = await blockchainService.getAllAssets();
        res.json({ success: true, data: assets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/assets/:id', async (req, res) => {
    try {
        const asset = await blockchainService.readAsset(req.params.id);
        res.json({ success: true, data: asset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/assets', async (req, res) => {
    try {
        const { id, color, size, owner, appraisedValue } = req.body;
        const result = await blockchainService.createAsset(id, color, size, owner, appraisedValue);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { color, size, owner, appraisedValue } = req.body;
        const result = await blockchainService.updateAsset(id, color, size, owner, appraisedValue);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/assets/:id/transfer', async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwner } = req.body;
        const result = await blockchainService.transferAsset(id, newOwner);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/assets/:id', async (req, res) => {
    try {
        const result = await blockchainService.deleteAsset(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initialize network on startup
    await initializeNetwork();
});

module.exports = app;
