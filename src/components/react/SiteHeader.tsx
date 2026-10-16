import { useEffect, useId, useRef } from "react";
import { NAV_LINKS } from "../../data/nav";
import { SITE } from "../../data/site";
import { useCheminAstro } from "../../hooks/useCheminAstro";
import { useMenuMobile } from "../../hooks/useMenuMobile";
import { useAnimationMenu } from "../../hooks/useAnimationMenu";

type SiteHeaderProps = {
  currentPath?: string;
};

export default function SiteHeader({ currentPath = "/" }: SiteHeaderProps) {
  const idMenu = useId();
  const refToggle = useRef<HTMLButtonElement>(null);
  const aDejaEteOuvert = useRef(false);
  const { estCourant } = useCheminAstro(currentPath);
  const { ouvert, fermerMenu, basculerMenu } = useMenuMobile();
  const { refOverlay, refMeta, refPied, definirRefLien } =
    useAnimationMenu(ouvert);

  useEffect(() => {
    if (ouvert) {
      aDejaEteOuvert.current = true;
      refOverlay.current?.querySelector<HTMLElement>("a")?.focus();
      return;
    }
    if (aDejaEteOuvert.current) refToggle.current?.focus();
  }, [ouvert, refOverlay]);

  useEffect(() => {
    const overlay = refOverlay.current;
    if (!ouvert || !overlay) return;

    const surTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = [
        ...overlay.querySelectorAll<HTMLElement>("a[href], button"),
      ];
      if (focusables.length === 0) return;
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };

    overlay.addEventListener("keydown", surTab);
    return () => overlay.removeEventListener("keydown", surTab);
  }, [ouvert, refOverlay]);

  return (
    <>
      <header className="nav-pill-wrap">
        <nav className={`nav-glass${ouvert ? " is-open" : ""}`} aria-label="Principale">
          <ul className="nav-desktop">
            {NAV_LINKS.map((lien) => {
              const courant = estCourant(lien.href);
              return (
                <li key={lien.href}>
                  <a
                    className={`nav-desktop-link${courant ? " active" : ""}`}
                    href={lien.href}
                    aria-current={courant ? "page" : undefined}
                  >
                    {lien.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            ref={refToggle}
            type="button"
            className="nav-toggle"
            aria-expanded={ouvert}
            aria-controls={idMenu}
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={basculerMenu}
          >
            <span className="nav-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </header>

      <div
        ref={refOverlay}
        id={idMenu}
        className={`menu-overlay${ouvert ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation mobile"
        aria-hidden={!ouvert}
      >
        <div className="menu-stage">
          <p className="menu-meta" ref={refMeta}>
            {SITE.nom}
          </p>
          <ul className="menu-list">
            {NAV_LINKS.map((lien, i) => {
              const courant = estCourant(lien.href);
              return (
                <li key={lien.href}>
                  <a
                    ref={definirRefLien(i)}
                    className={`menu-link${courant ? " active" : ""}`}
                    href={lien.href}
                    aria-current={courant ? "page" : undefined}
                    onClick={fermerMenu}
                  >
                    <span className="idx">0{i + 1}</span>
                    {lien.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
