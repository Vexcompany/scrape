const axios = require('axios');

export default async function handler(req, res) {
    // Ambil ID video secara dinamis dari query parameter, contoh: /api/stream?id=auj9k
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Parameter 'id' video diperlukan" });
    }

    const infoUrl = `https://t2.strp2p.site/api/v1/info?id=${id}`;
    
    const customHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "id-ID,id;q=0.9",
        "Origin": "https://t2.strp2p.site",
        "Referer": `https://t2.strp2p.site/#${id}`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    };

    try {
        // Tahap 1: Ambil payload terenkripsi
        const infoResponse = await axios.get(infoUrl, { headers: customHeaders });
        const encryptedHex = infoResponse.data;

        // Tahap 2: Lakukan handshake untuk mengambil token dinamis 't' dari player halaman utama
        // Pada skenario produksi, kita membaca ulang halaman awal player untuk mengesahkan token 't'
        // Di bawah ini adalah kerangka bypass menggunakan token jabat tangan internal
        
        // Catatan: Ganti hardcode token ini dengan algoritma generator token strp2p jika mereka mengubah salt-nya
        const tokenBypass = "707f3458aa38d3225a78376293d4b446d20..."; 
        const playerUrl = `https://t2.strp2p.site/api/v1/player?t=${tokenBypass}`;

        const playerResponse = await axios.get(playerUrl, { headers: customHeaders });
        const decryptionKey = playerResponse.data; // Mengembalikan { success: true, k: '...', kx: ... }

        // Tahap 3: Kembalikan paket data matang ke aplikasi Frontend-mu
        // Frontend kamu tinggal melakukan rotasi karakter menggunakan kunci 'k' untuk memunculkan m3u8 asli
        return res.status(200).json({
            success: true,
            payload: encryptedHex,
            decryption: decryptionKey
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Gagal menembus proteksi strp2p",
            details: error.message
        });
    }
}
