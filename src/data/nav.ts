export type NavLink = {
  href: string;
  label: string;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/live-coding", label: "Live coding" },
  { href: "/tatouage", label: "Tatouage" },
  { href: "/curriculum-vitae", label: "Curriculum vitæ" },
];

export const SITE = {
  name: "TombeauLatent",
};
