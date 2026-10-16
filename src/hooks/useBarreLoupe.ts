import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import gsap from "gsap";

type MesuresLoupe = {
  tailleBase: number;
  tailleMax: number;
  distanceLoupe: number;
  hauteurBarre: number;
  hauteurCoquilleSurvol: number;
};

function lireVariableCss(nom: string, repli: number): number {
  const brut = getComputedStyle(document.documentElement)
    .getPropertyValue(nom)
    .trim();
  const valeur = parseFloat(brut);
  return Number.isFinite(valeur) ? valeur : repli;
}

function lireMesuresLoupe(): MesuresLoupe {
  return {
    tailleBase: lireVariableCss("--outillage-taille-base", 34),
    tailleMax: lireVariableCss("--outillage-taille-max", 56),
    distanceLoupe: lireVariableCss("--outillage-distance-loupe", 160),
    hauteurBarre: lireVariableCss("--outillage-hauteur-barre", 56),
    hauteurCoquilleSurvol: lireVariableCss(
      "--outillage-hauteur-coquille-survol",
      30,
    ),
  };
}

/** Magnification type macOS : distance souris → taille */
function tailleDepuisSouris(
  positionSourisX: number,
  centreElementX: number,
  mesures: MesuresLoupe,
) {
  let ecart = 0;

  if (!Number.isFinite(positionSourisX)) return mesures.tailleBase;
  ecart = Math.abs(positionSourisX - centreElementX);
  if (ecart >= mesures.distanceLoupe) return mesures.tailleBase;
  return (
    mesures.tailleMax -
    (ecart / mesures.distanceLoupe) *
      (mesures.tailleMax - mesures.tailleBase)
  );
}

/**
 * Effet loupe type dock macOS (GSAP) sur la barre d’outillage.
 */
export function useBarreLoupe() {
  const coquilleRef = useRef<HTMLDivElement>(null);
  const elementsRefs = useRef<(HTMLElement | null)[]>([]);
  const largeurVers = useRef<Array<ReturnType<typeof gsap.quickTo>>>([]);
  const hauteurVers = useRef<Array<ReturnType<typeof gsap.quickTo>>>([]);
  const hauteurCoquilleVers = useRef<ReturnType<typeof gsap.quickTo> | null>(
    null,
  );
  const mesuresRef = useRef<MesuresLoupe | null>(null);
  const reduireMouvementRef = useRef(false);

  const reinitialiserLoupe = useCallback(() => {
    const mesures = mesuresRef.current;
    if (!mesures) return;
    largeurVers.current.forEach((vers) => vers?.(mesures.tailleBase));
    hauteurVers.current.forEach((vers) => vers?.(mesures.tailleBase));
    hauteurCoquilleVers.current?.(mesures.hauteurBarre);
  }, []);

  const auMouvementSouris = useCallback((e: MouseEvent<HTMLElement>) => {
    const mesures = mesuresRef.current;

    if (reduireMouvementRef.current) return;
    if (!mesures) return;

    hauteurCoquilleVers.current?.(
      Math.max(
        mesures.hauteurCoquilleSurvol,
        mesures.tailleMax + mesures.tailleMax / 2 + 4,
      ),
    );

    elementsRefs.current.forEach((el, i) => {
      let rect: DOMRect | null = null;
      let taille = 0;

      if (!el) return;
      rect = el.getBoundingClientRect();
      taille = tailleDepuisSouris(
        e.clientX,
        rect.left + rect.width / 2,
        mesures,
      );
      largeurVers.current[i]?.(taille);
      hauteurVers.current[i]?.(taille);
    });
  }, []);

  const definirRefElement =
    (index: number) => (el: HTMLElement | null) => {
      elementsRefs.current[index] = el;
    };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const surChangement = () => {
      reduireMouvementRef.current = media.matches;
    };
    reduireMouvementRef.current = media.matches;
    media.addEventListener("change", surChangement);
    return () => media.removeEventListener("change", surChangement);
  }, []);

  useEffect(() => {
    const mesures = lireMesuresLoupe();
    const elements = elementsRefs.current.filter(Boolean) as HTMLElement[];
    const ressort = { duration: 0.35, ease: "power3.out" } as const;

    mesuresRef.current = mesures;

    largeurVers.current = elements.map((el) =>
      gsap.quickTo(el, "width", ressort),
    );
    hauteurVers.current = elements.map((el) =>
      gsap.quickTo(el, "height", ressort),
    );

    if (coquilleRef.current) {
      hauteurCoquilleVers.current = gsap.quickTo(
        coquilleRef.current,
        "height",
        ressort,
      );
      gsap.set(coquilleRef.current, { height: mesures.hauteurBarre });
    }

    elements.forEach((el) => {
      gsap.set(el, { width: mesures.tailleBase, height: mesures.tailleBase });
    });

    return () => {
      largeurVers.current = [];
      hauteurVers.current = [];
      hauteurCoquilleVers.current = null;
    };
  }, []);

  return {
    coquilleRef,
    definirRefElement,
    auMouvementSouris,
    reinitialiserLoupe,
  };
}
