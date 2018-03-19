var StellarSdk = require('stellar-sdk');
var request = require('request');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
//var pair =  StellarSdk.Keypair.random();
//console.log(pair.publicKey());
//console.log(pair.secret());

//var issuerPuclic = "GDRQ5UQ6JPQXJOPH6WJNEVF5IHSM6NAXG32L5IYNSWKDERB4PTZUFMBV";
//var issuerSecret = "SBUA7XLPGJFCXZ7J2LIW2XCP7TGUH7A6LE7CBRV4QUVBZVINWQQ26QA2";

var issuerPuclic = "GACJAVG6TPHFG6FOZ6KQDFMKQRWZPHMFD3UJZLON7I3EZKXASMRZTO4L";
var issuerSecret = "SAXUTWQPUIKYX5U5XYMAGVQX4ALWIN3CAHP3NMYFKHWEYMDBAP6WMHWO";

var distPublic = "GBU4U3X6QMJSC3OC5LWYCXAZFQTZYKP46IE7FFIBF3QODQQNEB245MDG";
var distSecret = "SDP6P7VYVVDJOP7BEKHQ3GJJSDZ5RYYFWGGSMCMB7TS5E54EV3GBMAIJ";

var secondPublic = "GDHP235USF3U4OFB6AVUT547GOYTYCMZUWZQUC32A3NPM3HU46NQAZ2W";
var secondPrivate = "SCAGCLSU7QXFWBHMC64B2MJRRFSZEWSUT73HQCF5AYU3IOIMC2JZM5JF";

sendToken(distPublic, distSecret, secondPublic, '666');
//lockIssuer(issuerSecret)
//getAccBalance(distPublic)

function sendToken(issuerAcc, sourceSecret ,destAcc, amount){
    let sourceKeyPair = StellarSdk.Keypair.fromSecret(sourceSecret);

    server.loadAccount(sourceKeyPair.publicKey()).then(sourceAcc=>{
        transaction = new StellarSdk.TransactionBuilder(sourceAcc)
        .addOperation(StellarSdk.Operation.payment({
            destination:destAcc,
            asset:new StellarSdk.Asset('TESTCOIN',issuerAcc),
            amount:amount
        }))
        .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(sourceKeyPair);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
    }).then(function(result) {
        console.log('Success! Results:', result);
    })
    .catch(function(error) {
        console.error('Something went wrong!', JSON.stringify(error));
    });
}

function lockIssuer(issuerSecret){
    let keyPair = StellarSdk.Keypair.fromSecret(issuerSecret);
    server.loadAccount(keyPair.publicKey()).then(sourceAcc=>{
        transaction = new StellarSdk.TransactionBuilder(sourceAcc)
        .addOperation(StellarSdk.Operation.setOptions(
            /*'','','',0,1,1,1,null,'',''*/
            {
                inflationDest:"",
                clearFlags:undefined,
                setFlags:undefined,
                masterWeight:0,
                lowThreshold:1,
                medThreshold:1,
                highThreshold:1,
                signer:undefined,
                homeDomain:undefined,
                source:undefined
            }
        ))
        .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(keyPair);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
    }).then(function(result) {
        console.log('Success! Results:', result);
    })
    .catch(function(error) {
        console.error('Something went wrong!', error);
    });
}

function trustIssuer(issuerPublic, distributorSecret){
    let distAccount = StellarSdk.Keypair.fromSecret(distributorSecret);

    server.loadAccount(distAccount.publicKey()).then(distAcc=>{
        transaction = new StellarSdk.TransactionBuilder(distAcc)
        .addOperation(StellarSdk.Operation.changeTrust({
            asset:new StellarSdk.Asset('TESTCOIN',issuerPublic)
        }))
        .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(distAccount);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
    }).then(function(result) {
        console.log('Success! Results:', result);
    })
    .catch(function(error) {
        console.error('Something went wrong!', error);
    });

}

function getAccBalance(acc){
    server.loadAccount(acc).then(function(account) {
        account.balances.forEach(function(balance) {
            let code;
            if (balance.asset_type == "native"){
                code = "XLM";
            } else {
                code = balance.asset_code;
            }
            console.log(code, ' : ', balance.balance);
        });
    });
}

function getTestFillAcc(acc){
    request.get({
    url: 'https://horizon-testnet.stellar.org/friendbot',
    qs: { addr: acc },
    json: true
    }, function(error, response, body) {
    if (error || response.statusCode !== 200) {
        console.error('ERROR!', error || body);
    }
    else {
        console.log('SUCCESS! You have a new account :)\n', body);
    }
    });
}

