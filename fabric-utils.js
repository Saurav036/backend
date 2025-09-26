// const { Gateway, Wallets } = require('fabric-network');
// const FabricCAServices = require('fabric-ca-client');
// const path = require('path');
// const fs = require('fs');

// class FabricUtils {
//     constructor() {
//         this.channelName = 'mychannel';
//         this.chaincodeName = 'basic';
//         this.mspOrg1 = 'Org1MSP';
//         this.walletPath = path.join(process.cwd(), 'wallet');
//         this.org1UserId = 'appUser';
//     }

//     async connectToNetwork() {
//         const ccp = this.buildCCPOrg1();
//         const wallet = await this.buildWallet(Wallets, this.walletPath);

//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: this.org1UserId,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(this.channelName);
//         const contract = network.getContract(this.chaincodeName);

//         return { contract, network, gateway };
//     }

//     buildCCPOrg1() {
//         const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 
//             'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//         const fileExists = fs.existsSync(ccpPath);
//         if (!fileExists) {
//             throw new Error(`no such file or directory: ${ccpPath}`);
//         }
//         const contents = fs.readFileSync(ccpPath, 'utf8');
//         const ccp = JSON.parse(contents);

//         console.log(`Loaded the network configuration located at ${ccpPath}`);
//         return ccp;
//     }

//     async buildWallet(Wallets, walletPath) {
//         let wallet;
//         if (walletPath) {
//             wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`Built a file system wallet at ${walletPath}`);
//         } else {
//             wallet = await Wallets.newInMemoryWallet();
//             console.log('Built an in memory wallet');
//         }

//         return wallet;
//     }

//     async enrollAdmin() {
//         try {
//             const ccp = this.buildCCPOrg1();
//             const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
//             const caTLSCACerts = caInfo.tlsCACerts.pem;
//             const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const identity = await wallet.get('admin');
//             if (identity) {
//                 console.log('An identity for the admin user "admin" already exists in the wallet');
//                 return;
//             }

//             const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg1,
//                 type: 'X.509',
//             };
//             await wallet.put('admin', x509Identity);
//             console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

//         } catch (error) {
//             console.error(`Failed to enroll admin user "admin": ${error}`);
//         }
//     }

//     async registerUser() {
//         try {
//             const ccp = this.buildCCPOrg1();
//             const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
//             const ca = new FabricCAServices(caURL);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const userIdentity = await wallet.get(this.org1UserId);
//             if (userIdentity) {
//                 console.log(`An identity for the user ${this.org1UserId} already exists in the wallet`);
//                 return;
//             }

//             const adminIdentity = await wallet.get('admin');
//             if (!adminIdentity) {
//                 console.log('An identity for the admin user "admin" does not exist in the wallet');
//                 console.log('Run the enrollAdmin.js application before retrying');
//                 return;
//             }

//             const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
//             const adminUser = await provider.getUserContext(adminIdentity, 'admin');

//             const secret = await ca.register({
//                 affiliation: 'org1.department1',
//                 enrollmentID: this.org1UserId,
//                 role: 'client'
//             }, adminUser);

//             const enrollment = await ca.enroll({
//                 enrollmentID: this.org1UserId,
//                 enrollmentSecret: secret
//             });

//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg1,
//                 type: 'X.509',
//             };

//             await wallet.put(this.org1UserId, x509Identity);
//             console.log(`Successfully registered and enrolled admin user ${this.org1UserId} and imported it into the wallet`);

//         } catch (error) {
//             console.error(`Failed to register user ${this.org1UserId}: ${error}`);
//         }
//     }
// }

// module.exports = FabricUtils;



// const { Gateway, Wallets } = require('fabric-network');
// const FabricCAServices = require('fabric-ca-client');
// const path = require('path');
// const fs = require('fs');

// class FabricUtils {
//     constructor() {
//         this.channelName = 'mychannel';
//         this.chaincodeName = 'basic';
//         this.mspOrg1 = 'Org1MSP';
//         this.mspOrg2 = 'Org2MSP';
//         this.walletPath = path.join(process.cwd(), 'wallet');
//         this.org1UserId = 'appUser1';
//         this.org2UserId = 'appUser2';
//     }

