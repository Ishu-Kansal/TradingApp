// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "./OptionsExchange.sol";

contract OptionsFactory is OptionsExchange {


    event NewOption(uint contractId, uint32 _ticker, uint8 _optionType, uint32 _strike, uint32 _expiration,
        uint32 _listedPrice, address _writer, address _currOwner, uint8 isListed);

    uint currId;

    struct Option {
        uint32 ticker;
        uint8 optionType;
        uint32 strike;
        uint32 expiration;
        uint32 listedPrice;
        address writer;
        address currOwner;
        uint8 isListed;
    }

    Option[] public options;

    mapping(uint => address) public optionToOwner;

    function _createOption(
        uint32 _ticker,
        uint8 _optionType,
        uint32 _strike,
        uint32 _expiration,
        uint32 _listedPrice,
        address _writer,
        address _currOwner,
        uint8 _isListed
    ) private {
        options.push(Option(
            _ticker,
            _optionType,
            _strike,
            _expiration,
            _listedPrice,
            _writer,
            _currOwner,
            _isListed
        ));
        uint id = options.length;
        optionToOwner[id] = msg.sender;
        emit NewOption(id, _ticker, _optionType, _strike, _expiration, _listedPrice, _writer, _currOwner, _isListed);
    }
    
    function createOption(
        uint32 _ticker,
        uint8 _optionType,
        uint32 _strike,
        uint32 _expiration,
        uint32 _listedPrice,
        uint8 _isListed
    ) public {
        _createOption( _ticker, _optionType, _strike, _expiration, _listedPrice, address(msg.sender), address(msg.sender), _isListed);
    }

}