# Heart Rate Tauri

**Heart Rate Tauri** is a cross-platform desktop app built with [Tauri](https://tauri.app/) that displays real-time heart rate data from your **Xiaomi Mi Band**. It allows users to view their current heart rate on their computer via Bluetooth connection to the band.

## 🚀 Features

- 📡 Real-time heart rate monitoring from Xiaomi Mi Band
- 💻 Cross-platform: Windows, macOS, Linux
- ⚙️ Built with Rust + Web technologies for performance and flexibility
- 🔒 Local processing and Bluetooth connection ensure data privacy

## 📷 Screenshots

![screenshot](https://github.com/user-attachments/assets/0686b946-042f-4154-92dc-6e99d1648205)

## 📦 Getting Started

### Prerequisites

- A Xiaomi Mi Band (Mi Band 9/10 recommended)
- Bluetooth supported and enabled on your computer
- [Rust](https://www.rust-lang.org/) and [Node.js](https://nodejs.org/) installed

### Clone the Repository

```bash
git clone https://github.com/ahaoboy/heart-rate-tauri.git
cd heart-rate-tauri
````

### Install Dependencies and Run

```bash
pnpm install
pnpm run tauri dev
```

The app will attempt to scan for nearby Xiaomi bands and connect automatically.

## ⚠️ Notes

* Some bands may require developer mode or special permissions to broadcast data
* Only supports Mi Bands with accessible heart rate broadcast (unencrypted or reverse-engineered protocols)

## 🗒️ TODO

* [ ] Support for more band models (e.g. Mi Band 8, Huawei Band)
* [ ] Add historical heart rate chart/logging
* [ ] Auto-reconnect and connection status UI

## 📄 License

This project is licensed under the MIT License.
Feel free to use, modify, and contribute!
