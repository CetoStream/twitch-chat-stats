//Adresse de votre serveur WebSocket
const WS_URL = "ws://localhost:8080";

//Intervalle d'envoi automatique (en miillisecondes)
//Ici toutes les 2 minuties = 2 * 60 * 1000 = 120000 ms
const INTERVAL_MS = 2 * 60 * 1000;

// scripts/main.js
Hooks.on("ready", () => {
  console.log("✅ Twitch Chat Stats chargé, initialisation WebSocket…");

  // 1️⃣ Créer la connexion
    const socket = new WebSocket(WS_URL);

  // 2️⃣ Quand la connexion est établie
  socket.addEventListener("open", () => {
    console.log("🔗 Connecté au serveur WebSocket");
    // On envoie immédiatement un premier payload
    sendPayload(socket);
    // Puis on programme l’envoi à intervalle régulier
    setInterval(() => sendPayload(socket), INTERVAL_MS);
  });

  // 3️⃣ En cas d’erreur de connexion
  socket.addEventListener("error", (err) => {
    console.error("⚠️ Erreur WebSocket :", err);
  });


});

/**
 * Construit le payload JSON et l'envoie via WebSocket
 */
function sendPayload(socket) {
  // a) Nom de la scène
  const sceneName = canvas.scene?.name || "Inconnue";

  // b) Extraction des PJ
  const playersData = game.actors
    .filter(a => a.hasPlayerOwner)
    .map(actor => {
      const hp    = actor.system.attributes.hp.value;
      const maxHp = actor.system.attributes.hp.max;
      const ac    = actor.system.attributes.ac.value;
      const level = actor.system.details.level.value;
      const classItem = actor.items.find(i => i.type === "class");
      const className = classItem?.name || "Inconnue";
      let status = hp <= 0
        ? "KO"
        : hp <= maxHp * 0.25
          ? "Blessé"
          : "En forme";

      return {
        id:     actor.id,
        name:   actor.name,
        class:  className,
        level:  level,
        hp:     hp,
        maxHp:  maxHp,
        ac:     ac,
        status: status
      };
    });

  // c) Assemblage du payload
  const payload = {
    scene:   sceneName,
    players: playersData
  };

  // d) Envoi via WebSocket
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    console.log("📤 Payload envoyé :", payload);
  } else {
    console.warn("⏳ WebSocket pas encore ouvert, envoi différé");
  }
}
