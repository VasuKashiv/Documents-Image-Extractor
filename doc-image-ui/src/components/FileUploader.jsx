import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { client } from "../api/client";
import { useDropzone } from "react-dropzone";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

export default function FileUploader({ onStart }) {
  const [files, setFiles] = useState([]);
  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return client.post("/upload", form);
    },
    onSuccess(res) {
      onStart(res.data.document_ids);
      setFiles([]);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    multiple: true, // allow multi-select
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted]),
  });

  return (
    <div style={{ border: "2px dashed #aaa", padding: 20, marginBottom: 20 }}>
      <div
        {...getRootProps()}
        style={{ cursor: "pointer", padding: 40, textAlign: "center" }}
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select</p>
      </div>
      {files.length > 0 && (
        <ul>
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={mutation.isLoading}
          style={{ marginTop: 10 }}
        >
          {mutation.isLoading ? "Processing…" : "Upload & Process"}
        </Button>
      )}
      {mutation.isError && (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {mutation.error.message}
        </Alert>
      )}
    </div>
  );
}
