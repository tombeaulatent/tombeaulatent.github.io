import { useEffect, useId, useState, type CSSProperties } from "react";
import { SITE } from "../../data/site";
import { ICONES, OUTILS, type NomIcone } from "../../data/outillage";
import {
  formaterTemps,
  useLecteurAudio,
} from "../../hooks/useLecteurAudio";
import { useBarreLoupe } from "../../hooks/useBarreLoupe";

function IconeOutillage({ nom }: { nom: NomIcone }) {
  return (
    <span
      className="outillage-icon"
      style={{ "--outillage-icon": `url(${ICONES[nom]})` } as CSSProperties}
      aria-hidden="true"
    />
  );
}

export default function Outillage() {
  const [lecteurOuvert, setLecteurOuvert] = useState(false);
  const idLecteur = useId();

  const {
    enLecture,
    progression,
    duree,
    tempsActuel,
    demarrer,
    basculerLecture,
    allerA,
  } = useLecteurAudio();

  const {
    coquilleRef,
    definirRefElement,
    auMouvementSouris,
    reinitialiserLoupe,
  } = useBarreLoupe();

  const ouvrirLecteur = () => {
    setLecteurOuvert(true);
    if (!enLecture) demarrer();
  };

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLecteurOuvert(false);
    };

    if (!lecteurOuvert) return;
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [lecteurOuvert]);

  return (
    <div className="outillage" data-astro-transition-persist="outillage">
      <div
        id={idLecteur}
        className={`outillage-player${lecteurOuvert ? " is-open" : ""}`}
        role="region"
        aria-label="Lecteur audio"
        aria-hidden={!lecteurOuvert}
      >
        <div className="outillage-player-meta">
          <span className="outillage-player-title">{SITE.audio.titre}</span>
          <span className="outillage-player-artist">{SITE.audio.artiste}</span>
        </div>

        <div className="outillage-player-controls">
          <button
            type="button"
            className="outillage-btn outillage-btn-play"
            onClick={basculerLecture}
            aria-label={enLecture ? "Pause" : "Lecture"}
          >
            <IconeOutillage nom={enLecture ? "pause" : "play"} />
          </button>

          <div className="outillage-progress">
            <button
              type="button"
              className="outillage-progress-track"
              aria-label="Position dans la piste"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.min(
                  1,
                  Math.max(0, (e.clientX - rect.left) / rect.width),
                );
                allerA(ratio);
              }}
            >
              <span
                className="outillage-progress-fill"
                style={{ transform: `scaleX(${progression})` }}
              />
            </button>
            <div className="outillage-progress-times">
              <span>{formaterTemps(tempsActuel)}</span>
              <span>{formaterTemps(duree)}</span>
            </div>
          </div>

          <button
            type="button"
            className="outillage-btn"
            onClick={() => setLecteurOuvert(false)}
            aria-label="Fermer le lecteur"
          >
            <IconeOutillage nom="close" />
          </button>
        </div>
      </div>

      <div className="outillage-shell" ref={coquilleRef}>
        <nav
          className="outillage-bar"
          aria-label="Outillage"
          onMouseMove={auMouvementSouris}
          onMouseLeave={reinitialiserLoupe}
        >
          {OUTILS.map((outil, index) => {
            if (outil.kind === "lien") {
              return (
                <a
                  key={outil.id}
                  ref={definirRefElement(index)}
                  className="outillage-item"
                  href={outil.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={outil.libelle}
                >
                  <IconeOutillage nom={outil.icone} />
                </a>
              );
            }

            return (
              <button
                key={outil.id}
                ref={definirRefElement(index)}
                type="button"
                className={`outillage-item outillage-item-trigger${
                  lecteurOuvert || enLecture ? " is-active" : ""
                }`}
                aria-expanded={lecteurOuvert}
                aria-controls={idLecteur}
                aria-label={
                  lecteurOuvert ? "Masquer le lecteur" : "Ouvrir le lecteur"
                }
                onClick={() => {
                  if (lecteurOuvert) setLecteurOuvert(false);
                  else ouvrirLecteur();
                }}
              >
                <IconeOutillage
                  nom={enLecture && !lecteurOuvert ? "pause" : "play"}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
