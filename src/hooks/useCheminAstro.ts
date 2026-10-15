import { useEffect, useState } from "react";

function normaliserChemin(chemin: string) {
  if (!chemin || chemin === "") return "/";
  return chemin.length > 1 && chemin.endsWith("/")
    ? chemin.slice(0, -1)
    : chemin;
}

function estCheminCourant(cheminActuel: string, href: string) {
  const chemin = normaliserChemin(cheminActuel);
  const cible = normaliserChemin(href);
  return (
    chemin === cible || (cible !== "/" && chemin.startsWith(`${cible}/`))
  );
}

/**
 * Suit le pathname avec les view transitions Astro.
 */
export function useCheminAstro(cheminInitial = "/") {
  const [chemin, setChemin] = useState(normaliserChemin(cheminInitial));

  useEffect(() => {
    const synchroniser = () =>
      setChemin(normaliserChemin(window.location.pathname));
    synchroniser();
    document.addEventListener("astro:page-load", synchroniser);
    document.addEventListener("astro:after-swap", synchroniser);
    return () => {
      document.removeEventListener("astro:page-load", synchroniser);
      document.removeEventListener("astro:after-swap", synchroniser);
    };
  }, []);

  const estCourant = (href: string) => estCheminCourant(chemin, href);

  return { chemin, estCourant };
}
