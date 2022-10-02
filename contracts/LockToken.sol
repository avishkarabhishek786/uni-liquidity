// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LockToken is ERC20, ERC20Burnable, Ownable {

    address public lockContract;
    constructor() ERC20("LockToken", "LCK") {}

    function setLockAddress(address lock) public onlyOwner {
        require(lock != address(0), "0 addres");
        lockContract = lock;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender==lockContract, "only lockContract");
        require(to!=address(0), "0 address");
        _mint(to, amount);
    }
}