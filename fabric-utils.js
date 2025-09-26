const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricUtils {
    constructor() {
        this.channelName = 'mychannel';
        this.chaincodeName = 'basic';
        this.mspOrg1 = 'Org1MSP';
        this.walletPath = path.join(process.cwd(), 'wallet');
        this.org1UserId = 'appUser';
    }

    async connectToNetwork() {
        const ccp = this.buildCCPOrg1();
        const wallet = await this.buildWallet(Wallets, this.walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: this.org1UserId,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(this.channelName);
        const contract = network.getContract(this.chaincodeName);

        return { contract, network, gateway };
    }

    buildCCPOrg1() {
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 
            'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);

        console.log(`Loaded the network configuration located at ${ccpPath}`);
        return ccp;
    }

    async buildWallet(Wallets, walletPath) {
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Built a file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('Built an in memory wallet');
        }

        return wallet;
    }

    async enrollAdmin() {
        try {
            const ccp = this.buildCCPOrg1();
            const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            const wallet = await this.buildWallet(Wallets, this.walletPath);

            const identity = await wallet.get('admin');
            if (identity) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }

            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this.mspOrg1,
                type: 'X.509',
            };
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
        }
    }

    async registerUser() {
        try {
            const ccp = this.buildCCPOrg1();
            const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            const ca = new FabricCAServices(caURL);

            const wallet = await this.buildWallet(Wallets, this.walletPath);

            const userIdentity = await wallet.get(this.org1UserId);
            if (userIdentity) {
                console.log(`An identity for the user ${this.org1UserId} already exists in the wallet`);
                return;
            }

            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.js application before retrying');
                return;
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: this.org1UserId,
                role: 'client'
            }, adminUser);

            const enrollment = await ca.enroll({
                enrollmentID: this.org1UserId,
                enrollmentSecret: secret
            });

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: this.mspOrg1,
                type: 'X.509',
            };

            await wallet.put(this.org1UserId, x509Identity);
            console.log(`Successfully registered and enrolled admin user ${this.org1UserId} and imported it into the wallet`);

        } catch (error) {
            console.error(`Failed to register user ${this.org1UserId}: ${error}`);
        }
    }
}

module.exports = FabricUtils;
