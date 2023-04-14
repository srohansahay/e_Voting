// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract E_Voting is Ownable {

 uint256 public totalCandidates;
 uint256 public totalVoters;
 uint256 public totalElections;

 constructor(){
   state = State.Created;
 }

 Candidate[] Candidates;
 
 mapping (address => bool) voted;

 mapping (address => address) voterToCandidate;


  /*struct Voter {
     //   uint256 id;
     //   string name;
        address voterAddress;
        address _CandidateAddress;
    }*/

    struct Candidate {
        string name;
        uint256 id;
        address _CandidateAddress;
        uint256 candidate_votes;
    }

    enum State { Created, Voting, Ended }
    State public state;

    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    function registerCandidate(address _Address, string memory _name) external inState(State.Created) onlyOwner {

        for (uint256 i = 0; i < Candidates.length; i++) {
         require(Candidates[i]._CandidateAddress != _Address,"Candidate is already registered");
        }
        Candidates.push(Candidate(_name,totalCandidates, _Address, 0));
        totalCandidates++;
    }

    
    function startElection() external inState(State.Created) onlyOwner {

     require(totalCandidates>=2,"There should atleast be 2 candidates");

     state = State.Voting;
    }

    function vote(uint256 _CandidateId) external inState(State.Voting) {

     require(voted[msg.sender]==false,"You have already voted from this address!");

     voterToCandidate[msg.sender]=Candidates[_CandidateId]._CandidateAddress;
     voted[msg.sender]=true;
     Candidates[_CandidateId].candidate_votes++;
     totalVoters++;

    }

    function endElection() external inState(State.Voting) onlyOwner returns(uint256) {

     state = State.Ended;

     uint256 maxVotes = Candidates[0].candidate_votes;
     uint256 winnerId = 0;

     for(uint256 i=0; i<totalCandidates;i++){
      if(Candidates[i].candidate_votes>maxVotes){
       maxVotes = Candidates[i].candidate_votes;
       winnerId = i;
      }
     }

     return winnerId;

    }

   

}

//E_Voting Contract Deployed to :  0x9cA5DE2675Fe65744fc7bDA4458Af231b135a9d5

