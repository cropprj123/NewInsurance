require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 31337,
    },
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC
      accounts: [
        "0x7388c3a9028c2465631658543856e670079ccc067698dd96ce76d071cafdd954",
        // "0xb1645bce29f4c3c0cde630d16ea8b4925132f1dfd984b5d99085432aa92e30d7", // Replace this with your private key
      ],
    },
  },
};
