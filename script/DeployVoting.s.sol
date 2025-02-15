// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {Voting} from "../src/Voting.sol";

contract DeployVoting is Script {
    function run() external {
        vm.startBroadcast();
        Voting voting = new Voting();
        vm.stopBroadcast();
    }
}
