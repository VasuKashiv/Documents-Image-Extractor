import React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function ProgressTracker({ count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Typography>
        Captions: {count} / {total} ({pct}%)
      </Typography>
      <LinearProgress variant="determinate" value={pct} />
    </Box>
  );
}
