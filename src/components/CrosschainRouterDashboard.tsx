"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui";
import { AlertCircle, ArrowRight, DollarSign, Wallet, Zap } from "lucide-react";

declare global {
  interface Window {
    ethereum: any;
  }
}

const CrosschainRouterDashboard = () => {
  const [routerAddress, setRouterAddress] = useState("");
  const [gasFeeAmount, setGasFeeAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error(
          "An error occurred while checking the wallet connection:",
          error
        );
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error("An error occurred while connecting the wallet:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  };

  const handleDeploy = () => {
    console.log("Deploying router...");
  };

  const handleFundGas = () => {
    console.log(`Funding gas: ${gasFeeAmount}`);
  };

  const handleFundTokens = () => {
    console.log(`Funding tokens: ${tokenAmount} ${selectedToken}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c20] to-[#2c313c] text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl text-gray-100 font-light tracking-wide">
          ProxyAI
        </h1>
        <Button
          onClick={connectWallet}
          className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full px-6 py-2 flex items-center transition-all duration-300"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect MetaMask"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "Deploy Router",
            icon: Zap,
            action: handleDeploy,
            input: routerAddress,
            setInput: setRouterAddress,
            placeholder: "Router Address",
          },
          {
            title: "Fund Gas",
            icon: ArrowRight,
            action: handleFundGas,
            input: gasFeeAmount,
            setInput: setGasFeeAmount,
            placeholder: "Gas Fee Amount",
            inputType: "number",
          },
          {
            title: "Fund Tokens",
            icon: DollarSign,
            action: handleFundTokens,
            input: tokenAmount,
            setInput: setTokenAmount,
            placeholder: "Token Amount",
            inputType: "number",
            hasSelect: true,
          },
          { title: "Router Status", icon: AlertCircle, status: true },
        ].map((item, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden"
          >
            <CardHeader className="bg-white/5">
              <CardTitle className="text-xl font-light flex items-center">
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {item.status ? (
                <div className="flex items-center text-yellow-300">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span className="text-lg font-light">
                    Router not deployed
                  </span>
                </div>
              ) : (
                <>
                  {item.input !== undefined && (
                    <Input
                      type={item.inputType || "text"}
                      placeholder={item.placeholder}
                      value={item.input}
                      onChange={(e) => item.setInput(e.target.value)}
                      className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
                    />
                  )}
                  {item.hasSelect && (
                    <Select
                      value={selectedToken}
                      onValueChange={setSelectedToken}
                    >
                      <SelectTrigger className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300">
                        <SelectValue placeholder="Select Token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c313c] border-white/20">
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    onClick={item.action}
                    className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
                  >
                    <item.icon className="mr-2 h-4 w-4" /> {item.title}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CrosschainRouterDashboard;
