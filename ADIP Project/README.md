# Watermark Lab

Watermark Lab is an interactive image-watermarking experiment based on the DWT + DCT workflow from the accompanying notebooks. It embeds a binary mark in a cover image, extracts it again, and reports PSNR, SSIM, MSE, capacity, and recovery accuracy.

**Live site:** [academic-projects-three.vercel.app](https://academic-projects-three.vercel.app/)

## Built with

- HTML and CSS
- Vanilla JavaScript and the Canvas API
- Haar discrete wavelet transform
- 8×8 discrete cosine transform

## Run locally

Open this folder in VS Code and launch `index.html` with Live Server. Choose a cover image and a watermark, adjust the parameters, then select **Run experiment**. Processing happens entirely in the browser; uploaded images are not sent anywhere.

The original Python work is included in `ADIP_Project_v4_3.ipynb`, with a separate portal notebook in `ADIP_Project_Watermark_Portal.ipynb`.

## Deploy

Import the repository into Vercel, set the Root Directory to `ADIP Project`, and deploy with the `Other` framework preset. There is no build step.
