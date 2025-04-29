import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function ImageCard({ img }) {
  const src = `${process.env.REACT_APP_API_URL}${img.url}`;

  return (
    <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* Aspect-ratio box for uniform full-sized images */}
      <Box sx={{ position: "relative", pt: "75%" /* 4:3 ratio */ }}>
        <Box
          component="img"
          src={src}
          alt={img.caption}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <CardContent>
        {img.caption_source === "system" ? (
          <Typography variant="subtitle2" color="warning.main">
            {img.caption}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.primary">
            {img.caption || "Loading caption…"}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          {img.document_filename}{" "}
          {img.page_or_slide && `(Page ${img.page_or_slide})`}
        </Typography>
      </CardContent>
    </Card>
  );
}
