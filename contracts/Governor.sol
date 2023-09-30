// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

contract Governor is OwnerIsCreator, CCIPReceiver {
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        bytes data,
        address feeToken,
        uint256 fees
    );

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        bytes data
    );

    IRouterClient router;

    LinkTokenInterface linkToken;

    bytes32 private lastReceivedMessageId;
    string private lastReceivedText;

    mapping(uint64 => address) public supportedChain;
    mapping(uint256 => uint64) public supportedChainId;
    uint256 totalSupportedChains;

    error ZeroAddressNotAllowed();
    error ChainNotSupported();
    error Unauthorized();

    constructor(address _router, address _link) CCIPReceiver(_router) {
        router = IRouterClient(_router);
        linkToken = LinkTokenInterface(_link);
    }

    function addSupportedChain(
        uint64 chainSelector,
        address targetContract
    ) public onlyOwner {
        if (targetContract == address(0)) revert ZeroAddressNotAllowed();
        if (supportedChain[chainSelector] == address(0))
            supportedChainId[totalSupportedChains++] = chainSelector;
        supportedChain[chainSelector] = targetContract;
    }

    function removeSupportedChain(uint64 chainSelector) public onlyOwner {
        if (supportedChain[chainSelector] == address(0))
            revert ChainNotSupported();
        supportedChain[chainSelector] = address(0);

        uint256 index;
        for (uint256 i = 0; i < totalSupportedChains; i++) {
            if (supportedChainId[i] == chainSelector) index = i;
        }
        supportedChainId[index] = supportedChainId[--totalSupportedChains];
    }

    function broadcastMessage(bytes calldata data) external onlyOwner {
        for (uint256 i = 0; i < totalSupportedChains; i++) {
            uint64 destinationChainSelector = supportedChainId[i];
            address receiver = supportedChain[destinationChainSelector];
            _sendMessage(destinationChainSelector, receiver, data);
        }
    }

    function _sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        bytes calldata data
    ) internal returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            feeToken: address(linkToken)
        });

        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        if (fees > linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

        linkToken.approve(address(router), fees);

        messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        emit MessageSent(
            messageId,
            destinationChainSelector,
            receiver,
            data,
            address(linkToken),
            fees
        );

        return messageId;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        if (supportedChain[any2EvmMessage.sourceChainSelector] != sender)
            revert Unauthorized();
        lastReceivedMessageId = any2EvmMessage.messageId;
        lastReceivedText = abi.decode(any2EvmMessage.data, (string));

        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            sender,
            any2EvmMessage.data // abi.decode(any2EvmMessage.data, (string))
        );
    }

    function getLastReceivedMessageDetails()
        external
        view
        returns (bytes32 messageId, string memory text)
    {
        return (lastReceivedMessageId, lastReceivedText);
    }

    function withdrawLinkTokens(address beneficiary) public onlyOwner {
        uint256 balance = linkToken.balanceOf(address(this));
        if (balance == 0) return;
        linkToken.transfer(beneficiary, balance);
    }
}
