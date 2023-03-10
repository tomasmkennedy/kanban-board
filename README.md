
# Kanban-Board

I created this kanban board using React for the frontend, and Firebase Firestore for the backend. Firestore takes care of data storage as well as user authentication, while for the frontend I used Atlassian's react-beautiful-dnd to handle drag and drop functionality. I originally created this project using a different drag and drop library, however there were issues with list reordering so I had to recreate it with Atlassian's library. 


## Installation

For installation after downloading the project, open a terminal in the project folder, and install dependencies

```bash
  cd kanban-board
  npm install
```

Following this, you will have to add your own firebase firestore API information to the utils/firebase.js file. Then, you can run the program

```bash
  npm start
```

    