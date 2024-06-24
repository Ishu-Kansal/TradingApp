// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StockExchange.sol";

contract OptionsExchange is StockExchange {
    address public owner;

    
    mapping(address => bool) acceptedTokens;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only Owner can modify exchange");
        _;
    }

    function deposit(uint _amount, address _tokenToTransfer) public {
        require(acceptedTokens[_tokenToTransfer]);
        balances[_tokenToTransfer][msg.sender] += _amount;

        IERC20(_tokenToTransfer).transferFrom(msg.sender, address(this), _amount);
    }

    function returnTokens(address _tokenToTransfer) public {
        uint256 amount = balances[_tokenToTransfer][msg.sender];
        balances[_tokenToTransfer][msg.sender] = 0;
        IERC20(_tokenToTransfer).transfer(msg.sender, amount);
    }

    /*made some changes */
}