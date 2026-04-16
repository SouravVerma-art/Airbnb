const slider = document.getElementById("rating");
const value = document.getElementById("rating-value");

if (slider && value) {
  value.textContent = slider.value;

  slider.addEventListener("input", function () {
    value.textContent = this.value;
  });
}