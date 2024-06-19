var express = require("express");
var router = express.Router();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

router.get("/", async function (req, res) {
  const name = (Math.random() + 1).toString(36).substring(7);
  const outputPath = path.join(__dirname, `./../storage/images/${name}.svg`);
  const url = req.query.url;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>QR Code Styling</title>
          <script
            type="text/javascript"
            src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"
          ></script>
        </head>
        <body>
          <div id="canvas"></div>
          <script type="text/javascript">
            window.onload = () => {
              window.qrCode = new QRCodeStyling({
                type: "svg",
                width: 300,
                height: 300,
                data: "${url}",
                // image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
                margin: 0,
                qrOptions: {
                  typeNumber: "0",
                  mode: "Byte",
                  errorCorrectionLevel: "Q",
                },
                imageOptions: { hideBackgroundDots: true, imageSize: 0.3, margin: 4, crossOrigin: "anonymous"},
                dotsOptions: {
                  type: "rounded",
                  color: "#0287cb",
                  gradient: {
                    type: "linear",
                    rotation: 0,
                    colorStops: [
                      { offset: 0, color: "#2f2f41" },
                      { offset: 1, color: "#406d66" },
                    ],
                  },
                },
                backgroundOptions: { color: "#ffffff" },
                dotsOptionsHelper: {
                  colorType: { single: true, gradient: false },
                  gradient: {
                    linear: true,
                    radial: false,
                    color1: "#6a1a4c",
                    color2: "#6a1a4c",
                    rotation: "0",
                  },
                },
                cornersSquareOptions: {
                  type: "extra-rounded",
                  color: "#0287cb",
                  gradient: {
                    type: "linear",
                    rotation: 0,
                    colorStops: [
                      { offset: 0, color: "#2f2f41" },
                      { offset: 1, color: "#406d66" },
                    ],
                  },
                },
                cornersSquareOptionsHelper: {
                  colorType: { single: true, gradient: false },
                  gradient: {
                    linear: true,
                    radial: false,
                    color1: "#000000",
                    color2: "#000000",
                    rotation: "0",
                  },
                },
                cornersDotOptions: { type: "", color: "#364044" },
                cornersDotOptionsHelper: {
                  colorType: { single: true, gradient: false },
                  gradient: {
                    linear: true,
                    radial: false,
                    color1: "#000000",
                    color2: "#000000",
                    rotation: "0",
                  },
                },
                backgroundOptionsHelper: {
                  colorType: { single: true, gradient: false },
                  gradient: {
                    linear: true,
                    radial: false,
                    color1: "#ffffff",
                    color2: "#ffffff",
                    rotation: "0",
                  },
                },
              });

              window.qrCode.append(document.getElementById("canvas"));
            };
          </script>
        </body>
      </html>
    `);

    // Wait for the QR code to be fully rendered
    await page.waitForSelector("#canvas svg", { timeout: 5000 });

    // Debug: Screenshot the entire page to verify QR code rendering
    // await page.screenshot({ path: "debug_full_page.png", fullPage: true });

    // Extract the QR code image data
    const qrCodeData = await page.evaluate(() => {
      // const canvas = document.querySelector("#canvas canvas");
      // return canvas ? canvas.toDataURL("image/png") : null;
      const svg = document.querySelector("#canvas svg");
      return svg ? new XMLSerializer().serializeToString(svg) : null;
    });

    if (!qrCodeData) {
      throw new Error("Failed to generate QR code");
    }

    // // Convert base64 to buffer and save as an image file
    // const base64Data = qrCodeData.replace(/^data:image\/png;base64,/, "");
    // fs.writeFileSync(outputPath, base64Data, "base64");

    // await browser.close();

    // res.sendFile(outputPath);

    // Save SVG data to a file
    fs.writeFileSync(outputPath, qrCodeData);

    await browser.close();

    res.sendFile(outputPath, (error) => {
      // if (!error) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).send({ message: "Error generating QR code" });
  }
});

module.exports = router;
