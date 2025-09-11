import mongoose from 'mongoose';

const connectDB = async () => {
    try {
       
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL environment variable is not defined');
        }

        const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected! DB host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1); 
    }
}

export default connectDB;