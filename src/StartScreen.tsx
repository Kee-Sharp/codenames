import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React, { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import Board from "./Board";

interface StartScreenProps {
  isInRoom: () => Promise<string | undefined>;
  createRoom: () => Promise<void>;
  bigScreen: boolean;
}

const StartScreen = ({ isInRoom, createRoom, bigScreen }: StartScreenProps) => {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    isInRoom().then((roomAlreadyIn) => {
      if (roomAlreadyIn) navigate(roomAlreadyIn);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "78.5px 48px 24px" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: -200,
          ...(!bigScreen && {
            flexDirection: "column-reverse",
            gap: 24,
            marginLeft: 0,
          }),
        }}
      >
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
          <Button variant="outlined" color="secondary" onClick={createRoom}>
            Create Room
          </Button>
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

export default StartScreen;
