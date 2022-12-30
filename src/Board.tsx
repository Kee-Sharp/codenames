import _ from "lodash";
import Card from "@mui/material/Card";
import { ICard, TRole } from "./App";

interface BoardProps {
  cards: ICard[];
  role: TRole;
  hasWinner: boolean;
  onClick: (index: number) => void;
}

const Board = ({ cards, role, hasWinner, onClick }: BoardProps) => {
  const rows = _.chunk(cards, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", gap: 8 }}>
          {row.map(({ team, title, revealed }, index) => {
            /** [revealed color, spymaster color] */
            let backgroundColors: [string, string];
            /** [revealed color, spymaster color] */
            let colors: [string, string];
            switch (team) {
              case "blue":
                backgroundColors = ["primary.dark", "#81c3f9"];
                colors = ["white", "primary.dark"];
                break;
              case "red":
                backgroundColors = ["error.dark", "#f48885"];
                colors = ["white", "error.dark"];
                break;
              case "bomb":
                backgroundColors = ["black", "grey.700"];
                colors = ["white", "black"];
                break;
              default:
                backgroundColors = ["grey.400", "white"];
                colors = ["white", "black"];
                break;
            }
            let backgroundColor, color;
            if (revealed) {
              backgroundColor = backgroundColors[0];
              color = colors[0];
            } else if (role === "spymaster" || hasWinner) {
              backgroundColor = backgroundColors[1];
              color = colors[1];
            } else {
              backgroundColor = "white";
              color = "black";
            }
            return (
              <Card
                key={index}
                sx={{
                  backgroundColor,
                  color,
                  width: 108,
                  height: 72,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: "medium",
                  "&:hover": { opacity: "90%" },
                }}
                onClick={() => onClick(rowIndex * 5 + index)}
              >
                {title.toUpperCase()}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};
export default Board;
