import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import { NFTMarketplace_contractAddresses, NFTMarketplace_abi, etherscanWebUrl } from "../constants";

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [loadingMint, setLoadingMint] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [contractAdd, setContractAdd] = useState("");
  const [contractInfo, setContractInfo] = useState({});
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [counter, setCounter] = useState(0);
  
  useEffect(async () => {
    if(window.ethereum){
      let web3 = new Web3(window.ethereum);
      setWeb3(web3);
      let chainId = await web3.eth.getChainId();
      console.log('chainId', chainId)
      console.log('NFTMarketplace_contractAddresses', NFTMarketplace_contractAddresses)
      let contractAdd = chainId in NFTMarketplace_contractAddresses ? NFTMarketplace_contractAddresses[chainId][0] : null;
      setContractAdd(contractAdd);

      let c = new web3.eth.Contract(NFTMarketplace_abi, contractAdd);
      setContract(c);
      checkIfWalletIsConnected();
      
      window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
      });
      window.ethereum.on('networkChanged', function (accounts) {
        window.location.reload();
      });
    }else{
      console.log("Please install MetaMask")
    }
  }, [])
  
  useEffect(() => {
    getCurrentUserInfo();
  }, [currentAccount])
  
  useEffect(() => {
    setupEventListener();
    initial();
  }, [contract])

  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      const account = accounts[0];
      if(account){
        console.log("Connected", account);
        setCurrentAccount(account); 
      }
    }).catch((err) => console.log(err));
  }
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        window.location.reload();
      }).catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  }

  const initial = async () => {
    if(!contract) return; 
    
    var contractBalance = await getContractBalance();
    var contractInfo = {...contractInfo, contractAdd, contractBalance};
    contractInfo.rewardRatePerSecond = await contract.methods.rewardRatePerSecond().call();
    contractInfo.withdrawalDeadline = await contract.methods.withdrawalDeadline().call();
    setContractInfo(contractInfo);
  }

  const getContractBalance = async () => {
    var balance = 0;
    try {
      balance = await web3.eth.getBalance(contractAdd);
    } catch (error) {
      console.log(error);
    }
    return balance;
  }

  const setupEventListener = async () => {
    try {
      if(!contract) return; 
      
      contract.events.Staking({}, function(error, event){ 
        if(event && event.returnValues){
          // var returnValues = event.returnValues;
          // var amount = returnValues.amount;
          setLoadingMint(false);
          setLoadingMsg("");
        }
      });

      contract.events.Received({}, function(error, event){ 
        if(event && event.returnValues){
          var returnValues = event.returnValues;
          var amount = returnValues.amount
          amount = web3.utils.fromWei(amount, 'ether');
          var interest = returnValues.interest;
          interest = web3.utils.fromWei(interest, 'ether');
          
          let url = `${amount} Ether received! You have earned extra ${interest} Ether as interest!`;
          setSuccessMsg(url);
  
          setLoadingMint(false);
          setLoadingMsg("");
          
          setCurrentUserInfo({ staked: 0, withdrawalTimeLeft: 0 });
        }
      });
    } catch (error) {
      console.log(error)
    }
  }
  
  const askContractToStake = async () => {
    try {
      setSuccessMsg("");
      setLoadingMint(true);
      
      console.log("Going to pop wallet now to pay gas...")
      contract.methods.stake().send({from: currentAccount, value: web3.utils.toWei("0.1", "ether")})
      .on('transactionHash', function(hash){
        // console.log("transactionHash: "+transactionHash);
        setLoadingMsg("Staking... please wait.")
      })
      // .on('receipt', function(receipt){
      //    console.log('receipt', receipt)
      // })
      .on('error', function(error){
        setLoadingMint(false);
        console.log(error)
      })
      .then(function(result){
        console.log(result)
        getCurrentUserInfo();
      });
    } catch (error) {
      setLoadingMint(false);
      console.log(error)
    }
  }
  
  const askContractToWithdraw = async () => {
    try {
      setSuccessMsg("");
      setLoadingMint(true);
      
      console.log("Going to pop wallet now to pay gas...")
      contract.methods.withdraw().send({from: currentAccount})
      .on('transactionHash', function(hash){
        // console.log("transactionHash: "+transactionHash);
        setLoadingMsg("Withdrawing... please wait.")
      })
      // .on('receipt', function(receipt){
      //    console.log('receipt', receipt)
      // })
      .on('error', function(error){
        setLoadingMint(false);
        setLoadingMsg("Transaction Error!")
        console.log(error)
      })
      .then(function(result){
        console.log(result)
        getCurrentUserInfo();
      });
    } catch (error) {
      setLoadingMint(false);
      console.log(error)
    }
  }
  
  const getCurrentUserInfo = async (account) => {
    account = account || currentAccount;
    try {
      if (contract && account) {
        var currentStaked = await contract.methods.stakes(currentAccount).call();
        var staked = 0;
        var withdrawalTimeLeft = 0;

        if(currentStaked?.balance > 0){
          staked = currentStaked.balance;
          withdrawalTimeLeft = await contract.methods.withdrawalTimeLeft().call();
          console.log('withdrawalTimeLeft', withdrawalTimeLeft)
        }

        setCurrentUserInfo({ staked, withdrawalTimeLeft });
        if(withdrawalTimeLeft > 0 && counter <= 0){
          setCounter(withdrawalTimeLeft);
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    if(counter > 0){
      setTimeout(() => setCounter(counter - 1), 1000); 
    }else{
      setCurrentUserInfo({ ...currentUserInfo, withdrawalTimeLeft: 0 });
    }
  }, [counter]);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );
  
  return (
    // <div className={styles.container}>
    <div className="App">
      <div className="container">
        <div style={{position: 'absolute', right: '1em', top: '2.5em'}}>
          {
            currentAccount &&
            <span>
              (
              {
                currentAccount.substring(0, 6) + 
                '....' + 
                currentAccount.substring(currentAccount.length - 4)
              }
              )
            </span>
          }
          <span className="network-text">Goerli</span>
        </div>
        <div className="header-container">
          <p className="header gradient-text">Staking dApp</p>
          <br/>
          <p className="sub-text">
            Contract address: {contractAdd && <a href={etherscanWebUrl+contractAdd} target="_blank">{contractAdd}</a>}
          </p>
          <p className="sub-text">
            Contract balance: {(contractInfo.contractBalance) ? web3.utils.fromWei(contractInfo.contractBalance, 'ether')  : 0} Ether
          </p>
          <p className="sub-text">
            Reward rate: {(contractInfo.rewardRatePerSecond) ? web3.utils.fromWei(contractInfo.rewardRatePerSecond, 'ether')  : 0} Ether per second
          </p>
          <p className="sub-text">
            Minimum required to withdraw: staked {(contractInfo.withdrawalDeadline) ? contractInfo.withdrawalDeadline  : 0} second
          </p>

          <hr />

          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : 
            loadingMint ? (
            <div style={{marginLeft: '48%'}}>
              <div className="loader"></div>
            </div>
          ) 
            :
            <>
              {
                currentUserInfo &&
                <>
                  <p className="sub-text">
                    You have staked: { web3.utils.fromWei(currentUserInfo.staked?.toString() || '0', 'ether')} Ether
                  </p>
                  {
                    (currentUserInfo.staked == 0) ?
                    <button onClick={askContractToStake} className="cta-button connect-wallet-button">
                      Stake 0.1 Ether
                    </button>
                    :
                    (currentUserInfo.withdrawalTimeLeft > 0) ?
                    <p className="sub-text">
                      Withdrawal count down: {counter} second
                    </p>
                    : null
                  }
                  {
                    (currentUserInfo.staked > 0 && currentUserInfo.withdrawalTimeLeft == 0) &&
                    <button onClick={askContractToWithdraw} className="cta-button connect-wallet-button">
                      Withdraw Now
                    </button>
                  }
                </>
              }
            </>
          }
          {
            loadingMsg &&
            <p>{loadingMsg}</p>
          }
          {
            successMsg &&
            <p className="sub-text gradient-text">{successMsg}</p>
          }
        </div>
        <div className="footer-container">
          <span className="footer-text">
            build by 0xJeffrey
          </span>
        </div>
      </div>
    </div>
  )
}
