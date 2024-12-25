import cloudinary from "../cloudinaryConfig.js";
import { validationResult } from "express-validator";
import Hotel from "../models/hotel.js";
import QRCode from "qrcode";
import mongoose from "mongoose";
import { upload } from "../lib/upload.js";

// Add New Hotel
function addHotel(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Logo file is required" });
  }

  try {
    const { name, address } = req.body;

    // Upload Logo to Cloudinary
    cloudinary.uploader
      .upload_stream(
        { folder: "SurefyLogos" },
        async (logoErr, logoUploadResult) => {
          if (logoErr) {
            return res
              .status(500)
              .json({ error: "Error uploading logo to Cloudinary" });
          }

          // Save Hotel without QR code
          const hotel = new Hotel({
            name: name,
            address: address,
            logo: logoUploadResult.secure_url,
          });

          hotel
            .save()
            .then(async (savedHotel) => {
              // Generate QR Code using the saved hotel's _id
              const qrCodeUrl = `${process.env.API_URL}/${savedHotel._id}`;
              QRCode.toDataURL(qrCodeUrl, async (err, qrCodeData) => {
                if (err) {
                  return res.status(500).json({
                    error: "Error generating QR code",
                    details: err,
                  });
                }

                // Upload QR Code to Cloudinary
                cloudinary.uploader
                  .upload_stream(
                    { folder: "SurefyHotelQRCodes" },
                    async (qrErr, qrUploadResult) => {
                      if (qrErr) {
                        return res.status(500).json({
                          error: "Error uploading QR code to Cloudinary",
                          details: qrErr,
                        });
                      }

                      // Update the hotel with the QR code URL
                      savedHotel.qrcode = qrUploadResult.secure_url;

                      await savedHotel
                        .save()
                        .then(() => {
                          res.status(201).json({
                            message: "Hotel added successfully",
                            hotel: savedHotel,
                          });
                        })
                        .catch((updateErr) => {
                          res.status(500).json({
                            error: "Error updating hotel with QR code",
                            details: updateErr,
                          });
                        });
                    }
                  )
                  .end(Buffer.from(qrCodeData.split(",")[1], "base64"));
              });
            })
            .catch((dbError) => {
              res.status(500).json({
                error: "Error saving hotel to the database",
                details: dbError,
              });
            });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Internal Server error", details: error });
  }
}

//Get All Hotels
async function getAllHotels(req, res) {
  try {
    const hotels = await Hotel.find({});

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ error: "No hotels available" });
    }

    return res.status(200).json({ hotels });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server error", details: error.message });
  }
}

//Get Single Hotel
async function getSingleHotel(req, res) {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "Hotel id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid hotel id format" });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    return res.status(200).json({ hotel });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

// Edit Hotel
const updateHotel = async (req, res) => {
  const { id } = req.params;
  console.log("Received request to update hotel with ID:", id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid or missing Hotel ID");
    return res.status(400).json({ error: "Missing or invalid Hotel id" });
  }

  try {
    const updateData = {};

    if (req.body.name) {
      console.log("Updating hotel name:", req.body.name);
      updateData.name = req.body.name;
    }

    if (req.body.address) {
      console.log("Updating hotel address:", req.body.address);
      updateData.address = req.body.address;
    }

    if (req.file) {
      console.log("Processing file upload for hotel logo");

      const hotel = await Hotel.findById(id);
      if (!hotel) {
        console.log("Hotel not found with ID:", id);
        return res.status(404).json({ error: "Hotel not found" });
      }

      const { logo } = hotel;

      const extractPublicId = (url) => {
        const parts = url.split("/");
        const publicIdWithExt = parts[parts.length - 1];
        return publicIdWithExt.split(".")[0];
      };

      const logoPublicId = logo ? extractPublicId(logo) : null;

      if (logoPublicId) {
        console.log(
          "Deleting existing logo from Cloudinary with public ID:",
          logoPublicId
        );
        await cloudinary.uploader.destroy(`SurefyLogos/${logoPublicId}`);
      }

      console.log("Uploading new logo to Cloudinary");
      const logoUploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "SurefyLogos" }, (error, result) => {
            if (error) {
              console.error("Error uploading logo to Cloudinary:", error);
              reject(error);
            } else {
              console.log("Logo uploaded successfully:", result.secure_url);
              resolve(result);
            }
          })
          .end(req.file.buffer);
      });

      updateData.logo = logoUploadResult.secure_url;
    }

    console.log("Updating hotel data in database:", updateData);
    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } 
    );

    if (!updatedHotel) {
      console.log("Hotel not found during update with ID:", id);
      return res.status(404).json({ error: "Hotel not found" });
    }

    console.log("Hotel updated successfully:", updatedHotel);
    return res
      .status(200)
      .json({ message: "Hotel Updated Successfully", updatedHotel });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// Delete Hotel
async function deleteHotel(req, res) {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ error: "Hotel id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid hotel id format" });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const { logo, qrcode } = hotel;

    const extractPublicId = (url) => {
      const parts = url.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      return publicIdWithExt.split(".")[0];
    };

    const logoPublicId = logo ? extractPublicId(logo) : null;
    const qrcodePublicId = qrcode ? extractPublicId(qrcode) : null;

    const deletionPromises = [];

    if (logoPublicId) {
      deletionPromises.push(
        cloudinary.uploader.destroy(`SurefyLogos/${logoPublicId}`)
      );
    }
    if (qrcodePublicId) {
      deletionPromises.push(
        cloudinary.uploader.destroy(`SurefyHotelQRCodes/${qrcodePublicId}`)
      );
    }

    await Promise.all(deletionPromises);

    await Hotel.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Hotel and associated assets deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

export { addHotel, getAllHotels, deleteHotel, getSingleHotel, updateHotel };
