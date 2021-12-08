//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";

contract ExampleTokenV1 is ERC1155PresetMinterPauserUpgradeable {
    function version() public pure returns (uint256) {
        return 1;
    }
}

contract ExampleTokenV2 is ERC1155PresetMinterPauserUpgradeable {
    function version() public pure returns (uint256) {
        return 2;
    }
}
