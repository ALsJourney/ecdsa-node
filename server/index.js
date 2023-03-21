const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils");
const {keccak256} = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");


const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
    "04f735c89e29ba05e55f8d0c02981ab349dc1a176e908abcb175358fa976bfe962aaf002462509ebb739b5930261193a83f6ee7dcd5eebb6ac5057a7f67a1480e2": 100,
    "04b22a8efa5d411d21f969731bd0d9e7c9556ea61f9dcfb6fa962128af9089e3935599a3ee8e5d7277f192cc61aa337ec28fd28dea6b0805897600c6f96a7ee654": 50,
    "627918ed762db591a2917dcd1b49c884de79866cde9f90cd5b4f7b29c0dc8aae": 75,
};

app.get("/balance/:address", (req, res) => {
    const {address} = req.params;
    const balance = balances[address] || 0;
    res.send({balance});
});

app.post("/send", async (req, res) => {
    // Todo: get a signature from the client-side application
    // recover the public address from its signature

    const {sender, recipient, amount, signature, nonce} = req.body;

    setInitialBalance(sender);
    setInitialBalance(recipient);


    const [signedtx, recoveryBit] = signature;


    const formattedSignature = Uint8Array.from(Object.values(signature));
    const msgToBytes = utf8ToBytes(recipient + amount + JSON.stringify(nonce));
    const messageHash = toHex(keccak256(msgToBytes));


    const recoveredPublicKey = await secp.recoverPublicKey(messageHash, formattedSignature, recoveryBit);

    const verify = secp.verify(formattedSignature, messageHash, recoveryBit);
    console.log("Verified: " + verify);

    if (!verify) {
        res.status(400).send({message: "Verification failed!"});
    } else if (balances[sender] < amount) {
        res.status(400).send({message: "Not enough funds!"});

    } else if (sender === recipient) {
        res.status(400).send({message: "Cannot send to yourself! :P"});
    } else if (recipient && amount) {
        balances[sender] -= amount;
        balances[recipient] += amount;
        res.send({balance: balances[sender], message: "Transfer was successful!"});
    } else {
        res.status(400).send({message: "Invalid request!"});
    }

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
    if (!balances[address]) {
        balances[address] = 0;
    }
}
