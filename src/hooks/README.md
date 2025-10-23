# Custom Hooks

Ce dossier contient tous les hooks personnalisés réutilisables de l'application, suivant le **Hooks Pattern**.

## Architecture

### useCamera
**Responsabilité :** Gestion de la caméra et de la détection faciale

**Fonctionnalités :**
- Démarre/arrête la caméra
- Intègre la détection faciale (Mediapipe)
- Détecte l'orientation de la tête
- Gestion d'erreurs

**Usage :**
```tsx
const { videoRef, headOrientation, stopCamera } = useCamera({
  isActive: true,
  onError: (error) => console.error(error)
})
```

### usePhotoCapture
**Responsabilité :** Capture et téléchargement de photos

**Fonctionnalités :**
- Capture une frame vidéo sur canvas
- Effet flash lors de la capture
- Téléchargement des photos
- Conversion en JPEG

**Usage :**
```tsx
const { canvasRef, showFlash, capture, download } = usePhotoCapture()

// Capturer
const photo = await capture(videoRef, 'left')

// Télécharger
download(photo)
```

### useLivenessDetection
**Responsabilité :** Logique de détection de liveness

**Fonctionnalités :**
- Gestion du workflow de vérification
- Détection automatique des poses
- Progression à travers les étapes
- Déclenchement de capture automatique

**Usage :**
```tsx
const {
  status,
  currentPose,
  captures,
  progress,
  isCompleted,
  start,
  reset,
  addCapture
} = useLivenessDetection({
  headOrientation,
  onCaptureRequired: async (pose) => { /* ... */ },
  onComplete: () => { /* ... */ }
})
```

### useFaceDetection
**Responsabilité :** Détection faciale bas niveau (Mediapipe)

**Fonctionnalités :**
- Initialisation de Mediapipe Face Landmarker
- Calcul de l'orientation de la tête
- Gestion du flux vidéo
- Détection en temps réel

**Usage :**
```tsx
const { isReady, headOrientation, startCamera, stopCamera } = useFaceDetection()
```

## Avantages du pattern Hooks

1. **Réutilisabilité** : Chaque hook est indépendant et réutilisable
2. **Testabilité** : Les hooks peuvent être testés unitairement
3. **Séparation** : La logique est isolée des composants UI
4. **Composition** : Les hooks peuvent être combinés facilement
5. **Maintenabilité** : Plus facile de modifier ou déboguer une logique spécifique

## Hiérarchie

```
useFaceDetection (bas niveau - Mediapipe)
    ↓
useCamera (utilise useFaceDetection)
    ↓
useLivenessDetection (orchestration)
    ↓
LivenessCheckContainer (composition)
```

## Principes

- **Single Responsibility** : Chaque hook a une responsabilité unique
- **Pas de side effects cachés** : Tout est explicite via les paramètres
- **Callbacks pour la communication** : onCapture, onComplete, onError
- **Refs pour le DOM** : Retourne des refs pour les éléments HTML
