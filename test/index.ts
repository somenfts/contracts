import { expect } from "chai";
import { ethers } from "hardhat";
import {ExampleTokenV2} from "../typechain";

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
    const Token = await ethers.getContractFactory("ExampleTokenV1");
    const token = await Token.deploy();
    await token.deployed();

    // deploy proxy factory
    const BeaconProxyFactory = await ethers.getContractFactory("BeaconProxyFactory");
    const beaconProxyFactory = await BeaconProxyFactory.deploy();
    await beaconProxyFactory.deployed();

    let upgradeableBeacon;
    {
      // "deploy" beacon
      const tokenTX = await beaconProxyFactory.newUpgradeableBeacon(token.address);
      const tx = await tokenTX.wait();
      const topic = BeaconProxyFactory.interface.getEventTopic("UpgradeableBeaconCreated")
      const [beaconAddr] = tx.logs.filter(log => log.topics.find(t => t === topic))
          .map(log => BeaconProxyFactory.interface.decodeEventLog("UpgradeableBeaconCreated", log.data))
          .map(d => {console.log("UpgradeableBeaconCreated", d); return d})
          .map(([_, address]) => address)

      console.log("upgradeableBeacon deployed to", beaconAddr)

      const UpgradeableBeacon = await ethers.getContractFactory("UpgradeableBeacon");
      upgradeableBeacon = UpgradeableBeacon.attach(beaconAddr)
      expect(await upgradeableBeacon.implementation()).to.equal(token.address)
    }
    console.log("upgradeableBeacon deployed to", upgradeableBeacon.address)

    // deploy beacon
    // const UpgradeableBeacon = await ethers.getContractFactory("UpgradeableBeacon");
    // const upgradeableBeacon = await UpgradeableBeacon.deploy(token.address);
    // await upgradeableBeacon.deployed();
    // expect(await upgradeableBeacon.implementation()).to.equal(token.address)

    // create proxies
    const tokenAddrs = [];
    for (let i = 0; i < 10; i++) {
      const uri = `http://host-${i}/{id}.json`
      // create and initialize instance from factory
      const data = Token.interface.encodeFunctionData("initialize", [uri])
      const topic = BeaconProxyFactory.interface.getEventTopic("BeaconProxyCreated")
      const beaconTX = await beaconProxyFactory.newBeaconProxy(upgradeableBeacon.address, data)
      const tx = await beaconTX.wait();

      // get instance and confirm instance readable
      const [tokenAddr] = tx.logs.filter(log => log.topics.find(t => t === topic))
          .map(log => BeaconProxyFactory.interface.decodeEventLog("BeaconProxyCreated", log.data))
          .map(([_, address]) => address)
      const deployedToken = Token.attach(tokenAddr)
      expect(await deployedToken.uri(0)).to.equal(uri)
      expect(await deployedToken.version()).to.equal(1)

      tokenAddrs.push(deployedToken.address)
    }

    // upgrade beacon
    const TokenV2 = await ethers.getContractFactory("ExampleTokenV2");
    const tokenV2 = await TokenV2.deploy();
    await tokenV2.deployed();
    await upgradeableBeacon.upgradeTo(tokenV2.address)
    expect(await upgradeableBeacon.implementation()).to.equal(tokenV2.address)

    // verify proxies are upgraded, too
    for (let i = 0; i < 10; i++) {
      const uri = `http://host-${i}/{id}.json`
      const deployedToken = TokenV2.attach(tokenAddrs[i])
      expect(await deployedToken.uri(0)).to.equal(uri)
      expect(await deployedToken.version()).to.equal(2)
    }
  });
});
