// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

interface ILiquidity {
    function transferUniNFT(uint256 nftId, address to) external;
}

interface ILockToken {
    function mint(address to, uint256 amount) external;
}

contract Lock is IERC721Receiver {

    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    ILiquidity public immutable liquidityContract;
    ILockToken public immutable lockContract;

    constructor(
        INonfungiblePositionManager _nonfungiblePositionManager,
        ILiquidity _liquidity,
        ILockToken _lockContract
    ) {
        nonfungiblePositionManager = _nonfungiblePositionManager;
        liquidityContract = _liquidity;
        lockContract = _lockContract;
    }

    function transferUniNFT(uint256 nftId, address to) external returns(uint128 liquidity) {
        liquidityContract.transferUniNFT(nftId, address(this));
        (,,,,,,,liquidity,,,,) = nonfungiblePositionManager.positions(nftId);

        lockContract.mint(to, uint256(liquidity));
    }

    function onERC721Received(address, address, uint256, bytes calldata) external override pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}