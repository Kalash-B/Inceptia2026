"use client"

import QRCode from 'qrcode'
import { useState } from 'react'



function Page() {

    const [qr, setQr] = useState("")

    async function generateQR() {
        const url = await QRCode.toDataURL("SammyK.")
        setQr(url)
    }
    return (
        <div>
            <h1>Welcome Sammy K.</h1>
            <p>Kremlin Spies</p>

            <button onClick={generateQR}>Generate</button>

            {qr && <img src={qr} alt="QR Code" />}

        </div>
    )
}
export default Page