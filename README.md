# 🧠 Real-Time Object Detection Web App

A modern web application using TensorFlow\.js to detect objects in real time via webcam or image upload — fully in-browser and privacy-friendly.
👉 [https://cjsiegaz.manus.space](https://cjsiegaz.manus.space)
---

## 🚀 Features

* **Real-time detection**: Detects objects continuously via your webcam
* **Image upload**: Analyze static images for object detection
* **80 object classes**: Recognizes people, vehicles, animals, and everyday items
* **Modern interface**: Responsive design built with Tailwind CSS and shadcn/ui
* **Optimized performance**: Runs on TensorFlow\.js CPU backend for maximum compatibility

---

## 🛠️ Tech Stack

* **React**: Modern frontend framework
* **TensorFlow\.js**: In-browser machine learning
* **COCO-SSD**: Pre-trained object detection model
* **Tailwind CSS**: Utility-first CSS framework
* **shadcn/ui**: Clean UI component library
* **Vite**: Fast build tool

---

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/subtilhugo/object-detection-app.git
cd object-detection-app
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start the development server**

```bash
pnpm run dev
```

4. Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

The application is deployed and accessible here:
👉 [https://cjsiegaz.manus.space](https://cjsiegaz.manus.space)

To build for production:

```bash
pnpm run build
```

---

## 🎯 Usage

### Webcam Mode

1. Click “Start Camera”
2. Allow access to your webcam
3. Click “Start Detection”
4. Detected objects will appear with bounding boxes and labels

### Image Upload Mode

1. Switch to “Image” mode
2. Click “Choose Image”
3. Select an image from your computer
4. Click “Detect Objects”
5. Results will be shown over the image

---

## 🧠 Machine Learning Model

The app uses the **COCO-SSD** (Common Objects in Context – Single Shot MultiBox Detector) model which can detect **80 different object classes**, including:

* People
* Vehicles (cars, bikes, buses, trains, etc.)
* Animals (dogs, cats, horses, birds, etc.)
* Everyday objects (phones, laptops, books, etc.)
* Food and beverages
* ... and more

---

## ⚙️ Configuration

The app uses TensorFlow\.js with the **CPU backend by default**, ensuring compatibility with most devices and browsers without requiring GPU acceleration.

---

## 📱 Compatibility

* ✅ Chrome, Firefox, Safari, Edge (latest versions)
* ✅ Desktop and mobile
* ✅ Runs without GPU
* ✅ No plugins required

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

## 📄 License

This project is under the [MIT License](./LICENSE).

---

## 🙏 Acknowledgments

* [TensorFlow.js](https://www.tensorflow.org/js)
* [COCO Dataset](https://cocodataset.org)
* [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [shadcn/ui](https://ui.shadcn.com/)

