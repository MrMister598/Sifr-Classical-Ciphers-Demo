const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const caesarCipher = (text, shift, encrypt) => {
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char.toLowerCase() === char ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
    const code = char.charCodeAt(0) - base;
    const adjustedShift = encrypt ? shift : (26 - shift);
    const newCode = (code + adjustedShift) % 26;
    return String.fromCharCode(newCode + base);
  }).join('');
};

const vigenereCipher = (text, key, encrypt) => {
  key = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!key.length) return text;
  
  let keyIndex = 0;
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char.toLowerCase() === char ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
    const keyChar = key.charCodeAt(keyIndex % key.length) - 'a'.charCodeAt(0);
    const code = char.charCodeAt(0) - base;
    const adjustedShift = encrypt ? keyChar : (26 - keyChar);
    const newCode = (code + adjustedShift) % 26;
    keyIndex++;
    return String.fromCharCode(newCode + base);
  }).join('');
};

const atbashCipher = (text) => {
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char.toLowerCase() === char ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
    const code = char.charCodeAt(0) - base;
    const newCode = 25 - code;
    return String.fromCharCode(newCode + base);
  }).join('');
};

const xorCipher = (text, key, encrypt) => {
  if (!key.length) return text;
  let inputText = text;
  if (!encrypt) {
    const hexRegex = /^[0-9a-fA-F]+$/;
    if (hexRegex.test(text)) {
      inputText = Buffer.from(text, 'hex').toString('binary');
    }
  }
  let result = '';
  for (let i = 0; i < inputText.length; i++) {
    const charCode = inputText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return encrypt ? Buffer.from(result).toString('hex') : result;
};

const QWERTY_ORDER = "QWERTYUIOPASDFGHKLZXCVBNM";

const createMiftahGrid = () => {
  const key = "MIFTAH";
  const keyChars = [...new Set(key.toUpperCase().replace(/J/g, 'I').split(''))];
  const remainingChars = QWERTY_ORDER.split('').filter(c => !keyChars.includes(c));
  const gridChars = [...keyChars, ...remainingChars].slice(0, 25);
  const grid = [];
  for (let i = 0; i < 5; i++) {
    grid.push(gridChars.slice(i * 5, (i + 1) * 5));
  }
  return grid;
};

const findInMiftahGrid = (char, grid) => {
  char = char.toUpperCase();
  if (char === 'J') char = 'I';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === char) {
        return { row, col };
      }
    }
  }
  throw new Error(`Character ${char} not found in grid`);
};

const processTextForEncryption = (text) => {
  let processed = text.toUpperCase().replace(/[^A-Z]/g, '');
  const jPositions = [];
  const duplicateMarkers = [];
  let result = '';
  for (let i = 0; i < processed.length; i++) {
    const currentChar = processed[i];
    if (currentChar === 'J') {
      jPositions.push(result.length);
    }
    result += currentChar === 'J' ? 'I' : currentChar;
    if (i % 2 === 0 && processed[i] === processed[i + 1]) {
      result += 'X';
      duplicateMarkers.push(result.length - 1);
    }
  }
  if (result.length % 2 !== 0) {
    result += 'X';
    duplicateMarkers.push(result.length - 1);
  }
  return {
    processedText: result,
    jPositions,
    duplicateMarkers
  };
};

const miftahPlayfairEncrypt = (text, grid) => {
  const { processedText, jPositions, duplicateMarkers } = processTextForEncryption(text);
  let result = '';
  for (let i = 0; i < processedText.length; i += 2) {
    const a = processedText[i];
    const b = processedText[i + 1];
    const aPos = findInMiftahGrid(a, grid);
    const bPos = findInMiftahGrid(b, grid);
    if (aPos.row === bPos.row) {
      result += grid[aPos.row][(aPos.col + 1) % 5] + grid[bPos.row][(bPos.col + 1) % 5];
    } else if (aPos.col === bPos.col) {
      result += grid[(aPos.row + 1) % 5][aPos.col] + grid[(bPos.row + 1) % 5][bPos.col];
    } else {
      result += grid[aPos.row][bPos.col] + grid[bPos.row][aPos.col];
    }
  }
  let markers = '';
  if (jPositions.length > 0) {
    markers += 'J' + jPositions.map(p => String.fromCharCode(65 + p)).join('');
  }
  if (duplicateMarkers.length > 0) {
    markers += 'X' + duplicateMarkers.map(p => String.fromCharCode(65 + p)).join('');
  }
  return result + (markers ? '|' + markers : '');
};

