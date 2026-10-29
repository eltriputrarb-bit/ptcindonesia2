import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        category: { type: String, default: 'Kursus komputer' },
        rating: { type: String, default: '5.00' },
        price: { type: String, required: true },
        priceNumeric: { type: Number, required: true },
        image: { type: String, default: '' },
        quotaSesi: { type: Number, default: 12 },
    },
    { timestamps: true }
);

export default mongoose.model('Course', courseSchema);