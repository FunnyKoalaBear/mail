document.addEventListener('DOMContentLoaded', function() {

  // BUTTONS to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //buttons to send the email
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    send_email(); // Call the function to send the email
    console.log("Form submitted");
  });

  // By default, load the inbox
  console.log("Loading inbox");
  load_mailbox('inbox');
});




function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block'; //block means show the block bruh 

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}




function send_email() {
  
    fetch('/emails', {
      method: "POST",
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })  
    })
  
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    })

    load_mailbox('sent'); // Load the sent mailbox after sending the email
}




function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  console.log("trying to load mail box");

  // Fetch emails from the mailbox
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    //print emails to the console
    console.log(emails);
    console.log("All emails loaded successfully!");

    //Show mails in mailbox
    let emailsView = document.querySelector('#emails-view');
    emailsView.innerHTML = ''; // Clear previous emails
    emailsView.innerHTML = '<h3>Inbox</h3>'; // Add a header for the inbox

    //condition to check if there are no emails
    if (emails.length === 0) {
      console.log("No emails found in this mailbox.");
      let noneDiv = document.createElement('h6');
      noneDiv.textContent = "// Sorry, no emails found at the moment";
      emailsView.appendChild(noneDiv);
      return; // Exit the function if no emails are found
    }

    // Loop through each email and create a div for it
    emails.forEach(email => {
      let emailDiv = document.createElement('div');
      emailDiv.className = 'email-item'; // Add a class to the div for styling
      emailDiv.id = email.id; // Set the id of the div to the email id

      emailDiv.innerHTML = `
        <strong>From:</strong> ${email.sender} <br>
        <strong>Subject:</strong> ${email.subject} <br>
        <strong>Timestamp:</strong> ${email.timestamp} <br>
        
      `; //populating the div with the email content
      
      
      emailDiv.addEventListener('click', () => load_email(email.id))
      emailsView.appendChild(emailDiv); //append email div to inbox div
    })

  })
  .catch(error => {
    console.error('Error:', error);
  })

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}



function load_email(email_id) {

  let emailDiv = document.getElementById(`${email_id}`);
  let expandedView = emailDiv.querySelector('.expanded-view');
  
  if (expandedView) {
    //closing an open email
    expandedView.remove(); // Remove the previous expanded view if it exists
    emailDiv.innerHTML = `
      <strong>From:</strong> ${emailDiv.dataset.sender} <br>
      <strong>Subject:</strong> ${emailDiv.dataset.subject} <br>
      <strong>Timestamp:</strong> ${emailDiv.dataset.timestamp} <br>
    `; 
    console.log("Email closed successfully!");

  }
  else {
    // Create a new div for the expanded view  
    // Fetch the email details
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      //display the email content
      console.log("Email loaded successfully!");

      emailDiv.dataset.sender = email.sender;
      emailDiv.dataset.subject = email.subject;
      emailDiv.dataset.timestamp = email.timestamp;
      
      //retaining the email content in the div when collapsed
      emailDiv.innerHTML = `
        <strong>From:</strong> ${email.sender} <br>
        <strong>Subject:</strong> ${email.subject} <br>
        <strong>Timestamp:</strong> ${email.timestamp} <br>
      `;
      
      //create and append the expanded view 
      let expandedView = document.createElement('div');
      expandedView.className = 'expanded-view'; // Add a class to the div for styling
      expandedView.id = {email_id}; // Set the id of the div to the email id
      
      //new stuff to show
      expandedView.innerHTML = `
        <hr>
        <p>${email.body}</p>
        <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
        `; //populating the expanded view div with the email content
      emailDiv.appendChild(expandedView); // Append the expanded view to the email div
      
      //reply button functionality
      let replyButton = document.querySelector('#reply');
      replyButton.addEventListener('click', () => reply_email(email_id));
      //read functionality
      //archive button functionality

    })
  }

  function reply_email(email_id) {
    // Show compose view and hide other views
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block'; //block means show the block bruh 

    // Fetch the email details
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {

      //populating the compose fields with the email content
      document.querySelector('#compose-recipients').value = email.sender; // Set the recipient to the original sender

      let subject = email.subject;
      let match = subject.match(/^Re (\d+): (.*)$/); // Check if subject already has "Re X: "
      if (match) {
        let replyCount = parseInt(match[1]) + 1; // Increment the count
        subject = `Re ${replyCount}: ${match[2]}`; // Update subject
      } else if (subject.startsWith("Re: ")) {
        subject = `Re 2: ${subject.slice(4)}`; // Convert "Re: " to "Re 2: "
      } else {
        subject = "Re 1: " + subject; // First reply
      }
      document.querySelector('#compose-subject').value = subject; // Set the subject to the original subject
      
      document.querySelector('#compose-body').value = '';

    })
    .catch(error => {
      console.error('Error: ', error);
    })
    
  }


}



