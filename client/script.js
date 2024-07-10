import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;

// Loader function to display loading animation
function loader(element) {
    element.textContent = '';
    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

// Function to simulate typing effect
function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// Generate unique ID for each message
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random().toString(16).substring(2);
    return `id-${timestamp}-${randomNumber}`;
}

// Create chat message HTML
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
        `
    );
}

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    // User's chat message
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    // Bot's chat message placeholder
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    // Fetch response from the server
    try {
        const response = await fetch('http://localhost:5000', { // Ensure using HTTP for local development
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: data.get('prompt') }),
        });

        clearInterval(loadInterval);
        messageDiv.innerHTML = '';

        if (response.ok) {
            const data = await response.json(); // response from backend
            const parsedData = data.bot.trim(); // trims any trailing spaces/'\n' 

            typeText(messageDiv, parsedData);
        } else {
            const err = await response.text();
            messageDiv.innerHTML = 'Something went wrong';
            alert(err);
        }
    } catch (error) {
        clearInterval(loadInterval);
        messageDiv.innerHTML = 'Something went wrong';
        console.error('Error:', error);
    }
};

// Event listeners for form submission and Enter key press
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});
