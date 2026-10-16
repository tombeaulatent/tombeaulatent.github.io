export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/curriculum-vitae", label: "Curriculum vitæ" },
];
