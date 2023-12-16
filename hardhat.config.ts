import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "hardhat-abi-exporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";

import dotenv from "dotenv";

dotenv.config({ debug: false });
const {
  NODEREAL_APP_ID_STG,
  NODEREAL_APP_ID_PRD,
  PRIVATE_KEY,
  BSCSCAN_API_KEY,
  ETHERSCAN_API_KEY,
  ARBSCAN_API_KEY,
  GNOSISSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  networks: {
    eth_sepolia: {
      url: `https://eth-sepolia.public.blastapi.io`,
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    eth_mainnet: {
      url: `https://rpc.ankr.com/eth`,
      chainId: 1,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    arb_mainnet: {
      url: `https://arb1.arbitrum.io/rpc`,
      chainId: 42161,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 12450000000,
    },
    arb_testnet: {
      url: `https://goerli-rollup.arbitrum.io/rpc`,
      chainId: 421613,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 12450000000,
    },
    bsc_testnet: {
      url: ``,
      chainId: 97,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 12450000,
      gasPrice: 5000000000,
    },
    bsc_mainnet: {
      url: `https://bsc-dataseed.binance.org/`,
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 12450000,
      gasPrice: 5000000000,
    },
    zeta_testnet: {
      url: `https://zetachain-athens-evm.blockpi.network/v1/rpc/public`,
      chainId: 7001,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 12450000,
    },
    gnosis: {
      url: "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    chiado: {
      // gnosis testnet
      url: "",
      gasPrice: 5000000000,
      gas: 12450000,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    mode: {
      //mode testnet
      url: "https://sepolia.mode.network/",
      gasPrice: 5000000000,
      gas: 12450000,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    hardhat: {
      allowUnlimitedContractSize: true,
      allowBlocksWithSameTimestamp: true,
    },
  },
  etherscan: {
    apiKey: {
      chiado: "",
      bscTestnet: BSCSCAN_API_KEY || "",
      bsc: BSCSCAN_API_KEY || "",
      gnosis: GNOSISSCAN_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      mainnet: ETHERSCAN_API_KEY || "",
      arbitrumGoerli: ARBSCAN_API_KEY || "",
      arbitrumOne: ARBSCAN_API_KEY || "",
      mode: ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "chiado",
        chainId: 10200,
        urls: {
          //Blockscout
          apiURL: "https://blockscout.com/gnosis/chiado/api",
          browserURL: "https://blockscout.com/gnosis/chiado",
        },
      },
      {
        network: "mode",
        chainId: 919,
        urls: {
          //Blockscout
          apiURL: "https://sepolia.explorer.mode.network/api",
          browserURL: "https://sepolia.explorer.mode.network/",
        },
      },
      {
        network: "gnosis",
        chainId: 100,
        urls: {
          // 3) Select to what explorer verify the contracts
          // Gnosisscan
          apiURL: "https://api.gnosisscan.io/api",
          browserURL: "https://gnosisscan.io/",
          // Blockscout
          //apiURL: "https://blockscout.com/xdai/mainnet/api",
          //browserURL: "https://blockscout.com/xdai/mainnet",
        },
      },
    ],
  },
  abiExporter: {
    path: "./build/contracts",
    runOnCompile: true,
    clear: true,
    flat: true,
    except: [
      "Controllable$",
      "INameWrapper$",
      "SHA1$",
      "Ownable$",
      "NameResolver$",
      "TestBytesUtils$",
    ],
    spacing: 2,
    format: "json",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
  },
};

export default config;
