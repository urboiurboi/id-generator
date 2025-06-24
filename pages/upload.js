import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('uploads')  // you will create this bucket soon
      .upload(filePath, file);

    if (uploadError) {
      setMessage('Upload error: ' + uploadError.message);
      return;
    }

    // Get public URL
    const { publicURL, error: urlError } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    if (urlError) {
      setMessage('URL error: ' + urlError.message);
      return;
    }

    // Save file info to DB
    const { data, error: dbError } = await supabase
      .from('files')
      .insert([{ file_name: file.name, file_url: publicURL }]);

    if (dbError) {
      setMessage('DB error: ' + dbError.message);
      return;
    }

    setMessage('File uploaded successfully!');
  }

  return (
    <form onSubmit={handleUpload}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Upload</button>
      <p>{message}</p>
    </form>
  );
}
