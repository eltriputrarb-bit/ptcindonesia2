import mongoose from 'mongoose';

const userCourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    sisaAbsen: { type: Number, default: 12 },
    image: { type: String, default: '' },
    pricePaid: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        phone: { type: String, default: '' },
        birthPlace: { type: String, default: '' },
        birthDate: { type: String, default: '' },
        address: { type: String, default: '' },
        role: { type: String, enum: ['User', 'Admin'], default: 'User' },
        saldo: { type: Number, default: 0 },
        courses: [userCourseSchema],
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);