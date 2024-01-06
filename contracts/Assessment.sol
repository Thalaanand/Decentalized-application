// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public rewardsFund;
    uint256 public rewardPrize;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event RewardPrizeSet(uint256 prize);
    event RewardContributed(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function setRewardPrize(uint256 _prize) public {
        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // set the reward prize
        rewardPrize = _prize;

        // emit the event
        emit RewardPrizeSet(_prize);
    }

    function contributeToRewards(uint256 _amount) public {
        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // contribute to rewards fund
        rewardsFund += _amount;

        // deduct the contributed amount from the balance
        balance -= _amount;

        // emit the contribution event
        emit RewardContributed(_amount);
    }
}
