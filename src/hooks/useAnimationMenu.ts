import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SEUIL_MENU_DESKTOP } from "./useMenuMobile";

/**
 * Animation GSAP de l’overlay menu mobile (ouverture / fermeture).
 * Respecte prefers-reduced-motion : bascule instantanée sans timeline.
 */
export function useAnimationMenu(ouvert: boolean) {
  // Conteneur plein écran du menu
  const refOverlay = useRef<HTMLDivElement>(null);
  // Liens de navigation ( remplis via definirRefLien(index) )
  const refsLiens = useRef<(HTMLAnchorElement | null)[]>([]);
  // Titre / nom en haut de l’overlay
  const refMeta = useRef<HTMLParagraphElement>(null);
  // Pied de page de l’overlay
  const refPied = useRef<HTMLParagraphElement>(null);
  // Timeline en cours ( tuée avant chaque nouvelle animation )
  const refTimeline = useRef<gsap.core.Timeline | null>(null);
  // Premier passage : pose l’état caché sans animer la fermeture initiale
  const dejaInitialise = useRef(false);
  // Miroir de prefers-reduced-motion (mis à jour par matchMedia)
  const reduireMouvementRef = useRef(false);
  // Toujours la dernière implémentation du reset (effets [] sans stale closure)
  const resetRef = useRef<() => void>(() => {});
  // Context GSAP longue durée (revert au démontage seulement)
  const ctxRef = useRef<gsap.Context | null>(null);

  // Callback ref par index — accepte null au démontage pour éviter les refs stale
  const definirRefLien = (index: number) => (el: HTMLAnchorElement | null) => {
    refsLiens.current[index] = el;
  };

  // Coupe l’anim et remet overlay + contenus à l’état fermé (ex. passage desktop)
  resetRef.current = () => {
    const overlay = refOverlay.current;
    const contenus = [refMeta.current, refPied.current, ...refsLiens.current].filter(
      Boolean,
    );
    refTimeline.current?.kill();
    refTimeline.current = null;
    if (!overlay) return;
    gsap.set(overlay, {
      clipPath: "inset(0 0 100% 0)",
      autoAlpha: 0,
    });
    if (contenus.length > 0) {
      gsap.set(contenus, { y: 0, autoAlpha: 0, clearProps: "transform" });
    }
  };

  // Suit la préférence système (réduire les animations)
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const surChangement = () => {
      reduireMouvementRef.current = media.matches;
    };
    reduireMouvementRef.current = media.matches;
    media.addEventListener("change", surChangement);
    return () => media.removeEventListener("change", surChangement);
  }, []);

  // Sécurité resize : reset GSAP quand on passe en format PC
  useEffect(() => {
    const media = window.matchMedia(
      `(min-width: ${SEUIL_MENU_DESKTOP}px)`,
    );
    const surDesktop = () => {
      if (media.matches) resetRef.current();
    };
    surDesktop();
    media.addEventListener("change", surDesktop);
    return () => media.removeEventListener("change", surDesktop);
  }, []);

  // View transitions Astro : header persisté et reset styles GSAP à chaque page
  useEffect(() => {
    const surPageLoad = () => resetRef.current();
    document.addEventListener("astro:page-load", surPageLoad);
    return () => document.removeEventListener("astro:page-load", surPageLoad);
  }, []);

  // Context GSAP : scope + revert uniquement au démontage
  useLayoutEffect(() => {
    ctxRef.current = gsap.context(() => {}, refOverlay);
    return () => {
      resetRef.current();
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  // Cache/montre le menu avant l’affichage de la frame (évite un flash visible)
  useLayoutEffect(() => {
    const overlay = refOverlay.current;
    const ctx = ctxRef.current;
    if (!overlay || !ctx) return;

    let timeline: gsap.core.Timeline | null = null;

    ctx.add(() => {
      const liens = refsLiens.current.filter(Boolean);
      // Ignore meta/pied absents du DOM pour ne pas casser GSAP
      const contenus = [refMeta.current, refPied.current, ...liens].filter(
        Boolean,
      );

      // En desktop l’overlay est display:none — pas d’anim
      if (window.matchMedia(`(min-width: ${SEUIL_MENU_DESKTOP}px)`).matches) {
        resetRef.current();
        return;
      }

      // Initialisation : overlay et contenus invisibles, sans jouer la timeline de fermeture
      if (!dejaInitialise.current) {
        dejaInitialise.current = true;
        gsap.set(overlay, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
        if (contenus.length > 0) gsap.set(contenus, { autoAlpha: 0 });
        return;
      }

      // Réduction de mouvement : état final immédiat, pas de timeline
      if (reduireMouvementRef.current) {
        refTimeline.current?.kill();
        refTimeline.current = null;
        if (ouvert) {
          gsap.set(overlay, { clipPath: "inset(0 0 0% 0)", autoAlpha: 1 });
          if (contenus.length > 0) gsap.set(contenus, { y: 0, autoAlpha: 1 });
        } else {
          resetRef.current();
        }
        return;
      }

      // Animation complète (ouverture ou fermeture)
      refTimeline.current?.kill();
      timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      refTimeline.current = timeline;

      if (ouvert) {
        timeline.fromTo(
          overlay,
          { clipPath: "inset(0 0 100% 0)", autoAlpha: 0.55 },
          { clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 0.5 },
        );
        if (refMeta.current) {
          timeline.fromTo(
            refMeta.current,
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.3 },
            "-=0.22",
          );
        }
        if (liens.length > 0) {
          timeline.fromTo(
            liens,
            { y: 36, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06 },
            "-=0.18",
          );
        }
        if (refPied.current) {
          timeline.fromTo(
            refPied.current,
            { y: 10, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.28 },
            "-=0.2",
          );
        }
      } else {
        if (liens.length > 0) {
          timeline.to(liens, {
            y: -10,
            autoAlpha: 0,
            duration: 0.18,
            stagger: 0.03,
          });
        }
        const metaPied = [refMeta.current, refPied.current].filter(Boolean);
        if (metaPied.length > 0) {
          timeline.to(metaPied, { autoAlpha: 0, duration: 0.12 }, "<");
        }
        timeline.to(overlay, {
          clipPath: "inset(0 0 100% 0)",
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.inOut",
        });
      }
    });

    return () => {
      timeline?.kill();
      refTimeline.current = null;
    };
  }, [ouvert]);

  return {
    refOverlay,
    refMeta,
    refPied,
    definirRefLien,
  };
}
