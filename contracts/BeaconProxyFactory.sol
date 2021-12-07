//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/presets/ERC1155PresetMinterPauserUpgradeable.sol";
import "hardhat/console.sol";

contract BeaconProxyFactory {
    address private beacon;

    event BeaconProxyCreated(BeaconProxy beaconProxy);

    constructor(address _beacon) {
        beacon = _beacon;
    }

    function newBeaconProxy(bytes memory data) public returns (BeaconProxy) {
        BeaconProxy beaconProxy = new BeaconProxy(beacon, data);
        emit BeaconProxyCreated(beaconProxy);
        return beaconProxy;
    }
}
