const upload = async (req, res) => {
  const video = await Video.findById(req.query.id);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  res.json({
    url: video.url,
    message: `Get video for community with ID: ${req.query.id}`,
  });
};

const postVideo = async (req, res) => {
  const { title, description, duration, tags } = req.body;
  //analyze the video:
  //to analyze the video :
  //1. analyze the video using blazepose
  //2. put the analyzed video in youtube as an unlisted video.
  //3. get the video url and return that
  //@vatsal: thumbnail and url would be given by the service

  //first we save that video in the database.
  // Assuming you've set up multer middleware in your application
  // If not, you'd need to add this to your imports:
  // const multer = require('multer');
  // const upload = multer({ dest: 'uploads/' });
  // And modify your route to use upload.single('video')

  // Check if video file is included in the request
  if (!req.file && !req.body.video) {
    return res.status(400).json({ message: "No video file provided" });
  }

  // If the frontend passes a Cloudinary URL directly
  if (req.body.video && typeof req.body.video === "string") {
    // Frontend has already uploaded to Cloudinary and is passing the URL
    req.body.url = req.body.video;
  }
  // If the frontend uploads the file to the server first
  else if (req.file) {
    const cloudinaryResult = await uploadToCloudinary(req.file.path);
    req.body.url = cloudinaryResult.url;
  }
  const { thumbnail, url } = await analyzeVideo(req.body.url);
  try {
    const newVideo = new Video({
      title,
      description,
      thumbnail,
      duration,
      tags,
      thumbnail,
      url,
    });

    await newVideo.save();

    res
      .status(201)
      .json({ message: "Video created successfully", data: newVideo });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating video", error: error.message });
  }
};
export { upload, postVideo };
