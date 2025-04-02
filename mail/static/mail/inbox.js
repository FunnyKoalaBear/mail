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

    if (emails.length === 0) {
      console.log("No emails found in this mailbox.");
    }

    //Show mails in mailbox
    let emailsView = document.querySelector('#emails-view');
    emailsView.innerHTML = ''; // Clear previous emails
    emailsView.innerHTML = '<h3>Inbox</h3>'; // Add a header for the inbox
     

    // Loop through each email and create a div for it
    emails.forEach(email => {
      let emailDiv = document.createElement('div');
      emailDiv.className = 'email-item';

      let emailLink = document.createElement('a');    
      emailLink.href = `/emails/${email.id}`; // Set the href attribute of the email link

      emailDiv.innerHTML = `
        <strong>From:</strong> ${email.sender} <br>
        <strong>Subject:</strong> ${email.subject} <br>
        <strong>Timestamp:</strong> ${email.timestamp} <br>
        
      `; //populating the div with the email content
      
      console.log(email.id);
      emailsView.appendChild(emailDiv); //append email div to inbox div
      emailDiv.appendChild(emailLink); //append the email link to the email div

    })

  })

  .catch(error => {
    console.error('Error:', error);
  })

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}