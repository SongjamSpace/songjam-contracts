// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SongjamToken
 * @dev Simple ERC20 token for the Songjam ecosystem
 * Features:
 * - Fixed maximum supply of 100 million tokens
 * - Owner can mint up to max supply
 * - Simple and straightforward implementation
 */
contract SongjamToken is ERC20, Ownable {
    
    // Maximum total supply: 100 million tokens
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /**
     * @dev Constructor
     * @param initialOwner The initial owner of the contract
     */
    constructor(address initialOwner) 
        ERC20("SongjamToken", "SONG") 
        Ownable(initialOwner) 
    {
        // Constructor is now simple - no complex initialization needed
    }
    
    /**
     * @dev Mint tokens to specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Get remaining supply that can be minted
     * @return The remaining supply
     */
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
