import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});


describe("BeaconProxyFactory", function () {
  it("Should return the new greeting once it's changed", async function () {
    // deploy implementation
    const Token = await ethers.getContractFactory("ERC1155PresetMinterPauserUpgradeable");
    const token = await Token.deploy();
    await token.deployed();

    // deploy beacon
    const UpgradeableBeacon = await ethers.getContractFactory("UpgradeableBeacon");
    const upgradeableBeacon = await UpgradeableBeacon.deploy(token.address);
    await upgradeableBeacon.deployed();
    expect(await upgradeableBeacon.implementation()).to.equal(token.address)

    // deploy proxy factory
    const BeaconProxyFactory = await ethers.getContractFactory("BeaconProxyFactory");
    const beaconProxyFactory = await BeaconProxyFactory.deploy(upgradeableBeacon.address);
    await beaconProxyFactory.deployed();

    // create and initialize instance from factory
    const data = Token.interface.encodeFunctionData("initialize", ["http://localhost:3000/{id}.json"])
    const topic = BeaconProxyFactory.interface.getEventTopic("BeaconProxyCreated")
    const beaconTX = await beaconProxyFactory.newBeaconProxy(data)
    const tx = await beaconTX.wait();

    // get instance and confirm instance readable
    const [tokenAddr] = tx.logs.filter(log => log.topics.find(t => t === topic))
        .map(log => BeaconProxyFactory.interface.decodeEventLog("BeaconProxyCreated", log.data))
        .map(([address]) => address)
    const deployedToken = Token.attach(tokenAddr)
    expect(await deployedToken.uri(0)).to.equal("http://localhost:3000/{id}.json")
  });
});
