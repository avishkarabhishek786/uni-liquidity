const { expect } = require("chai")
const { ethers } = require("hardhat")

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WETH_WHALE = "0x06920C9fC643De77B99cB7670A944AD31eaAA260"

const INonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

describe("LiquidityExamples", () => {
  let liquidityExamples
  let accounts
  let dai
  let usdc
  let NonfungiblePositionManagerContract
  let lockContract

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

    console.log("accounts[0]", accounts[0].address);
    console.log("liquidityExamples",liquidityExamples.address);
    console.log("lockContract",lockContract.address);
    //console.log("",);

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

  it("mintNewPosition", async () => {
    const daiAmount = 100n * 10n ** 18n
    const usdcAmount = 100n * 10n ** 6n

    console.log("daiAmount", daiAmount);
    console.log("usdcAmount", usdcAmount);

    console.log(
        "DAI balance before add liquidity",
        String(await dai.balanceOf(accounts[0].address))
      )
      console.log(
        "USDC balance before add liquidity",
        String(await usdc.balanceOf(accounts[0].address))
      )

    await dai
      .connect(accounts[0])
      .transfer(liquidityExamples.address, daiAmount)
    await usdc
      .connect(accounts[0])
      .transfer(liquidityExamples.address, usdcAmount)

    await liquidityExamples.mintNewPosition()

    console.log(
      "DAI balance after add liquidity",
      String(await dai.balanceOf(accounts[0].address))
    )
    console.log(
      "USDC balance after add liquidity",
      String(await usdc.balanceOf(accounts[0].address))
    )

    let ff = await liquidityExamples.getUserNftIds(accounts[0].address)

    console.log(String(ff));
    console.log(String(lockContract.address));

    console.log("Owner =>", await NonfungiblePositionManagerContract.ownerOf(String(ff)));
    
    let gg = await lockContract.transferUniNFT(
        String(ff), accounts[0].address, {from:accounts[0].address}
    );

    //let hh = await gg.wait(1)

    console.log("Lock token balance", await lockTokenContract.balanceOf(accounts[0].address));

    console.log(await NonfungiblePositionManagerContract.ownerOf(String(ff)));

  })





  
})