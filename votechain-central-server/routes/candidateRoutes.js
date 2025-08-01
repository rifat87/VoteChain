import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate face ID from captured images
function generateFaceId(nid) {
    const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
    const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);
    
    try {
        // Check if directory exists
        if (!fs.existsSync(datasetPath)) {
            console.error(`Dataset directory not found: ${datasetPath}`);
            return null;
        }

        // Read all face images and create a hash
        const files = fs.readdirSync(datasetPath);
        const imageFiles = files.filter(file => file.endsWith('.jpg'));
        
        if (imageFiles.length === 0) {
            console.error(`No face images found in directory: ${datasetPath}`);
            return null;
        }

        console.log(`Found ${imageFiles.length} face images in ${datasetPath}`);
        
        const imageData = imageFiles
            .map(file => {
                const filePath = path.join(datasetPath, file);
                console.log(`Reading image: ${filePath}`);
                return fs.readFileSync(filePath);
            })
            .join('');
        
        const faceId = createHash('sha256').update(imageData).digest('hex');
        console.log(`Generated face ID: ${faceId}`);
        return faceId;
    } catch (error) {
        console.error('Error generating face ID:', error);
        return null;
    }
}

router.post('/register', async (req, res) => {
    try {
        const candidateData = req.body;
        console.log('Received candidate data:', candidateData);

        // Generate face ID from captured images
        const faceId = generateFaceId(candidateData.nationalId);
        if (!faceId) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate face ID from captured images'
            });
        }

        // For now, generate a placeholder fingerprint ID
        // TODO: Implement actual fingerprint capture and ID generation
        const fingerprint = createHash('sha256')
            .update(candidateData.nationalId + Date.now().toString())
            .digest('hex');

        // Create candidate instance with required fields
        const candidate = new Candidate({
            ...candidateData,
            faceId,
            fingerprint,
            isVerified: false,
            verificationStatus: 'pending'
        });

        console.log('Processed candidate data:', candidate);

        // Save to database
        await candidate.save();
        console.log('Created candidate instance:', candidate);

        res.status(201).json({
            success: true,
            message: 'Candidate registered successfully',
            data: candidate
        });

    } catch (error) {
        console.error('Error saving candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register candidate',
            error: error.message
        });
    }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all candidates...');
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    console.log(`Found ${candidates.length} candidates`);
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get candidate by ID
router.get('/:id',
  [param('id').isMongoId().withMessage('Invalid candidate ID')],
  validate,
  async (req, res) => {
    try {
      console.log(`Fetching candidate with ID: ${req.params.id}`);
      const candidate = await Candidate.findById(req.params.id);
      if (!candidate) {
        console.log(`Candidate not found with ID: ${req.params.id}`);
        return res.status(404).json({ message: 'Candidate not found' });
      }
      console.log('Found candidate:', candidate);
      res.json(candidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update candidate
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid candidate ID'),
    body('name').optional().trim().notEmpty(),
    body('party').optional().trim().notEmpty(),
    body('nationalId').optional().trim().notEmpty(),
    body('fathersName').optional().trim().notEmpty(),
    body('mothersName').optional().trim().notEmpty(),
    body('dateOfBirth').optional().isISO8601(),
    body('bloodGroup').optional().trim().notEmpty(),
    body('postOffice').optional().trim().notEmpty(),
    body('postCode').optional().isInt(),
    body('location').optional().trim().notEmpty(),
    body('faceId').optional().trim().notEmpty(),
    body('fingerprint').optional().trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      console.log(`Updating candidate with ID: ${req.params.id}`, req.body);
      const candidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!candidate) {
        console.log(`Candidate not found for update: ${req.params.id}`);
        return res.status(404).json({ message: 'Candidate not found' });
      }
      console.log('Successfully updated candidate:', candidate);
      res.json(candidate);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete candidate
router.delete('/:id',
  [param('id').isMongoId().withMessage('Invalid candidate ID')],
  validate,
  async (req, res) => {
    try {
      console.log(`Deleting candidate with ID: ${req.params.id}`);
      const candidate = await Candidate.findByIdAndDelete(req.params.id);
      if (!candidate) {
        console.log(`Candidate not found for deletion: ${req.params.id}`);
        return res.status(404).json({ message: 'Candidate not found' });
      }
      console.log('Successfully deleted candidate:', candidate);
      res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/face-hash/:nid', async (req, res) => {
  try {
      const { nid } = req.params;
      console.log(`[Face Hash] Generating face hash for NID: ${nid}`);
      
      // Generate face ID from existing captured images
      const faceId = generateFaceId(nid);
      if (!faceId) {
          return res.status(404).json({
              success: false,
              message: 'Failed to generate face hash from captured images. Please ensure face capture is completed first.'
          });
      }

      console.log(`[Face Hash] Successfully generated face hash: ${faceId.substring(0, 16)}...`);
      res.json({
          success: true,
          faceHash: faceId,
          message: 'Face hash generated successfully'
      });
  } catch (error) {
      console.error('Error generating face hash:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to generate face hash',
          error: error.message
      });
          }
      });

router.post('/train-face/:nid', async (req, res) => {
  try {
      const { nid } = req.params;
      console.log(`[Train Face] Starting face training for NID: ${nid}`);

      // Check if face images exist first
      const faceRecognitionPath = path.join(__dirname, '../../votechain-face-recognition');
      const datasetPath = path.join(faceRecognitionPath, 'dataset', nid);
      
      if (!fs.existsSync(datasetPath)) {
          return res.status(404).json({
              success: false,
              message: 'Face images not found. Please capture face images first.'
          });
      }

      const imageFiles = fs.readdirSync(datasetPath).filter(file => file.endsWith('.jpg'));
      if (imageFiles.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No face images found. Please capture face images first.'
          });
              }

      console.log(`[Train Face] Found ${imageFiles.length} face images for training`);

      // Import spawn dynamically
      const { spawn } = await import('child_process');

      // Run train_faces.py script
      const trainScript = path.join(faceRecognitionPath, 'train_faces.py');
      console.log(`[Train Face] Running training script: ${trainScript}`);
      
      const trainProcess = spawn('python', [trainScript], {
          cwd: faceRecognitionPath,
          stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      trainProcess.stdout.on('data', (data) => {
          const message = data.toString();
          console.log(`[Train Face] Training output: ${message}`);
          output += message;
      });

      trainProcess.stderr.on('data', (data) => {
          const error = data.toString();
          console.error(`[Train Face] Training error: ${error}`);
          errorOutput += error;
      });

          trainProcess.on('close', (code) => {
          console.log(`[Train Face] Training process finished with code: ${code}`);
          
          if (code !== 0) {
              return res.status(500).json({
                  success: false,
                  message: 'Face training failed',
                  error: errorOutput,
                  code: code
              });
              }

          res.json({
              success: true,
              message: 'Face training completed successfully',
              output: output,
              nid: nid
          });
      });

      trainProcess.on('error', (error) => {
          console.error(`[Train Face] Process error: ${error}`);
          res.status(500).json({
              success: false,
              message: 'Failed to start training process',
              error: error.message
          });
      });

  } catch (error) {
      console.error('Error in train-face endpoint:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to train face model',
          error: error.message
      });
  }
});

export default router; 