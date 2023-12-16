const { ethers } = require("ethers");
const web3Utils = require("web3-utils");

const { toBigInt, toHex, hexToBytes, bytesToHex, sha3 } = web3Utils;
// const {
//   calIdentifier,
//   deployToolkit,
//   registerTLD,
//   registerTLDWithoutPreRegi,
//   encodeHookExtraData,
// } = require("../test/test-utils/tld.ts");

// Replace these values with your actual contract and account details
const contractAddress = "0xC5005a0027CcD013622940202693795973991dd4";
const resolverAddress = "0xf675259f989f95e15d7923AccC6883D2e1fdd735";
const privateKey =
  "0x128c6360f0192a385ea1ef6e75be2f136cbc5b4e1867463ae88cb3ab9fe3465e";
const identifier =
  "24788734048738952657326481919470860950418461592552443182906243034561913";
const providerUrl = "https://sepolia.mode.network/";

const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Replace these values with the actual domain and registration details
const domainToRegister = "mode";
const registrationDuration = 31556952; // 1 year in seconds

async function registerDomain() {
  // Load your contract ABI and connect to the contract
  const contractABI = require("../artifacts/contracts/controller/RegistrarController.sol/RegistrarController.json"); // Replace with your actual ABI
  const contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    wallet
  );
  //2264379541407608
  const estimatedPriceArray = await contract.rentPrice(
    toBigInt(identifier),
    domainToRegister, // Replace with a label for your domain
    registrationDuration
  );
  console.log(estimatedPriceArray);
  // Access individual BigNumber objects in the array
  const base = estimatedPriceArray[0];
  const premium = estimatedPriceArray[1];

  console.log("Base Price (Wei):", base.toString());
  console.log("Premium Price (Wei):", premium.toString());
  // const USE_GIFTCARD_EXTRA_DATA = encodeHookExtraData("", true);

  const available = await contract.available(
    toBigInt(identifier),
    domainToRegister // Replace with a label for your domain
  );
  console.log(available);
  try {
    // Submit the registration transaction
    const registrationTx = await contract.bulkRegister(
      toBigInt(identifier),
      [domainToRegister],
      wallet.address,
      registrationDuration,
      resolverAddress,
      true,
      ["0x"],
      {
        value: base + premium,
        // gasLimit: 2000000, // Manually set a sufficient gas limit
      }
    );

    // Wait for the transaction to be mined
    const receipt = await registrationTx.wait();
    console.log(
      "Registration successful. Transaction hash:",
      receipt.transactionHash
    );
  } catch (error) {
    console.error("Error registering domain:", error.message);
  }
}

// Call the registration function
registerDomain();
