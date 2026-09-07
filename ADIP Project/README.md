# Watermark Lab v5

Watermark Lab is an interactive image-watermarking experiment based on the improved v5 DWT–DCT workflow. It embeds a binary mark in the Haar LH subband, extracts it again, and reports image quality (PSNR, SSIM, MSE), capacity, BER, normalized correlation, recovery accuracy, and robustness under common attacks.

**Live site:** [academic-projects-three.vercel.app](https://academic-projects-three.vercel.app/)

## Built with

- HTML and CSS
- Vanilla JavaScript and the Canvas API
- Haar discrete wavelet transform with reflect padding
- 8×8 discrete cosine transform
- JPEG, Gaussian-noise, and median-blur robustness tests

## Run locally

Open this folder in VS Code and launch `index.html` with Live Server. Choose a cover image and a watermark, adjust the parameters, then select **Run experiment**. The v5 defaults are DWT level 1, alpha 40, threshold 127, and DCT coefficient (3, 3). Processing happens entirely in the browser; uploaded images are not sent anywhere.

`ADIP_Project_v5_improved.ipynb` is the current reference implementation. `ADIP_Project_Watermark_Portal.ipynb` provides the same improved workflow through Gradio. The earlier `ADIP_Project_v4_3.ipynb` is retained for comparison.
