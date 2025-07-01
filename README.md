// CSCI 355 Project 3 by Ashiq Khan 🎯

/* QuizApp is a fun and interactive browser game that tests your general knowledge. This software utilizes the client-server 
architecture and is written in HTML, CSS, and JavaScript. In this version, the questions are retrieved from TriviaApp.   */

🧠 Quiz Content & Categories

The quiz covers a large variety of topics including math, science, history, pop culture, and gaming. The questions 
are retrieved fthe Trivia API (free): https://opentdb.com/api_config.php. The user is presented multiple-choice questions 
in a random order one-by-one. The user can select a choice and it is indicated whether it’s right or wrong. 
This makes the game an enjoyable and fruitful learning experience.

🚀 Game Flow & Start

The user is required to click on or tap the “Start Quiz” button to play the quiz. Next, the user is given multiple-choice
questions one at a time. The question number, question, and choices will be presented. If the user selects the correct choice,
it will be highlighted green. Otherwise, it will be highlighted red and the correct choice will be highlighted green.

✅ Scoring System

The score of the user is stored in JavaScript, both locally and globally. The score is statically stored in the program
and also in MongoDB. Each time the user selects the correct answer, the score is increased by one. Once the user is finished 
with the quiz, it will show a “Quiz Complete” message and a score. The score is written as a fraction such as 9/10.

✨ Features & Customization

QuizApp has many features. To begin, the user can make an account by clicking on the "Sign Up" button, typing their credentials, 
and clicking on "Create Account". The user can log in by clicking on the "Login Button", typing their credentials, checking off 
the "I agree with the Terms and Services" box, and then the "Login Button". If the user is interested, he or she can click on the 
“Terms and Services” link to see the terms. The user can click on the “Remember Me” box to have their credentials stored. Moreover,
they can click on the "Reset Password" link and enter their registered email. Upon clicking on it, their profile image will appear 
on the top left along with their username and their status will updated from “Offline” to “Online”. When the user clicks on their 
profile image, there will be three yellow buttons on top: “Profile Info”, “Play History”, and “Change Avatar”. “Profile Info” shows 
your profile information, “Play History” gives detailed information regarding how much you played, and “Change Avatar” allows you to 
upload your profile picture or choose from 40 given. The settings button allows the user to control the number of questions per quiz,
whether a timer is present, how long the timer is, and change between light and dark mode. There is also a button on the top right that 
also toggles between light and dark mode. As you can see, animated backgrounds have been used to grab the user's interest.

📦 Architecture & Design

QuizApp uses a client-server architecture, a model where the client gets requests their requests from a server, and also a static one. 
It asks for files including index.html, style.css, and script.js from a  server. In return, The server sends the files without backend
processing. In addition, it fetches questions from Trivia API (free): https://opentdb.com/api_config.php. The server gives a response
in return such as by giving a message in return such as "Account created!" or "Welcome back!". It also stores score locally and on MongoDB,
but only if you run a real server.  It also gives back error messages such as "Login failed!". Features including toggling between light 
mode and dark mode, signing up, logging in, changing settings, and updating your profile don’t rely on a server and thus, are static.

💡 Extras & Accessibility

QuizApp is designed to be somewhat accessible. It can be accessed simply by clicking on my GitHub link or on the server. It can be accesesd 
on a desktop computer, laptop computer, tablet, phone, or any similar device. QuizApp is also very easy to use. The buttons are big, have big
text for the user to read, and quickly respond to the user's request. If the user use another device such as a phone, the screen and all the 
content being presented changes size accordingly so that it's easy to use. However, some things will overlap each other such as the profile box 
and buttons, which makes some buttons not easily accessible.

🤝 Contributions

I (Ashiq Khan) contributed to this project in many ways. I made the home page which included the “Welcome to Quiz App” text box and “Start Quiz” 
button. I also made the buttons on the top right including the toggle button, sign up button, login button, leaderboard button, and settings button.
I also made the sign up and login forms along with the fields within. I made the “Terms and Services” link and the information that it shows. I made 
the “Remember Me” checkbox to store the user’s credentials. I made the profile image on the top right and all the specified features including viewing 
yourself, showing your play history, and selecting your profile picture. I made the settings including the ability to change the number of questions,
implement a timer, and how long the timer will last. I made the select category button, which filters what questions are shown. In addition to the 
“Go Home” and “Try Again” button, I made the “Save to Leaderboard” button and “Share to Social Media” button. The former button saves your scores to
the leaderboard where the user can see their top 10 scores. The latter button redirects the user to a page where he or she can select the social media 
platform to send their score to. They include “Facebook”, “SnapChat”, “Twitter”, and “Instagram”.

🚀 How to Deploy the Server

To deploy the server on GitHub, click on the following link: https://akha324.github.io/Quiz-App---Update/                              To deploy the server on Heroku, click on the follwing link: https://quizapp-update-813af058569c.herokuapp.com/

📄 License

The project is open-source, which means it’s free for anyone to use. However, it’s still a work in progress and feedback on this software is greatly appreciated.