//     // Build connection profile for Org1
//     buildCCPOrg1() {
//         const ccpPath = path.resolve(__dirname, 'config', 'connection-org1.json');
//         const fileExists = fs.existsSync(ccpPath);
//         if (!fileExists) {
//             throw new Error(`Connection profile not found at: ${ccpPath}`);
//         }
//         const contents = fs.readFileSync(ccpPath, 'utf8');
//         const ccp = JSON.parse(contents);
//         console.log(`✅ Loaded Org1 network configuration from ${ccpPath}`);
//         return ccp;
//     }

//     // Build connection profile for Org2
//     buildCCPOrg2() {
//         const ccpPath = path.resolve(__dirname, 'config', 'connection-org2.json');
//         const fileExists = fs.existsSync(ccpPath);
//         if (!fileExists) {
//             throw new Error(`Connection profile not found at: ${ccpPath}`);
//         }
//         const contents = fs.readFileSync(ccpPath, 'utf8');
//         const ccp = JSON.parse(contents);
//         console.log(`✅ Loaded Org2 network configuration from ${ccpPath}`);
//         return ccp;
//     }

//     async buildWallet(Wallets, walletPath) {
//         let wallet;
//         if (walletPath) {
//             wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`✅ Built a file system wallet at ${walletPath}`);
//         } else {
//             wallet = await Wallets.newInMemoryWallet();
//             console.log('✅ Built an in-memory wallet');
//         }
//         return wallet;
//     }

//     // Connect to network using Org1
//     async connectToNetworkAsOrg1() {
//         const ccp = this.buildCCPOrg1();
//         const wallet = await this.buildWallet(Wallets, this.walletPath);

//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: this.org1UserId,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(this.channelName);
//         const contract = network.getContract(this.chaincodeName);

//         return { contract, network, gateway };
//     }

//     // Connect to network using Org2
//     async connectToNetworkAsOrg2() {
//         const ccp = this.buildCCPOrg2();
//         const wallet = await this.buildWallet(Wallets, this.walletPath);

//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: this.org2UserId,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(this.channelName);
//         const contract = network.getContract(this.chaincodeName);

//         return { contract, network, gateway };
//     }

//     // Generic connect method (defaults to Org1)
//     async connectToNetwork(org = 'org1') {
//         if (org === 'org1') {
//             return await this.connectToNetworkAsOrg1();
//         } else if (org === 'org2') {
//             return await this.connectToNetworkAsOrg2();
//         } else {
//             throw new Error('Invalid organization. Use "org1" or "org2"');
//         }
//     }

//     // Enroll admin for Org1
//     async enrollAdminOrg1() {
//         try {
//             const ccp = this.buildCCPOrg1();
//             const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
//             const caTLSCACerts = caInfo.tlsCACerts.pem;
//             const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const identity = await wallet.get('adminOrg1');
//             if (identity) {
//                 console.log('✅ Admin identity for Org1 already exists in wallet');
//                 return;
//             }

//             const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg1,
//                 type: 'X.509',
//             };
//             await wallet.put('adminOrg1', x509Identity);
//             console.log('✅ Successfully enrolled admin for Org1 and imported to wallet');

//         } catch (error) {
//             console.error(`❌ Failed to enroll admin for Org1: ${error}`);
//             throw error;
//         }
//     }

//     // Enroll admin for Org2
//     async enrollAdminOrg2() {
//         try {
//             const ccp = this.buildCCPOrg2();
//             const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
//             const caTLSCACerts = caInfo.tlsCACerts.pem;
//             const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const identity = await wallet.get('adminOrg2');
//             if (identity) {
//                 console.log('✅ Admin identity for Org2 already exists in wallet');
//                 return;
//             }

//             const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg2,
//                 type: 'X.509',
//             };
//             await wallet.put('adminOrg2', x509Identity);
//             console.log('✅ Successfully enrolled admin for Org2 and imported to wallet');

//         } catch (error) {
//             console.error(`❌ Failed to enroll admin for Org2: ${error}`);
//             throw error;
//         }
//     }

//     // Register user for Org1
//     async registerUserOrg1() {
//         try {
//             const ccp = this.buildCCPOrg1();
//             const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
//             const ca = new FabricCAServices(caURL);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const userIdentity = await wallet.get(this.org1UserId);
//             if (userIdentity) {
//                 console.log(`✅ User identity ${this.org1UserId} already exists in wallet`);
//                 return;
//             }

