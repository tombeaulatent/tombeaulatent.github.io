import { SITE } from "./site";

export const ICONES = {
  instagram: "/icons/instagram.svg",
  soundcloud: "/icons/soundcloud.svg",
  play: "/icons/play.svg",
  pause: "/icons/pause.svg",
  close: "/icons/close.svg",
} as const;

export type NomIcone = keyof typeof ICONES;

export type OutilLien = {
  kind: "lien";
  id: string;
  href: string;
  libelle: string;
  icone: NomIcone;
};

export type OutilLecteur = {
  kind: "lecteur";
  id: string;
};

export type Outil = OutilLien | OutilLecteur;

export const OUTILS: Outil[] = [
  {
    kind: "lien",
    id: "instagram",
    href: SITE.reseaux.instagram,
    libelle: "Instagram",
    icone: "instagram",
  },
  {
    kind: "lien",
    id: "soundcloud",
    href: SITE.reseaux.soundcloud,
    libelle: "SoundCloud",
    icone: "soundcloud",
  },
  { kind: "lecteur", id: "lecteur" },
];
