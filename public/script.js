const formBtn = document.getElementById("formBtn");
const formBtnLoader = document.getElementById("formBtnLoader");
const formBtnText = document.getElementById("formBtnText");

import Notifier from "./notifier.js"

let exclaSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/> </svg>';
let upSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16"> <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/> </svg>';

function showLoader() {
  formBtnLoader.style.display = "inline-block";
  formBtnText.style.display = "none";
}

function hideLoader() {
  formBtnLoader.style.display = "none";
  formBtnText.style.display = "inline-block";
}

let emailsToAvoid = []; 

const notifier = new Notifier(2500);

regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = regForm.elements["email"].value;
  showLoader();

  if (emailsToAvoid.includes(email))  {
    notifier.error("Error!", "can't try again with invalid email");
    hideLoader();
    return;
  }

  const res = await fetch(`/register?email=${email}`);
  let data = await res.json();

  hideLoader();
  if (res.ok) {
    notifier.success("Success!", "your email was registered, check your inbox")
    return;
  };

  if (data.code === "email-exists") {
    notifier.error("Error!", "the email is already registered");
  } else if (data.code === "email-invalid") {
    notifier.error("Error!", "the email is invalid");
    emailsToAvoid.push(email);
  } else if (data.code === "fake-email") {
    notifier.error("Error!", "you need to provide a real email");
    emailsToAvoid.push(email);
  } else {
    notifier.error("Internal error", "try again later");
  }
    


});
