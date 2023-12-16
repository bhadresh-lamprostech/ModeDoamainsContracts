const { ethers } = require("ethers");
const reverseRegistrarABI = require("../artifacts/contracts/registrar/ReverseRegistrar.sol/ReverseRegistrar.json"); // Replace with the path to your ReverseRegistrar ABI file
const resolverABI = require("../artifacts/contracts/resolvers/Resolver.sol/Resolver.json"); // Replace with the path to your Resolver ABI file

async function resolveAddressToENSName(address) {
  // Replace with your Ethereum node provider URL
  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.mode.network/"
  );

  // Replace with the reverse registrar contract address and resolver address for the reverse resolution
  const reverseRegistrarAddress = "0xF3087f9ad8718C28f4fe81C22b01cDfeca1FFbd5";
  const resolverAddress = "0xf675259f989f95e15d7923AccC6883D2e1fdd735";

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
  const ensName = await resolverContract.name(reverseNode);

  return ensName;
}

// Usage example
const address = "0xB5204aff106dc1Ffc6bE909c94a6A933081dB636"; // Replace with the Ethereum address you want to resolve

resolveAddressToENSName(address)
  .then((ensName) => console.log(`ENS name for ${address}: ${ensName}`))
  .catch((error) => console.error(error));
