'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Client, Session } from '@heroiclabs/nakama-js';
import { useGlobalState } from '@/store';
import { useAlert } from 'react-alert';
// import { WebSocketAdapterPb } from '@heroiclabs/nakama-js-protobuf';

export const NakamaContext = createContext<any>({});
export const useNakamaContext = () => useContext(NakamaContext);

export default function NakamaProvider({ children, config }) {
  const alert = useAlert();
  const gState = useGlobalState();
  const [ctxNakamaClient, setCtxNakamaClient] = useState(null);
  const [ctxNakamaSocket, setCtxNakamaSocket] = useState(null);
  const [ctxNakamaSession, setCtxNakamaSession] = useState(null);

  // onLoad
  useEffect(() => {
    initializeClient();
  }, []);

  // onDisconnect
  useEffect(() => {
    if (!gState['verify'].value) disconnect();
  }, [gState['verify']]);

  useEffect(() => {
    if (!ctxNakamaSocket) return;

    ctxNakamaSocket.gameSocket.onmatchdata = (matchState) => {
      console.log('matchState: ', matchState);
    };

    ctxNakamaSocket.gameSocket.onnotification = (notification) => {
      console.log('NOTIFICATION', notification);
    };

    ctxNakamaSocket.chatSocket.onchannelmessage = (message) => {
      console.log('Received a message on channel: %o', message.channel_id);
      console.log('Message content: %o', message);
    };

    ctxNakamaSocket.chatSocket.onchannelpresence = (presences) => {
      console.log('presences: ', presences);
    };
  }, [ctxNakamaSocket]);

  const initializeClient = async () => {
    try {
      const client = new Client(
        config.serverkey,
        config.host,
        config.port,
        config.useSSL
      );
      setCtxNakamaClient(client);

      const chatSocket = client.createSocket(
        config.useSSL,
        config.trace
        // new WebSocketAdapterPb()
      );
      const gameSocket = client.createSocket(config.useSSL, config.trace);
      setCtxNakamaSocket({ gameSocket, chatSocket });

      console.log('Nakama client initialized: ', client);
    } catch (e) {
      console.error(e.message);
    }
  };

  const disconnect = () => {
    if (ctxNakamaSocket) {
      ctxNakamaSocket.gameSocket.disconnect();
      ctxNakamaSocket.chatSocket.disconnect();
    }
  };

  const restoreSession = async () => {
    try {
      let session = Session.restore(
        gState['verify']['nakama']['token'].value,
        gState['verify']['nakama']['refresh_token'].value
      );
      console.log('Restore session, ', session);

      setCtxNakamaSession(session);
      gState['verify']['nakama']['token'].set(session.token);
      gState['verify']['nakama']['refresh_token'].set(session.refresh_token);

      const appearOnline = true;
      const connectionTimeout = 30;
      await ctxNakamaSocket.gameSocket.connect(
        session,
        appearOnline,
        connectionTimeout
      );
      console.log('game socket connected');

      await ctxNakamaSocket.chatSocket.connect(
        session,
        appearOnline,
        connectionTimeout
      );
      console.log('chat socket connected');
    } catch (e) {
      console.log('game and game socket disconnected xxx');
      console.error(e.message);
    }
  };

  return (
    <NakamaContext.Provider
      value={{
        alert,
        ctxNakamaClient,
        ctxNakamaSocket,
        ctxNakamaSession,
        initializeClient,
        disconnect,
        restoreSession,
      }}
    >
      {children}
    </NakamaContext.Provider>
  );
}
