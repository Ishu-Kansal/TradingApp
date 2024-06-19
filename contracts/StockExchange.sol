// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StockExchange {
    //maps user wallet to amount of tokenized stock
    mapping(address => mapping(address => uint)) portfolio;
    //maps user wallet to amount of _stablecoin tokens available (in hundredths)
    mapping(address => mapping(address => uint)) public balances;

    //_quantity in 1/1000 of a stock
    function _buyStock(address _stockTokenAddress, address _stablecoinToUse, uint _stockPrice, uint _quantity, address _account) internal {
        require((_stockPrice / 100) * (_quantity / 1000) >= balances[_account][_stablecoinToUse] / 100);

        portfolio[_account][_stockTokenAddress] += _quantity;
        balances[_account][_stablecoinToUse] -= (_stockPrice / 100) * (_quantity / 1000) * 100;
        /* TODO: Decide to use public ledger or transfer tokens */
    }

    function _sellStock(address _stockTokenAddress, address _stablecoinToReceive, uint _stockPrice, uint _quantity, address _account) internal {
        require(portfolio[_account][_stockTokenAddress] >= _quantity);

        portfolio[_account][_stockTokenAddress] -= _quantity;
        balances[_account][_stablecoinToReceive] += (_stockPrice / 100) * (_quantity / 1000) * 100;
        /* TODO: Decide to use public ledger or transfer tokens */
    }
}