'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UploadForm() {
  const [form, setForm] = useState({
    nombre_apodo: '',
    numero_id: '',
    instagram: '',
    color_fondo: '',
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('your-bucket-name') // replace with your actual bucket
      .upload(`uploads/${form.numero_id}_${form.file.name}`, form.file);

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message);
      return;
    }

    const publicUrl = supabase.storage
      .from('your-bucket-name')
      .getPublicUrl(uploadData.path).data.publicUrl;

    // Insert metadata
    const { data, error } = await supabase.from('files').insert([
      {
        nombre_apodo: form.nombre_apodo,
        numero_id: form.numero_id,
        instagram: form.instagram,
        color_fondo: form.color_fondo,
        file_url: publicUrl,
      },
    ]);

    if (error) {
      alert('Error saving form: ' + error.message);
    } else {
      alert('Upload successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input name="nombre_apodo" placeholder="Nombre/Apodo" onChange={handleChange} required />
      <input name="numero_id" placeholder="Número de ID" onChange={handleChange} required />
      <input name="instagram" placeholder="Instagram @" onChange={handleChange} />
      <input name="color_fondo" placeholder="Color de Fondo" onChange={handleChange} required />
      <input name="file" type="file" onChange={handleChange} required />
      <button type="submit">Subir</button>
    </form>
  );
}
