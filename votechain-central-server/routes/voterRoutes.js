import express from 'express';
import voterController from '../controllers/voterController.js';
import {
  createVoterValidation,
  updateVoterValidation,
  getVoterByIdValidation,
  getVoterByWalletValidation,
  deleteVoterValidation
} from '../middleware/validators/voterValidator.js';
import validate from '../middleware/validate.js';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


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

// Create a new voter (root endpoint)
router.post(
  '/',
  createVoterValidation,
  validate,
  voterController.createVoter
);

// Create a new voter (register endpoint)
router.post(
  '/register',
  createVoterValidation,
  validate,
  voterController.createVoter
);

// Get all voters
router.get('/', voterController.getAllVoters);

// Get voter by ID
router.get(
  '/voter',
  getVoterByIdValidation,
  validate,
  voterController.getVoterById
);

// Get voter profile by wallet address
router.get(
  '/profile',
  getVoterByWalletValidation,
  validate,
  voterController.getVoterProfile
);

// Get face hash by national ID
router.get('/face-hash/:nid', voterController.getFaceHash);

// Train face by national ID
router.post('/train-face/:nid', voterController.handleTrainFace);

// DEMO: Face verification - will be deleted later
router.post('/verify-face-demo', voterController.handleVerifyFaceDemo);

router.get('/by-fingerprint/:fingerId', voterController.getVoterByFingerprint);


// Update voter
router.put(
  '/voter',
  updateVoterValidation,
  validate,
  voterController.updateVoter
);

// Delete voter
router.delete(
  '/voter',
  deleteVoterValidation,
  validate,
  voterController.deleteVoter
);

export default router; 