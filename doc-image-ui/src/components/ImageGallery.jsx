// import React from "react";
// import Grid from "@mui/material/Grid";
// import ImageCard from "./ImageCard";

// export default function ImageGallery({ images }) {
//   return (
//     <Grid container spacing={2}>
//       {images.map((img) => (
//         <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
//           <ImageCard img={img} />
//         </Grid>
//       ))}
//     </Grid>
//   );
// }

import React, { useState } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

const breakpointColumnsObj = {
  default: 4,
  1200: 3,
  900: 2,
  600: 1,
};

export default function ImageGallery({ images }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Precompute full URLs
  const urls = images.map(
    (img) => `${process.env.REACT_APP_API_URL}${img.url}`
  );

  return (
    <Box sx={{ my: 4 }}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map((img, idx) => (
          <Box
            key={img.id}
            className="masonry-item"
            sx={{ mb: 2, position: "relative", cursor: "pointer" }}
            onClick={() => {
              setPhotoIndex(idx);
              setIsOpen(true);
            }}
          >
            <img
              src={urls[idx]}
              alt={img.caption}
              style={{
                width: "100%",
                display: "block",
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
            {/* Hover overlay */}
            <Box
              className="overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                p: 1,
                opacity: 0,
                transition: "opacity 0.3s",
                borderRadius: 1,
              }}
            >
              <ZoomInIcon sx={{ fontSize: 24, mb: 0.5 }} />
              <Typography variant="caption" noWrap>
                {img.caption || "Loading caption…"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Masonry>

      {/* Lightbox */}
      {isOpen && (
        <Lightbox
          mainSrc={urls[photoIndex]}
          nextSrc={urls[(photoIndex + 1) % urls.length]}
          prevSrc={urls[(photoIndex + urls.length - 1) % urls.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + urls.length - 1) % urls.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % urls.length)
          }
          imageCaption={
            <>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                {images[photoIndex].caption}
              </Typography>
              <Typography variant="caption" sx={{ color: "#ccc" }}>
                Source: {images[photoIndex].document_filename}
                {images[photoIndex].page_or_slide != null
                  ? ` (Page ${images[photoIndex].page_or_slide})`
                  : ""}
              </Typography>
            </>
          }
        />
      )}
    </Box>
  );
}
