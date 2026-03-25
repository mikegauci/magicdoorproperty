import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserProvider, formatEther } from "ethers";

const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const addressRef = useRef(null);

  const isConnected = Boolean(address);

  const fetchBalance = useCallback(async (addr) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const raw = await provider.getBalance(addr);
      setBalance(parseFloat(formatEther(raw)).toFixed(4));
    } catch {
      setBalance(null);
    }
  }, []);

  const activate = useCallback(
    (addr) => {
      setAddress(addr);
      addressRef.current = addr;
      fetchBalance(addr);
    },
    [fetchBalance],
  );

  const resetState = useCallback(() => {
    setAddress(null);
    setBalance(null);
    addressRef.current = null;
  }, []);

  const disconnectWallet = useCallback(async () => {
    resetState();
    try {
      await window.ethereum?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      /* wallet_revokePermissions not supported by older wallets */
    }
  }, [resetState]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      activate(accounts[0]);
    } catch {
      resetState();
    }
  }, [activate, resetState]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) activate(accounts[0]);
      })
      .catch(() => {});
  }, [activate]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      accounts.length === 0 ? resetState() : activate(accounts[0]);
    };

    const handleChainChanged = () => {
      if (addressRef.current) fetchBalance(addressRef.current);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [activate, resetState, fetchBalance]);

  return { address, balance, isConnected, connectWallet, disconnectWallet };
};

export default useWallet;
