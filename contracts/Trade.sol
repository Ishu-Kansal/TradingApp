// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "./OptionsFactory.sol";

contract Trade is OptionsFactory {
    function listContract(uint _contractId, uint32 _price) public {
        require(options[_contractId].currOwner == msg.sender);
        options[_contractId].isListed = 1;
        options[_contractId].listedPrice = _price;
    }

    function buyContract(uint _contractId, uint32 inputPrice) public {
        require(inputPrice >= options[_contractId].listedPrice);
        require(options[_contractId].isListed == 1);

        options[_contractId].currOwner = msg.sender;
        options[_contractId].isListed = 0;
    }

    function updateAsk(uint _contractId, uint32 askPrice) public {
        require(options[_contractId].currOwner == msg.sender);
        require(options[_contractId].isListed == 1);

        options[_contractId].listedPrice = askPrice;
    }
}