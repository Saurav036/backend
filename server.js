const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');

const app = express();
const port = 5000;

// Configure the Fabric network connection
const connectionProfile = path.resolve(__dirname, 'connection-profile.json');
const walletPath = path.resolve(__dirname, 'wallet');

async function initFabricNetwork() {
  // Your Fabric network initialization code here
  // Refer to the Hyperledger Fabric documentation for more details
}

app.get('/api/hello', async (req, res) => {
  try {
    await initFabricNetwork();
    res.send('Hello from the Fabric-connected backend!');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error connecting to Fabric network');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

