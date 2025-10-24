# Face Liveness Check

Une application web de vérification d'identité par détection de vivacité faciale utilisant MediaPipe et React.

[![Deploy to GitHub Pages](https://github.com/MalauryB/face-recognition/actions/workflows/deploy.yml/badge.svg)](https://github.com/MalauryB/face-recognition/actions/workflows/deploy.yml)

## Fonctionnalités

- **Détection de visage en temps réel** avec MediaPipe Face Landmarker
- **Vérification de vivacité** : capture de 3 angles (gauche, centre, droite)
- **Interface responsive** : fonctionne sur desktop et mobile
- **Feedback visuel** : indicateurs de progression et d'orientation
- **Export des captures** : téléchargement des photos capturées
- **Tests unitaires** : 53 tests avec 100% de réussite
- **Mode sombre/clair** : thème adaptatif

## Démo en ligne

**[https://malauryb.github.io/face-recognition/](https://malauryb.github.io/face-recognition/)**

## Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Navigateur moderne** supportant WebRTC (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/MalauryB/face-recognition.git
cd face-recognition
```

### 2. Installer les dépendances

```bash
npm install
```

## Commandes disponibles

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### Build

```bash
# Créer un build de production
npm run build

# Les fichiers compilés seront dans le dossier dist/
```

### Preview

```bash
# Prévisualiser le build de production localement
npm run preview
```

### Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec coverage
npm run test:coverage

# Lancer l'interface UI des tests
npm run test:ui
```

### Linting

```bash
# Vérifier le code avec ESLint
npm run lint
```

## Structure du projet

```
face-liveness-check/
├── src/
│   ├── components/           # Composants React
│   │   ├── liveness-check/   # Composants de vérification de vivacité
│   │   │   ├── LivenessCheckContainer.tsx
│   │   │   ├── LivenessCheckPresenter.tsx
│   │   │   ├── LivenessVideoArea.tsx
│   │   │   ├── LivenessStepsList.tsx
│   │   │   └── LivenessCaptureGallery.tsx
│   │   ├── ui/               # Composants UI (shadcn/ui)
│   │   ├── head-avatar.tsx   # Avatar de visualisation
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/                # Hooks React personnalisés
│   │   ├── use-camera.ts
│   │   ├── use-face-detection.ts
│   │   ├── use-liveness-detection.ts
│   │   └── use-photo-capture.ts
│   ├── types/                # Types TypeScript
│   │   └── liveness.ts
│   ├── lib/                  # Utilitaires
│   │   └── utils.ts
│   ├── test/                 # Configuration des tests
│   │   └── setup.ts
│   ├── App.tsx               # Composant principal
│   ├── main.tsx              # Point d'entrée
│   └── index.css             # Styles globaux
├── public/                   # Fichiers statiques
│   ├── logo.svg
│   └── favicon.svg
├── dist/                     # Build de production (généré)
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD GitHub Actions
├── jest.config.js            # Configuration Jest
├── vite.config.ts            # Configuration Vite
├── tsconfig.json             # Configuration TypeScript
├── tailwind.config.js        # Configuration Tailwind CSS
└── package.json
```

## Tests

Le projet utilise **Jest** et **React Testing Library** pour les tests unitaires.

### Couverture des tests

- **53 tests** au total
- **100% de réussite**
- Composants testés :
  - `use-photo-capture` (6 tests)
  - `use-liveness-detection` (10 tests)
  - `LivenessVideoArea` (16 tests)
  - `LivenessStepsList` (10 tests)
  - `LivenessCaptureGallery` (11 tests)

### Lancer les tests

```bash
# Tests simples
npm test

# Tests avec coverage détaillé
npm run test:coverage

# Interface UI interactive
npm run test:ui
```

## Architecture

### Pattern Render Props

Le projet utilise le **pattern Render Props** pour une flexibilité maximale :

```tsx
<LivenessVideoArea
  videoRef={videoRef}
  canvasRef={canvasRef}
  state={state}
  renderIdle={() => <div>Prêt à démarrer</div>}
  renderActive={() => <div>Détection en cours</div>}
  renderOverlay={(state) => <div>Progression: {state.progress}%</div>}
/>
```

### Hooks personnalisés

- **`useCamera`** : Gestion de la caméra et du flux vidéo
- **`useFaceDetection`** : Détection de visage avec MediaPipe
- **`useLivenessDetection`** : Logique de vérification de vivacité
- **`usePhotoCapture`** : Capture et export de photos

### Gestion d'état

- État local avec `useState` et `useRef`
- Pas de state management global (Redux/Zustand) - non nécessaire pour cette app

## Technologies

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI accessibles
- **MediaPipe** - Détection de visage et landmarks
- **Lucide React** - Icônes
- **Jest + Testing Library** - Tests

## Déploiement

### GitHub Pages (automatique)

Le projet est déployé automatiquement sur GitHub Pages via GitHub Actions à chaque push sur `main`.

**URL de production :** https://malauryb.github.io/face-recognition/

### Déploiement manuel

```bash
# Build pour production
npm run build

# Déployer le contenu du dossier dist/
# sur votre hébergeur (Vercel, Netlify, etc.)
```

## Permissions requises

L'application nécessite l'autorisation d'accès à la caméra :

```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
})
```

## Dépannage

### La caméra ne démarre pas

1. Vérifiez que votre navigateur supporte WebRTC
2. Autorisez l'accès à la caméra dans les paramètres du navigateur
3. Vérifiez que vous utilisez HTTPS (requis pour getUserMedia)

### Erreurs MediaPipe

Si vous voyez `ROI width and height must be > 0` :
- C'est normal au démarrage (la vidéo charge)
- Si ça persiste, rechargez la page

### Build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Licence

Ce projet est sous licence MIT.

## Auteur

**Malaury B**

- GitHub: [@MalauryB](https://github.com/MalauryB)
