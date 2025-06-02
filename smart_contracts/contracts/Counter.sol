// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Counter {
    uint public count = 0;

    function increment() public {
        count += 1;
    }

    function getCount() public view returns (uint) {
        return count;
    }
}
