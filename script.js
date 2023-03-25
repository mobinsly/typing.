const textarea = document.querySelector("#text");
const imageContainer = document.querySelector("#image-container");
const copyBtn = document.querySelector("#copy-btn");
const shareBtn = document.querySelector("#share-btn");
const infoButton = document.getElementById("info-btn");
const infoText = document.getElementById("info");

//info btn open/close
infoButton.addEventListener("click", () => {
  if (infoText.style.display === "block") {
    infoText.classList.toggle("show");
    infoText.style.rotate = "90";
    infoText.style.display = "none";
    infoButton.innerHTML = '<i class="ri-information-line"></i>';
  } else {
    infoText.style.transform = "all 0.2s ease";
    infoText.style.display = "block";
    infoButton.innerHTML = '<i class="ri-close-line"></i>';
  }
});

//for "copy text" bg style
let bgGradient = `background: radial-gradient(137.33% 895.65% at 50% 50%, #000000 0%, #C5FFC0 100%);`;
let bgBlack = `background: #000000;`;

//generate img
function generateImage() {
  const ctx = document.createElement("canvas").getContext("2d");
  const text = textarea.value;
  const fontInput = document.querySelector("#font");

  fontInput.addEventListener("change", () => {
    const file = fontInput.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", async () => {
      const fontContents = reader.result;
      const font = new FontFace("custom", fontContents);
      await font.load();
      document.fonts.add(font);
      ctx.font = "100px custom"; // set font after loading
      updateImage();
    });

    reader.readAsArrayBuffer(file);
  });

  ctx.font = "100px custom"; // change to the user's selected font
  const lines = text.split("n");
  let maxWidth = 600;
  const padding = 100;
  for (let i = 0; i < lines.length; i++) {
    const lineWidth = ctx.measureText(lines[i]).width;
    if (lineWidth > maxWidth) {
      maxWidth = lineWidth;
    }
  }
  maxWidth += padding * 2; // add left and right padding

  const lineHeight = 400;
  const canvasHeight = lineHeight * lines.length;
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = canvasHeight;

  function updateImage() {
    const ctx2 = canvas.getContext("2d");
    ctx2.font = "100px custom"; // change to the user's selected font
    ctx2.fillStyle = document.querySelector("#color").value;
    ctx2.textAlign = "center"; // center text horizontally
    for (let i = 0; i < lines.length; i++) {
      const y = canvasHeight / 2 - (lines.length - i - 1) * lineHeight; // center text vertically
      ctx2.fillText(lines[i], (maxWidth - padding * 2) / 2 + padding, y);
    }

    const image = canvas.toDataURL("image/png");
    imageContainer.innerHTML = '<img src="' + image + '">';
  }

  updateImage();
}

textarea.addEventListener("input", () => {
  generateImage();
});

generateImage();

function resetButton() {
  copyBtn.textContent = "Copy Text";
  copyBtn.disabled = false;
  document.getElementById("copy-btn").style = bgBlack;
  document.getElementById("copy-btn").style.transition = "all 0.2s ease-out";
}

//copy img
copyBtn.addEventListener("click", (event) => {
  event.preventDefault(); // prevent the default form submission behavior
  const img = imageContainer.querySelector("img");

  //use fetch to retrieve the binary data of the image
  fetch(img.src)
    .then((response) => response.blob())
    .then((blob) => {
      const clipboardItems = [
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ];

      navigator.clipboard.write(clipboardItems).then(() => {
        // update button UI to show a tick and turn green
        copyBtn.textContent = "Copied!";
        copyBtn.disabled = true;
        copyBtn.innerHTML =
          '<img id="CopyEmoji" src="img/CopyEmoji.png" width="16px" height="16px" style="padding-right:6px; vertical-align:middle;" />Copied!';
        document.getElementById("copy-btn").style = bgGradient;
        document.getElementById("copy-btn").style.transition =
          "all 0.2s ease-out";
        // reset button UI after 2 seconds
        setTimeout(() => {
          resetButton();
        }, 1000);
      });
    });
});

//share img
shareBtn.addEventListener("click", (event) => {
  event.preventDefault(); // prevent the default form submission behavior
  const img = imageContainer.querySelector("img");

  //use fetch to retrieve the binary data of the image
  fetch(img.src)
    .then((response) => response.blob())
    .then((blob) => {
      const file = new File([blob], "image.png", { type: "image/png" });
      const filesArray = [file];

      if (navigator.share) {
        navigator
          .share({
            files: filesArray,
          })
          .then(() => {
            console.log("Successfully shared image!");
          })
          .catch((error) => {
            console.log(`Error sharing image: ${error}`);
          });
      } else {
        console.log("Share API not supported.");
      }
    });
});
