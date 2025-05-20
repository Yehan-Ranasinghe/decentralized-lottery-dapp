// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address[] public players;
    address public lastWinner;
    uint public ticketPrice;

    constructor() {
        manager = msg.sender;
        ticketPrice = 0.01 ether; // default price
    }

    function enter() public payable {
        require(msg.value == ticketPrice, "Must send exact ticket price");
        players.push(msg.sender);
    }

    function setTicketPrice(uint _price) public {
        require(msg.sender == manager, "Only manager can set the ticket price");
        require(_price > 0, "Price must be greater than 0");
        ticketPrice = _price;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function pickWinner() public {
        require(msg.sender == manager, "Only manager can pick winner");
        require(players.length > 0, "No players");

        uint index = random() % players.length;
        address winner = players[index];
        payable(winner).transfer(address(this).balance);
        lastWinner = winner;
        delete players;
    }

    function random() private view returns (uint) {
    return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }
}