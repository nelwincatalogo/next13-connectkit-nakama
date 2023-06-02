'use client';

/* eslint-disable import/no-anonymous-default-export */
import { bscTestnet, bsc, Chain } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from '@wagmi/core/providers/public';

export const currentNetwork = Number(process.env.NEXT_PUBLIC_NETWORK) || 0;
export const blockchainNetwork = ['BSC - Testnet', 'BSC - Mainnet'];
export const config = [
  {
    api_url: 'https://stg-api.anitolegends.com/v2',
    supported_chains: [bscTestnet] as Chain[],
    providers: [
      jsonRpcProvider({
        rpc: (chain) => ({
          http: `https://endpoints.omniatech.io/v1/bsc/testnet/public`,
        }),
      }),
    ],
  },
  {
    api_url: 'https://stg-api.anitolegends.com/v2',
    supported_chains: [bsc] as Chain[],
    providers: [publicProvider()],
  },
];

export default {
  project: 'next13_tailwindcss_with_connect_wallet',
  name: blockchainNetwork[currentNetwork],
  setting: config[currentNetwork],
  isTestnet: Number(currentNetwork) === 0,
};
