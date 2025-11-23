import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHero: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('GalleryItem', galleryItemSchema);

