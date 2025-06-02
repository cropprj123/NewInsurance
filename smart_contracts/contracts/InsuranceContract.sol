// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InsuranceContract {
    struct Policy {
        uint256 policyId;
        address farmerAddress;
        string cropType;
        uint256 thresholdValue;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    struct Claim {
        uint256 claimId;
        uint256 policyId;
        uint256 claimDate;
        uint256 weatherValue;
        bool isApproved;
        string status;
    }

    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public farmerPolicies;
    
    uint256 public policyCount;
    uint256 public claimCount;

    event PolicyCreated(uint256 policyId, address farmerAddress);
    event ClaimSubmitted(uint256 claimId, uint256 policyId);
    event ClaimProcessed(uint256 claimId, bool isApproved);

    function createPolicy(
        address _farmerAddress,
        string memory _cropType,
        uint256 _thresholdValue,
        uint256 _startDate,
        uint256 _endDate
    ) public returns (uint256) {
        policyCount++;
        uint256 policyId = policyCount;
        
        policies[policyId] = Policy({
            policyId: policyId,
            farmerAddress: _farmerAddress,
            cropType: _cropType,
            thresholdValue: _thresholdValue,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true
        });

        farmerPolicies[_farmerAddress].push(policyId);
        
        emit PolicyCreated(policyId, _farmerAddress);
        return policyId;
    }

    function submitClaim(
        uint256 _policyId,
        uint256 _weatherValue
    ) public returns (uint256) {
        require(policies[_policyId].isActive, "Policy is not active");
        require(policies[_policyId].farmerAddress == msg.sender, "Not policy owner");
        
        claimCount++;
        uint256 claimId = claimCount;
        
        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            claimDate: block.timestamp,
            weatherValue: _weatherValue,
            isApproved: false,
            status: "Pending"
        });

        emit ClaimSubmitted(claimId, _policyId);
        return claimId;
    }

    function processClaim(uint256 _claimId) public {
        require(claims[_claimId].claimId != 0, "Claim does not exist");
        
        uint256 policyId = claims[_claimId].policyId;
        uint256 weatherValue = claims[_claimId].weatherValue;
        uint256 thresholdValue = policies[policyId].thresholdValue;
        
        bool isApproved = weatherValue >= thresholdValue;
        
        claims[_claimId].isApproved = isApproved;
        claims[_claimId].status = isApproved ? "Approved" : "Rejected";
        
        emit ClaimProcessed(_claimId, isApproved);
    }

    function getPolicy(uint256 _policyId) public view returns (
        uint256 policyId,
        address farmerAddress,
        string memory cropType,
        uint256 thresholdValue,
        uint256 startDate,
        uint256 endDate,
        bool isActive
    ) {
        Policy memory policy = policies[_policyId];
        return (
            policy.policyId,
            policy.farmerAddress,
            policy.cropType,
            policy.thresholdValue,
            policy.startDate,
            policy.endDate,
            policy.isActive
        );
    }

    function getClaim(uint256 _claimId) public view returns (
        uint256 claimId,
        uint256 policyId,
        uint256 claimDate,
        uint256 weatherValue,
        bool isApproved,
        string memory status
    ) {
        Claim memory claim = claims[_claimId];
        return (
            claim.claimId,
            claim.policyId,
            claim.claimDate,
            claim.weatherValue,
            claim.isApproved,
            claim.status
        );
    }

    function getFarmerPolicies(address _farmerAddress) public view returns (uint256[] memory) {
        return farmerPolicies[_farmerAddress];
    }
} 