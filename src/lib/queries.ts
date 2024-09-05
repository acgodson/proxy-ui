import { ethers } from "ethers";
import { Controller } from "./ethers-contracts";

export async function fetchQueryResponse(
  controller: Controller,
  userAddress: `0x${string}`,
  prompt: any,
  requestHash: string,
  apiKey: string
) {
  // Retrieeve idempotency key
  const retrievedKey = await controller.requestHashToKey(requestHash);
  console.log("Retrieved idempotency key:", retrievedKey);
  console.log("user Address:", userAddress);

  // Retrieve idempotency key Data
  const idempotencyData = await controller.getIdempotencyData(retrievedKey);

  console.log("idempotency data", idempotencyData);
  const user = idempotencyData[0];
  const isProcessed = idempotencyData[2];
  console.log("user: ", user);
  console.log("isProcessed: ", isProcessed);

  if (idempotencyData) {
    // proceed if key belongs to router and is unushed
    if (
      ethers.utils.getAddress(user) !== ethers.utils.getAddress(userAddress) ||
      isProcessed
    ) {
      throw new Error("unauthorized user or invalid key");
    }

    try {
      //generate new dempotency key with hash of request
      let headersList = {
        "idempotency-key": retrievedKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      let bodyContent = JSON.stringify({
        prompt: prompt,
        context: "",
      });

      let response = await fetch(
        "https://blueband-db-442d8.web.app/api/query",
        {
          method: "POST",
          body: bodyContent,
          headers: headersList,
        }
      );

      let data = await response.json();
      return { data: data, key: retrievedKey };
    } catch (e) {
      console.log(e);
    }
  }
}