const miftahPlayfairDecrypt = (text, grid) => {
  const markerIndex = text.lastIndexOf('|');
  let ciphertext = text;
  let jPositions = [];
  let duplicateMarkers = [];
  if (markerIndex !== -1) {
    ciphertext = text.slice(0, markerIndex);
    const markers = text.slice(markerIndex + 1);
    const jMarker = markers.indexOf('J');
    if (jMarker !== -1) {
      const xMarker = markers.indexOf('X');
      const jPosStr = xMarker === -1 ? markers.slice(jMarker + 1) : markers.slice(jMarker + 1, xMarker);
      jPositions = [...jPosStr].map(c => c.charCodeAt(0) - 65);
    }
    const xMarker = markers.indexOf('X');
    if (xMarker !== -1) {
      const xPosStr = markers.slice(xMarker + 1);
      duplicateMarkers = [...xPosStr].map(c => c.charCodeAt(0) - 65);
    }
  }
  let decrypted = '';
  for (let i = 0; i < ciphertext.length; i += 2) {
    const a = ciphertext[i];
    const b = ciphertext[i + 1];
    if (!a || !b) break;
    const aPos = findInMiftahGrid(a, grid);
    const bPos = findInMiftahGrid(b, grid);
    if (aPos.row === bPos.row) {
      decrypted += grid[aPos.row][(aPos.col - 1 + 5) % 5] + grid[bPos.row][(bPos.col - 1 + 5) % 5];
    } else if (aPos.col === bPos.col) {
      decrypted += grid[(aPos.row - 1 + 5) % 5][aPos.col] + grid[(bPos.row - 1 + 5) % 5][bPos.col];
    } else {
      decrypted += grid[aPos.row][bPos.col] + grid[bPos.row][aPos.col];
    }
  }
  let finalResult = '';
  for (let i = 0; i < decrypted.length; i++) {
    if (!duplicateMarkers.includes(i)) {
      finalResult += decrypted[i];
    }
  }
  let resultWithJs = '';
  let jIndex = 0;
  for (let i = 0; i < finalResult.length; i++) {
    if (jIndex < jPositions.length && i === jPositions[jIndex]) {
      resultWithJs += 'J';
      jIndex++;
    } else {
      resultWithJs += finalResult[i];
    }
  }
  return resultWithJs;
};

const miftahCipher = (text, encrypt) => {
  const grid = createMiftahGrid();
  const key = "MIFTAH";
  if (encrypt) {
    const playfairResult = miftahPlayfairEncrypt(text, grid);
    return vigenereCipher(playfairResult, key, true);
  } else {
    const vigenereDecrypted = vigenereCipher(text, key, false);
    return miftahPlayfairDecrypt(vigenereDecrypted, grid);
  }
};

app.post('/api/encrypt', (req, res) => {
  try {
    const { text, cipher } = req.body;
    if (!text || !cipher) throw new Error('Missing parameters');
    let result;
    switch (cipher.toLowerCase()) {
      case 'caesar':
        result = caesarCipher(text, 6, true);
        break;
      case 'vigenere':
        result = vigenereCipher(text, "miftah", true);
        break;
      case 'atbash':
        result = atbashCipher(text);
        break;
      case 'xor':
        result = xorCipher(text, "miftah", true);
        break;
      case 'miftah':
        result = miftahCipher(text, true);
        break;
      default:
        throw new Error('Invalid cipher specified');
    }
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/decrypt', (req, res) => {
  try {
    const { text, cipher } = req.body;
    if (!text || !cipher) throw new Error('Missing parameters');
    let result;
    switch (cipher.toLowerCase()) {
      case 'caesar':
        result = caesarCipher(text, 6, false);
        break;
      case 'vigenere':
        result = vigenereCipher(text, "miftah", false);
        break;
      case 'atbash':
        result = atbashCipher(text);
        break;
      case 'xor':
        result = xorCipher(text, "miftah", false);
        break;
      case 'miftah':
        result = miftahCipher(text, false);
        break;
      default:
        throw new Error('Invalid cipher specified');
    }
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
