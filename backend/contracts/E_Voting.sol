// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract E_Voting is Ownable {

 uint256 public totalCandidates;
 uint256 public totalVoters;
 uint256 public winnerId;
 //uint256 public totalElections;

 constructor(){
   state = State.Created;
 }

 //mapping (address => address) voterToCandidate;


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


    mapping(uint256 => Candidate) public candidates;


    mapping(address => bool) voted;

    enum State { Created, Voting, Ended }
    State public state;



    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    function registerCandidate(address _Address, string memory _name) external inState(State.Created) onlyOwner returns(uint256){

        for (uint256 i = 0; i < totalCandidates; i++) {
         
         require(candidates[i]._CandidateAddress != _Address,"Candidate is already registered");
        }
      
        Candidate storage candidate = candidates[totalCandidates];
        candidate._CandidateAddress = _Address;
        candidate.name = _name;
        candidate.id = totalCandidates;
        
        totalCandidates++;

        return totalCandidates-1;
    }

    function ifVoted(address _Address) external view returns(bool){
       
       if(voted[_Address]==true){
        return true;
       } 
        return false;

    }

    function ifElectionStarted() external view returns(bool){

        if(state != State.Created){
            return true;
        }
       
       return false;

    }

       function ifElectionEnded() external view returns(bool){

        if(state == State.Ended){
            return true;
        }
       
       return false;

    }

    
    function startElection() external inState(State.Created) onlyOwner {

     require(totalCandidates>=2,"There should atleast be 2 candidates");

     state = State.Voting;
    }

    function vote(uint256 _CandidateId) external inState(State.Voting) {

     require(voted[msg.sender]==false,"You have already voted from this address!");

     candidates[_CandidateId].candidate_votes++;
    
     voted[msg.sender]=true;
     totalVoters++;

    }

    function endElection() external inState(State.Voting) onlyOwner {

     state = State.Ended;

     uint256 maxVotes = candidates[0].candidate_votes;
     uint256 _winnerId = 0;

     for(uint256 i=0; i<totalCandidates;i++){
      if(candidates[i].candidate_votes>maxVotes){
       maxVotes = candidates[i].candidate_votes;
       _winnerId = i;
      }
     }

     winnerId = _winnerId;

    }

   

}

//E_Voting Contract Deployed to :  0x96a601fDd0C80C6Bc1421517B24e4FC10c92CE7F
