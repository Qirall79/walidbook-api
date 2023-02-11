
# Walidbook API

This is a REST API for my Walidbook app: https://github.com/Qirall79/walidbook-client
This API allows users to authenticate and perform CRUD operations on the MongoDB database.

When a user uploads an image, it's not stored in the database directly, instead, it's stored in a cloud service called Cloudinary, only the link to the image is stored in MongoDB database.




## Technologies used
- ExpressJS
- NodeJS
- MongoDB
- PassportJS
- Cloudinary (for images storage)
