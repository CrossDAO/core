// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NFTWallet is ERC721Holder {
	IERC721 public nftContract;
	uint256 public nftId;

	event Deposit(address indexed sender, uint256 amount, uint256 balance);

	modifier onlyOwner() {
		require(
			address(nftContract) == msg.sender ||
				nftContract.ownerOf(nftId) == msg.sender,
			"not owner"
		);
		_;
	}

	constructor(uint256 _nftId) {
		nftContract = IERC721(msg.sender);
		nftId = _nftId;
	}

	receive() external payable {
		emit Deposit(msg.sender, msg.value, address(this).balance);
	}

	function executeTransaction(
		address _to,
		uint256 _value,
		bytes memory _data
	) public onlyOwner {
		(bool success, ) = _to.call{ value: _value }(_data);
		require(success, "transaction failed");
	}
}
