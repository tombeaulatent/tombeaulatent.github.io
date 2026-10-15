import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { NAV_LINKS, SITE } from "../../data/nav";

type SiteHeaderProps = {
  currentPath?: string;
};

function normalizePath(path: string) {
  if (!path || path === "") return "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isCurrent(pathname: string, href: string) {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  return (
    path === target || (target !== "/" && path.startsWith(`${target}/`))
  );
}

export default function SiteHeader({ currentPath = "/" }: SiteHeaderProps) {
  const [pathname, setPathname] = useState(normalizePath(currentPath));
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const titleId = useId();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    const syncPath = () => setPathname(normalizePath(window.location.pathname));
    syncPath();
    document.addEventListener("astro:page-load", syncPath);
    document.addEventListener("astro:after-swap", syncPath);
    return () => {
      document.removeEventListener("astro:page-load", syncPath);
      document.removeEventListener("astro:after-swap", syncPath);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (!bootedRef.current) {
      bootedRef.current = true;
      gsap.set(overlay, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
      gsap.set([metaRef.current, footerRef.current, ...linksRef.current], {
        autoAlpha: 0,
      });
      return;
    }

    tlRef.current?.kill();
    const links = linksRef.current.filter(Boolean);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    if (open) {
      tl.fromTo(
        overlay,
        { clipPath: "inset(0 0 100% 0)", autoAlpha: 0.55 },
        { clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 0.5 },
      )
        .fromTo(
          metaRef.current,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3 },
          "-=0.22",
        )
        .fromTo(
          links,
          { y: 36, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06 },
          "-=0.18",
        )
        .fromTo(
          footerRef.current,
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.28 },
          "-=0.2",
        );
    } else {
      tl.to(links, { y: -10, autoAlpha: 0, duration: 0.18, stagger: 0.03 })
        .to(
          [metaRef.current, footerRef.current],
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
      tl.kill();
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="nav-pill-wrap" data-astro-transition-persist="nav">
        <nav className={`nav-glass${open ? " is-open" : ""}`} aria-label="Principale">
          <a className="nav-brand" href="/" onClick={closeMenu}>
            - - -
          </a>

          {/* Desktop : liens dans la barre glass */}
          <ul className="nav-desktop">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className={`nav-desktop-link${
                    isCurrent(pathname, link.href) ? " is-current" : ""
                  }`}
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile uniquement */}
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls={titleId}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </header>

      {/* Overlay mobile uniquement (CSS le masque dès 900px) */}
      <div
        ref={overlayRef}
        id={titleId}
        className={`menu-overlay${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation mobile"
        aria-hidden={!open}
      >
        <div className="menu-stage">
          <p className="menu-meta" ref={metaRef}>
            {SITE.name}
          </p>
          <ul className="menu-list">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href}>
                <a
                  ref={(el) => {
                    if (el) linksRef.current[i] = el;
                  }}
                  className={`menu-link${
                    isCurrent(pathname, link.href) ? " is-current" : ""
                  }`}
                  href={link.href}
                  onClick={closeMenu}
                >
                  <span className="idx">0{i + 1}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="menu-footer" ref={footerRef}>
            protocol://tombeaulatent.com
          </p>
        </div>
      </div>
    </>
  );
}
