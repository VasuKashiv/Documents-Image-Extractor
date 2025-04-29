import React from "react";
import Grid from "@mui/material/Grid";
import ImageCard from "./ImageCard";

export default function ImageGallery({ images }) {
  return (
    <Grid container spacing={2}>
      {images.map((img) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
          <ImageCard img={img} />
        </Grid>
      ))}
    </Grid>
  );
}
