require("@nomicfoundation/hardhat-toolbox");

const DEFAULT_COMPILER_SETTINGS = {
    version: '0.7.6',
    settings: {
      evmVersion: 'istanbul',
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      metadata: {
        bytecodeHash: 'none',
      },
    },
  }

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [DEFAULT_COMPILER_SETTINGS],
    },
};
