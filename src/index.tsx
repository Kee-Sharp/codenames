import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import reportWebVitals from "./reportWebVitals";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FirebaseWrapper from "./FirebaseWrapper";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
const theme = createTheme({
  palette: {
    secondary: {
      main: "#f5f5f5",
    },
  },
});
root.render(
  <ThemeProvider theme={theme}>
    <FirebaseWrapper />
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