//             const adminIdentity = await wallet.get('adminOrg1');
//             if (!adminIdentity) {
//                 console.log('❌ Admin identity for Org1 does not exist in wallet');
//                 console.log('Run enrollAdminOrg1 first');
//                 return;
//             }

//             const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
//             const adminUser = await provider.getUserContext(adminIdentity, 'adminOrg1');

//             const secret = await ca.register({
//                 affiliation: 'org1.department1',
//                 enrollmentID: this.org1UserId,
//                 role: 'client'
//             }, adminUser);

//             const enrollment = await ca.enroll({
//                 enrollmentID: this.org1UserId,
//                 enrollmentSecret: secret
//             });

//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg1,
//                 type: 'X.509',
//             };

//             await wallet.put(this.org1UserId, x509Identity);
//             console.log(`✅ Successfully registered user ${this.org1UserId} for Org1`);

//         } catch (error) {
//             console.error(`❌ Failed to register user for Org1: ${error}`);
//             throw error;
//         }
//     }

//     // Register user for Org2
//     async registerUserOrg2() {
//         try {
//             const ccp = this.buildCCPOrg2();
//             const caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
//             const ca = new FabricCAServices(caURL);

//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             const userIdentity = await wallet.get(this.org2UserId);
//             if (userIdentity) {
//                 console.log(`✅ User identity ${this.org2UserId} already exists in wallet`);
//                 return;
//             }

//             const adminIdentity = await wallet.get('adminOrg2');
//             if (!adminIdentity) {
//                 console.log('❌ Admin identity for Org2 does not exist in wallet');
//                 console.log('Run enrollAdminOrg2 first');
//                 return;
//             }

//             const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
//             const adminUser = await provider.getUserContext(adminIdentity, 'adminOrg2');

//             const secret = await ca.register({
//                 affiliation: 'org2.department1',
//                 enrollmentID: this.org2UserId,
//                 role: 'client'
//             }, adminUser);

//             const enrollment = await ca.enroll({
//                 enrollmentID: this.org2UserId,
//                 enrollmentSecret: secret
//             });

//             const x509Identity = {
//                 credentials: {
//                     certificate: enrollment.certificate,
//                     privateKey: enrollment.key.toBytes(),
//                 },
//                 mspId: this.mspOrg2,
//                 type: 'X.509',
//             };

//             await wallet.put(this.org2UserId, x509Identity);
//             console.log(`✅ Successfully registered user ${this.org2UserId} for Org2`);

//         } catch (error) {
//             console.error(`❌ Failed to register user for Org2: ${error}`);
//             throw error;
//         }
//     }
// }

// module.exports = FabricUtils;


// const { Gateway, Wallets } = require('fabric-network');
// const path = require('path');
// const fs = require('fs');

// class FabricUtils {
//     constructor() {
//         this.channelName = 'mychannel';
//         this.chaincodeName = 'basic';
//         this.mspOrg1 = 'Org1MSP';
//         this.mspOrg2 = 'Org2MSP';
//         this.walletPath = path.join(process.cwd(), 'wallet');
//         this.org1UserId = 'Admin@org1.example.com';
//         this.org2UserId = 'Admin@org2.example.com';
//     }

//     buildCCPOrg1() {
//         const ccpPath = path.resolve(__dirname, 'config', 'connection-org1.json');
//         const fileExists = fs.existsSync(ccpPath);
//         if (!fileExists) {
//             throw new Error(`Connection profile not found at: ${ccpPath}`);
//         }
//         const contents = fs.readFileSync(ccpPath, 'utf8');
//         const ccp = JSON.parse(contents);
//         console.log(`✅ Loaded Org1 network configuration from ${ccpPath}`);
//         return ccp;
//     }

//     buildCCPOrg2() {
//         const ccpPath = path.resolve(__dirname, 'config', 'connection-org2.json');
//         const fileExists = fs.existsSync(ccpPath);
//         if (!fileExists) {
//             throw new Error(`Connection profile not found at: ${ccpPath}`);
//         }
//         const contents = fs.readFileSync(ccpPath, 'utf8');
//         const ccp = JSON.parse(contents);
//         console.log(`✅ Loaded Org2 network configuration from ${ccpPath}`);
//         return ccp;
//     }

//     async buildWallet(Wallets, walletPath) {
//         let wallet;
//         if (walletPath) {
//             wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`✅ Built a file system wallet at ${walletPath}`);
//         } else {
//             wallet = await Wallets.newInMemoryWallet();
//             console.log('✅ Built an in-memory wallet');
//         }
//         return wallet;
//     }

