# Liveness Check Components

Ce dossier contient les composants de vérification de liveness, suivant les patterns **Container/Presenter** et **Render Props**.

## Architecture

### Container/Presenter Pattern

#### LivenessCheckContainer
**Responsabilité :** Logique métier et orchestration des hooks

**Fonctionnalités :**
- Gestion de l'état de capture (idle, active, completed)
- Orchestration des hooks personnalisés (useCamera, usePhotoCapture, useLivenessDetection)
- Gestion des événements (start, reset, download)
- Pas de JSX complexe, délègue tout au Presenter

**Usage :**
```tsx
import LivenessCheck from '@/components/liveness-check'

function App() {
  return <LivenessCheck />
}
```

#### LivenessCheckPresenter
**Responsabilité :** Présentation pure (UI uniquement)

**Fonctionnalités :**
- Reçoit toutes les props du Container
- Compose les composants avec Render Props
- Aucune logique métier
- JSX uniquement

## Render Props Pattern

### LivenessVideoArea
**Responsabilité :** Zone vidéo avec personnalisation flexible

**Props de rendu :**
- `renderIdle`: Affichage en mode inactif
- `renderActive`: Affichage en mode actif (guide facial)
- `renderOverlay`: Overlays personnalisés (status, progression)
- `renderCompletion`: Message de complétion
- `children`: Fonction de rendu recevant l'état

**Usage :**
```tsx
<LivenessVideoArea
  videoRef={videoRef}
  canvasRef={canvasRef}
  state={{ status, progress, showFlash, isCompleted }}
  renderIdle={() => (
    <div>Caméra inactive</div>
  )}
  renderActive={() => (
    <div>Guide facial oval</div>
  )}
  renderOverlay={(state) => (
    <div>Status: {state.status}</div>
  )}
  renderCompletion={() => (
    <div>Terminé !</div>
  )}
/>
```

### LivenessStepsList
**Responsabilité :** Liste des étapes de vérification

**Props de rendu :**
- `renderStep`: Rendu d'une étape individuelle avec données enrichies
- `renderHeader`: En-tête personnalisé
- `children`: Fonction de rendu recevant toutes les étapes

**Données d'étape enrichies :**
```typescript
interface StepItemData {
  pose: PoseConfig         // Configuration de la pose
  index: number           // Index dans la liste
  isCaptured: boolean     // Étape capturée ?
  isCurrent: boolean      // Étape actuelle ?
}
```

**Usage :**
```tsx
<LivenessStepsList
  poses={POSES}
  captures={captures}
  currentPose={currentPose}
  status={status}
  renderStep={(stepData) => (
    <div className={stepData.isCurrent ? 'active' : ''}>
      {stepData.isCaptured && <CheckIcon />}
      <span>{stepData.pose.label}</span>
    </div>
  )}
/>
```

### LivenessCaptureGallery
**Responsabilité :** Galerie de photos capturées

**Props de rendu :**
- `renderCapture`: Rendu d'une capture individuelle avec métadonnées
- `renderHeader`: En-tête personnalisé (reçoit le compte)
- `renderEmpty`: État vide
- `children`: Fonction de rendu recevant toutes les captures

**Données de capture enrichies :**
```typescript
interface CaptureItemData {
  capture: Capture              // Données de capture brutes
  poseInfo: PoseConfig | undefined  // Info de la pose associée
  index: number                 // Index dans la liste
}
```

**Usage :**
```tsx
<LivenessCaptureGallery
  captures={captures}
  poses={POSES}
  onDownload={handleDownload}
  renderCapture={(itemData, onDownload) => (
    <div>
      <img src={itemData.capture.dataUrl} />
      <button onClick={() => onDownload(itemData.capture)}>
        Télécharger {itemData.poseInfo?.label}
      </button>
    </div>
  )}
  renderHeader={(count) => (
    <h3>{count} photos capturées</h3>
  )}
  renderEmpty={() => (
    <p>Aucune photo</p>
  )}
/>
```

## Avantages du Render Props Pattern

### 1. Flexibilité maximale
Les composants parents contrôlent totalement le rendu :
```tsx
// Version A : Simple
<LivenessStepsList
  renderStep={(step) => <div>{step.pose.label}</div>}
/>

// Version B : Complexe avec animations
<LivenessStepsList
  renderStep={(step) => (
    <motion.div animate={step.isCurrent ? 'active' : 'idle'}>
      <Avatar />
      <Progress />
      {step.pose.label}
    </motion.div>
  )}
/>
```

