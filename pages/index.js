import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import QRCode from "react-qr-code";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showPassbook, setShowPassbook] = useState(false);
  const [amount, setAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);

      window.ethereum.on("accountsChanged", (newAccounts) => {
        if (newAccounts.length > 0) {
          handleAccount(newAccounts[0]);
        } else {
          handleDisconnect();
        }
      });
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (acc) => {
    if (acc) {
      console.log("Account connected: ", acc);
      setAccount(acc);
    } else {
      console.log("No account found");
    }
  };

  const handleDisconnect = () => {
    setAccount(undefined);
    setATM(undefined);
    setBalance(undefined);
    console.log("Disconnected from MetaMask");
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit</button>
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={withdraw}>Withdraw</button>
        <button onClick={disconnect}>Sign Out</button>
        <button onClick={() => setShowPassbook(true)}>View Passbook</button>
      </div>
    );
  };

  const disconnect = () => {
    if (ethWallet) {
      ethWallet.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] })
        .then(() => handleDisconnect())
        .catch((error) => console.error("Error disconnecting:", error));
    }
  };

  const PassbookModal = () => {
    return (
      <div className="passbook-modal">
        <p>Scan this QR code to view details</p>
        <QRCode
          value={`Account: ${account}\nBalance: ${balance}\nFather: YourFather\nMother: YourMother\nBrother: YourBrother\nNominee: YourNominee\nTIN: YourTIN\nDebt: YourDebt\nOpening Date: YourOpeningDate`}
        />
        <button onClick={() => setShowPassbook(false)}>Close</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      {showPassbook && <PassbookModal />}
      {account === undefined && <p>Please connect again to operate.</p>}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: darkblue;
          color: white;
        }
        .passbook-modal {
          background-color: brown;
          padding: 20px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </main>
  );
}
