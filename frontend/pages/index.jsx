import { ethers, Contract, providers } from "ethers";
//import { formatEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  E_VOTING_ABI,
  E_VOTING_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

/*import { BrowserRouter as Router, Switch, 
  Route, Redirect,} from "react-router-dom";*/

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const web3ModalRef = useRef();
  const [loading, setLoading] = useState(false);
  const [numCandidates, setNumCandidates] = useState("0");
  const [numVoters, setNumVoters] = useState("0");
  const [electionStarted, setElectionStarted] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [winnerId, setWinnerId] = useState(1);
  /*const [addingCandidates,setAddingCandidates] = useState(false);*/
  const [selectedTab, setSelectedTab] = useState("Election not yet started");
  

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      //fetchAllCandidates();
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      //window.alert("Please switch to the Mumbai network!");
     // throw new Error("Please switch to the Mumbai network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getE_VotingContractInstance = (providerOrSigner) => {
    return new Contract(
      E_VOTING_CONTRACT_ADDRESS,
      E_VOTING_ABI,
      providerOrSigner
    );
  };

  const getOwner = async () => {
    try {
        const signer   = await getProviderOrSigner(true);
        const contract = getE_VotingContractInstance(signer);

        // call the owner function from the contract
        const _owner  = await contract.owner();
        // Get the address associated to signer which is connected to Metamask
        const address = await signer.getAddress();
        if (address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
    } catch (err) {

      console.error(err.message);
    }
  };

  const registerCandidate = async(candidateAddress, candidateName) => {
    try {
      const signer   = await getProviderOrSigner(true);
      const contract = getE_VotingContractInstance(signer);

      let tmpdata = ethers.utils.getAddress(candidateAddress);

      const txn = await contract.registerCandidate(tmpdata,candidateName);
      setLoading(true);
      await txn.wait();
      await getNumCandidates();
      //await fetchAllCandidates();
      
      //setAddingCandidates(false);
      setLoading(false);
      setSelectedTab("Election not yet started");

      
    } catch (error) {
      console.error(error.message);
      window.alert(error.reason);
    }
  }

  const fetchCandidateById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);
      const candidate = await contract.candidates(id);
      const parsedCandidate = {
        candidateId: id,
        candidateName: candidate.name,
        candidateAddress: candidate._CandidateAddress.toString(),
        candidateVotes: candidate.candidate_votes.toString(),
      };
      return parsedCandidate;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllCandidates = async () => {
    try {
      const candidates = [];
      for (let i = 0; i < numCandidates; i++) {
        const candidate = await fetchCandidateById(i);
        candidates.push(candidate);
      }
      setCandidates(candidates);
      return candidates;
    } catch (error) {
      console.error(error);
    }
  };


  const startElection = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getE_VotingContractInstance(signer);

      const txn = await contract.startElection();
      setLoading(true);
      await txn.wait();
     // setElectionStarted(true);
     await fetchAllCandidates();
      setLoading(false);
      if(isOwner){setSelectedTab("Election started and Admin");}
      else{setSelectedTab("Election started and Voter");}
      
      
    } catch (error) {
      console.error(error.message);
    }

  }

  const getNumCandidates = async() => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);

      const numCandidates = await contract.totalCandidates();
      setNumCandidates(numCandidates.toString());
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const getNumVoters = async() => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);

      const numVoters = await contract.totalVoters();
      setNumVoters(numVoters.toString());
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const vote = async(candidateId) => {
    try {
      const signer   = await getProviderOrSigner(true);
      const contract = getE_VotingContractInstance(signer);

      const txn = await contract.vote(candidateId);
      setLoading(true);
      await txn.wait();
      await getNumVoters();
      await fetchAllCandidates();
      await checkIfVoted();
      setLoading(false);

      setSelectedTab("Election started and Voter");

      
    } catch (error) {
      console.error(error.message);
      window.alert(error.reason);
    }
  }

  const checkIfVoted = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getE_VotingContractInstance(signer);

      const checkVoted = await contract.ifVoted(signer.getAddress());
      await fetchAllCandidates();

      setVoted(checkVoted);


      
      return checkVoted;
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const checkIfElectionStarted = async() => {
    try {
      const provider = await getProviderOrSigner(false);
      const contract = getE_VotingContractInstance(provider);

      const electionState = await contract.ifElectionStarted();
      await getOwner();
      await checkIfVoted();
      //const checkStarted = false;
     /* if(electionState && !isOwner && !voted)
      {
        //checkStarted = true;
        setSelectedTab("Election started and Voter not yet voted");
      }
      if(electionState && !isOwner && voted)
      {
        //checkStarted = true;
        setSelectedTab("Election started and Voter voted");
      }
      if(electionState && isOwner)
      {
        setSelectedTab("Election started and Admin");
      }*/

      //setElectionStarted(checkStarted);
      
      return electionState;
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const checkIfElectionEnded = async() => {

    try {
      const provider = await getProviderOrSigner(false);
      const contract = getE_VotingContractInstance(provider);
      const _winnerId = await contract.winnerId();

      const electionState = await contract.ifElectionEnded();
      await getOwner();
      
      const checkStarted = await checkIfElectionStarted();
      const checkVoted = await checkIfVoted();
      //const checkStarted = false;
      if(electionState)
      {
        //checkStarted = true;
        setWinnerId(_winnerId);
        setSelectedTab("Results Tab");
      }
      if(!electionState && !isOwner && checkStarted && checkVoted)
      {
        //checkStarted = true;
        setSelectedTab("Election started and Voter voted");
      }
      if(!electionState && !isOwner && checkStarted && !checkVoted)
      {
        //checkStarted = true;
        setSelectedTab("Election started and Voter not yet voted");
      }
      if(!electionState && isOwner && checkStarted)
      {
        setSelectedTab("Election started and Admin");
      }
      if(!electionState && !checkStarted){
        setSelectedTab("Election not yet started");
      }

      //setElectionStarted(checkStarted);
      
      return electionState;
      
    } catch (error) {
      console.error(error.message);
    }
  
  }

  const endElection = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = getE_VotingContractInstance(signer);

      const txn = await contract.endElection();
      setLoading(true);
      await txn.wait();
      const _winnerId = await contract.winnerId();
      
      setLoading(false);
      setWinnerId(_winnerId);

      await fetchAllCandidates();
      await getOwner();
      await checkIfElectionEnded();
      
      
      //return ;
      
    } catch (error) {
      console.error(error.message);
    }
  }  


  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {

        getNumCandidates();
        getOwner();
        fetchAllCandidates();
        checkIfElectionStarted();
        checkIfVoted();
      });
    }
  }, [walletConnected]);


  useEffect(() => {

    if(selectedTab !== "addingCandidates")
    {
      getOwner();
      fetchAllCandidates();
      checkIfElectionStarted();
      checkIfElectionEnded();
      checkIfVoted();
      console.log(candidates);
      console.log(checkIfElectionStarted());
      console.log(checkIfElectionEnded());
      console.log(checkIfVoted());
    }
    
  }, [selectedTab],[]);


  function renderTabs() {

    if (selectedTab === "addingCandidates") {
      return addCandidateTab();
    } else if (selectedTab === "Election not yet started") {
      return electionNotStartedTab();
    } else if (selectedTab === "Election started and Voter not yet voted") {
      return voterTab();
    } else if (selectedTab === "Election started and Voter voted") {
      return votedTab();
    }
    else if (selectedTab === "Election started and Admin") {
      return viewElectionTab();
    } 
    else if(selectedTab === "Results Tab") {
      return resultsTab();
    }
    return null;
  }

  const electionNotStartedTab = () => {

    if (!walletConnected) {
      return (
        <><div className={styles.login}>
          <h1 className={styles.title}>
          Welcome to <a href="#">E-Voting</a>
        </h1>
        <br></br><button onClick={() => connectWallet()} className={styles.button3}>
            Connect your wallet
          </button>
          </div></>
      );
    }
  

    if (loading) {
      return (<><div className={styles.login}><h1 className={styles.title}>
        Welcome to <a href="#">E-Voting</a>
      </h1><button className={styles.button3}>Loading...</button></div></>);
    }

    if(isOwner && selectedTab === "Election not yet started") {
      return (
        <div className={styles.container}>
             <h1 className={styles.title}>Welcome Admin</h1>
             <p>Total Candidates: {numCandidates}</p>
            
          {candidates.map((p, index) => (
            <div key={index} className={styles.login}>
              <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
              <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
              <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
            </div>
          ))}
            <button className={styles.button2} onClick={() => setSelectedTab("addingCandidates")}>
              Add Candidate
            </button>
            <button className={styles.button2} onClick={() => startElection()}>
              Start Election
            </button>
            
          </div>
      );
    }

    if(!isOwner && selectedTab === "Election not yet started") {
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Candidates are :</h1>
           {candidates.map((p, index) => (
            <><div key={index} className={styles.login}>
               <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
               <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
               <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
             </div></>
          ))}
          <p>Total Candidates: {numCandidates}</p>
            <p>Election is not yet started.</p>
          </div>
      );

    }

  }

  const voterTab = () => {

  /*  if (loading) {
      return (<><h1 className={styles.title}>
        Welcome to <a href="#">E-Voting</a>
      </h1><button className={styles.button}>Loading...</button></>);
    }

    else */
    
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Please Vote :</h1>
          {candidates.map((p, index) => (
            <><div key={index} className={styles.login}>
             <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
               <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
               <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
              <div className={styles.flex}>
              <button className={styles.button2} onClick={() => vote(parseInt(p.candidateId))}>
              Vote
            </button>
                </div>
            </div></>
          ))}
        </div>
      );
      
      
    } 

  

  const votedTab = () => {

    return(<p>You've already voted! Please wait for results.</p>);

  }

  const addCandidateTab = ()=> {
    if(!loading){
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Add New Candidate</h1>
          <br></br>
        <label className={styles.subheading}>Candidate : </label>
            <input className={styles.input}
              placeholder="Name of the Candidate"
              type="string"
              onChange={(e) => setCandidateName(e.target.value)}
            />
            <input className={styles.input}
              placeholder="Address of the Candidate"
              type="string"
              onChange={(e) => setCandidateAddress(e.target.value)}
            />
  
            <br></br> 
            <button className={styles.button2} onClick={()=>registerCandidate((ethers.utils.getAddress(candidateAddress)),candidateName)}>
              Register New Candidate
            </button> 
      </div>
  
      );
    }
    else{
      return(<button className={styles.button2} onClick={()=>null}>
      Loading...
    </button>);
      
    }
   
    
  }

  const viewElectionTab = () => {
    if(!isOwner){
      return (
        <div>

            {candidates.map((p, index) => (
            <><div key={index} className={styles.login}>
               <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
               <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
               <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
               <p className={styles.subheading}>Votes: <span className={styles.lightText}>16</span></p>

             </div></>
          ))}
          </div>
  
      );
    }

    if(isOwner){
      return(
        <div>
          <h1 className={styles.title}>Election Status:</h1>
        {candidates.map((p, index) => (
            <><div key={index} className={styles.login}>
               <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
               <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
               <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
               <p className={styles.subheading}>Votes: <span className={styles.lightText}>{p.candidateVotes}</span></p>

             </div></>
          ))}
        <button className={styles.button2} onClick={()=> endElection()}>
        End Election
      </button>
      </div>

      );
    }

  }

  const resultsTab = () => {

    //const firstObject = Object.values(candidates[winnerId]);

    /*let names;

    for(let i=0;i < numCandidates;i++)
    {
     names[i] = candidates[i].candidateName;
    }*/

    /*const str = JSON.stringify(candidates[winnerId]);
    const winnerName = str.substring(str.indexOf(":")+1,str.indexOf(","));*/


    return(
      <div>
      <p>Final results: </p>
      {candidates.map((p, {index}) => (
            <><div key={index} className={styles.login}>
               <p className={styles.subheading}>Candidate ID: <span className={styles.lightText}>{p.candidateId}</span> </p>
               <p className={styles.subheading}>Candidate Name: <span className={styles.lightText}>{p.candidateName}</span></p>
               <p className={styles.subheading}>Address: <span className={styles.lightText}>{p.candidateAddress}</span></p>
               <p className={styles.subheading}>Votes: <span className={styles.lightText}>{p.candidateVotes}</span></p>

             </div></>
          ))}
    </div>
    );
    
  } 

    return (
      <div className={styles.container}>
        <Head>
          <title>E-Voting</title>
          <meta
            name="description"
            content="Created with love"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>

          <div className={styles.description}>

           {renderTabs()}
           
          </div>
  
         
        </main>
       
      </div>
    );

  

  /*if(addingCandidates) {
    return (
      <div className={styles.container}>
        <Head>
          <title>E-Voting</title>
          <meta
            name="description"
            content="Created with love"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>
          
          <div className={styles.description}>
          
           {addCandidate()}
           
          </div>
  
         
        </main>
      </div>
    );


  }*/
}
