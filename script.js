
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEAB_u-FX0jBDBaA8-w3B3s6l647dBDUg",
  authDomain: "login-6cc5e.firebaseapp.com",
  databaseURL: "https://login-6cc5e-default-rtdb.firebaseio.com",
  projectId: "login-6cc5e",
  storageBucket: "login-6cc5e.appspot.com",
  messagingSenderId: "531367313044",
  appId: "1:531367313044:web:7c57c48b77b2d63690fe81",
  measurementId: "G-TCE7760WX4"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

   addRecipeBtn.addEventListener('click', () => {
     const recipeName = document.getElementById('recipeName').value;
     const fileInput = document.getElementById('file');
     const recipeIngredients = document.getElementById('recipeIngredients').value;
     const recipeInstructions = document.getElementById('recipeInstructions').value;
     const file = fileInput.files[0];

     // Create a reference to the storage location
     const storageRef = storage.ref().child(`recipeImages/${file.name}`);

     // Upload the file to Firebase Storage
     storageRef.put(file)
       .then(() => {
         // Get the download URL of the uploaded file
         return storageRef.getDownloadURL();
       })
       .then((downloadURL) => {
         // Store the recipe data in Firestore
         return db.collection('recipes').add({
           name: recipeName,
           image: downloadURL,
           ingredients: recipeIngredients,
           instructions: recipeInstructions
         });
       })
       .then(() => {
         console.log('Recipe added successfully!');
         
         // Clear the input fields

         recipeName.value = '';
         fileInput.value = '';
         recipeIngredients.value = '';
         recipeInstructions.value = '';
         location.reload();
       })
       .catch((error) => {
         console.error('Error adding recipe: ', error);
       });
});



const savedRecipesDiv = document.getElementById('savedRecipesDiv');
const modal = document.getElementById('recipeModal');
const modalRecipeName = document.getElementById('modalRecipeName');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const closeBtn = document.getElementsByClassName('close')[0];
const deleteBtn = document.getElementById('deleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let currentRecipeId = null; // Track the ID of the currently displayed recipe

// Retrieve recipe data from Firestore
db.collection('recipes').get()
 .then((querySnapshot) => {
   querySnapshot.forEach((doc) => {
     const recipeData = doc.data();
     const recipeId = doc.id;
     const recipeName = recipeData.name;
     const recipeImage = recipeData.image;
     const recipeIngredients = recipeData.ingredients;
     const recipeInstructions = recipeData.instructions;

     // Create recipe card HTML elements
     const recipeCard = document.createElement('div');
     recipeCard.className = 'recipe-card';

     const recipeImageElement = document.createElement('img');
     recipeImageElement.src = recipeImage;
     recipeImageElement.alt = recipeName;

     const recipeNameElement = document.createElement('h3');
     recipeNameElement.textContent = recipeName;

     // Append the elements to the recipe card
     recipeCard.appendChild(recipeImageElement);
     recipeCard.appendChild(recipeNameElement);

     // Add event listener to the recipe card
     recipeCard.addEventListener('click', () => {
       // Populate the modal with recipe details
       modalRecipeName.textContent = recipeName;
       modalIngredients.textContent = recipeIngredients;
       modalInstructions.textContent = recipeInstructions;

       // Store the ID and image URL of the currently displayed recipe
       currentRecipeId = recipeId;
       currentRecipeImage = recipeImage;

       // Show the modal
       modal.style.display = 'block';
     });

     // Append the recipe card to the savedRecipesDiv
     savedRecipesDiv.appendChild(recipeCard);
   });
 })
 .catch((error) => {
   console.error('Error retrieving recipes: ', error);
 });

// Close the modal when the close button is clicked
closeBtn.addEventListener('click', () => {
 modal.style.display = 'none';
});

// Close the modal when the user clicks outside of it
window.addEventListener('click', (event) => {
 if (event.target === modal) {
   modal.style.display = 'none';
 }
});

// Show confirmation popup when the delete button is clicked
deleteBtn.addEventListener('click', () => {
 const confirmationPopup = document.getElementById('confirmationPopup');
 confirmationPopup.style.display = 'block';
});

// Event listener for the confirm delete button in the confirmation popup
confirmDeleteBtn.addEventListener('click', () => {
 // Hide the confirmation popup
 confirmationPopup.style.display = 'none';

 // Delete the recipe document from Firestore
 db.collection('recipes').doc(currentRecipeId).delete()
   .then(() => {
     console.log('Recipe document deleted from database');

     // Create a reference to the image in storage using its URL
     const imageRef = storage.refFromURL(currentRecipeImage);

     // Delete the image from storage
     imageRef.delete()
       .then(() => {
         location.reload();
         console.log('Image deleted from storage');
         // Remove the recipe card from the UI
         const recipeCard = document.querySelector(`[data-recipe-id="${currentRecipeId}"]`);
         if (recipeCard) {
         recipeCard.remove();
         
         } else {
         console.warn('Recipe card not found in the UI');
         }
       })
       .catch((error) => {
         console.error('Error deleting image from storage: ', error);
       });
   })
   .catch((error) => {
     console.error('Error deleting recipe document: ', error);
   });
});

// Event listener for the cancel delete button in the confirmation popup
cancelDeleteBtn.addEventListener('click', () => {
 // Hide the confirmation popup
 confirmationPopup.style.display = 'none';
});
