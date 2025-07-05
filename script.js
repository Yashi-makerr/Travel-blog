// Get modal elements
var modal = document.getElementById("imageModal");
var mainImage = document.getElementById("mainImage");
var closeBtn = document.getElementsByClassName("close")[0];

// Open modal when the main image is clicked
mainImage.onclick = function() {
    modal.style.display = "block";
}

// Close modal when the user clicks the close button
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Close modal when the user clicks anywhere outside the modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
const modals = document.querySelectorAll('.modal');
modals.forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      modal.style.display = 'none';
    }
  });
});
