import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 18 C 15 8, 25 8, 35 18" stroke="hsl(var(--primary))" strokeWidth="3" />
    <path d="M20 3 C 15 8, 20 18, 28 17" stroke="hsl(var(--primary))" strokeWidth="2.5" />
    <text x="42" y="17" fontFamily="'PT Sans', sans-serif" fontSize="14" fill="hsl(var(--foreground))" fontWeight="bold">
      SafaiSetu
    </text>
  </svg>
);

export default Logo;
