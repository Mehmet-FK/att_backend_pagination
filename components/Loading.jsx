"use client";

import { Fade } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const Loading = ({ loading }) => {
  return (
    <Fade in={loading} timeout={350}>
      <Backdrop
        sx={{
          backgroundColor: "#000000de",
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 3,
        }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Fade>
  );
};

export default Loading;
