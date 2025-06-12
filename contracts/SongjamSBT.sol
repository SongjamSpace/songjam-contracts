// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IERC5484
 * @dev Interface for ERC-5484 Consensual Soulbound Tokens
 */
interface IERC5484 {
    /// @notice Emitted when a soulbound token is issued.
    /// @dev This emits when a new token is issued and bound to an account.
    event Issued(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        BurnAuth burnAuth
    );

    /// @notice Emitted when a soulbound token is burned.
    /// @dev This emits when an existing SBT is burned.
    event Burned(
        address indexed from,
        uint256 indexed tokenId
    );

    /// @notice Burn authorization for soulbound tokens
    enum BurnAuth {
        IssuerOnly,     // 0: Only issuer can burn
        OwnerOnly,      // 1: Only owner can burn  
        Both,           // 2: Both issuer and owner can burn
        Neither         // 3: Neither can burn (permanent)
    }

    /// @notice Get the burn authorization of a token
    /// @dev Returns the burn authorization of `tokenId`
    /// @param tokenId The identifier for a token
    /// @return The burn authorization of `tokenId`
    function burnAuth(uint256 tokenId) external view returns (BurnAuth);
}

contract SongjamSBT is ERC721, Pausable, Ownable, ReentrancyGuard, IERC5484{
    using Strings for uint256;

    string public defaultURI = "";
    string private baseURI = "";

    string public cid;

    address public manager;
    uint256 public tokenMinted;
    uint256 public price = 0.001 ether;

    // Mapping from token ID to burn authorization
    mapping(uint256 => BurnAuth) private _burnAuth;

    event TokenMinted(uint256 tokenId, address to);

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to be Owner or Manager");
        _;
    }

    constructor(address initialOwner, string memory _name, 
        string memory _symbol, string memory _baseUri) ERC721(_name, _symbol) Ownable(initialOwner){
        manager = address(0x07C920eA4A1aa50c8bE40c910d7c4981D135272B);
        baseURI = _baseUri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _baseuri) public onlyOwnerOrManager {
		baseURI = _baseuri;
	}

    function setDefaultRI(string calldata _defaultURI) public onlyOwnerOrManager {
		defaultURI = _defaultURI;
	}

    function setManager(address _manager) public onlyOwnerOrManager {
        manager = _manager;
    }

    function tokenURI(uint256 /* tokenId */) public view virtual override returns (string memory) {
        return baseURI;
    }

    function mint() public payable whenNotPaused nonReentrant returns (uint256){
        return mintWithBurnAuth(msg.sender, BurnAuth.IssuerOnly);
    }

    function mintInternal(address user) public onlyOwnerOrManager whenNotPaused nonReentrant returns (uint256){
        return mintWithBurnAuth(user, BurnAuth.IssuerOnly);
    }

    function mintWithCustomBurnAuth(address to, BurnAuth burnAuthLevel) public onlyOwnerOrManager whenNotPaused nonReentrant returns (uint256){
        return mintWithBurnAuth(to, burnAuthLevel);
    }

    function mintWithBurnAuth(address to, BurnAuth burnAuthLevel) internal whenNotPaused returns (uint256){
        //require(price == msg.value, "Incorrect Funds Sent" ); // Amount sent should be equal to the price
        
        uint256 currentTokenId = tokenMinted;
        
        _safeMint(to, currentTokenId);
        _burnAuth[currentTokenId] = burnAuthLevel;
        tokenMinted++;
        
        emit TokenMinted(currentTokenId, to);
        emit Issued(msg.sender, to, currentTokenId, burnAuthLevel);
        return currentTokenId;
    }
    
    // Helper function to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ERC-5484 Implementation
    function burnAuth(uint256 tokenId) external view override returns (BurnAuth) {
        require(_exists(tokenId), "SongjamSBT: Token does not exist");
        return _burnAuth[tokenId];
    }

    function burn(uint256 tokenId) public nonReentrant {
        require(_exists(tokenId), "SongjamSBT: Token does not exist");
        
        address tokenOwner = ownerOf(tokenId);
        BurnAuth auth = _burnAuth[tokenId];
        
        bool canBurn = false;
        
        if (auth == BurnAuth.IssuerOnly) {
            canBurn = (msg.sender == owner() || msg.sender == manager);
        } else if (auth == BurnAuth.OwnerOnly) {
            canBurn = (msg.sender == tokenOwner);
        } else if (auth == BurnAuth.Both) {
            canBurn = (msg.sender == owner() || msg.sender == manager || msg.sender == tokenOwner);
        }
        // BurnAuth.Neither means no one can burn
        
        require(canBurn, "SongjamSBT: Not authorized to burn this token");
        
        emit Burned(tokenOwner, tokenId);
        _burn(tokenId);
        delete _burnAuth[tokenId];
    }

    // Override update function to make tokens soulbound (non-transferable)
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // But prevent transfers between accounts
        require(
            from == address(0) || to == address(0), 
            "SongjamSBT: Soulbound tokens are non-transferable"
        );
        
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721)
        returns (bool) {
        // Supports the following `interfaceId`s:
        // - IERC165: 0x01ffc9a7
        // - IERC721: 0x80ac58cd
        // - IERC721Metadata: 0x5b5e139f
        // - IERC5484: 0x0489b56f
        return
            interfaceId == type(IERC5484).interfaceId ||
            ERC721.supportsInterface(interfaceId);
    }

    function pause() public onlyOwnerOrManager nonReentrant {
        _pause();
    }

    function unpause() public onlyOwnerOrManager nonReentrant {
        _unpause();
    }
}