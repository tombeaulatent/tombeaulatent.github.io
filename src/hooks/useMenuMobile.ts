import { useEffect, useState } from "react";

/** Doit rester aligné avec les media queries de menu.css */
export const SEUIL_MENU_DESKTOP = 900;

/**
 * État du menu hamburger mobile : ouverture, Escape, resize, scroll lock.
 */
export function useMenuMobile() {
  const [ouvert, setOuvert] = useState(false);

  const fermerMenu = () => setOuvert(false);
  const basculerMenu = () => setOuvert((v) => !v);

  useEffect(() => {
    const media = window.matchMedia(
      `(min-width: ${SEUIL_MENU_DESKTOP}px)`,
    );
    const surChangement = () => {
      if (media.matches) setOuvert(false);
    };
    surChangement();
    media.addEventListener("change", surChangement);
    return () => media.removeEventListener("change", surChangement);
  }, []);

  // View transitions : fermer après un vrai swap (pas le page-load initial)
  useEffect(() => {
    const surSwap = () => setOuvert(false);
    document.addEventListener("astro:after-swap", surSwap);
    return () => document.removeEventListener("astro:after-swap", surSwap);
  }, []);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  useEffect(() => {
    document.body.style.overflow = ouvert ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  return {
    ouvert,
    setOuvert,
    fermerMenu,
    basculerMenu,
  };
}
