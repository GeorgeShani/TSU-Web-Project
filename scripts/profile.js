document
  .getElementById("editProfileBtn")
  .addEventListener("click", function () {
    const form = document.getElementById("editForm");
    form.classList.remove("profile__form--hidden");
  });

document.getElementById("cancelEditBtn").addEventListener("click", function () {
  const form = document.getElementById("editForm");
  form.classList.add("profile__form--hidden");
});
