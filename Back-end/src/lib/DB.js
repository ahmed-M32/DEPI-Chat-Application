import mongoose from 'mongoose';



export const connectDatabase = async () => {

    try {
        console.log(process.env.MONGODB);
        
        const connect  = await mongoose.connect(process.env.MONGODB);

        console.log(`Connected to database`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        
    }
};
