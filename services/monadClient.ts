
// Simple JSON-RPC client for Monad (EVM compatible)
// Since we are avoiding heavy web3 libraries in the scaffold, we use fetch.

const RPC_URL = "https://rpc-devnet.monadinfra.com/rpc"; // Placeholder for Monad Devnet

export interface MonadStatus {
  blockHeight: number;
  gasPrice: string;
  connected: boolean;
}

export const monadClient = {
  async connect(): Promise<boolean> {
    // Simulate wallet connection delay
    return new Promise((resolve) => setTimeout(() => resolve(true), 800));
  },

  async getChainStatus(): Promise<MonadStatus> {
    try {
      // In a real app, this would fetch from the RPC
      // const blockRes = await rpcCall("eth_blockNumber", []);
      
      // simulating data for the visualizer
      return {
        blockHeight: 1240593,
        gasPrice: "15 gwei",
        connected: true
      };
    } catch (e) {
      console.error("Monad RPC Error", e);
      return {
        blockHeight: 0,
        gasPrice: "0",
        connected: false
      };
    }
  }
};

async function rpcCall(method: string, params: any[]) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });
  return await response.json();
}
