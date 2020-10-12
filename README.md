
# Fruit Quest 

![fruit quest logo](./src/fruit-quest-logo.png)

## Description

Fruit quest is an game application created using a Ruby on Rails backend and React frontend, in combination with the Phaser 3 game engine. Users can create a profile and play any of the four levels available. The aim of the game is to collect as many pieces of fruit as possible before the timer reaches 0. Users can view their personal high scores and total scores on their profile page, and can also make their way onto the leaderboard. 

## Installation
1. Fork and clone this frontend repository and navigate into the directory where you cloned the repository.
2. Enter the command "npm install" in the terminal.
3. Fork and clone backend repository from [here](https://github.com/carcarvroom/fruit-quest-backend). Navigate to the backend folder.
4. Enter the command 'bundle install' in the terminal.
5. Run "rails db:migrate" in the terminal.
6. For testing data, in the ../db/seeds.rb file, uncomment the test data, and run "rails db:seed" in the terminal.
7. Run "rails server" to begin server.
8. Run "npm start" to view the website!

## Features
* Sign up as a new user or login as a returning user
* View game instructions via the how to play button 
* Play levels 1-4 and collect as many fruits as possible
* View your profile with your highest score and total score
* View leaderboard with the highest top ten scores
* Logout or delete account
    * Deleting account will delete your scores

## Demo

![Fruit Quest Demo](https://thumbs.gfycat.com/RegalOnlyHumpbackwhale-size_restricted.gif)

## Built with
* Ruby 2.6.1
* JavaScript
* React 16.13.1
* Phaser 3.24.1
* Tiled Map Editor 1.4.2

## Credits

**Carly La**<br>
https://github.com/carcarvroom
https://www.linkedin.com/in/carlyla/

**Iona Brabender**<br>
https://github.com/iona-b
https://www.linkedin.com/in/iona-brabender/

**Sprites**<br>
Pixel Adventure 1<br>
https://pixel-frog.itch.io/pixel-adventure-1

## License

Please see license file included in the fruit quest frontend directory.