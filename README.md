# Uniswap V3 mint new position and lock NFT token

Write a smart contract to lock Uniswap V3 NFT and issue ERC20 equal to total liquidity in that NFT w.r.t. token0. Example: If token0 is DAI and token1 is ETH, and the NFT holds 1 ETH and 1000 DAI, mint 2000 ERC20 tokens.

Steps:

```shell
npm install
npx hardhat compile
$ npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/{YOUR_API_KEY}
npx hardhat test --network localhost
```
