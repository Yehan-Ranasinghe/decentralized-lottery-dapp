// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address[] public players;
    address public lastWinner;
    uint public ticketPrice;

    constructor(uint _ticketPrice) {
        manager = msg.sender;
        ticketPrice = _ticketPrice; // in wei
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this.");
        _;
    }

    function enter() public payable {
        require(msg.value == ticketPrice, "Incorrect ETH amount.");
        players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }

    function getBalance() public view onlyManager returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function pickWinner() public onlyManager {
        require(players.length > 0, "No players in the lottery.");
        uint index = random() % players.length;
        address winner = players[index];
        payable(winner).transfer(address(this).balance);
        lastWinner = winner;
        emit WinnerSelected(winner);

        // reset for next round
        delete players;
    }

    function random() private view returns (uint) {
        // Not secure but okay for a basic version
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    event PlayerEntered(address indexed player);
    event WinnerSelected(address indexed winner);
}

