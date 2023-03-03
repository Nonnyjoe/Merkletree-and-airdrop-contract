// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract airdropToken is ERC20 {
    event poolId(uint32 _voteId, string message);
    address admin;
    bytes32 merkleRoot;
    mapping(address => bool) claimedAirdrop;
    uint256 airDropAmount = 1000;

    constructor(
        uint256 amount,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        admin = msg.sender;
        _mint(address(this), amount * (10 ** decimals()));
    }

    /////////////// /////////////////////////////////////////////

    function claimAirdrop(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public {
        require(checkRoot(), "NOT ELIGIBLE YET");
        require(!(claimedAirdrop[msg.sender]), "YOU ALREADY THIS AIRDROP");
        // bool status = verify(proof, root, leaf);
        require(
            verify(proof, root, leaf),
            "SORRY, NOT DRAFTED FOR THIS AIRDROP"
        );
        claimedAirdrop[msg.sender] = true;
        _mint(msg.sender, airDropAmount * (10 ** decimals()));
    }

    function setMerkleRoot(bytes32 _merkleRoot) public {
        require(msg.sender == admin, "ONLY ADMIN");
        merkleRoot = _merkleRoot;
    }

    function checkRoot() internal view returns (bool status) {
        (merkleRoot.length > 0) ? status = true : status = false;
    }

    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal view returns (bool) {
        uint256 path = proof.length;
        bytes memory input = abi.encodePacked(path, proof, root, leaf);

        bytes32 result;
        bool success;
        assembly {
            success := staticcall(
                gas(),
                0x07,
                add(input, 0x20),
                mload(input),
                result,
                0x20
            )
        }

        require(success, "Merkle proof verification failed");
        return uint256(result) == 1;
    }
}
