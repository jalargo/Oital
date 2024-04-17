![image](https://github.com/jalargo/oital/assets/163580293/0eb68bd9-3c89-40b1-a400-6795bf393008) ![image](https://github.com/jalargo/oital/assets/163580293/35a0b434-3697-417a-8329-2e452ef7b659)



# Chat Application

This project is a web-based chat system designed to allow users to send text messages and upload files anonymously. It focuses on real-time communication, file sharing, and maintaining user anonymity. The application is built using Node.js and Express for the backend, with MongoDB for data storage, and employs Socket.io for real-time messaging.

## Overview

The chat application is structured into a 3-tier architecture, including a frontend using vanilla JavaScript and Bootstrap for styling, a Node.js backend with Express for handling HTTP requests and real-time messaging, and MongoDB as the database for storing message logs and file metadata. It emphasizes lightweight operation, user anonymity, and enhanced error handling and logging for better usability and debugging.

## Features

- **Anonymous Messaging:** Users can send text messages anonymously in real-time.
- **File Sharing:** Support for uploading and sharing a wide range of file types including images, audio, video, and documents, with a file size limit of 10MB.
- **Local Data Storage:** Messages and files are stored locally to ensure user anonymity and privacy.
- **Enhanced Error Handling:** Improved error feedback mechanisms to provide clearer user feedback in case of failures. This includes meaningful feedback for file upload errors and message sending issues.
- **Security and Performance:** Utilizes HTTPS for secure communication, Helmet for securing HTTP headers, and compression for optimized performance. The application also features a revamped logging system using Winston for efficient local logging, categorizing logs properly, and ensuring detailed error messages and stack traces are captured without storing user data.

## Getting Started

### Requirements

- Node.js
- MongoDB

### Environment Configuration

Before starting the application, you need to configure the environment variables. Copy the `.env.example` file to a new file named `.env` and update the following settings:

- `PORT`: The port number on which the application will run. Default is 8000.
- `MONGODB_URI`: INPUT_REQUIRED {Please ensure this URI points to your MongoDB instance and includes the correct database name.}
- `CORS_ORIGIN`: INPUT_REQUIRED {Please ensure this URL is the correct origin from which your app will be accessed.}
- `HTTPS_ENABLE`: INPUT_REQUIRED {Set to true if you want to enable HTTPS.}
- `HTTPS_KEY_PATH`: INPUT_REQUIRED {Please ensure this path points to your SSL key file if HTTPS is enabled.}
- `HTTPS_CERT_PATH`: INPUT_REQUIRED {Please ensure this path points to your SSL certificate file if HTTPS is enabled.}
- `JWT_SECRET`: INPUT_REQUIRED {This is a secret key used for encrypting JWT tokens. It is crucial for the security of your application. Ensure this key is complex and not shared publicly. Example value: `your_secret_key_here`.}

### Quickstart

1. Clone the repository to your local machine.
2. Install the dependencies with `npm install`.
3. Configure the `.env` file with the necessary environment variables.
4. Start the server with `npm start`. The chat application should now be running and accessible on the specified port.

## Detailed Setup Instructions

To set up the chat application, follow these steps:

1. Ensure Node.js and MongoDB are installed on your system. If not, download and install them from their official websites.
2. Clone the chat application repository to your local machine using `git clone`.
3. Navigate to the cloned directory and run `npm install` to install all required dependencies.
4. Copy the `.env.example` file to a new file named `.env`. Update this file with your specific configurations, such as the MongoDB URI and the port number.
5. To start the application, run `npm start`. Your chat application should now be accessible at the specified port.

## Embedding Chat Application into Existing Apps

To embed the chat application into your existing application, follow these guidelines:

1. Ensure your application can serve the chat application's static files located in the `public` directory.
2. Include the Socket.io client script in your application's HTML file. This script is necessary for real-time communication.
3. Embed the chat widget by including `chatWidget.js` and `style.css` from the chat application's `public` directory in your application.
4. Adjust the CORS policy in the `.env` file of the chat application to allow requests from your existing application's domain.
5. Customize the chat widget's appearance by overriding the styles defined in `style.css` with your custom CSS.

## Enabling HTTPS

For increased security, you can enable HTTPS by following these steps:

1. Obtain SSL certificates. You can generate them using Let's Encrypt or any other certificate authority.
2. Place your key (`key.pem`) and certificate (`cert.pem`) files in a secure directory.
3. Update the `.env` file with the paths to your SSL key (`HTTPS_KEY_PATH=./path/to/key.pem`) and certificate (`HTTPS_CERT_PATH=./path/to/cert.pem`), and set `HTTPS_ENABLE=true`.

## Optimizations and Security Enhancements

The application has been optimized for performance and security with the following enhancements:

- **Helmet:** Secures HTTP headers. Helmet middleware is configured in `server.js` to enhance security.
- **Compression:** Uses gzip compression for HTTP responses to reduce the size of the data transferred between the server and clients, improving load times.
- **CORS Policy:** The CORS policy has been adjusted to allow requests only from origins expected to host the chat widget, enhancing security.
- **Socket.io Security:** Best practices for securing Socket.io communications have been applied, including origin validation and the option to use HTTPS for encrypted WebSocket connections.
- **Logging:** The Winston library is used for efficient local logging, with logs categorized by levels (info, warning, error) and sensitive information anonymized.

## Data and Files Cleanup

To ensure the privacy and anonymity of our users, we have implemented a data and files cleanup process. This process involves the deletion of all messages, uploaded files, user accounts, and other related data from the application. To run the cleanup process, execute the following command:

```
node cleanUpData.js
```

Please use this command with caution as it will permanently delete all user data and uploaded files from the application.

### License

Copyright (c) 2024 Jalargo. All rights reserved.
