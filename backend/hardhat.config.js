require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//* Default Template for Reference
/*
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "mumbai",
  networks: {
    mumbai: {
      url: process.env.ALCHEMY_API_KEY_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.SCAN_KEY,
    },
  },
};
*/

// Configuration
/*
  solidity - The version of solidity compiler
  defaultNetwork - The Default network to run (Without running --network-name)
  networks - Object which contains the network information
  etherscan - Object to fill in EtherScan Information for contract verification
*/
module.exports = {
  solidity: "0.8.9",
};

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
solidity: "0.8.9",
defaultNetwork: "polygon_mumbai",
networks: {
hardhat: {},
polygon_mumbai: {
url: API_URL,
accounts: [`0x${PRIVATE_KEY}`]
}
},

}


