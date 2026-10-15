import { useId } from "react";
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
  const { estCourant } = useCheminAstro(currentPath);
  const { ouvert, fermerMenu, basculerMenu } = useMenuMobile();
  const { refOverlay, refMeta, refPied, definirRefLien } =
    useAnimationMenu(ouvert);

  return (
    <>
      <header className="nav-pill-wrap" data-astro-transition-persist="nav">
        <nav
          className={`nav-glass${ouvert ? " is-open" : ""}`}
          aria-label="Principale"
        >
          <a className="nav-brand" href="/" onClick={fermerMenu} />

          <ul className="nav-desktop">
            {NAV_LINKS.map((lien) => (
              <li key={lien.href}>
                <a
                  className={`nav-desktop-link${
                    estCourant(lien.href) ? " is-current" : ""
                  }`}
                  href={lien.href}
                >
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>

          <button
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
            {NAV_LINKS.map((lien, i) => (
              <li key={lien.href}>
                <a
                  ref={definirRefLien(i)}
                  className={`menu-link${
                    estCourant(lien.href) ? " is-current" : ""
                  }`}
                  href={lien.href}
                  onClick={fermerMenu}
                >
                  <span className="idx">0{i + 1}</span>
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="menu-footer" ref={refPied}>
            protocol://tombeaulatent.com
          </p>
        </div>
      </div>
    </>
  );
}
