export default function UploadForm() {
  async function handleSubmit(event) {
    event.preventDefault()

    const fileInput = event.target.fileInput.files[0]
    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64File = reader.result

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: event.target.nombre.value,
          numeroId: event.target.numeroId.value,
          instagram: event.target.instagram.value,
          colorDeFondo: event.target.colorDeFondo.value,
          file: base64File
        })
      })

      const data = await res.json()
      if (res.ok) {
        alert('Upload success!')
      } else {
        alert('Error: ' + data.error)
      }
    }

    reader.readAsDataURL(fileInput)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre/Apodo" required />
      <input name="numeroId" placeholder="Número de ID" required />
      <input name="instagram" placeholder="Instagram @" />
      <input name="colorDeFondo" placeholder="Color de Fondo" required />
      <input type="file" name="fileInput" accept="image/*" required />
      <button type="submit">Upload</button>
    </form>
  )
}
