// import React, { useState } from "react";
// import Button from "@mui/material/Button";
// import FileUploader from "./components/FileUploader";
// import ProgressTracker from "./components/ProgressTracker";
// import ImageGallery from "./components/ImageGallery";
// import { useLiveImages } from "./hooks/useLiveImages";
// import { useAllImages } from "./hooks/useAllImages";

// function App() {
//   const [docIds, setDocIds] = useState([]); // all uploaded docs
//   const [showAll, setShowAll] = useState(false); // gallery mode toggler

//   // Live-preview (polling) for just the docs in `docIds`, only when not in full gallery
//   const liveQuery = useLiveImages(docIds.length > 0 && !showAll);
//   // Full gallery query, enabled only when `showAll === true`
//   const allQuery = useAllImages(showAll);

//   // Filter live data to our docs
//   const liveImages = (liveQuery.data || []).filter((img) =>
//     docIds.includes(img.document_id)
//   );
//   const doneCount = liveImages.filter((i) => i.caption_source).length;

//   // Handler for the "Refresh Full Gallery" button
//   const handleFullRefresh = () => {
//     if (showAll) {
//       // already in gallery → re-fetch to pick up new images
//       allQuery.refetch();
//     } else {
//       // switch into gallery mode → triggers the first fetch
//       setShowAll(true);
//     }
//   };

//   return (
//     <div className="app-container">
//       <h1>📄 → 🖼️ Document Image Gallery</h1>

//       {/* File picker + process */}
//       <FileUploader
//         onStart={(ids) => {
//           setDocIds((prev) => [...prev, ...ids]);
//           setShowAll(false); // leave gallery mode when new upload happens
//         }}
//       />

//       {/* Refresh gallery button */}
//       <Button variant="outlined" onClick={handleFullRefresh} sx={{ mb: 3 }}>
//         Refresh Full Gallery
//       </Button>

//       {/* --- Full Gallery View --- */}
//       {showAll ? (
//         <>
//           {allQuery.isLoading && <p>Loading gallery…</p>}
//           {allQuery.isError && <p>Error: {allQuery.error.message}</p>}
//           {allQuery.data && <ImageGallery images={allQuery.data} />}
//         </>
//       ) : /* --- Live Preview View --- */
//       docIds.length > 0 ? (
//         <>
//           {liveQuery.isLoading && <p>Loading images…</p>}
//           <ProgressTracker count={doneCount} total={liveImages.length} />
//           <ImageGallery images={liveImages} />
//         </>
//       ) : (
//         /* --- Initial Prompt --- */
//         <p>Select and upload documents to begin.</p>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import FileUploader from "./components/FileUploader";
import ProgressTracker from "./components/ProgressTracker";
import ImageGallery from "./components/ImageGallery";
import { useLiveImages } from "./hooks/useLiveImages";
import { useAllImages } from "./hooks/useAllImages";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [docIds, setDocIds] = useState([]);

  // live preview when tab=0
  const liveQuery = useLiveImages(tab === 0 && docIds.length > 0);
  // full gallery when tab=1
  const allQuery = useAllImages(tab === 1);

  const liveImages = (liveQuery.data || []).filter((img) =>
    docIds.includes(img.document_id)
  );
  const doneCount = liveImages.filter((i) => i.caption_source).length;

  const handleTabChange = (e, newVal) => {
    setTab(newVal);
  };

  const handleUploadStart = (ids) => {
    setDocIds((prev) => [...prev, ...ids]);
    // if they just uploaded, go back to live preview
    setTab(0);
  };

  const handleRefresh = () => {
    if (tab === 1) allQuery.refetch();
    else setTab(1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />

      <Container className="app-container" sx={{ flex: 1 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Live Preview" />
          <Tab label="Full Gallery" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <FileUploader onStart={handleUploadStart} />
          {docIds.length === 0 ? (
            <Typography>Select and upload documents to begin.</Typography>
          ) : (
            <>
              {liveQuery.isLoading && <Typography>Loading images…</Typography>}
              <ProgressTracker count={doneCount} total={liveImages.length} />
              <ImageGallery images={liveImages} />
            </>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Button variant="outlined" onClick={handleRefresh} sx={{ mb: 2 }}>
            Refresh Gallery
          </Button>
          {allQuery.isLoading && <Typography>Loading gallery…</Typography>}
          {allQuery.data && <ImageGallery images={allQuery.data} />}
        </TabPanel>
      </Container>

      <Footer />
    </Box>
  );
}
