const express = require("express");
const router = express.Router();   //init the router object
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const JSON_FILE_NAME = "./data/video-details.json";

/**
 * Reads all data from video-details.json
 * @returns 
 */
function readVideosData() {
    const videosJsonData = fs.readFileSync(JSON_FILE_NAME);
    return (JSON.parse(videosJsonData));
}

/**
 * GET request: /videos => Get the list of videos by reading data from video-details.json
 and parse json data into a javascript object
 */
router.get("/", (req, res) => {
    try {
        const videosData = readVideosData();
        res.status(200).json(videosData);
    } catch (error) {
        console.error('Error reading or parsing videos data in get request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET request: /videos/:id => Get the video for given videoId by reading data from video-details.json
   and then finding video data for given id,  parse json data into a javascript object
 */
router.get("/:videoId", (req, res) => {
    const { videoId } = req.params;
    try {       
        const videosData = readVideosData();
        res.status(200).json(videosData.find((video) => (video.id === videoId)));
    } catch (error) {
        console.error(`Error reading or parsing video data for given videoId ${videoId}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST request: /videos =>save a new video,
 * Create unique id for each new video
 * Add new video entry to video-details.json file  
 */
router.post("/",(req,res) => {        
    try{
        const newVideo = {
            id: uuidv4(), 
            ...req.body
        }
        let videosData = readVideosData();
        videosData = [...videosData, newVideo]; //Add a new video
        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(videosData, null, 2));
        res.status(201).json({ message: `New video object added successfully` });
    } catch(error) {
        console.error(`Error in posting new video object`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /videos/:id/comments => Post the new Comment for given video id,
 * Get new comment Object from request body, 
 * get all videos data by reading from video-details.json,
 * find out video object for given videoId, 
 * Add new comments object to given videoId object
 * Write updated data back to file
 */
router.post("/:videoId/comments", (req, res) => {
    const { videoId } = req.params;
    try {         
        const newCommentData = {
            id: uuidv4(), 
            ...req.body         
        };            
        const videosData = readVideosData();
        const video = Array.isArray(videosData) && videosData.find((video) => (video.id === videoId));
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        //Added new commment object to existing comments array at the top
        video.comments=[newCommentData, ...video.comments];
        
        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(videosData, null, 2));
        res.status(201).json({ message: `New comment object added successfully for video id ${videoId}` });
    } catch (error) {
        console.error(`Error in posting new comment object for given videoId ${videoId}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * DELETE /videos/:videoId/comments/:commentId => Delete requested CommentId for given videoId.
 */
router.delete("/:videoId/comments/:commentId", (req, res) => {
    const { videoId, commentId } = req.params;
    try {        
        const videosData = readVideosData();
        const video = Array.isArray(videosData) && videosData.find((video) => (video.id === videoId));
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Find the index of the comment object with the given ID in the comments array
        const commentIndex = video.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        //Remove the comment from the comments array
        video.comments.splice(commentIndex, 1);
        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(videosData, null, 2));
        res.status(204).json({ message: `comment id ${commentId} deleted successfully for video id ${videoId}` });
    } catch (error) {
        console.error(`Error in deleting comment ${commentId} for given videoId  ${videoId}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Put /videos/:videoId/likes :Update likes property of video for requested video Id
 */
router.put("/:videoId/likes", (req, res) => {
    const { videoId } = req.params;
    try {       
        const videosData = readVideosData();
        const video = Array.isArray(videosData) && videosData.find((video) => (video.id === videoId));
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        let likesInt = parseInt((video.likes).replace(/,/, ''));
        likesInt = likesInt + 1;
        let stringLikes = likesInt.toString(); 
        video.likes= stringLikes.replace(/\B(?=(\d{3})+(?!\d))/g, ",");        
        fs.writeFileSync(JSON_FILE_NAME, JSON.stringify(videosData, null, 2));
        res.status(200).json({ message: `likes propery updated successfully for video id ${videoId}` });
    } catch (error) {
        console.error(`Error in updating likes property for given videoId  ${videoId}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
