const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");


const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x9e6549c43dea3ea114e832edc8b28046f1e9835be4bec310bcf2c8990831299b": 100,
  "0x9f01954fa8f054c3979878010f95319bf63f50a0941568c31616c5ef937399fa": 50,
  "0x627918ed762db591a2917dcd1b49c884de79866cde9f90cd5b4f7b29c0dc8aae": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // Todo: get a signature from the client-side application
  // recover the public address from its signature
  

  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const messageInBytes = utf8ToBytes(message);
  const messageHash = keccak256(messageInBytes);
  const formattedSignature = Uint8Array.from(Object.values(signature[0]))
  const recoveredPublicKey = secp.recoverPublicKey(hash, formattedSignature, signature[1]);

  const recoveredAddress = `0x${toHex(keccak256(recoveredPublicKey.slice(1)).slice(-20))}`;


  setInitialBalance(recoveredAddress);
  setInitialBalance(recipient);


  const verify = secp.verify(messageHash, formattedSignature, recoveredPublicKey);
  console.log("Verified: " + verify);

  if (!verify) {
    res.status(400).send({ message: "Verification failed!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });

  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender], message: "Transfer was successful!" });
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
