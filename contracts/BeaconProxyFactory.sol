//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "hardhat/console.sol";

contract BeaconProxyFactory {

    event UpgradeableBeaconCreated(address indexed createdBy, UpgradeableBeacon beacon, address initialImplementation);

    /// newUpgradeableBeacon creates a new beacon with an initial implementation set
    /// @param initialImplementation sets the first iteration of logic for proxies
    function newUpgradeableBeacon(address initialImplementation) public returns (UpgradeableBeacon) {
        UpgradeableBeacon beacon = new UpgradeableBeacon(initialImplementation);
        beacon.transferOwnership(msg.sender);
        emit UpgradeableBeaconCreated(msg.sender, beacon, initialImplementation);
        return beacon;
    }

    event BeaconProxyCreated(UpgradeableBeacon indexed beacon, BeaconProxy beaconProxy);

    /// newBeaconProxy creates and initializes a new proxy for the given beacon
    /// @param beacon is address of the beacon
    /// @param data is the encoded function call to initialize the proxy
    function newBeaconProxy(UpgradeableBeacon beacon, bytes memory data) public returns (BeaconProxy) {
        BeaconProxy beaconProxy = new BeaconProxy(address(beacon), data);
        emit BeaconProxyCreated(beacon, beaconProxy);
        return beaconProxy;
    }
}
