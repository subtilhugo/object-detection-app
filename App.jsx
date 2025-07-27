import { useState, useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Camera, CameraOff, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import './App.css'

function App() {
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [model, setModel] = useState(null)
  const [isVideoStarted, setIsVideoStarted] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [mode, setMode] = useState('webcam') // 'webcam' ou 'upload'

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)

  // Charger le modèle TensorFlow.js
  const loadModel = async () => {
    setIsModelLoading(true)
    try {
      // Forcer l'utilisation du backend CPU pour éviter les problèmes WebGL
      await tf.setBackend('cpu')
      await tf.ready()
      
      // Charger le modèle COCO-SSD
      const loadedModel = await cocoSsd.load()
      setModel(loadedModel)
      console.log('Modèle COCO-SSD chargé avec succès')
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error)
    } finally {
      setIsModelLoading(false)
    }
  }

  // Démarrer la webcam
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsVideoStarted(true)
        setMode('webcam')
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à la webcam:', error)
      alert('Impossible d\'accéder à la webcam. Vous pouvez utiliser le mode upload d\'image à la place.')
    }
  }

  // Arrêter la webcam
  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsVideoStarted(false)
    setIsDetecting(false)
    setPredictions([])
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Gérer l'upload d'image
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setMode('upload')
        stopVideo()
        setPredictions([])
      }
      reader.readAsDataURL(file)
    }
  }

  // Détecter les objets dans l'image uploadée
  const detectObjectsInImage = async () => {
    if (!model || !imageRef.current || !canvasRef.current) return

    const image = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Ajuster la taille du canvas à celle de l'image
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    try {
      // Faire une prédiction
      const predictions = await model.detect(image)
      setPredictions(predictions)

      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dessiner les boîtes de détection
      predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox
        const confidence = (prediction.score * 100).toFixed(1)

        // Dessiner la boîte
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, width, height)

        // Dessiner le label avec fond
        const text = `${prediction.class} (${confidence}%)`
        ctx.font = '16px Arial'
        const textMetrics = ctx.measureText(text)
        const textHeight = 20

        // Fond du texte
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
        ctx.fillRect(x, y > textHeight ? y - textHeight : y, textMetrics.width + 8, textHeight)

        // Texte
        ctx.fillStyle = '#000000'
        ctx.fillText(text, x + 4, y > textHeight ? y - 4 : y + 16)
      })
    } catch (error) {
      console.error('Erreur lors de la détection:', error)
    }
  }

  // Détecter les objets dans la vidéo
  const detectObjects = async () => {
    if (!model || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Ajuster la taille du canvas à celle de la vidéo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    try {
      // Faire une prédiction
      const predictions = await model.detect(video)
      setPredictions(predictions)

      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dessiner les boîtes de détection
      predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox
        const confidence = (prediction.score * 100).toFixed(1)

        // Dessiner la boîte
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)

        // Dessiner le label
        ctx.fillStyle = '#00ff00'
        ctx.font = '16px Arial'
        ctx.fillText(
          `${prediction.class} (${confidence}%)`,
          x,
          y > 20 ? y - 5 : y + 20
        )
      })

      // Continuer la détection
      if (isDetecting) {
        animationRef.current = requestAnimationFrame(detectObjects)
      }
    } catch (error) {
      console.error('Erreur lors de la détection:', error)
    }
  }

  // Démarrer/arrêter la détection
  const toggleDetection = () => {
    if (mode === 'upload') {
      detectObjectsInImage()
    } else {
      if (isDetecting) {
        setIsDetecting(false)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      } else {
        setIsDetecting(true)
        detectObjects()
      }
    }
  }

  // Charger le modèle au démarrage
  useEffect(() => {
    loadModel()
  }, [])

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      stopVideo()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Détection d'Objets en Temps Réel
          </h1>
          <p className="text-lg text-gray-600">
            Utilise TensorFlow.js pour identifier des objets via webcam ou upload d'image
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contrôles */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Contrôles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isModelLoading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement du modèle...
                </div>
              )}

              {/* Mode sélection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode:</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMode('webcam')}
                    variant={mode === 'webcam' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Webcam
                  </Button>
                  <Button
                    onClick={() => setMode('upload')}
                    variant={mode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                </div>
              </div>

              {mode === 'webcam' ? (
                <Button
                  onClick={isVideoStarted ? stopVideo : startVideo}
                  disabled={isModelLoading}
                  className="w-full"
                  variant={isVideoStarted ? "destructive" : "default"}
                >
                  {isVideoStarted ? (
                    <>
                      <CameraOff className="w-4 h-4 mr-2" />
                      Arrêter la caméra
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Démarrer la caméra
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isModelLoading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir une image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}

              {((mode === 'webcam' && isVideoStarted) || (mode === 'upload' && uploadedImage)) && (
                <Button
                  onClick={toggleDetection}
                  disabled={!model}
                  className="w-full"
                  variant={isDetecting ? "secondary" : "default"}
                >
                  {mode === 'upload' ? 'Détecter les objets' : 
                   (isDetecting ? 'Arrêter la détection' : 'Démarrer la détection')}
                </Button>
              )}

              {/* Statut */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Modèle:</span>
                  <Badge variant={model ? "default" : "secondary"}>
                    {model ? "Chargé" : "Non chargé"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <Badge variant="outline">
                    {mode === 'webcam' ? 'Webcam' : 'Upload'}
                  </Badge>
                </div>
                {mode === 'webcam' && (
                  <div className="flex justify-between">
                    <span>Caméra:</span>
                    <Badge variant={isVideoStarted ? "default" : "secondary"}>
                      {isVideoStarted ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Détection:</span>
                  <Badge variant={isDetecting || (mode === 'upload' && predictions.length > 0) ? "default" : "secondary"}>
                    {mode === 'upload' ? 
                     (predictions.length > 0 ? "Terminée" : "Aucune") :
                     (isDetecting ? "En cours" : "Arrêtée")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vidéo et détections */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {mode === 'webcam' ? 'Flux vidéo' : 'Image uploadée'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden">
                {mode === 'webcam' ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      onLoadedData={() => {
                        if (canvasRef.current && videoRef.current) {
                          canvasRef.current.width = videoRef.current.videoWidth
                          canvasRef.current.height = videoRef.current.videoHeight
                        }
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                    {!isVideoStarted && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Cliquez sur "Démarrer la caméra" pour commencer</p>
                          <p className="text-sm mt-2 opacity-75">
                            Ou utilisez le mode "Image" pour uploader une photo
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          ref={imageRef}
                          src={uploadedImage}
                          alt="Image uploadée"
                          className="w-full h-auto"
                          onLoad={() => {
                            if (canvasRef.current && imageRef.current) {
                              canvasRef.current.width = imageRef.current.naturalWidth
                              canvasRef.current.height = imageRef.current.naturalHeight
                            }
                          }}
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white min-h-[300px]">
                        <div className="text-center">
                          <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Cliquez sur "Choisir une image" pour commencer</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Liste des détections */}
              {predictions.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Objets détectés:</h3>
                  <div className="flex flex-wrap gap-2">
                    {predictions.map((prediction, index) => (
                      <Badge key={index} variant="outline">
                        {prediction.class} ({(prediction.score * 100).toFixed(1)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette application utilise TensorFlow.js avec le modèle COCO-SSD pour détecter 
              des objets en temps réel dans votre flux webcam ou dans des images uploadées. 
              Le modèle peut identifier 80 classes d'objets différents incluant des personnes, 
              des véhicules, des animaux, et des objets du quotidien.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
