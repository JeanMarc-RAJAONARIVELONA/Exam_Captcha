document
  .getElementById("sequenceForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const N = parseInt(document.getElementById("numberInput").value);
    const outputDiv = document.getElementById("output");
    const form = document.getElementById("sequenceForm");
    form.style.display = "none";

    outputDiv.innerHTML = "";

    let currentRequest = 1;

    function makeRequest() {
      if (currentRequest > N) return;

      fetch("https://api.prod.jcloudify.com/whoami")
        .then((response) => {
          if (response.status === 405) {
            throw new Error("CaptchaRequired");
          } else if (!response.ok) {
            throw new Error("Forbidden");
          }
          return response.text();
        })
        .then((data) => {
          outputDiv.innerHTML += `<p>${currentRequest}. ${data}</p>`;
          currentRequest++;
          setTimeout(makeRequest, 1000);
        })
        .catch((error) => {
          if (error.message === "CaptchaRequired") {
            handleCaptcha().then(() => {
              setTimeout(makeRequest, 1000);
            });
          } else if (error.message === "Forbidden") {
            outputDiv.innerHTML += `<p>${currentRequest}. Forbidden</p>`;
            currentRequest++;
            setTimeout(makeRequest, 1000);
          } else {
            console.error("Unexpected error:", error);
          }
        });
    }

    function handleCaptcha() {
      return new Promise((resolve) => {
        showMyCaptcha();
        window.captchaResolved = resolve;
      });
    }

    makeRequest();
  });

function showMyCaptcha() {
  var container = document.querySelector("#my-captcha-container");

  AwsWafCaptcha.renderCaptcha(container, {
    apiKey: window.WAF_API_KEY,
    onSuccess: captchaExampleSuccessFunction,
    onError: captchaExampleErrorFunction,
  });
}

function captchaExampleSuccessFunction(wafToken) {
  AwsWafIntegration.fetch("...WAF-protected URL...", {
    method: "POST",
  }).then(() => {
    if (window.captchaResolved) window.captchaResolved();
  });
}

function captchaExampleErrorFunction(error) {
  console.error("CAPTCHA error:", error);
}
