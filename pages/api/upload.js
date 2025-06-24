import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { nombre, numeroId, instagram, colorDeFondo, file } = req.body

    if (!nombre || !numeroId || !file) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const folderName = `id-${numeroId}`
    const fileName = 'profile-image.png'
    const filePath = `${folderName}/${fileName}`

    const base64Data = file.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, 'base64')

    const { error: uploadError } = await supabase.storage
      .from('funnynoiseclubids') //
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      return res.status(500).json({ error: 'Upload failed', details: uploadError.message })
    }

    const { error: insertError } = await supabase
      .from('funnynoiseclubids') //
      .insert([
        {
          nombre,
          id_###: numeroId,
          instagram @,
          color: colorDeFondo,
          file_path: filePath,
          uploaded_at: new Date().toISOString()
        }
      ])

    if (insertError) {
      return res.status(500).json({ error: 'DB insert failed', details: insertError.message })
    }

    return res.status(200).json({ message: 'Upload success' })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
