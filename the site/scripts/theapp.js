const socket = io("https://the-river-new.onrender.com")

const usernameForm = document.getElementById("usernameform")
const userNameInput = document.getElementById("usernameinput")
const subBtn = document.getElementById("subbtn") 

const theUsers = document.getElementById("theusers")
const onlineUsers = document.getElementById("onlineusers")
const onlineUsersHome = document.getElementById("onlineusershome")
const activeTab = document.getElementById("activetab")
const theActiveTab = document.getElementById("theactivetab")

const activeUsers = document.getElementById("activeusers")

const userExist = document.getElementById("userexist")
const chatBox = document.getElementById("chatbox")
const messageContainer = document.getElementById("messagecontainer")
const messageInput = document.getElementById("messageinput")
const sendBtn = document.getElementById("sendbutton")

const searchCharon = document.getElementById("searchcharon")

const privateSend = document.getElementById("privatesend")

const privateBox = document.getElementById("privatebox")
const privateMessages = document.getElementById("privatemessages")
const privateInput = document.getElementById("privateinput")
const privateBtn = document.getElementById("privatebtn")

const theVideo = document.getElementById("thevideo")
const realVideo = document.getElementById("realvideo")

//private direct
const thePrivateUser = document.getElementById("theprivateuser")


chatBox.style.display = "none"
userExist.style.display = "none"
onlineUsers.style.display = "block"

privateBox.style.display = "none"
privateSend.style.display = "none"

theVideo.style.display = "none"
realVideo.pause()

let selectedUser = null;

let user = null;

let theUsername = null


socket.on('theuser', theuser => {
  if (theuser === socket.id) {
    user = theuser;
    theUsername = theuser
  }
});


usernameForm.addEventListener("submit", event => {

  event.preventDefault()


  if (!userNameInput.value == "") {
   event.preventDefault()

    socket.emit('users', userNameInput.value.replace(/ /g, "_"))

    theUsername = userNameInput.value

    console.log(theUsername)

    userExist.style.display = "none"
    usernameForm.style.display = "none"
    onlineUsersHome.style.display = "none"




    setTimeout(() => {
      if (theVideo.style.display == "block") {
        chatBox.style.display = "block"
        chatBox.classList.add('anim')
      }
    }, 4000);


    theVideo.style.display = "block"
    theVideo.classList.add('anim')
    realVideo.play()

    setTimeout(() => {
      theVideo.style.display = "none"
      realVideo.pause()
      theVideo.classList.remove('anim')
    }, 4000);
  } else {

    userExist.style.display = "block"
  }
})

sendBtn.addEventListener("click", function () {

  const message = messageInput.value.trim();
  if (message !== "") {
    socket.emit('messages', message);
    messageInput.value = "";
  }
});


socket.on('user', users => {
  appendUsers(users);
});

socket.on('themessages', data => {
  data.forEach(messageData => {
    if (messageData.userId === socket.id) {
      appendMessages("You: " + messageData.message);
    } else {
      appendMessages("Charon " + messageData.username + ": " + messageData.message);
    }
  });
});


messageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (message !== "") {
      socket.emit('messages', message);
      messageInput.value = "";
    }
  }
});




socket.on('usernameError', error => {
  console.log(error)
  userExist.style.display = "block"
  chatBox.style.display = "none"
  usernameForm.style.display = "block"
  onlineUsersHome.style.display = "block"

  theVideo.style.display = "none"
  realVideo.pause()
  theVideo.classList.remove('anim')
  chatBox.classList.remove('anim')
})

let getUsername = null;

function appendUsers(users) {
  activeTab.innerHTML = '';
  onlineUsers.innerHTML = '';
  users.forEach(user => {
    const userEl = document.createElement("div");
    userEl.classList.add("onlinecharons")
    const onlineEl = document.createElement("div")
    const directM = document.createElement("button")
    directM.innerHTML = "Direct Message"
    userEl.innerText = "Charon " + user.username;
    onlineEl.innerText = "Charon " + user.username;

    userEl.style.position = "relative"
    userEl.style.top = "5px"
    userEl.style.color = "darkgreen"
    userEl.style.cursor = "pointer"

    userEl.style.marginBottom = "5px";
    onlineEl.style.marginBottom = "5px"



    userEl.addEventListener("click", () => {
      const username = userEl.innerText.replace("Charon ", "");
      const user = users.find(user => user.username === username);
      if (user) {

        getUsername = user.username;

        privateBox.style.display = "block"
        privateSend.style.display = "block"

        selectedUser = user.socketId;

        thePrivateUser.innerHTML = "Private Chat To Charon " + user.username;

        if (username == theUsername) {
          privateBox.style.display = "none"
          privateSend.style.display = "none"
        }
      } else {
        console.log("User not found");
      }
    });

    searchCharon.addEventListener("input", () => {
      const filter = searchCharon.value.toLowerCase();
      const items = document.querySelectorAll(".onlinecharons")

      items.forEach((item) => {
        let text = item.textContent;
        if (text.toLowerCase().includes(filter.toLowerCase())) {
          item.style.display = ""
        } else {
          item.style.display = "none"
1        }
      })
    })



    if (onlineUsersHome.style.display == "none") {
      activeTab.appendChild(userEl);
    }
    onlineUsers.appendChild(onlineEl)


    const theUsers = users.length
    activeUsers.innerText = "Active Users: " + theUsers
  });
}

privateBtn.addEventListener("click", () => {
  const message = privateInput.value.trim();
  if (message !== "") {
    socket.emit('directMessage', { recipient: selectedUser, message, theUsername });
    privateInput.value = "";

 
    const messageEl = document.createElement("div");
    messageEl.style.color = "green";
    messageEl.innerText = `To Charon ${getUsername}: ${message}`;
    privateMessages.appendChild(messageEl);
  }
});


privateInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    const message = privateInput.value.trim();
    if (message !== "") {
      socket.emit('directMessage', { recipient: selectedUser, message, theUsername });

      const messageEl = document.createElement("div");
      messageEl.style.color = "green";
      messageEl.innerText = `To Charon ${getUsername}: ${message}`;
      privateMessages.appendChild(messageEl);

      privateInput.value = ""; 
    }
  }
});




function isScrollAtBottom(element) {
  return element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

socket.on("privateMessage", ({ sender, message, theUsername }) => {
  const isAtBottom = isScrollAtBottom(privateMessages);

  const messageEl = document.createElement("div");
  messageEl.style.color = "green";

  if (sender === socket.id) {
    messageEl.innerText = `To Charon ${getUsername}: ${message}`;
  } else {
    messageEl.innerText = `From Charon ${theUsername}: ${message}`;
  }

  privateMessages.appendChild(messageEl);

  if (isAtBottom) {
    scrollToBottom(privateMessages);
  }
});


let isAutoScrollEnabled = true; 
const SCROLL_DELAY = 1000; 

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}



const SCROLL_THRESHOLD = 50; 


function appendMessages(messages) {
  const isScrolledToBottom = messageContainer.scrollHeight - messageContainer.scrollTop === messageContainer.clientHeight;

  const messageEl = document.createElement("div");
  messageEl.style.color = "green";
  messageEl.innerText = messages;
  messageContainer.appendChild(messageEl);
  messageEl.style.marginBottom = "5px";

  if (isAutoScrollEnabled && (isScrolledToBottom || messageContainer.scrollHeight - messageContainer.scrollTop <= SCROLL_THRESHOLD)) {
    scrollToBottom();
  }
}