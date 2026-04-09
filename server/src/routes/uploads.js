import express from 'express';
import path from 'path';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/image', requireAuth, requireAdmin, (req, res) => {
  const runUpload = upload.single('image');

  runUpload(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const base = (process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, '');
    const filePath = path.posix.join('/uploads', req.file.filename);

    return res.status(201).json({ imageUrl: `${base}${filePath}` });
  });
});

export default router;
