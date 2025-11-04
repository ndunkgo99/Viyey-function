const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Ambil kredensial dari config (akan diatur nanti)
const BUNNY_API_KEY = functions.config().bunny.api_key;
const BUNNY_LIBRARY_ID = functions.config().bunny.library_id;

exports.createBunnyVideo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login dulu!");
  }

  const { title } = data;
  if (!title || typeof title !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Judul wajib diisi.");
  }

  try {
    const res = await axios.post(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      { title },
      { headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "application/json" } }
    );

    return {
      videoId: res.data.guid,
      uploadUrl: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${res.data.guid}`,
      title: title.trim()
    };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError("internal", "Gagal buat video di Bunny.");
  }
});
