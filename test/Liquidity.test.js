const { expect } = require("chai")
const { ethers } = require("hardhat")
const { BN, expectRevert, constants } = require('@openzeppelin/test-helpers');

require('chai').use(require('chai-as-promised')).should()

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WETH_WHALE = "0x06920C9fC643De77B99cB7670A944AD31eaAA260"

const INonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

function bn(x) {
    return new BN(BigInt(Math.round(parseFloat(x))))
}

function toWei(x) {
    return ethers.utils.parseEther(String(x));
}

function toEth(x) {
    return ethers.utils.formatEther(String(x));
}

function toUnits(x, decimal=18) {
    return ethers.utils.formatUnits(String(x), decimal);
}

function shouldEqualApprox(x, y, acceptable_diff=2) {
    const diff = x.sub(y).abs(); 
    const diffPct = (diff.mul(bn(100))).div(x);
    acceptable_diff = bn(acceptable_diff);
    diffPct.should.be.bignumber.lte(acceptable_diff)
 }

describe("LiquidityExamples", () => {
  let liquidityExamples,
  accounts, dai, usdc, NonfungiblePositionManagerContract, 
  lockContract, lockTokenBalance, userNftIds

  before(async () => {
    accounts = await ethers.getSigners(1)

    NonfungiblePositionManagerContract = await ethers.getContractAt(
        "INonfungiblePositionManager", INonfungiblePositionManager
    )

    const LiquidityExamples = await ethers.getContractFactory(
      "LiquidityExamples"
    )
    liquidityExamples = await LiquidityExamples.deploy(INonfungiblePositionManager)
    await liquidityExamples.deployed()

    const LockToken = await ethers.getContractFactory(
        "LockToken"
      )
    lockTokenContract = await LockToken.deploy()
    await lockTokenContract.deployed()

    const Lock = await ethers.getContractFactory(
        "Lock"
      )
    lockContract = await Lock.deploy(
        INonfungiblePositionManager, 
        liquidityExamples.address,
        lockTokenContract.address
    )
    await lockContract.deployed()

    await lockTokenContract.setLockAddress(lockContract.address)

    dai = await ethers.getContractAt("IERC20", DAI)
    usdc = await ethers.getContractAt("IERC20", USDC)

    // Unlock DAI and USDC whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    })
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    })

    const daiWhale = await ethers.getSigner(DAI_WHALE)
    const usdcWhale = await ethers.getSigner(USDC_WHALE)

    // Send DAI and USDC to accounts[0]
    const daiAmount = 100n * 10n ** 18n
    const usdcAmount = 100n * 10n ** 6n

    expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount)
    expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount)

    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount)
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount)
  })

  it("mintNewPosition: transfers dai, usdc from account0 to liquidity contract", async () => {
    const daiAmount = 100n * 10n ** 18n
    const usdcAmount = 100n * 10n ** 6n

    const daiBefore = String(await dai.balanceOf(accounts[0].address))
    const usdcBefore = String(await usdc.balanceOf(accounts[0].address))

    await dai
      .connect(accounts[0])
      .transfer(liquidityExamples.address, daiAmount)
    await usdc
      .connect(accounts[0])
      .transfer(liquidityExamples.address, usdcAmount)

    await liquidityExamples.mintNewPosition()

    let daiAfter = String(await dai.balanceOf(accounts[0].address));
    let usdcAfter = String(await usdc.balanceOf(accounts[0].address))

    shouldEqualApprox(bn(daiBefore), bn(daiAfter).add(bn(daiAmount)));
    shouldEqualApprox(bn(usdcBefore), bn(usdcAfter).add(bn(usdcAmount)));

  })

  it('Lock NFTs: transfers NFT from Liquidity to Lock contract', async()=>{
    userNftIds = String(await liquidityExamples.getUserNftIds(accounts[0].address))

    const NFTOwnerbeforeTransfer = await NonfungiblePositionManagerContract.ownerOf(userNftIds)

    expect(String(NFTOwnerbeforeTransfer)).to.equal(liquidityExamples.address)
    
    let nftTransfer = await lockContract.transferUniNFT(
        userNftIds, accounts[0].address, {from:accounts[0].address}
    );

    await nftTransfer.wait(1)

    expect(nftTransfer.hash.length).to.equal(66)

    const NFTOwnerAfterTransfer = await NonfungiblePositionManagerContract.ownerOf(userNftIds)

    expect(String(NFTOwnerAfterTransfer)).to.equal(lockContract.address)
  })


  it('account0 Lock token balance should increase after successful lock', async()=>{
    lockTokenBalance = await lockTokenContract.balanceOf(accounts[0].address)

    lockTokenBalance.toString().should.be.bignumber.gt(bn('0'))
  })

})