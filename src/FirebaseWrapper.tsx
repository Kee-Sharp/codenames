import useMediaQuery from "@mui/material/useMediaQuery";
import { initializeApp } from "firebase/app";
import {
  child,
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
} from "firebase/database";
import React, { useRef, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import App, { AppState } from "./App";
import appReducer, { init, Payloads } from "./appReducer";
import StartScreen from "./StartScreen";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

const FirebaseWrapper = () => {
  const [roomState, setRoomState] = useState(() => init({ blankCards: true }));
  const navigate = useNavigate();
  const unsubscribeRef = useRef<Function | null>(null);
  const clientId = generateClientId();

  const bigScreen = useMediaQuery(`(min-width:846px)`);

  const isInRoom = async () => {
    const roomsRef = child(dbRef, "rooms");
    const snapshot = await get(roomsRef);
    const rooms = (snapshot.val() ?? {}) as Record<string, AppState>;
    for (let [key, room] of Object.entries(rooms)) {
      const { players = [] } = room;
      if (players.find(({ id }) => id === clientId)) {
        return key;
      }
    }
  };

  const createRoom = async () => {
    const newRoomKey = push(child(dbRef, "rooms"), init()).key;
    if (!newRoomKey) return;
    navigate(newRoomKey);
  };

  const joinRoom = async (key: string, alreadyInRoom = false) => {
    const roomRef = child(dbRef, `rooms/${key}`);
    const roomSnapshot = await get(roomRef);
    const room = roomSnapshot.val() as AppState | null;
    if (!room) {
      navigate("..", { state: { joinError: true } });
      return;
    }
    let newState = room;
    if (!alreadyInRoom) {
      await runTransaction(roomRef, (prevState: AppState | null) => {
        if (!prevState) return prevState;
        newState = appReducer(room, { type: "addPlayer", payload: clientId });
        return newState;
      });
    }
    // set initial values even though they will be updated by the listener immediately
    setRoomState(newState);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as AppState | null;
      setRoomState(data ?? init({ blankCards: true }));
    });
    unsubscribeRef.current = unsubscribe;
  };

  const dispatch = async (payload: Payloads, roomId: string) => {
    const roomRef = child(dbRef, `rooms/${roomId}`);
    await runTransaction(roomRef, (previousState: AppState | null) => {
      if (!previousState) return previousState;
      return appReducer(previousState, payload);
    });
  };

  const cleanup = async (roomId: string) => {
    const roomRef = child(dbRef, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    const room = roomSnapshot.val() as AppState | null;
    if (!room?.players?.length) remove(roomRef);
    unsubscribeRef.current?.();
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <StartScreen
            isInRoom={isInRoom}
            createRoom={createRoom}
            bigScreen={bigScreen}
          />
        }
      />
      <Route
        path="/:roomId"
        element={
          <App
            clientId={clientId}
            isInRoom={isInRoom}
            joinRoom={joinRoom}
            roomState={roomState}
            dispatch={dispatch}
            onLeave={cleanup}
            bigScreen={bigScreen}
          />
        }
      />
    </Routes>
  );
};

const generateClientId = () => {
  // Check if the client ID is already stored in sessionStorage
  const clientId = sessionStorage.getItem("clientId");
  if (clientId) return clientId;
  // Generate a new client ID
  const newClientId = "client_" + Math.random().toString(36).substring(2, 15);
  // Store the client ID in sessionStorage
  sessionStorage.setItem("clientId", newClientId);
  return newClientId;
};

export default FirebaseWrapper;
