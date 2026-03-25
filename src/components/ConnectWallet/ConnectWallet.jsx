import React, { useState } from "react";
import useWallet from "../../hooks/useWallet";

const truncateAddress = (addr) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const ConnectWallet = () => {
  const { address, balance, isConnected, connectWallet, disconnectWallet } =
    useWallet();
  const [showFull, setShowFull] = useState(false);

  if (!isConnected) {
    return (
      <button className="connect-wallet-btn" onClick={connectWallet}>
        CONNECT WALLET
      </button>
    );
  }

  return (
    <div className="wallet-connected">
      <div className="wallet-details">
        <span className="wallet-balance">{balance ?? "..."} ETH</span>
        <span
          className="wallet-address"
          title={address}
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? address : truncateAddress(address)}
        </span>
      </div>
      <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
        DISCONNECT
      </button>
    </div>
  );
};

export default ConnectWallet;
