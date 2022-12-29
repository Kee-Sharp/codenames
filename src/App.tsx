import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import Board from "./Board";

export interface ICard {
  team: "red" | "blue" | "bomb" | "none";
  title: string;
  revealed: boolean;
}

const words = [
  "Block",
  "March",
  "Berlin",
  "Glove",
  "Club",
  "Soldier",
  "Point",
  "Ruler",
  "Nurse",
  "Olive",
  "Sock",
  "Cross",
  "Apple",
  "Circle",
  "Pool",
  "Fire",
  "Spy",
  "Light",
  "Sub",
  "Plastic",
  "Battery",
  "Well",
  "Snowman",
  "Queen",
  "State",
];

function App() {
  const [cards, setCards] = useState<ICard[]>(() =>
    words.map((v) => ({
      team: (["red", "blue", "bomb", "none"] as const)[Math.floor(Math.random() * 4)],
      title: v,
      revealed: false,
    }))
  );
  const remainingRed = cards.reduce(
    (total, { team, revealed }) => (team === "red" && !revealed ? total + 1 : total),
    0
  );
  const remainingBlue = cards.reduce(
    (total, { team, revealed }) => (team === "blue" && !revealed ? total + 1 : total),
    0
  );

  const handleCardClick = (index: number) => {
    const newCards = [...cards];
    newCards[index] = { ...cards[index], revealed: true };
    setCards(newCards);
  };

  return (
    <div style={{ margin: "24px 48px", display: "flex", gap: 8 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="white" fontWeight="bold">
          Teams
        </Typography>
        {/* Team Selection */}
        <Box sx={{ backgroundColor: "grey.700", width: 200, height: 250 }}></Box>
      </div>
      <div>
        {/* Top Info Section */}
        <div style={{ display: "flex", marginBottom: 16 }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <Typography color="error.light">{remainingRed}</Typography>
            <Typography color="white" marginLeft="7px" marginRight="6px">
              -
            </Typography>
            <Typography color="primary.light">{remainingBlue}</Typography>
          </div>
          <Typography
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "error.main",
              fontWeight: "bold",
            }}
          >
            Red's turn
          </Typography>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              sx={{
                fontWeight: "bold",
                fontSize: 12,
                borderColor: "grey.700",
                borderRadius: "2px",
                color: "white",
              }}
            >
              End Turn
            </Button>
          </div>
        </div>
        <Board cards={cards} onClick={handleCardClick} />
      </div>
    </div>
  );
}

export default App;
