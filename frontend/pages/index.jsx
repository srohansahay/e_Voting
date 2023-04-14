import { ethers, Contract, providers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  E_VOTING_ABI,
  E_VOTING_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";
import { BrowserRouter as Router, Switch, 
  Route, Redirect,} from "react-router-dom";

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
  const [addingCandidates,setAddingCandidates] = useState(false);
  //const [selectedTab, setSelectedTab] = useState("");
  

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Please switch to the Mumbai network!");
      throw new Error("Please switch to the Mumbai network");
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
      await setAddingCandidates(false);
      setLoading(false);
      
    } catch (error) {
      console.error(error.message);
      window.alert(error.reason);
    }
  }

  const fetchCandidateById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);
      const candidate = await contract.Candidates(id);
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
      await setElectionStarted(true);
      setLoading(false);
      
    } catch (error) {
      console.error(error.message);
    }

  }

  const getNumCandidates = async() => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);

      const numCandidates = await contract.totalCandidates;
      setNumCandidates(numCandidates.toString());
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const getNumVoters = async() => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);

      const numVoters = await contract.totalVoters;
      setNumVoters(numVoters.toString());
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const getCandidateVotes = async(candidateId) => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getE_VotingContractInstance(provider);

      const candidateVotes = await contract.Candidate[candidateId].candidate_votes();

      return candidateVotes;
      
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
      setLoading(false);
      
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
       // getDAOTreasuryBalance();
       // getUserNFTBalance();
       // getNumProposalsInDAO();
        getOwner();
      });
    }
  }, [walletConnected]);

  useEffect(()=> {
    if(!electionStarted){
      fetchAllCandidates();
      console.log(candidates);
    }

  },[addingCandidates])

 /* useEffect(()=>{
    if(addingCandidates){
      addCandidate();
    }

  },[addingCandidates]);*/

  const renderButton = () => {

    if (!walletConnected) {
      return (
        <><h1 className={styles.title}>
          Welcome to <a href="#">E-Voting</a>
        </h1><button onClick={() => connectWallet()} className={styles.button}>
            Connect your wallet
          </button></>
      );
    }

    if (loading) {
      return (<><h1 className={styles.title}>
        Welcome to <a href="#">E-Voting</a>
      </h1><button className={styles.button}>Loading...</button></>);
    }

    if(isOwner && !electionStarted) {
      return (
        <div className={styles.container}>
          {candidates.map((p, index) => (
            <div key={index} className={styles.candidateCard}>
              <p>Candidate ID: {p.id}</p>
              <p>Candidate Name: {p.name}</p>
              <p>Address: {p._CandidateAddress.toString()}</p>
            </div>
          ))}
            <button className={styles.button2} onClick={() => setAddingCandidates(true)}>
              Add Candidate
            </button>
            <button className={styles.button2} onClick={() => startElection()}>
              Start Election
            </button>
          </div>
      );
    }

    if(!isOwner) {
      return (
       
        <div className={styles.container}>
           <h1 className={styles.title}>
        Welcome Admin 
      </h1>
          {candidates.map((p, index) => (
            <div key={index} className={styles.candidateCard}>
              <p>Candidate ID: {p.id}</p>
              <p>Candidate Name: {p.name}</p>
              <p>Address: {p._CandidateAddress.toString()}</p>
            </div>
          ))}
            <button className={styles.button2} onClick={() => setAddingCandidates(true)}>
              Add Candidate
            </button>
            <button className={styles.button2} onClick={() => startElection()}>
              Start Election
            </button>
          </div>
      );

    }

  }

  const votePage = () => {

    if (loading) {
      return (<><h1 className={styles.title}>
        Welcome to <a href="#">E-Voting</a>
      </h1><button className={styles.button}>Loading...</button></>);
    }

    if(!isOwner) {

      return (
        <div>
          {candidates.map((p, index) => (
            <div key={index} className={styles.candidateCard}>
              <p>Candidate ID: {p.id}</p>
              <p>Candidate Name: {p.name}</p>
              <p>Address: {p._CandidateAddress.toString()}</p>
              <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => vote(p.id)}
                  >
                    Vote 
                  </button>
                </div>
            </div>
          ))}
        </div>
      );

    }

  } 

  function renderCandidatesTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (candidates.length === 0) {
      return (
        <div className={styles.description}>No candidates have been registered</div>
      );
    } else {
      return (
        <div>
          {candidates.map((p, index) => (
            <div key={index} className={styles.candidateCard}>
              <p>Candidate ID: {p.id}</p>
              <p>Candidate Name: {p.name}</p>
              <p>Address: {p._CandidateAddress.toString()}</p>
            </div>
          ))}
        </div>
      );
    }
  }

  const addCandidate = ()=> {
    return (
      <div className={styles.container}>
      <label>Candidate : </label>
          <input
            placeholder="Name of the Candidate"
            type="string"
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <input
            placeholder="Address of the Candidate"
            type="string"
            onChange={(e) => setCandidateAddress(e.target.value)}
          />
          <button className={styles.button2} onClick={()=>registerCandidate((ethers.utils.getAddress(candidateAddress)),candidateName)}>
            Register
          </button>
    </div>

    );
    
  }

  function renderTabs() {
    if (addingCandidates) {
      return addCandidate();
    } else if (!addingCandidates && !electionStarted) {
      return renderButton();
    } else if (electionStarted && !electionEnded) {
      return votePage();
    }
    return null;
  }

  

  /*const renderCreateElectionPage = () => {

      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="string"
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <button className={styles.button2} onClick={()=>null}>
            Create
          </button>
        </div>
      );

  }*/




 

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
