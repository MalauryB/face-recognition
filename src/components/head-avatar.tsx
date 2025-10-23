interface HeadAvatarProps {
  direction: "left" | "center" | "right"
  className?: string
}

export function HeadAvatar({ direction, className = "" }: HeadAvatarProps) {
  // Tête tournée vers la GAUCHE
  if (direction === "left") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Fond */}
        <circle cx="24" cy="24" r="20" fill="#E0F2FE" />
        {/* Visage ovale tourné à gauche */}
        <ellipse cx="20" cy="24" rx="12" ry="15" fill="#0EA5E9" />
        {/* Oreille droite visible */}
        <ellipse cx="30" cy="24" rx="3" ry="5" fill="#0284C7" />
        {/* Œil visible (gauche) */}
        <circle cx="18" cy="22" r="2.5" fill="white" />
        <circle cx="18" cy="22" r="1.5" fill="#1e293b" />
        {/* Nez profile */}
        <path d="M14 24 L12 26" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        {/* Bouche */}
        <path d="M14 28 Q16 30 18 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  // Tête tournée vers la DROITE
  if (direction === "right") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Fond */}
        <circle cx="24" cy="24" r="20" fill="#E0F2FE" />
        {/* Visage ovale tourné à droite */}
        <ellipse cx="28" cy="24" rx="12" ry="15" fill="#0EA5E9" />
        {/* Oreille gauche visible */}
        <ellipse cx="18" cy="24" rx="3" ry="5" fill="#0284C7" />
        {/* Œil visible (droit) */}
        <circle cx="30" cy="22" r="2.5" fill="white" />
        <circle cx="30" cy="22" r="1.5" fill="#1e293b" />
        {/* Nez profile */}
        <path d="M34 24 L36 26" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        {/* Bouche */}
        <path d="M34 28 Q32 30 30 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  // Tête de FACE (centre)
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fond */}
      <circle cx="24" cy="24" r="20" fill="#E0F2FE" />
      {/* Visage de face */}
      <circle cx="24" cy="24" r="13" fill="#0EA5E9" />
      {/* Oreilles */}
      <ellipse cx="11" cy="24" rx="2.5" ry="4" fill="#0284C7" />
      <ellipse cx="37" cy="24" rx="2.5" ry="4" fill="#0284C7" />
      {/* Œil gauche */}
      <circle cx="19" cy="22" r="2.5" fill="white" />
      <circle cx="19" cy="22" r="1.5" fill="#1e293b" />
      {/* Œil droit */}
      <circle cx="29" cy="22" r="2.5" fill="white" />
      <circle cx="29" cy="22" r="1.5" fill="#1e293b" />
      {/* Nez */}
      <circle cx="24" cy="26" r="1.5" fill="#0284C7" />
      {/* Bouche souriante */}
      <path d="M19 29 Q24 32 29 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
