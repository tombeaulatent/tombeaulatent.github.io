import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SEUIL_MENU_DESKTOP } from "./useMenuMobile";

const CLIP_FERME = "inset(0 0 100% 0)";
const CLIP_OUVERT = "inset(0 0 0% 0)";

/**
 * Animation GSAP de l’overlay menu mobile (ouverture / fermeture).
 * Respecte prefers-reduced-motion : bascule instantanée sans timeline.
 */
export function useAnimationMenu(ouvert: boolean) {
  // Conteneur plein écran du menu
  const refOverlay = useRef<HTMLDivElement>(null);
  // Liens de navigation (remplis via definirRefLien(index))
  const refsLiens = useRef<(HTMLAnchorElement | null)[]>([]);
  // Premier passage : pose l’état caché sans animer la fermeture initiale
  const dejaInitialise = useRef(false);
  // Miroir de prefers-reduced-motion (mis à jour par matchMedia)
  const reduireMouvementRef = useRef(false);

  // Callback ref par index — accepte null au démontage pour éviter les refs stale
  const definirRefLien = (index: number) => (el: HTMLAnchorElement | null) => {
    refsLiens.current[index] = el;
  };

  const liensActifs = () =>
    refsLiens.current.filter((el): el is HTMLAnchorElement => el != null);

  const appliquerEtatFerme = () => {
    const overlay = refOverlay.current;
    const liens = liensActifs();
    if (!overlay) return;
    gsap.set(overlay, { clipPath: CLIP_FERME, autoAlpha: 0 });
    if (liens.length > 0) {
      gsap.set(liens, { y: 0, autoAlpha: 0, clearProps: "transform" });
    }
  };

  // Suit la préférence système (réduire les animations)
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const surChangement = () => {
      reduireMouvementRef.current = media.matches;
    };
    surChangement();
    media.addEventListener("change", surChangement);
    return () => media.removeEventListener("change", surChangement);
  }, []);

  // Resize desktop + navigation Astro : reset styles GSAP
  useEffect(() => {
    const media = window.matchMedia(
      `(min-width: ${SEUIL_MENU_DESKTOP}px)`,
    );
    const surDesktop = () => {
      if (media.matches) appliquerEtatFerme();
    };
    const surSwap = () => appliquerEtatFerme();

    surDesktop();
    media.addEventListener("change", surDesktop);
    document.addEventListener("astro:after-swap", surSwap);
    return () => {
      media.removeEventListener("change", surDesktop);
      document.removeEventListener("astro:after-swap", surSwap);
    };
  }, []);

  // Cache/montre le menu avant l’affichage de la frame (évite un flash visible)
  useLayoutEffect(() => {
    const overlay = refOverlay.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      const liens = liensActifs();

      // En desktop l’overlay est display:none — pas d’anim
      if (window.matchMedia(`(min-width: ${SEUIL_MENU_DESKTOP}px)`).matches) {
        appliquerEtatFerme();
        return;
      }

      // Init : caché sans jouer la fermeture ; si déjà ouvert, on enchaîne
      if (!dejaInitialise.current) {
        dejaInitialise.current = true;
        gsap.set(overlay, { autoAlpha: 0, clipPath: CLIP_FERME });
        if (liens.length > 0) gsap.set(liens, { autoAlpha: 0 });
        if (!ouvert) return;
      }

      // Réduction de mouvement : état final immédiat
      if (reduireMouvementRef.current) {
        if (ouvert) {
          gsap.set(overlay, { clipPath: CLIP_OUVERT, autoAlpha: 1 });
          if (liens.length > 0) gsap.set(liens, { y: 0, autoAlpha: 1 });
        } else {
          appliquerEtatFerme();
        }
        return;
      }

      // from/to explicites : survivent au ctx.revert() du cleanup précédent
      if (ouvert) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          overlay,
          { clipPath: CLIP_FERME, autoAlpha: 0.55 },
          { clipPath: CLIP_OUVERT, autoAlpha: 1, duration: 0.5 },
        );
        if (liens.length > 0) {
          tl.fromTo(
            liens,
            { y: 36, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06 },
            "-=0.18",
          );
        }
      } else {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (liens.length > 0) {
          tl.fromTo(
            liens,
            { y: 0, autoAlpha: 1 },
            { y: -10, autoAlpha: 0, duration: 0.18, stagger: 0.03 },
          );
        }
        tl.fromTo(
          overlay,
          { clipPath: CLIP_OUVERT, autoAlpha: 1 },
          {
            clipPath: CLIP_FERME,
            autoAlpha: 0,
            duration: 0.35,
            ease: "power2.inOut",
          },
          liens.length > 0 ? "<" : undefined,
        );
      }
    }, refOverlay);

    return () => ctx.revert();
  }, [ouvert]);

  return {
    refOverlay,
    definirRefLien,
  };
}
