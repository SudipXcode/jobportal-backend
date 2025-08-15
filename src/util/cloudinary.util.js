// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const uploadFileToCloudinary = (file) => {
//     return new Promise((resolve, reject) => {
//         let folderName;

//         if (file.mimetype.startsWith("image/")) {
//             folderName = "photo"; // Folder for images
//         } else if (file.mimetype === "application/pdf") {
//             folderName = "resume"; // Folder for resumes
//         } else {
//             return reject(new Error("Unsupported file type"));
//         }

//         const uploadStream = cloudinary.uploader.upload_stream(
//             { folder: folderName },
//             (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//             }
//         );

//         uploadStream.end(file.buffer);
//     });
// };
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = ({ file, userId }) => {
    return new Promise((resolve, reject) => {
        let folderName;
        let publicId;

        if (file.mimetype.startsWith("image/")) {
            folderName = "photo";
            publicId = `${folderName}/${userId}`; // e.g. photo/123
        } else if (file.mimetype === "application/pdf") {
            folderName = "resume";
            publicId = `${folderName}/${userId}`;
        } else {
            return reject(new Error("Unsupported file type"));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folderName,      // Optional: still keeps folder organization
                public_id: userId,       // Sets file name to userId
                overwrite: true,         // Replaces existing file with same public_id
                resource_type: "auto"    // Handles images, pdf, etc.
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};

// Deleting by userId
export const deleteFileFromCloudinary = async (type, userId) => {
    // type = 'photo' or 'resume'
    const publicId = `${type}/${userId}`;
    return await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
};
