const { ethers } = require("ethers");

const contractAddress = "0xca3a57e014937c29526de98e4a8a334a7d04792b";
const privateKey = process.env.PRIVATE_KEY;

function calculateTokenID(name) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
}

// Function to get the expiry date for a given token ID
async function getExpiryDate(tokenId) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.mode.network/"
    );

    // Load the contract ABI and create a contract instance
    const contractABI = require("../artifacts/contracts/base/Base.sol/Base.json");
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      wallet
    );

    const expiryDate = await contract.nameExpires(tokenId);
    console.log(`Expiry Date for Token ID ${tokenId}: ${expiryDate}`);
    return expiryDate;
  } catch (error) {
    console.error(
      `Error getting expiry date for Token ID ${tokenId}:`,
      error.message
    );
  }
}

// Function to get the token URI for a given token ID
async function getTokenURI(tokenId) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.mode.network/"
    );

    // Load the contract ABI and create a contract instance
    const contractABI = require("../artifacts/contracts/base/Base.sol/Base.json");
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      wallet
    );

    const tokenUri = await contract.tokenURI(tokenId);
    console.log(`Token URI for Token ID ${tokenId}: ${tokenUri}`);
    return tokenUri;
  } catch (error) {
    console.error(
      `Error getting token URI for Token ID ${tokenId}:`,
      error.message
    );
  }
}

// Specify the name for which you want to find the token ID
const nameToFind = "akash";

// Calculate the token ID
const tokenId = calculateTokenID(nameToFind);

// Call the function to get the expiry date for the specified token ID
getExpiryDate(tokenId);

// Call the function to get the token URI for the specified token ID
getTokenURI(tokenId);