//     // Import pre-enrolled admin for Org1 (without CA)
//     async importAdminOrg1() {
//         try {
//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             // Check if admin already exists
//             const identity = await wallet.get(this.org1UserId);
//             if (identity) {
//                 console.log('✅ Admin identity for Org1 already exists in wallet');
//                 return;
//             }

//             // Path to admin certificates
//             const credPath = path.join(
//                 process.cwd(),
//                 '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com'
//             );

//             const certPath = path.join(credPath, 'msp/signcerts/cert.pem');
//             const keyDir = path.join(credPath, 'msp/keystore');
//             const keyFiles = fs.readdirSync(keyDir);
//             const keyPath = path.join(keyDir, keyFiles[0]);

//             const cert = fs.readFileSync(certPath).toString();
//             const key = fs.readFileSync(keyPath).toString();

//             const x509Identity = {
//                 credentials: {
//                     certificate: cert,
//                     privateKey: key,
//                 },
//                 mspId: this.mspOrg1,
//                 type: 'X.509',
//             };

//             await wallet.put(this.org1UserId, x509Identity);
//             console.log('✅ Successfully imported admin identity for Org1');

//         } catch (error) {
//             console.error(`❌ Failed to import admin for Org1: ${error}`);
//             throw error;
//         }
//     }

//     // Import pre-enrolled admin for Org2 (without CA)
//     async importAdminOrg2() {
//         try {
//             const wallet = await this.buildWallet(Wallets, this.walletPath);

//             // Check if admin already exists
//             const identity = await wallet.get(this.org2UserId);
//             if (identity) {
//                 console.log('✅ Admin identity for Org2 already exists in wallet');
//                 return;
//             }

//             // Path to admin certificates
//             const credPath = path.join(
//                 process.cwd(),
//                 '../fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com'
//             );

//             const certPath = path.join(credPath, 'msp/signcerts/cert.pem');
//             const keyDir = path.join(credPath, 'msp/keystore');
//             const keyFiles = fs.readdirSync(keyDir);
//             const keyPath = path.join(keyDir, keyFiles[0]);

//             const cert = fs.readFileSync(certPath).toString();
//             const key = fs.readFileSync(keyPath).toString();

//             const x509Identity = {
//                 credentials: {
//                     certificate: cert,
//                     privateKey: key,
//                 },
//                 mspId: this.mspOrg2,
//                 type: 'X.509',
//             };

//             await wallet.put(this.org2UserId, x509Identity);
//             console.log('✅ Successfully imported admin identity for Org2');

//         } catch (error) {
//             console.error(`❌ Failed to import admin for Org2: ${error}`);
//             throw error;
//         }
//     }

//     // Connect to network using Org1
//     async connectToNetworkAsOrg1() {
//         const ccp = this.buildCCPOrg1();
//         const wallet = await this.buildWallet(Wallets, this.walletPath);
//         console.log('\n\n\nwallet is here', wallet, '\n\n\n')
//         const gateway = new Gateway();
//         console.log('\n\n\ngateway is here', gateway, '\n\n\n')

//         await gateway.connect(ccp, {
//             wallet,
//             identity: this.org1UserId,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(this.channelName);
//         const contract = network.getContract(this.chaincodeName);

//         return { contract, network, gateway };
//     }

//     // Connect to network using Org2
//     async connectToNetworkAsOrg2() {
//         const ccp = this.buildCCPOrg2();
//         const wallet = await this.buildWallet(Wallets, this.walletPath);

//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: this.org2UserId,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(this.channelName);
//         const contract = network.getContract(this.chaincodeName);

//         return { contract, network, gateway };
//     }

//     // Generic connect method (defaults to Org1)
//     async connectToNetwork(org = 'org1') {
//         if (org === 'org1') {
//             return await this.connectToNetworkAsOrg1();
//         } else if (org === 'org2') {
//             return await this.connectToNetworkAsOrg2();
//         } else {
//             throw new Error('Invalid organization. Use "org1" or "org2"');
//         }
//     }
// }

// module.exports = FabricUtils;


const { Gateway, Wallets } = require('fabric-network');
const ConnectionProfileBuilder = require('./connection-profile-builder');
const path = require('path');
const fs = require('fs');

