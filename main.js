// Récupérer les éléments HTML
const inputFile = document.getElementById("inputFile");
const showDiv = document.getElementById("show");
const previewDiv = document.getElementById("preview");
const generateGifButton = document.getElementById("generateGif");

// Création des éléments vidéo et canvas
const video = document.createElement("video");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Événement : Quand une vidéo est sélectionnée
inputFile.addEventListener("change", (event) => {
  const file = event.target.files[0];

  // Vérifier si le fichier est bien une vidéo
  if (file && file.type.startsWith("video/")) {
    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    // Afficher la vidéo dans la division "show"
    showDiv.innerHTML = "";
    video.controls = true; // Ajouter les contrôles (play, pause, etc.)
    showDiv.appendChild(video);

    // Charger les métadonnées de la vidéo (pour récupérer ses dimensions)
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Activer le bouton pour générer le GIF
      generateGifButton.disabled = false;
    };
  } else {
    alert("Veuillez sélectionner un fichier vidéo valide !");
  }
});

// Fonction pour convertir la vidéo en GIF
function generateGifFromVideo() {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height,
    workerScript: "gif.worker.js",
  });

  let currentTime = 0;
  const frameRate = 10; // Frames par seconde pour le GIF
  const maxDuration = 5; // Durée maximale en secondes pour le GIF
  video.currentTime = 0; // Repartir du début de la vidéo

  // Ajouter des frames au GIF
  video.addEventListener("timeupdate", function captureFrames() {
    if (currentTime < video.duration && currentTime < maxDuration) {
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      gif.addFrame(ctx, { copy: true, delay: 1000 / frameRate });
      currentTime += 1 / frameRate;
      video.currentTime = currentTime; // Passer à la prochaine frame
      previewDiv.innerHTML = ""; // Nettoyer la prévisualisation
      previewDiv.innerHTML = "Patientez un peu ...";
    } else {
      video.pause();
      gif.render(); // Terminer le GIF une fois toutes les frames ajoutées
      video.removeEventListener("timeupdate", captureFrames); // Arrêter d'écouter cet événement
    }
  });

  // Quand le GIF est terminé
  gif.on("finished", (blob) => {
    console.log(blob);
    console.log("hello");

    // Afficher le GIF
    const url = URL.createObjectURL(blob);
    const gifImage = document.createElement("img");
    gifImage.src = url;
    previewDiv.innerHTML = ""; // Nettoyer la prévisualisation
    previewDiv.appendChild(gifImage);

    // Lien de téléchargement
    const showLink = document.getElementById("showLink");
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "video-to-gif.gif";
    downloadLink.textContent = "Télécharger le GIF";
    showLink?.appendChild(downloadLink);
  });

  gif.on("error", (err) => {
    console.error("Erreur lors de la génération du GIF :", err);
    alert("Une erreur est survenue !");
  });
}

// Événement : Quand on clique sur le bouton "Créer un GIF"
generateGifButton.addEventListener("click", generateGifFromVideo);
