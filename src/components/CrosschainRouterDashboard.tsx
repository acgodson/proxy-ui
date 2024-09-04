"use client";
import React, { useState } from "react";
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
import { AlertCircle, ArrowRight, DollarSign, Zap } from "lucide-react";

const CrosschainRouterDashboard = () => {
  const [routerAddress, setRouterAddress] = useState("");
  const [gasFeeAmount, setGasFeeAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("");

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
    <div className="min-h-screen bg-[#282c34] text-white p-8">
      <h1 className="text-3xl text-gray-200 font-regular mb-8">ProxyAI</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#2c313c] border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Deploy Router</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Router Address"
              value={routerAddress}
              onChange={(e) => setRouterAddress(e.target.value)}
              className="mb-4 bg-[#353b48] border-[#4a4f5a]"
            />
            <Button
              onClick={handleDeploy}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="mr-2 h-4 w-4" /> Deploy Router
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#2c313c] border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Fund Gas</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Gas Fee Amount"
              value={gasFeeAmount}
              onChange={(e) => setGasFeeAmount(e.target.value)}
              className="mb-4 bg-[#353b48] border-[#4a4f5a]"
            />
            <Button
              onClick={handleFundGas}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Fund Gas
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#2c313c] border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Fund Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Token Amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="mb-4 bg-[#353b48] border-[#4a4f5a]"
            />
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="mb-4 bg-[#353b48] border-[#4a4f5a]">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent className="bg-[#353b48] border-[#4a4f5a]">
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleFundTokens}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <DollarSign className="mr-2 h-4 w-4" /> Fund Tokens
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#2c313c] border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Router Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-yellow-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="text-lg">Router not deployed</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrosschainRouterDashboard;
