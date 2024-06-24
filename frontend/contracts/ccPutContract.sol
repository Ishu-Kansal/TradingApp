// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ccPutContract {
    address public holder;
    uint256 public optionPrice;
    uint256 public strikePrice;
    uint256 public expirationDate;

    struct Option {
        address holder;
        address payable seller;
        uint256 amount;
        bool exercised;
    }

    mapping(address => Option) public options;

    event OptionPurchased(address indexed buyer, uint256 amount);
    event OptionExercised(address indexed holder, uint256 amount);


    modifier optionExists(address _holder) {
        require(options[_holder].amount > 0, "Option does not exist.");
        _;
    }

    modifier notExpired() {
        require(block.timestamp < expirationDate, "Option has expired.");
        _;
    }

    constructor(uint256 _optionPrice, uint256 _strikePrice, uint256 _expirationDate) {
        holder = msg.sender;
        optionPrice = _optionPrice;
        strikePrice = _strikePrice;
        expirationDate = _expirationDate;
    }

    function buyOption(uint256 amount) external payable notExpired {
        require(msg.value == amount * optionPrice, "Incorrect Ether amount sent.");

        options[msg.sender].holder = msg.sender;
        options[msg.sender].amount += amount;
        options[msg.sender].exercised = false;

        emit OptionPurchased(msg.sender, amount);
    }

    function exerciseOption(uint256 amount) external payable optionExists(msg.sender) notExpired {
        Option storage option = options[msg.sender];
        require(option.amount >= amount, "Insufficient option amount.");
        require(msg.value == amount * strikePrice, "Incorrect Ether amount sent.");

        option.amount -= amount;
        if (option.amount == 0) {
            option.exercised = true;
        }

        // Here, the actual stock transfer logic should be implemented
        // This is a placeholder to represent the transfer
        // transferStocks(msg.sender, amount);

        emit OptionExercised(msg.sender, amount);
    }

    function withdraw() external {
        payable(holder).transfer(address(this).balance);
    }

    function getOptionDetails(address _holder) external view returns (address, uint256, bool) {
        Option memory option = options[_holder];
        return (option.holder, option.amount, option.exercised);
    }
}