class FabricUtils {
    constructor() {
        this.channelName = 'mychannel';
        this.chaincodeName = 'basic';
        this.mspOrg1 = 'Org1MSP';
        this.mspOrg2 = 'Org2MSP';
        this.walletPath = path.join(process.cwd(), 'wallet');
        this.org1UserId = 'Admin@org1.example.com';
        this.org2UserId = 'Admin@org2.example.com';
        this.connectionBuilder = new ConnectionProfileBuilder();
    }

    buildCCPOrg1() {
        try {
            console.log('📋 Building connection profile for Org1...');
            return this.connectionBuilder.buildConnectionProfileOrg1();
        } catch (error) {
            console.error('❌ Failed to build connection profile for Org1:', error.message);
            throw error;
        }
    }

    buildCCPOrg2() {
        try {
            console.log('📋 Building connection profile for Org2...');
            return this.connectionBuilder.buildConnectionProfileOrg2();
        } catch (error) {
            console.error('❌ Failed to build connection profile for Org2:', error.message);
            throw error;
        }
    }

    async buildWallet(Wallets, walletPath) {
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`✅ Built a file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('✅ Built an in-memory wallet');
        }
        return wallet;
    }

    async importAdminOrg1() {
        try {
            console.log('👤 Importing Admin for Org1...');
            const wallet = await this.buildWallet(Wallets, this.walletPath);

            const identity = await wallet.get(this.org1UserId);
            if (identity) {
                console.log('✅ Admin identity for Org1 already exists in wallet');
                return;
            }

            const credPath = path.resolve(
                __dirname,
                '..',
                'fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com'
            );

            console.log(`📁 Looking for credentials at: ${credPath}`);

            const certPath = path.join(credPath, 'msp/signcerts/cert.pem');
            const keyDir = path.join(credPath, 'msp/keystore');

            if (!fs.existsSync(certPath)) {
                throw new Error(`Certificate not found at: ${certPath}`);
            }

            if (!fs.existsSync(keyDir)) {
                throw new Error(`Key directory not found at: ${keyDir}`);
            }

            const keyFiles = fs.readdirSync(keyDir);
            if (keyFiles.length === 0) {
                throw new Error(`No key files found in: ${keyDir}`);
            }

            const keyPath = path.join(keyDir, keyFiles[0]);
            
            const cert = fs.readFileSync(certPath).toString();
            const key = fs.readFileSync(keyPath).toString();

            const x509Identity = {
                credentials: {
                    certificate: cert,
                    privateKey: key,
                },
                mspId: this.mspOrg1,
                type: 'X.509',
            };

            await wallet.put(this.org1UserId, x509Identity);
            console.log('✅ Successfully imported admin identity for Org1');

        } catch (error) {
            console.error(`❌ Failed to import admin for Org1: ${error.message}`);
            throw error;
        }
    }

    async connectToNetworkAsOrg1() {
        try {
            console.log('🔗 Connecting to network as Org1...');
            
            const ccp = this.buildCCPOrg1();
            const wallet = await this.buildWallet(Wallets, this.walletPath);

            // Check if identity exists in wallet
            const identity = await wallet.get(this.org1UserId);
            if (!identity) {
                throw new Error(`Identity ${this.org1UserId} not found in wallet. Run importAdminOrg1 first.`);
            }

            const gateway = new Gateway();
            
            // Connect with more detailed options
            await gateway.connect(ccp, {
                wallet,
                identity: this.org1UserId,
                discovery: { 
                    enabled: true, 
                    asLocalhost: true 
                },
                eventHandlerOptions: {
                    commitTimeout: 300,
                    strategy: null
                }
            });

            console.log('✅ Connected to gateway');

            const network = await gateway.getNetwork(this.channelName);
            console.log('✅ Connected to channel:', this.channelName);

            const contract = network.getContract(this.chaincodeName);
            console.log('✅ Connected to chaincode:', this.chaincodeName);

            return { contract, network, gateway };

        } catch (error) {
            console.error(`❌ Failed to connect to network: ${error.message}`);
            throw error;
        }
    }

    async connectToNetwork(org = 'org1') {
        if (org === 'org1') {
            return await this.connectToNetworkAsOrg1();
        } else {
            throw new Error('Only org1 implemented for now');
        }
    }
}

module.exports = FabricUtils;

