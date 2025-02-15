// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {Voting} from "../src/Voting.sol";

contract VotingTest is Test { 
    Voting voting; 
    address electionCommission = address(1); 
    address voter1 = address(2); 
    address voter2 = address(3);
    function setUp() public {
        // Deploy the contract with electionCommission as the sender
        vm.prank(electionCommission);
        voting = new Voting();

        // Register two candidates
        vm.prank(electionCommission);
        voting.registerCandidate("Alice");
        vm.prank(electionCommission);
        voting.registerCandidate("Bob");

        // Register two voters
        vm.prank(electionCommission);
        voting.registerVoter(voter1);
        vm.prank(electionCommission);
        voting.registerVoter(voter2);
    }

    function testCastVote() public {
        // Voter1 casts a vote for candidate 1 ("Alice")
        vm.prank(voter1);
        voting.castVote(1);
        
        uint voteCount;
        // Retrieve candidate 1 and check the vote count
        Voting.Candidate memory candidate = voting.getCandidate(1); 
        voteCount = candidate.voteCount; 
        assertEq(voteCount, 1);
    }

    function testDoubleVote() public {
        // Voter1 casts a vote for candidate 1
        vm.prank(voter1);
        voting.castVote(1);

        // Voter1 tries to vote again and it should revert
        vm.prank(voter1);
        vm.expectRevert("You have already voted");
        voting.castVote(2);
    }
}