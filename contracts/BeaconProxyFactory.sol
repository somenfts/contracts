//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "hardhat/console.sol";

contract BeaconProxyFactory {
    event BeaconProxyCreated(address indexed beacon, BeaconProxy beaconProxy);

    function newBeaconProxy(address beacon, bytes memory data) public returns (BeaconProxy) {
        BeaconProxy beaconProxy = new BeaconProxy(beacon, data);
        emit BeaconProxyCreated(beacon, beaconProxy);
        return beaconProxy;
    }
}
