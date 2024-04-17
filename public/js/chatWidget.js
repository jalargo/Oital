// This script should be included in the chat widget page to handle UI interactions and WebSocket communication
// Assuming the server is serving socket.io client library correctly

document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chat-widget');
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.querySelector('#message-input-container input[type="text"]');
    const fileInput = document.getElementById('file-input'); // Re-added for file upload functionality
    const chatContent = document.getElementById('chat-widget-content');
    const usernameInput = document.getElementById('username-input'); // Input for username
    const setUsernameBtn = document.getElementById('set-username-btn'); // Button to set username
    const fileDisplayArea = document.createElement('div'); // Create a div to display selected file names

    // Theme buttons for changing chat widget appearance
    const themeDefaultBtn = document.getElementById('theme-default');
    const themeSoylanaBtn = document.getElementById('theme-soylana');
    const themeLightBtn = document.getElementById('theme-light');

    let currentUsername = "Anonymous"; // Default username initialized to "Anonymous"

    // Initialize socket connection
    const socket = io(); // Assuming the server is serving socket.io client library correctly

    // Set default username to 'Anonymous'
    usernameInput.value = currentUsername; // Default username

    // Function to update remove button colors based on theme
    function updateRemoveButtonColors(color) {
        document.querySelectorAll('#file-display-area button').forEach(button => {
            button.style.color = color;
        });
    }

    // Apply theme based on selection and save to localStorage
    function applyTheme(theme) {
        const root = document.documentElement;
        switch (theme) {
            case 'soylana': // 'soylana' theme
                root.style.setProperty('--default-gradient-start', '#9945FF');
                root.style.setProperty('--default-gradient-end', '#14F195');
                root.style.setProperty('--default-content-gradient-start', '#9945FF');
                root.style.setProperty('--default-content-gradient-end', '#14F195');
                root.style.setProperty('--default-button-gradient-start', '#ec407a');
                root.style.setProperty('--default-button-gradient-end', '#ffca28');
                root.style.setProperty('--input-box-shadow-default', '0 0 0 3px rgba(156, 39, 176, 0.5)');
                root.style.setProperty('--input-box-shadow-dark', '0 0 0 3px rgba(255, 255, 255, 0.5)');
                root.style.setProperty('--button-box-shadow-default', '0 0 0 3px rgba(236, 64, 122, 0.5)');
                root.style.setProperty('--button-box-shadow-dark', '0 0 0 3px rgba(255, 202, 40, 0.5)');
                root.style.setProperty('--text-color-default', '#fff'); // Change text color to white for soylana theme
                chatWidget.style.backgroundColor = '#f9f9f9';
                chatWidget.style.color = '#fff'; // Change text color to white for soylana theme
                sendBtn.style.color = '#fff'; // Change send button text color to white for soylana theme
                setUsernameBtn.style.color = '#fff'; // Change apply button text color to white for soylana theme
                updateRemoveButtonColors('#fff'); // Update remove button colors for soylana theme
                break;
            case 'default':
                root.style.setProperty('--default-gradient-start', '#5a67d8');
                root.style.setProperty('--default-gradient-end', '#d53f8c');
                root.style.setProperty('--default-content-gradient-start', '#5a67d8');
                root.style.setProperty('--default-content-gradient-end', '#d53f8c');
                root.style.setProperty('--default-button-gradient-start', '#ffffff');
                root.style.setProperty('--default-button-gradient-end', '#ba68c8');
                root.style.setProperty('--input-box-shadow-default', '0 0 0 3px rgba(90, 103, 216, 0.5)');
                root.style.setProperty('--input-box-shadow-dark', '0 0 0 3px rgba(213, 63, 140, 0.5)');
                root.style.setProperty('--button-box-shadow-default', '0 0 0 3px rgba(255, 255, 255, 0.5)');
                root.style.setProperty('--button-box-shadow-dark', '0 0 0 3px rgba(186, 104, 200, 0.5)');
                root.style.setProperty('--text-color-default', '#000'); // Reset text color for default theme
                chatWidget.style.backgroundColor = '#333';
                chatWidget.style.color = '#000'; // Reset text color to black for default theme
                sendBtn.style.color = '#000'; // Reset send button text color to black for default theme
                setUsernameBtn.style.color = '#000'; // Reset apply button text color to black for default theme
                updateRemoveButtonColors('#000'); // Update remove button colors for default theme
                break;
            case 'light':
                root.style.setProperty('--default-gradient-start', '#f0f0f0');
                root.style.setProperty('--default-gradient-end', '#f0f0f0');
                root.style.setProperty('--default-content-gradient-start', '#f0f0f0');
                root.style.setProperty('--default-content-gradient-end', '#f0f0f0');
                root.style.setProperty('--default-button-gradient-start', '#e0e0e0');
                root.style.setProperty('--default-button-gradient-end', '#e0e0e0');
                root.style.setProperty('--input-box-shadow-default', '0 0 0 3px rgba(224, 224, 224, 0.5)');
                root.style.setProperty('--input-box-shadow-dark', '0 0 0 3px rgba(224, 224, 224, 0.5)');
                root.style.setProperty('--button-box-shadow-default', '0 0 0 3px rgba(224, 224, 224, 0.5)');
                root.style.setProperty('--button-box-shadow-dark', '0 0 0 3px rgba(224, 224, 224, 0.5)');
                root.style.setProperty('--text-color-default', '#000'); // Ensure text color is black for light theme
                chatWidget.style.backgroundColor = '#fff';
                chatWidget.style.color = '#000'; // Ensure text color is black for light theme
                sendBtn.style.color = '#000'; // Ensure send button text color is black for light theme
                setUsernameBtn.style.color = '#000'; // Ensure apply button text color is black for light theme
                updateRemoveButtonColors('#000'); // Update remove button colors for light theme
                break;
        }
        localStorage.setItem('chatTheme', theme);
        console.log(`Theme applied: ${theme}`);
    }

    // Event listeners for theme buttons
    themeDefaultBtn.addEventListener('click', () => applyTheme('default'));
    themeSoylanaBtn.addEventListener('click', () => applyTheme('soylana'));
    themeLightBtn.addEventListener('click', () => applyTheme('light'));

    // Apply stored theme on load
    const storedTheme = localStorage.getItem('chatTheme') || 'default'; // Changed from 'soylana' to 'default'
    applyTheme(storedTheme);

    // Adjust the width of the message input to line up with the username input
    messageInput.style.width = 'calc(100% - 95px)'; // Adjust width to line up with the username input box

    // Initialize the file display area for showing selected file names
    fileDisplayArea.id = 'file-display-area';
    fileDisplayArea.style.marginTop = '5px';
    // Move the file display area under the message input container
    document.getElementById('message-input-container').insertAdjacentElement('afterend', fileDisplayArea);

    // Update file input event listener to display selected file names and add a remove button
    fileInput.addEventListener('change', function() {
        fileDisplayArea.innerHTML = ''; // Clear previous content
        Array.from(fileInput.files).forEach(file => {
            const fileContainer = document.createElement('div'); // Changed from span to div for better control over layout
            fileContainer.style.display = 'flex';
            fileContainer.style.alignItems = 'center';
            fileContainer.style.justifyContent = 'flex-start';
            fileContainer.style.marginBottom = '0px';

            const removeButton = document.createElement('button');
            removeButton.textContent = '✖'; // Changed to use a plain text icon
            removeButton.style.marginRight = '5px';
            removeButton.style.background = 'transparent'; // Set background to transparent
            removeButton.style.border = 'none'; // Remove border
            removeButton.style.cursor = 'pointer'; // Change cursor to pointer
            removeButton.style.display = 'inline'; // Ensure it's in the same line
            removeButton.classList.add('remove-button'); // Use class for dynamic color change
            removeButton.onclick = function() {
                fileInput.value = ''; // Clear the file input
                fileDisplayArea.innerHTML = ''; // Clear the display area
            };

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file.name;

            fileContainer.appendChild(removeButton);
            fileContainer.appendChild(fileNameSpan);
            fileDisplayArea.appendChild(fileContainer);
        });
    });

    // Modify the sendMessage function to handle both message and file upload simultaneously
    function sendMessage(inputElement) {
        const message = inputElement.value.trim();
        if (message.length > 250) {
            alert('Message cannot exceed 250 characters.');
            inputElement.value = ''; // Clear input after validation fail
            return; // Prevent sending the message
        }
        if (message || fileInput.files.length > 0) {

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const formData = new FormData();
                formData.append('file', file);
                fetch('/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    if(data.success) {
                        const fileUrl = data.fileUrl;
                        // Emit both message and file URL in a single event
                        socket.emit('newMessage', { message: message, username: currentUsername, fileUrl: fileUrl, fileType: file.type }, (response) => {
                            if (!response.success) {
                                alert(`Error: ${response.error}`);
                            }
                        });
                        console.log('File uploaded and message sent:', file.name);
                    } else {
                        alert('File upload exceeded the 10MB limit.', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                });
            } else {
                // If only message is present, send it without file URL
                socket.emit('newMessage', { message: message, username: currentUsername }, (response) => {
                    if (!response.success) {
                        alert(`Error: ${response.error}`);
                    }
                });
                console.log('Message sent:', message);
            }
            inputElement.value = ''; // Clear input after sending
            fileInput.value = ''; // Clear file input after sending
            fileDisplayArea.innerHTML = ''; // Clear the file display area
        }
    }

    sendBtn.addEventListener('click', () => sendMessage(messageInput));

    // Allow users to send messages by pressing enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(messageInput);
        }
    });

    // Set username
    setUsernameBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username.length > 15) {
            alert('Username must be 15 characters or less.');
            return;
        }
        if (!username) {
            console.error('Setting username failed due to missing username.');
            return;
        }
        currentUsername = username;
        socket.emit('setUsername', { username: username });
        console.log(`Username set: ${username}`);
    });

    // Enhance the socket.on('message') event listener to display different file types appropriately
    socket.on('message', async (msg) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        const usernameText = document.createElement('strong');
        usernameText.textContent = `${msg.username}: `;
        messageElement.appendChild(usernameText);

        if (msg.content) {
            const messageText = document.createTextNode(msg.content);
            messageElement.appendChild(messageText);
        }

        // Display different types of files appropriately
        if (msg.fileUrl) {
            let fileElement;
            const fileUrlParts = msg.fileUrl.split('.');
            const fileExtension = fileUrlParts[fileUrlParts.length - 1].toLowerCase();
            const brElement = document.createElement('br'); // Create a line break element

            switch (fileExtension) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    fileElement = document.createElement('img');
                    fileElement.src = msg.fileUrl;
                    fileElement.classList.add('file-display');
                    messageElement.appendChild(brElement); // Append line break before the file element
                    messageElement.appendChild(fileElement);
                    break;
                case 'mp4':
                case 'webm':
                    fileElement = document.createElement('video');
                    fileElement.controls = true;
                    fileElement.src = msg.fileUrl;
                    fileElement.classList.add('file-display');
                    messageElement.appendChild(brElement); // Append line break before the file element
                    messageElement.appendChild(fileElement);
                    break;
                case 'pdf':
                    fileElement = document.createElement('iframe');
                    fileElement.src = msg.fileUrl;
                    fileElement.classList.add('file-display');
                    messageElement.appendChild(brElement); // Append line break before the file element
                    messageElement.appendChild(fileElement);
                    break;
                case 'aac':
                case 'flac':
                case 'm4a':
                case 'm4p':
                case 'mp3':
                case 'wav':
                case 'wma':
                case 'mpeg':
                    fileElement = document.createElement('audio');
                    fileElement.controls = true;
                    fileElement.src = msg.fileUrl;
                    fileElement.classList.add('file-display');
                    messageElement.appendChild(brElement); // Append line break before the file element
                    messageElement.appendChild(fileElement);
                    break;
                case 'txt':
                    try {
                        const response = await fetch(msg.fileUrl);
                        const text = await response.text();
                        const textPreview = document.createElement('pre');
                        textPreview.textContent = text.substring(0, 100) + '...'; // Display first 100 characters
                        const fullTextLink = document.createElement('a');
                        fullTextLink.href = msg.fileUrl;
                        fullTextLink.textContent = ' Read more';
                        fullTextLink.target = '_blank';
                        messageElement.appendChild(brElement); // Append line break before the text preview
                        messageElement.appendChild(textPreview);
                        messageElement.appendChild(fullTextLink);
                    } catch (error) {
                        console.error('Error loading text file:', error);
                        const errorText = document.createElement('span');
                        errorText.textContent = 'Failed to load text preview.';
                        messageElement.appendChild(brElement); // Append line break before the error text
                        messageElement.appendChild(errorText);
                    }
                    break;
                default:
                    fileElement = document.createElement('a');
                    fileElement.href = msg.fileUrl;
                    fileElement.textContent = 'View File';
                    fileElement.target = '_blank';
                    messageElement.appendChild(brElement); // Append line break before the file element
                    messageElement.appendChild(fileElement);
            }
        }

        chatContent.appendChild(messageElement);
        chatContent.scrollTop = chatContent.scrollHeight;
        console.log('Message received:', msg.content || "File shared");
    });

    // Add error handling for socket connection and message sending
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        alert('Connection error. Please try again later.');
    });

    socket.on('error', (err) => {
        console.error('Socket encountered an error:', err.message);
        alert('An error occurred. Please try again later.');
    });
});