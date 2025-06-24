import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      nombre,
      numeroId,
      instagram,
      colorDeFondo,
      file,          // base64 image of photo
      firma          // base64 image of signature
    } = req.body;

    if (!nombre || !numeroId || !file || !firma) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // All files go into the same folder named after the ID
    const folderName = `id-${numeroId}`;

    // -------- Upload Profile Image --------
    const photoBuffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const photoPath = `${folderName}/profile.png`;

    const { error: photoError } = await supabase.storage
      .from('funnynoiseclubids')
      .upload(photoPath, photoBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (photoError) {
      return res.status(500).json({ error: 'Photo upload failed', details: photoError.message });
    }

    // -------- Upload Signature Image --------
    const signatureBuffer = Buffer.from(firma.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const signaturePath = `${folderName}/signature.png`;

    const { error: sigError } = await supabase.storage
      .from('funnynoiseclubids')
      .upload(signaturePath, signatureBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (sigError) {
      return res.status(500).json({ error: 'Signature upload failed', details: sigError.message });
    }

    // -------- Optional: Upload Metadata as JSON --------
    const metadata = {
      nombre,
      numeroId,
      instagram,
      colorDeFondo,
      uploaded_at: new Date().toISOString()
    };
    const metadataPath = `${folderName}/metadata.json`;

    const { error: metaError } = await supabase.storage
      .from('funnynoiseclubids')
      .upload(metadataPath, Buffer.from(JSON.stringify(metadata), 'utf-8'), {
        contentType: 'application/json',
        upsert: true
      });

    if (metaError) {
      return res.status(500).json({ error: 'Metadata upload failed', details: metaError.message });
    }

    // -------- Optional: Save a row in Supabase Table --------
    const { error: insertError } = await supabase
      .from('funnynoiseclubids')
      .insert([
        {
          nombre,
          id_numero: numeroId,
          instagram,
          color: colorDeFondo,
          photo_path: photoPath,
          signature_path: signaturePath,
          uploaded_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      return res.status(500).json({ error: 'DB insert failed', details: insertError.message });
    }

    return res.status(200).json({ message: 'Upload successful' });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
