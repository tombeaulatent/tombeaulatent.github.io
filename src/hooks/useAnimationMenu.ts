import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Animation GSAP de l’overlay menu mobile (ouverture / fermeture).
 * Respecte prefers-reduced-motion : bascule instantanée sans timeline.
 */
export function useAnimationMenu(ouvert: boolean) {
  // Conteneur plein écran du menu (clip-path + opacité)
  const refOverlay = useRef<HTMLDivElement>(null);
  // Liens de navigation   remplis via definirRefLien(index)
  const refsLiens = useRef<(HTMLAnchorElement | null)[]>([]);
  // Titre / nom en haut de l’overlay
  const refMeta = useRef<HTMLParagraphElement>(null);
  // Pied de page de l’overlay
  const refPied = useRef<HTMLParagraphElement>(null);
  // Timeline en cours   tuée avant chaque nouvelle animation
  const refTimeline = useRef<gsap.core.Timeline | null>(null);
  // Premier passage : pose l’état caché sans animer la fermeture initiale
  const dejaInitialise = useRef(false);
  // Miroir de prefers-reduced-motion (mis à jour par matchMedia)
  const reduireMouvementRef = useRef(false);

  // Suit la préférence système « réduire les animations »
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduireMouvementRef.current = media.matches;
    const surChangement = () => {
      reduireMouvementRef.current = media.matches;
    };
    media.addEventListener("change", surChangement);
    return () => media.removeEventListener("change", surChangement);
  }, []);

  useEffect(() => {
    const overlay = refOverlay.current;
    if (!overlay) return;

    // Init : overlay et contenus invisibles, sans jouer la timeline de fermeture
    if (!dejaInitialise.current) {
      dejaInitialise.current = true;
      gsap.set(overlay, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
      gsap.set([refMeta.current, refPied.current, ...refsLiens.current], {
        autoAlpha: 0,
      });
      return;
    }

    const liens = refsLiens.current.filter(Boolean);
    const contenus = [refMeta.current, refPied.current, ...liens];

    // Réduction de mouvement : état final immédiat, pas de timeline
    if (reduireMouvementRef.current) {
      refTimeline.current?.kill();
      refTimeline.current = null;
      if (ouvert) {
        gsap.set(overlay, { clipPath: "inset(0 0 0% 0)", autoAlpha: 1 });
        gsap.set(contenus, { y: 0, autoAlpha: 1 });
      } else {
        gsap.set(contenus, { autoAlpha: 0 });
        gsap.set(overlay, {
          clipPath: "inset(0 0 100% 0)",
          autoAlpha: 0,
        });
      }
      return;
    }

    // Animation complète (ouverture ou fermeture)
    refTimeline.current?.kill();
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    refTimeline.current = timeline;

    if (ouvert) {
      timeline
        .fromTo(
          overlay,
          { clipPath: "inset(0 0 100% 0)", autoAlpha: 0.55 },
          { clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 0.5 },
        )
        .fromTo(
          refMeta.current,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3 },
          "-=0.22",
        )
        .fromTo(
          liens,
          { y: 36, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06 },
          "-=0.18",
        )
        .fromTo(
          refPied.current,
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.28 },
          "-=0.2",
        );
    } else {
      timeline
        .to(liens, { y: -10, autoAlpha: 0, duration: 0.18, stagger: 0.03 })
        .to(
          [refMeta.current, refPied.current],
          { autoAlpha: 0, duration: 0.12 },
          "<",
        )
        .to(overlay, {
          clipPath: "inset(0 0 100% 0)",
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.inOut",
        });
    }

    return () => {
      timeline.kill();
    };
  }, [ouvert]);

  // Callback ref par index   accepte null au démontage pour éviter les refs stale
  const definirRefLien = (index: number) => (el: HTMLAnchorElement | null) => {
    refsLiens.current[index] = el;
  };

  return {
    refOverlay,
    refMeta,
    refPied,
    definirRefLien,
  };
}
