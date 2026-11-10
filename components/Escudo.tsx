// Logotipo: escudo con palomita (decorativo; el nombre de la marca va en texto).
export function Escudo({ size = 34 }: { size?: number }) {
  return (
    <svg className="marca-escudo" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <path d="M17 2l13 5v9c0 8.5-5.6 13.6-13 16-7.4-2.4-13-7.5-13-16V7z" fill="#0A3F46" />
      <path d="M11 17l4.2 4.2L23.5 13" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
