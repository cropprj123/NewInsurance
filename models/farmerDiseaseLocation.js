const mongoose = require('mongoose');

const farmerDiseaseLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Disease location must belong to a user']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  cropDiseaseName: {
    type: String,
    required: [true, 'Disease name is required']
  },
  diseaseConfidence: {
    type: Number,
    required: [true, 'Disease confidence score is required']
  },
  geolocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geolocation queries
farmerDiseaseLocationSchema.index({ geolocation: '2dsphere' });

const FarmerDiseaseLocation = mongoose.model('FarmerDiseaseLocation', farmerDiseaseLocationSchema);

module.exports = FarmerDiseaseLocation; 