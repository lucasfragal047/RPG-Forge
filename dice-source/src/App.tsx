import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";

import { InteractiveTray } from "./tray/InteractiveTray";
import { Sidebar } from "./controls/Sidebar";
import { LumathhuDiceSync } from "./plugin/LumathhuDiceSync";

export function App() {
  return (
    <Container disableGutters maxWidth="md">
      <Stack direction="row" justifyContent="center">
        <LumathhuDiceSync />
        <Sidebar />
        <InteractiveTray />
      </Stack>
    </Container>
  );
}
