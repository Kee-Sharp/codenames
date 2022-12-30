import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Board from "./Board";
import Teams from "./Teams";
import allWords from "./words.json";

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

function App() {
  const clientId = generateClientId();
  // not sure how this switches between games but making it a variable so it's
  // easy to change later
  const isRedFirst = true;
  const getNewCards = () => {
    let shuffled = _.shuffle(allWords);
    const numRedCards = isRedFirst ? 9 : 8;
    const redWords = _.take(shuffled, numRedCards);
    shuffled = _.drop(shuffled, numRedCards);
    const numBlueCards = isRedFirst ? 8 : 9;
    const blueWords = _.take(shuffled, numBlueCards);
    shuffled = _.drop(shuffled, numBlueCards);
    const neutralWords = _.take(shuffled, 7);
    shuffled = _.drop(shuffled, 7);
    const bombWords = [shuffled[0]];
    const teamOrder = ["red", "blue", "none", "bomb"] as const;
    const cards = [redWords, blueWords, neutralWords, bombWords].flatMap(
      (wordList, index) =>
        wordList.map((word) => ({
          team: teamOrder[index],
          title: word,
          revealed: false,
        }))
    );
    return _.shuffle(cards);
  };
  const [cards, setCards] = useState<ICard[]>(getNewCards);
  const [players, setPlayers] = useState<IPlayer[]>(() => [
    { id: clientId, team: "red", nickname: "Player 1", role: "guesser" },
    { id: "123", team: "blue", nickname: "Player 2", role: "guesser" },
    { id: "456", team: "red", nickname: "Player 3", role: "guesser" },
  ]);
  const [turn, setTurn] = useState<TTeam>("red");
  const [winner, setWinner] = useState<TTeam | undefined>();

  const currentPlayer = players.filter(({ id }) => id === clientId)[0];
  const isYourTurn = currentPlayer.team === turn;
  const remainingRed = cards.reduce(
    (total, { team, revealed }) => (team === "red" && !revealed ? total + 1 : total),
    0
  );
  const remainingBlue = cards.reduce(
    (total, { team, revealed }) => (team === "blue" && !revealed ? total + 1 : total),
    0
  );

  useEffect(() => {
    if (remainingRed === 0) setWinner("red");
    else if (remainingBlue === 0) setWinner("blue");
  }, [remainingRed, remainingBlue]);

  const handleCardClick = (index: number) => {
    if (winner || currentPlayer.team !== turn || currentPlayer.role === "spymaster")
      return;
    const newCards = [...cards];
    newCards[index] = { ...cards[index], revealed: true };
    setCards(newCards);
    if (cards[index].team === "bomb") setWinner(turn === "red" ? "blue" : "red");
  };
  const endTurn = () => {
    if (winner) return;
    setTurn(turn === "red" ? "blue" : "red");
  };

  const handleJoinTeam = (team: TTeam) => {
    if (team === currentPlayer.team) return;
    const newPlayers = players.filter(({ id }) => id !== clientId);
    const newPlayer = { ...currentPlayer, team };
    newPlayers.push(newPlayer);
    setPlayers(newPlayers);
  };
  const handleRandomizeTeams = () => {
    const shuffledPlayers = _.shuffle(players);
    const half = Math.ceil(players.length / 2);
    const newPlayers = shuffledPlayers.map<IPlayer>((player, index) => ({
      ...player,
      team: index < half ? "red" : "blue",
    }));
    setPlayers(newPlayers);
  };
  const handleChangePlayer = (newValues: Partial<IPlayer>) => {
    const newPlayers = [...players];
    const currentIndex = players.findIndex(({ id }) => id === clientId);
    newPlayers[currentIndex] = { ...currentPlayer, ...newValues };
    setPlayers(newPlayers);
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
        <Teams
          players={players}
          clientId={clientId}
          onJoinTeam={handleJoinTeam}
          onRandomizeTeams={handleRandomizeTeams}
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
              onClick={endTurn}
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
          onClick={handleCardClick}
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
          <Button
            variant={winner ? "contained" : "outlined"}
            color={winner ? "success" : "error"}
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}

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

export default App;
