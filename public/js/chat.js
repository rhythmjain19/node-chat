const socket = io();

// Elements
const $msgSubmitBtn = document.getElementById('msg-submit');
const $msgInput = document.getElementById('msg-input');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

//* Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//* Autoscroll function
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  if (!$newMessage) {
    return; // No new message to scroll to
  }

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom;

  // Visible height of the messages container
  const visibleHeight = $messages.offsetHeight;

  // Total height of the messages container including scrollable content
  const containerHeight = $messages.scrollHeight;

  // Current scroll position from the top
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // Autoscroll only if we are at the bottom *before* the new message arrives
  if (containerHeight - newMessageHeight <= scrollOffset + 1) {
    $messages.scrollTop = containerHeight;
  }
};

// todo--- RECEIVING MESSAGES FROM SERVER
socket.on('message', (message) => {
  try {
    // Render message template with data from the 'message' object
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm a'),
    });

    // Insert the rendered HTML into the messages container
    $messages.insertAdjacentHTML('beforeend', html);

    // Autoscroll to the latest message
    autoscroll();
  } catch (error) {
    console.error('Error rendering message:', error);
  }
});

// todo--- RECEIVING LOCATION FROM SERVER
socket.on('locationMessage', (locationMessage) => {
  try {
    // Render location template with the 'url' data
    const html = Mustache.render(locationTemplate, {
      username: locationMessage.username,
      locationUrl: locationMessage.url,
      createdAt: moment(locationMessage.createdAt).format('h:mm a'),
    });

    // Insert the rendered HTML into the messages container
    $messages.insertAdjacentHTML('beforeend', html);

    // Autoscroll to the latest message
    autoscroll();
  } catch (error) {
    console.error('Error rendering location message:', error);
  }
});

// todo--- RECEIVING ROOM DATA FROM SERVER
socket.on('roomData', ({ room, users }) => {
  try {
    // Render sidebar template with room and users data
    const html = Mustache.render(sidebarTemplate, {
      room,
      users,
    });

    // Update the sidebar content
    $sidebar.innerHTML = html;
  } catch (error) {
    console.error('Error rendering sidebar:', error);
  }
});

// todo---  SENDING A MESSAGE TO SERVER
$msgSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault();

  // Get the message input value and trim whitespace
  const message = $msgInput.value.trim();

  // Prevent sending empty messages
  if (!message) {
    return;
  }

  // Disable the send button to prevent multiple submissions
  $msgSubmitBtn.setAttribute('disabled', 'disabled');

  // Emit the 'sendMessage' event to the server with the message
  socket.emit('sendMessage', message, (error) => {
    // Re-enable the send button
    $msgSubmitBtn.removeAttribute('disabled');

    // Clear the input field and focus on it for the next message
    $msgInput.value = '';
    $msgInput.focus();

    // Log any error received from the server (e.g., profanity filter)
    if (error) {
      return console.error(error);
    }

    // Log a success message when the message is delivered
    console.log('Message delivered to server.');
  });
});

// todo--- SEDNING USERNAME AND ROOM TO SERVER ON JOIN
socket.emit('join', { username, room }, (error) => {
  if (error) {
    // If there's an error joining (e.g., username taken), display it and redirect to the homepage
    alert(error);
    location.href = '/';
  } else {
    console.log(`Joined room "${room}" as "${username}".`);
  }
});