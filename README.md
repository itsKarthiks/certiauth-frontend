# 🛡️ Certvify - Secure Credentialing Platform (Frontend)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

This repository contains the frontend client for **Certvify**, an enterprise-grade, cryptographically secure credential issuance and verification system. Built with React and Vite, it interfaces with our Node.js RSA-SHA256 cryptographic backend to guarantee the authenticity of academic records.

## ✨ Core Features

* **🔐 Admin Dashboard:** Secure interface for authorized personnel to issue, manage, and revoke student credentials.
* **📱 Live QR Verification:** Integrated camera scanner allowing recruiters to instantly verify physical certificates via dynamically generated QR codes.
* **⚡ Cryptographic Validation:** Real-time visual feedback (Green/Red states) based on public-key RSA signature decryption and SHA-256 hash matching.
* **🎨 Responsive Design:** Mobile-first architecture built with Tailwind CSS, ensuring perfect rendering across desktops, tablets, and smartphones.
* **🚀 Edge-Ready Routing:** Pre-configured `vercel.json` for seamless React Router integration on static hosting.

## 🛠️ Tech Stack

* **Core:** React 18, Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Utilities:** `qrcode.react` (QR Generation), `react-qr-reader` (Scanning)

 -->
## 📸 Screenshots

<p align="center">
  <b>Admin Dashboard</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b> Student Dashboard</b>
</p>

<p align="center">
  <img src="Certvify-AdminDashboard.png" width="45%"/>
  <img src="Certvify-StudentDashboard.png" width="45%"/>
</p>

<br/>

<p align="center">
  <b>Landing Page</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Admin Login</b>
</p>

<p align="center">
  <img src="Certvify-Landing.png" width="45%"/>
  <img src="Certvify-AdminLogin.png" width="45%"/>
</p>



<!-- ![Certvify-Landing Page](Certvify-Landing.png)
![Certvify-AdminLogin](Certvify-AdminLogin.png)
![Certvify-AdminDashboard](Certvify-AdminDashboard.png)
![Certvify-StudentDashboard](Certvify-StudentDashboard.png)