### 2. Réutilisabilité
Les composants avec Render Props sont réutilisables dans différents contextes :
```tsx
// UI Desktop
<LivenessCaptureGallery
  renderCapture={(data) => <DesktopCard {...data} />}
/>

// UI Mobile
<LivenessCaptureGallery
  renderCapture={(data) => <MobileCard {...data} />}
/>

// UI Admin Dashboard
<LivenessCaptureGallery
  renderCapture={(data) => <AdminDetailedView {...data} />}
/>
```

### 3. Données enrichies
Les composants préparent et enrichissent les données :
```tsx
// Pas besoin de faire ça manuellement :
const isCaptured = captures.some((c) => c.pose === pose.id)
const poseInfo = POSES.find((p) => p.id === capture.pose)

// Le composant le fait pour vous :
<LivenessStepsList
  renderStep={(stepData) => {
    // stepData.isCaptured déjà calculé ✅
    // stepData.isCurrent déjà calculé ✅
  }}
/>
```

### 4. Inversion de contrôle
Le parent décide COMMENT rendre, le composant décide QUAND et QUOI rendre :
```tsx
<LivenessVideoArea
  state={state}
  // Le composant décide : "Si status === 'idle', alors appeler renderIdle"
  renderIdle={() => {
    // Le parent décide : "Voici COMMENT afficher l'état idle"
    return <CustomIdleView />
  }}
/>
```

### 5. Testabilité
Facile de tester différents rendus sans modifier le composant :
```tsx
// Test 1 : Rendu minimal
render(
  <LivenessStepsList
    renderStep={(step) => <div>{step.index}</div>}
  />
)

// Test 2 : Rendu complet
render(
  <LivenessStepsList
    renderStep={(step) => <ComplexComponent {...step} />}
  />
)
```

## Structure des fichiers

```
liveness-check/
├── LivenessCheckContainer.tsx    # Logique (hooks, handlers)
├── LivenessCheckPresenter.tsx    # UI (composition)
├── LivenessVideoArea.tsx          # Render Props - Zone vidéo
├── LivenessStepsList.tsx          # Render Props - Liste étapes
├── LivenessCaptureGallery.tsx    # Render Props - Galerie photos
├── index.ts                       # Exports publics
└── README.md                      # Documentation
```

## Flux de données

```
Container (logique)
    ↓ props
Presenter (composition)
    ↓ render props
Render Props Components (données enrichies)
    ↓ fonction de rendu
UI finale définie par le parent
```

## Principes

1. **Séparation des responsabilités**
   - Container = Logique métier
   - Presenter = Composition UI
   - Render Props = Données + Flexibilité

2. **Composition over Configuration**
   - Plutôt que des dizaines de props booléennes, on utilise des fonctions de rendu

3. **Données enrichies**
   - Les composants préparent les données dérivées (isCaptured, poseInfo, etc.)

4. **Flexibilité sans complexité**
   - Le composant gère la complexité (état, calculs)
   - Le parent a la flexibilité (rendu personnalisé)

## Exemples d'utilisation avancée

### Utiliser `children` au lieu de `renderStep`
```tsx
<LivenessStepsList poses={POSES} captures={captures}>
  {(steps) => (
    <div className="custom-layout">
      {steps.map(step => (
        <CustomStepComponent key={step.index} {...step} />
      ))}
    </div>
  )}
</LivenessStepsList>
```

### Combinaison de plusieurs render props
```tsx
<LivenessVideoArea
  renderActive={() => <FaceGuide />}
  renderOverlay={(state) => (
    <>
      <StatusBadge status={state.status} />
      <ProgressRing progress={state.progress} />
    </>
  )}
>
  {/* children peut être combiné avec d'autres render props */}
  {(state) => <DebugInfo {...state} />}
</LivenessVideoArea>
```

### Rendu conditionnel personnalisé
```tsx
<LivenessCaptureGallery
  renderCapture={(data, onDownload) => {
    // Logique de rendu personnalisée
    if (data.poseInfo?.id === 'left') {
      return <SpecialLeftPoseCard {...data} />
    }
    return <StandardCard {...data} onDownload={onDownload} />
  }}
/>
```
