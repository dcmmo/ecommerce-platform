import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeBase = path
      .basename(file.originalname || 'upload', ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'image';
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  if (file.mimetype?.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image uploads are allowed.'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
});
