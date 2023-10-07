// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./NFTWallet.sol";

contract AccessCardNFT is ERC721 {
    mapping(uint256 => address) public wallets;

    modifier onlyOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        _;
    }

    constructor() ERC721("AccessCardNFT", "ACN") {}

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
        wallets[tokenId] = address(new NFTWallet(tokenId));
    }

    function executeTransaction(
        uint256 tokenId,
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner(tokenId) {
        NFTWallet wallet = NFTWallet(payable(wallets[tokenId]));
        wallet.executeTransaction(_to, _value, _data);
    }
}
