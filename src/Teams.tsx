import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import OutlinedInput, { outlinedInputClasses } from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { SystemStyleObject, Theme } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { IPlayer, TTeam } from "./App";

interface TeamsProps {
  players: IPlayer[];
  clientId: string;
  onJoinTeam: (team: TTeam) => void;
  onRandomizeTeams: () => void;
  onChangeNickname: (newName: string) => void;
  removePlayer: (id: string) => void;
}

const buttonSx: SystemStyleObject<Theme> = {
  fontWeight: "bold",
  fontSize: 10,
  borderColor: "grey.700",
  borderRadius: "2px",
  color: "grey.100",
  width: "100%",
  ":hover": {
    borderColor: "grey.600",
    backgroundColor: "inherit",
  },
};

const Teams = ({ onRandomizeTeams, onChangeNickname, ...rest }: TeamsProps) => {
  const [isChangingNickname, setIsChangingNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChangingNickname) inputRef.current?.focus();
  }, [isChangingNickname]);

  const submitNickname = () => {
    onChangeNickname(nickname);
    setNickname("");
    setIsChangingNickname(false);
  };
  return (
    <Box
      sx={{
        backgroundColor: "grey.800",
        width: 200,
        padding: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Team team="red" {...rest} />
        <Team team="blue" {...rest} />
      </Box>
      <Box>
        {isChangingNickname ? (
          <>
            <OutlinedInput
              inputRef={inputRef}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") submitNickname();
              }}
              size="small"
              placeholder="Enter new nickname"
              sx={{
                marginY: 1,
                fontSize: 12,
                width: "100%",
                color: "white",
                "&, & > fieldset": {
                  borderColor: "grey.700",
                },
                [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
                  {
                    borderColor: "grey.600",
                    borderWidth: 1,
                  },
                [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
                  borderColor: "grey.600",
                },
              }}
            />
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={submitNickname}
              disabled={!nickname}
            >
              Submit
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              sx={{ ...buttonSx, marginY: 1 }}
              onClick={onRandomizeTeams}
            >
              Randomize Teams
            </Button>
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={() => setIsChangingNickname(true)}
            >
              Change Nickname
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

interface TeamProps extends Omit<TeamsProps, "onRandomizeTeams" | "onChangeNickname"> {
  team: TTeam;
}
const Team = ({ team, players, clientId, onJoinTeam, removePlayer }: TeamProps) => {
  const [showRemoveIcons, setShowRemoveIcons] = useState<boolean[]>([]);
  const teamPlayers = players.filter((player) => player.team === team);
  const colorPrefix = team === "red" ? "error" : "primary";
  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
      onMouseLeave={() => {
        setShowRemoveIcons([...showRemoveIcons].fill(false));
      }}
    >
      <Button
        variant="contained"
        sx={{
          width: "100%",
          backgroundColor: `${colorPrefix}.main`,
          fontWeight: "bold",
          fontSize: 10,
          marginBottom: 1,
          ":hover": {
            backgroundColor: `${colorPrefix}.dark`,
          },
        }}
        onClick={() => onJoinTeam(team)}
      >{`Join ${team}`}</Button>
      {teamPlayers.map(({ id, nickname, role }, index) => (
        <Typography
          key={index}
          fontSize={10}
          color={`${colorPrefix}.main`}
          marginTop={0.5}
          sx={{
            ...(id === clientId && { fontStyle: "italic" }),
            display: "flex",
            alignItems: "center",
            userSelect: "none",
          }}
          onClick={(event) => {
            if (event.detail >= 2) {
              const newShowIcons = [...showRemoveIcons];
              newShowIcons[index] = true;
              setShowRemoveIcons(newShowIcons);
            }
          }}
        >
          {role === "spymaster" ? `[${nickname}]` : nickname}
          {showRemoveIcons[index] && (
            <CloseIcon
              fontSize="inherit"
              onClick={() => removePlayer(id)}
              sx={{ marginLeft: 0.5 }}
            />
          )}
        </Typography>
      ))}
    </Box>
  );
};

export default Teams;
