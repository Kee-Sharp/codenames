import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import React, { useState } from "react";
import type { Payloads } from "./appReducer";
import Board from "./Board";
import Teams from "./Teams";

export type TTeam = "red" | "blue";
export type TRole = "guesser" | "spymaster";

export interface ICard {
  team: TTeam | "bomb" | "none";
  title: string;
  revealed: boolean;
}
export interface IPlayer {
  id: string;
  team: TTeam;
  nickname: string;
  role: TRole;
}
export interface AppState {
  cards: ICard[];
  players: IPlayer[];
  turn: TTeam;
  winner: TTeam | "";
}
interface AppProps {
  clientId: string;
  roomState: AppState;
  dispatch: (payload: Payloads) => void;
  onClose: () => void;
}

function App({ clientId, roomState, dispatch }: AppProps) {
  const { cards, players, turn, winner } = roomState;
  const [showDialog, setShowDialog] = useState(false);

  const currentPlayer = players.filter(({ id }) => id === clientId)[0] ?? {};
  const isYourTurn = currentPlayer.team === turn;
  const remainingRed = cards.reduce(
    (total, { team, revealed }) => (team === "red" && !revealed ? total + 1 : total),
    0
  );
  const remainingBlue = cards.reduce(
    (total, { team, revealed }) => (team === "blue" && !revealed ? total + 1 : total),
    0
  );

  const handleChangePlayer = (newValues: Partial<IPlayer>) => {
    dispatch({ type: "changePlayer", payload: { newValues, currentPlayer } });
  };

  return (
    <div style={{ padding: "24px 48px", display: "flex", gap: 8 }}>
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
        <Teams
          players={players}
          clientId={clientId}
          onJoinTeam={(team) =>
            dispatch({ type: "joinTeam", payload: { team, currentPlayer } })
          }
          onRandomizeTeams={() => dispatch({ type: "randomizeTeams" })}
          onChangeNickname={(newName) => handleChangePlayer({ nickname: newName })}
        />
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
              color: `${
                (turn === "red" && winner !== "blue") || winner === "red"
                  ? "error"
                  : "primary"
              }.main`,
              fontWeight: "bold",
            }}
          >
            {winner
              ? `${_.capitalize(winner)} wins!`
              : `${isYourTurn ? "Your" : _.capitalize(turn)}${
                  isYourTurn ? "" : "'s"
                } turn`}
          </Typography>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                fontWeight: "bold",
                fontSize: 12,
                borderRadius: "2px",
              }}
              onClick={() => dispatch({ type: "endTurn" })}
              disabled={!isYourTurn}
            >
              End Turn
            </Button>
          </div>
        </div>
        <Board
          cards={cards}
          role={currentPlayer.role}
          hasWinner={!!winner}
          onClick={(index) =>
            dispatch({ type: "clickCard", payload: { index, currentPlayer } })
          }
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <ButtonGroup size="small" sx={{ button: { fontWeight: "500" } }}>
            <Button
              startIcon={<SearchIcon />}
              color="secondary"
              variant={currentPlayer.role === "guesser" ? "contained" : "outlined"}
              onClick={() => handleChangePlayer({ role: "guesser" })}
            >
              Guesser
            </Button>
            <Button
              startIcon={<PersonIcon />}
              color="secondary"
              variant={currentPlayer.role === "spymaster" ? "contained" : "outlined"}
              onClick={() => handleChangePlayer({ role: "spymaster" })}
            >
              Spymaster
            </Button>
          </ButtonGroup>
          <Dialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            sx={{ "& .MuiPaper-root": { maxWidth: 400 } }}
          >
            <DialogContent>
              <DialogContentText>
                Are you sure you want to start a new game? The game currently in progress
                will be overridden.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setShowDialog(false);
                  dispatch({ type: "reset" });
                }}
              >
                Start New Game
              </Button>
            </DialogActions>
          </Dialog>
          <Button
            variant={winner ? "contained" : "outlined"}
            color={winner ? "success" : "error"}
            onClick={() => {
              if (winner) dispatch({ type: "reset" });
              else setShowDialog(true);
            }}
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
