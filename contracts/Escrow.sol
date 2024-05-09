//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlyInspector(uint256 _nftID) {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasedPrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public isInspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        lender = _lender;
        inspector = _inspector;
        seller = _seller;
    }

    function list(
        uint256 _nftId,
        address _buyer,
        uint256 _purchasedPrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Before transfer "approve" is needed => That is why in test approve is written
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        purchasedPrice[_nftId] = _purchasedPrice;
        escrowAmount[_nftId] = _escrowAmount;
        buyer[_nftId] = _buyer;
    }

    function depositEarnest(uint256 _nftId) public payable onlyBuyer(_nftId) {
        require(msg.value >= escrowAmount[_nftId], "Insufficient funds");
        // payable(buyer[_nftId]).transfer(escrowAmount[_nftId]);
    }


    function upddateInspectionStatus(
        uint256 _nftId,
        bool _inspectionPassed
    ) public onlyInspector(_nftId) {
        isInspectionPassed[_nftId] = _inspectionPassed;
    }

    function approveSale(uint256 _nftId) public {
        approval[_nftId][msg.sender] = true;
    }

    // Finalize purchase
    function finalizeSale(uint256 _nftId) public onlyBuyer(_nftId) {
        require(isListed[_nftId]);
        require(approval[_nftId][buyer[_nftId]]);
        require(approval[_nftId][seller]);
        require(approval[_nftId][lender]);
        require(address(this).balance >= purchasedPrice[_nftId]);

        isListed[_nftId] =false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);   
        
    }

    function cancelSale(uint256 _nftId) public onlyBuyer(_nftId) {
        if(isInspectionPassed[_nftId] == false) {
            payable(buyer[_nftId]).transfer(escrowAmount[_nftId]);
        } else {
            payable(seller).transfer(address(this).balance);
        }

    }
    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
