if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("Registro Exitoso", reg))
      .catch(err => console.log("Error al registrar el SW", err));
  });
}

const video = document.getElementById('video');
const gallery = document.getElementById('gallery');
const db = new PouchDB('mini-gallery');
let useFrontCamera = false;
let stream = null;

async function startCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: useFrontCamera ? 'user' : 'environment' },
    audio: false
  });

  video.srcObject = stream;
}

document.getElementById('toggleCamera').addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  startCamera();
});

document.getElementById('capture').addEventListener('click', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  const base64 = canvas.toDataURL('image/jpeg');
  const doc = {
    _id: new Date().toISOString(),
    image: base64
  };

  await db.put(doc);
  addImageToGallery(base64);
});

document.getElementById('clearGallery').addEventListener('click', async () => {
  const allDocs = await db.allDocs();
  for (const row of allDocs.rows) {
    await db.remove(row.id, row.value.rev);
  }
  gallery.innerHTML = '';
});

function addImageToGallery(base64) {
  const img = document.createElement('img');
  img.src = base64;
  gallery.appendChild(img);
}

async function loadGallery() {
  const result = await db.allDocs({ include_docs: true });
  result.rows.forEach(row => addImageToGallery(row.doc.image));
}

startCamera();
loadGallery();