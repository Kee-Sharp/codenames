import _ from "lodash";
import Card from "@mui/material/Card";
import { ICard } from "./App";

interface BoardProps {
  cards: ICard[];
  onClick: (index: number) => void;
}

const Board = ({ cards, onClick }: BoardProps) => {
  const rows = _.chunk(cards, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", gap: 8 }}>
          {row.map(({ team, title, revealed }, index) => {
            let backgroundColor;
            let color = "white";
            switch (team) {
              case "blue":
                backgroundColor = "primary.dark";
                break;
              case "red":
                backgroundColor = "error.dark";
                break;
              case "bomb":
                backgroundColor = "black";
                break;
              default:
                backgroundColor = "grey.400";
                break;
            }
            if (!revealed) {
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
