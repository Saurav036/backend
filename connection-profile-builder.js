const fs = require('fs');
const path = require('path');

class ConnectionProfileBuilder {
    constructor() {
        this.fabricSamplesPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network');
    }

    buildConnectionProfileOrg1() {
        const org1CryptoPath = path.join(
            this.fabricSamplesPath,
            'organizations/peerOrganizations/org1.example.com'
        );

        // Read TLS CA certificate
        const tlsCertPath = path.join(org1CryptoPath, 'peers/peer0.org1.example.com/tls/ca.crt');
        
        if (!fs.existsSync(tlsCertPath)) {
            throw new Error(`TLS certificate not found at: ${tlsCertPath}`);
        }
        
        const tlsCert = fs.readFileSync(tlsCertPath).toString();

        // Read CA certificate
        const caCertPath = path.join(org1CryptoPath, 'ca/ca.org1.example.com-cert.pem');
        
        if (!fs.existsSync(caCertPath)) {
            throw new Error(`CA certificate not found at: ${caCertPath}`);
        }
        
        const caCert = fs.readFileSync(caCertPath).toString();

        return {
            name: "test-network-org1",
            version: "1.0.0",
            client: {
                organization: "Org1",
                connection: {
                    timeout: {
                        peer: { endorser: "300" },
                        orderer: "300"
                    }
                }
            },
            organizations: {
                Org1: {
                    mspid: "Org1MSP",
                    peers: ["peer0.org1.example.com"],
                    certificateAuthorities: ["ca.org1.example.com"]
                }
            },
            peers: {
                "peer0.org1.example.com": {
                    url: "grpcs://localhost:7051",
                    tlsCACerts: { pem: tlsCert },
                    grpcOptions: {
                        "ssl-target-name-override": "peer0.org1.example.com",
                        "hostnameOverride": "peer0.org1.example.com"
                    }
                }
            },
            certificateAuthorities: {
                "ca.org1.example.com": {
                    url: "https://localhost:7054",
                    caName: "ca-org1",
                    tlsCACerts: { pem: caCert },
                    httpOptions: { verify: false }
                }
            }
        };
    }

    buildConnectionProfileOrg2() {
        const org2CryptoPath = path.join(
            this.fabricSamplesPath,
            'organizations/peerOrganizations/org2.example.com'
        );

        // Read TLS CA certificate
        const tlsCertPath = path.join(org2CryptoPath, 'peers/peer0.org2.example.com/tls/ca.crt');
        
        if (!fs.existsSync(tlsCertPath)) {
            throw new Error(`TLS certificate not found at: ${tlsCertPath}`);
        }
        
        const tlsCert = fs.readFileSync(tlsCertPath).toString();

        // Read CA certificate
        const caCertPath = path.join(org2CryptoPath, 'ca/ca.org2.example.com-cert.pem');
        
        if (!fs.existsSync(caCertPath)) {
            throw new Error(`CA certificate not found at: ${caCertPath}`);
        }
        
        const caCert = fs.readFileSync(caCertPath).toString();

        return {
            name: "test-network-org2",
            version: "1.0.0",
            client: {
                organization: "Org2",
                connection: {
                    timeout: {
                        peer: { endorser: "300" },
                        orderer: "300"
                    }
                }
            },
            organizations: {
                Org2: {
                    mspid: "Org2MSP",
                    peers: ["peer0.org2.example.com"],
                    certificateAuthorities: ["ca.org2.example.com"]
                }
            },
            peers: {
                "peer0.org2.example.com": {
                    url: "grpcs://localhost:9051",
                    tlsCACerts: { pem: tlsCert },
                    grpcOptions: {
                        "ssl-target-name-override": "peer0.org2.example.com",
                        "hostnameOverride": "peer0.org2.example.com"
                    }
                }
            },
            certificateAuthorities: {
                "ca.org2.example.com": {
                    url: "https://localhost:8054",
                    caName: "ca-org2",
                    tlsCACerts: { pem: caCert },
                    httpOptions: { verify: false }
                }
            }
        };
    }
}

module.exports = ConnectionProfileBuilder;
