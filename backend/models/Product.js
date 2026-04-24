const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  images: [{
    url: String,
    public_id: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true
    },
    review: String
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
