import _ from "lodash";
import { Reducer } from "react";
import type { AppState, IPlayer, TTeam } from "./App";
import allWords from "./words.json";

export const init = (players: IPlayer[]): AppState => {
  // not sure how this switches between games but making it a variable so it's
  // easy to change later
  const isRedFirst = true;
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
  return {
    cards: _.shuffle(cards),
    players,
    turn: "red",
    winner: "",
  };
};

type PayloadAction<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { payload: P; type: T };

type GameplayPayloads =
  | PayloadAction<"clickCard", { index: number; currentPlayer: IPlayer }>
  | PayloadAction<"endTurn">
  | PayloadAction<"reset">;

type AdministrativePayloads =
  | PayloadAction<"addPlayer", string>
  | PayloadAction<"joinTeam", { team: TTeam; currentPlayer: IPlayer }>
  | PayloadAction<"randomizeTeams">
  | PayloadAction<"changePlayer", { newValues: Partial<IPlayer>; currentPlayer: IPlayer }>
  | PayloadAction<"removePlayer", string>;

export type Payloads = GameplayPayloads | AdministrativePayloads;
const reducer: Reducer<AppState, Payloads> = (state, action) => {
  switch (action.type) {
    case "addPlayer": {
      const { players = [] } = state;
      const newPlayers = [...players];
      const [reds, blues] = players.reduce(
        ([prevRed, prevBlue], { team }) =>
          team === "red" ? [prevRed + 1, prevBlue] : [prevRed, prevBlue + 1],
        [0, 0]
      );
      newPlayers.push({
        id: action.payload,
        nickname: `Player ${players.length + 1}`,
        team: reds <= blues ? "red" : "blue",
        role: "guesser",
      });
      return { ...state, players: newPlayers };
    }
    case "clickCard": {
      const { cards, winner, turn } = state;
      const { index, currentPlayer } = action.payload;
      if (winner || currentPlayer.team !== turn || currentPlayer.role === "spymaster")
        return state;
      const newCards = [...cards];
      newCards[index] = { ...cards[index], revealed: true };
      const remainingRed = newCards.reduce(
        (total, { team, revealed }) => (team === "red" && !revealed ? total + 1 : total),
        0
      );
      const remainingBlue = newCards.reduce(
        (total, { team, revealed }) => (team === "blue" && !revealed ? total + 1 : total),
        0
      );
      let newTurn = turn;
      let newWinner: AppState["winner"] = winner;
      const { team: cardTeam } = cards[index];
      if (cardTeam === "bomb") newWinner = turn === "red" ? "blue" : "red";
      else if (remainingRed === 0) newWinner = "red";
      else if (remainingBlue === 0) newWinner = "blue";
      if (!newWinner && cardTeam !== currentPlayer.team) {
        newTurn = turn === "red" ? "blue" : "red";
      }
      return { ...state, cards: newCards, winner: newWinner, turn: newTurn };
    }
    case "endTurn": {
      const { turn, winner } = state;
      if (winner) return state;
      return { ...state, turn: turn === "red" ? "blue" : "red" };
    }
    case "joinTeam": {
      const { players } = state;
      const { team, currentPlayer } = action.payload;
      if (team === currentPlayer.team) return state;
      const newPlayers = players.filter(({ id }) => id !== currentPlayer.id);
      const newPlayer = { ...currentPlayer, team };
      newPlayers.push(newPlayer);
      return { ...state, players: newPlayers };
    }
    case "randomizeTeams": {
      const { players } = state;
      const shuffledPlayers = _.shuffle(players);
      const half = Math.ceil(players.length / 2);
      const newPlayers = shuffledPlayers.map<IPlayer>((player, index) => ({
        ...player,
        team: index < half ? "red" : "blue",
      }));
      return { ...state, players: newPlayers };
    }
    case "changePlayer": {
      const { players } = state;
      const { newValues, currentPlayer } = action.payload;
      const newPlayers = [...players];
      const currentIndex = players.findIndex(({ id }) => id === currentPlayer.id);
      newPlayers[currentIndex] = { ...currentPlayer, ...newValues };
      return { ...state, players: newPlayers };
    }
    case "removePlayer": {
      const { players } = state;
      const newPlayers = players.filter(({ id }) => id !== action.payload);
      return { ...state, players: newPlayers };
    }
    case "reset": {
      return init(state.players.map((player) => ({ ...player, role: "guesser" })));
    }
    default:
      return state;
  }
};

export default reducer;
