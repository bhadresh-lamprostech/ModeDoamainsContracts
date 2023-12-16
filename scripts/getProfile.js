const { ethers } = require("ethers");

const reverseRegistrarABI = require("../artifacts/contracts/registrar/ReverseRegistrar.sol/ReverseRegistrar.json");
const resolverABI = require("../artifacts/contracts/resolvers/Resolver.sol/Resolver.json");
const contractABI = require("../artifacts/contracts/base/Base.sol/Base.json");

const providerUrl = "https://sepolia.mode.network/";

// Replace with the reverse registrar contract address and resolver address for reverse resolution
const reverseRegistrarAddress = "0xF3087f9ad8718C28f4fe81C22b01cDfeca1FFbd5";
const resolverAddress = "0xf675259f989f95e15d7923AccC6883D2e1fdd735";

const contractAddress = "0xca3a57e014937c29526de98e4a8a334a7d04792b";
const privateKey =
  "0x128c6360f0192a385ea1ef6e75be2f136cbc5b4e1867463ae88cb3ab9fe3465e";

async function resolveAddressToENSName(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Connect to the reverse registrar contract
    const reverseRegistrar = new ethers.Contract(
      reverseRegistrarAddress,
      reverseRegistrarABI.abi,
      provider
    );

    // Perform reverse resolution to get the reverse node for the address
    const reverseNode = await reverseRegistrar.node(address);

    if (reverseNode === ethers.constants.HashZero) {
      throw new Error(`No reverse resolution found for ${address}`);
    }

    // Connect to the resolver contract
    const resolverContract = new ethers.Contract(
      resolverAddress,
      resolverABI.abi,
      provider
    );

    // Get the ENS name associated with the reverse node
    let ensName = await resolverContract.name(reverseNode);

    // Remove the ".mode" suffix
    ensName = ensName.replace(".mode", "");

    return ensName;
  } catch (error) {
    throw new Error(`Error resolving address to ENS name: ${error.message}`);
  }
}

async function getTokenURIFromENSName(ensName) {
  try {
    const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ensName));

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Load the contract ABI and create a contract instance
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      wallet
    );

    // Call the function to get the token URI for the specified token ID
    const tokenUri = await contract.tokenURI(tokenId);
    console.log(`Token URI for Token ID ${tokenId}: ${tokenUri}`);
    return tokenUri;
  } catch (error) {
    throw new Error(
      `Error getting token URI for ENS name ${ensName}: ${error.message}`
    );
  }
}

// Specify the Ethereum address for which you want to find the token URI
const addressToResolve = "0xB5204aff106dc1Ffc6bE909c94a6A933081dB636";

// Resolve the Ethereum address to ENS name
resolveAddressToENSName(addressToResolve)
  .then(async (ensName) => {
    // Call the function to get the token URI for the specified ENS name
    await getTokenURIFromENSName(ensName);
  })
  .catch((error) => console.error(error));
