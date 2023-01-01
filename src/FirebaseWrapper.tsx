import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
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
import React, { useLayoutEffect, useRef, useState } from "react";
import App, { AppState } from "./App";
import appReducer, { init, Payloads } from "./appReducer";
import Board from "./Board";

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
  const [roomId, setRoomId] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [idError, setIdError] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [roomState, setRoomState] = useState(() => init([]));
  const unsubscribeRef = useRef<Function | null>(null);
  const clientId = generateClientId();

  useLayoutEffect(() => {
    const roomsRef = child(dbRef, "rooms");
    get(roomsRef).then((snapshot) => {
      const rooms = (snapshot.val() ?? {}) as Record<string, AppState>;
      for (let [key, room] of Object.entries(rooms)) {
        const { players = [] } = room;
        if (players.find(({ id }) => id === clientId)) {
          setRoomId(key);
          joinRoom(key, true);
          break;
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRoom = async () => {
    const newRoomKey = push(child(dbRef, "rooms"), init([])).key;
    if (!newRoomKey) return;
    setRoomId(newRoomKey);
    joinRoom(newRoomKey);
  };

  const joinRoom = async (key: string, alreadyInRoom = false) => {
    const roomRef = child(dbRef, `rooms/${key}`);
    const roomSnapshot = await get(roomRef);
    const room = roomSnapshot.val() as AppState | null;
    if (!room) {
      setIdError(true);
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
      setRoomState(data ?? init([]));
    });
    unsubscribeRef.current = unsubscribe;
    setHasJoinedRoom(true);
    setShowInput(false);
  };

  const dispatch = async (payload: Payloads) => {
    const roomRef = child(dbRef, `rooms/${roomId}`);
    await runTransaction(roomRef, (previousState: AppState | null) => {
      if (!previousState) return previousState;
      return appReducer(previousState, payload);
    });
  };

  const cleanup = async () => {
    const roomRef = child(dbRef, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    const room = roomSnapshot.val() as AppState | null;
    if (!room?.players?.length) remove(roomRef);
    setRoomId("");
    setHasJoinedRoom(false);
    unsubscribeRef.current?.();
  };

  return hasJoinedRoom ? (
    <App
      clientId={clientId}
      roomId={roomId}
      roomState={roomState}
      dispatch={dispatch}
      onLeave={cleanup}
    />
  ) : (
    <div style={{ padding: "78.5px 48px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Box
          sx={{
            backgroundColor: "grey.800",
            width: 200,
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          {showInput ? (
            <>
              <OutlinedInput
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setIdError(false);
                }}
                error={idError}
                size="small"
                placeholder="Enter room id"
                color="secondary"
                sx={{
                  marginY: 1,
                  fontSize: 12,
                  width: "100%",
                  color: "white",
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ flex: 1 }}
                  onClick={() => joinRoom(roomId)}
                >
                  Join
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ flex: 1 }}
                  onClick={() => {
                    setShowInput(false);
                    setRoomId("");
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Button variant="outlined" color="secondary" onClick={createRoom}>
                Create Room
              </Button>
              <Button
                variant="outlined"
                color="success"
                sx={{ marginTop: 1, filter: "brightness(1.4)" }}
                onClick={() => setShowInput(true)}
              >
                Join Room
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography fontSize={18} color="secondary.main" marginBottom={1}>
            Codenames
          </Typography>
          <Board
            cards={[...Array(25)].map(() => ({
              team: "none",
              title: "",
              revealed: false,
            }))}
          />
        </Box>
      </div>
    </div>
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
