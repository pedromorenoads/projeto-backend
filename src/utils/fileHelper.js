const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'public', 'uploads');

const MIME_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Grava uma imagem enviada em base64 (pura ou data URI) e devolve o caminho relativo.
 */
function saveBase64Image(content, mimeType = 'image/png') {
  ensureUploadDir();

  const dataUriMatch = String(content).match(/^data:([^;]+);base64,(.*)$/s);
  const type = dataUriMatch ? dataUriMatch[1] : mimeType;
  const base64 = dataUriMatch ? dataUriMatch[2] : String(content);

  const extension = MIME_EXTENSIONS[type] || '.png';
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(base64, 'base64'));

  return `/uploads/${filename}`;
}

/**
 * Retorna o path no formato esperado pela API: URLs externas seguem intactas,
 * arquivos locais recebem o domínio da aplicação.
 */
function buildImageUrl(storedPath) {
  if (!storedPath) {
    return storedPath;
  }

  if (/^https?:\/\//i.test(storedPath)) {
    return storedPath;
  }

  const baseUrl = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
  return `${baseUrl}${storedPath}`;
}

function isLocalUpload(storedPath) {
  return typeof storedPath === 'string' && storedPath.startsWith('/uploads/');
}

function removeLocalImage(storedPath) {
  if (!isLocalUpload(storedPath)) {
    return;
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(storedPath));
  fs.promises.unlink(filePath).catch(() => {
    // Se o arquivo já não existir, não há problema em ignorar.
  });
}

module.exports = {
  saveBase64Image,
  buildImageUrl,
  isLocalUpload,
  removeLocalImage,
};
