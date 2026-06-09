# Sifr. صفر

A web app for encrypting and decrypting text using classical ciphers.

---

## What It Does

Sifr lets you encrypt or decrypt a message using one of five ciphers. Type your message, hit Enter, pick a cipher, and get your result instantly. An animated node canvas runs in the background depicting each encryption and decryption.

---

## Ciphers

| Cipher | Description |
|--------|-------------|
| **Caesar** | Shifts each letter by 6 positions |
| **Vigenère** | Polyalphabetic substitution using the key `miftah` |
| **Atbash** | Reverses the alphabet (`A↔Z`, `B↔Y`, etc.) |
| **XOR** | XOR each character against the key `miftah`, output as hex |
| **Miftah** | A custom cipher — Playfair encryption on a QWERTY-ordered grid keyed with `MIFTAH`, followed by a Vigenère pass |

---

## Stack

- **Backend:** Node.js + Express — handles all cipher logic server-side via `/api/encrypt` and `/api/decrypt`
- **Frontend:** Vanilla HTML/CSS/JS — single `index.html`, no frameworks

---

## Getting Started

**Prerequisites:** Node.js installed

```bash
# Clone the repo
git clone https://github.com/your-username/sifr-classical-ciphers-demo.git
cd sifr

# Install dependencies
npm install

# Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Toggle between **E** (encrypt) and **D** (decrypt) mode using the switch in the header
2. Type your message and press **Enter** or click the button
3. Select a cipher from the dropdown
4. Copy the result with the **Copy** button

---

## Project Structure

```
sifr-classical-ciphers-demo/
├── index.html      # Frontend UI + canvas animation + glitch effects
├── server.js       # Express server + all cipher implementations
└── package.json
```

---

## Notes

- The Miftah cipher treats `I` and `J` as the same character (standard Playfair behavior), and appends position markers to the ciphertext to allow lossless decryption
- XOR output is hex-encoded; decryption expects hex input
- All ciphers are case-preserving except Miftah (which uppercases output)

---

*Sifr (صفر) — Arabic for "zero", and the etymological root of the word "cipher".*
