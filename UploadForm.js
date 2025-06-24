import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust the path if needed

export default function UploadForm() {
  const [file, setFile] = useState(null); // save selected file
  const [message, setMessage] = useState(""); // feedback messages

  // Called when user selects a file
  function handleFileChange(event) {
    setFile(event.target.files[0]); // grab the first file from the file input
  }

  // Called when user clicks "Upload"
  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    // Upload file to supabase storage
    const { data, error } = await supabase.storage
      .from("funnynoiseclubids")  // <- REPLACE with your bucket name from Supabase Storage
      .upload(file.name, file);

    if (error) {
      setMessage(`Upload failed: ${error.message}`);
    } else {
      setMessage("Upload successful!");
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
