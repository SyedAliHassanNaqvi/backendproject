import {v2 as cloudinary} from "cloudinary"
//imported filesystem
import fs from "fs"

// Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try{
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type:"auto"
    })
    // file has been uploaded successfully
    //console.log("file is uploaded on cloudinary",response.url);
    fs.unlinkSync(localFilePath)
    return response
  } catch (error){
    fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
}

const deleteFromCloudinary = async (oldAvatarpath)=>{
  try {
    const result = await cloudinary.uploader.destroy(oldAvatarpath)
    return result
  } catch (error) {
    throw new error("Error while deleting the image from cloudinary")
  }
}

export {uploadOnCloudinary,deleteFromCloudinary}
/*import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}*/