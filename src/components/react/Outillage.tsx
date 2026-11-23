import { useEffect, useId, useState, type CSSProperties } from "react";
import { MUSIQUE } from "../../data/musique";
import {formaterTemps,useLecteurAudio} from "../../hooks/useLecteurAudio";
import { useBarreLoupe } from "../../hooks/useBarreLoupe";

function IconeOutillage({ src }: { src: string }) {
  return (
    <span
      className="outillage-icon"
      style={{ "--outillage-icon": `url(${src})` } as CSSProperties}
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
    erreurChargement,
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
          <span className="outillage-player-title">{MUSIQUE.titre}</span>
          <span className="outillage-player-artist">{MUSIQUE.artiste}</span>
          {erreurChargement && (
            <span className="outillage-player-error" role="alert">
              Impossible de charger l’audio
            </span>
          )}
        </div>

        <div className="outillage-player-controls">
          <button
            type="button"
            className="outillage-btn outillage-btn-play"
            onClick={basculerLecture}
            aria-label={enLecture ? "Pause" : "Lecture"}
            disabled={erreurChargement}
          >
            <IconeOutillage
              src={enLecture ? "/icons/pause.svg" : "/icons/play.svg"}
            />
          </button>

          <div className="outillage-progress">
            <input
              type="range"
              className="outillage-progress-track"
              min={0}
              max={1}
              step={0.001}
              value={progression}
              aria-label="Position dans la piste"
              aria-valuetext={formaterTemps(tempsActuel)}
              disabled={erreurChargement || duree === 0}
              onChange={(e) => allerA(Number(e.target.value))}
            />
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
            <IconeOutillage src="/icons/close.svg" />
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
          <a
            ref={definirRefElement(0)}
            className="outillage-item"
            href="https://www.instagram.com/tombeaulatent"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <IconeOutillage src="/icons/instagram.svg" />
          </a>

          <a
            ref={definirRefElement(1)}
            className="outillage-item"
            href="https://soundcloud.com/tombeaulatent"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SoundCloud"
          >
            <IconeOutillage src="/icons/soundcloud.svg" />
          </a>

          <button
            ref={definirRefElement(2)}
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
              src={
                enLecture && !lecteurOuvert
                  ? "/icons/pause.svg"
                  : "/icons/play.svg"
              }
            />
          </button>
        </nav>
      </div>
    </div>
  );
}
