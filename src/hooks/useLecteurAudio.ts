import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { SITE } from "../data/site";

export function formaterTemps(secondes: number) {
  let minutes = 0;
  let reste = 0;

  if (!Number.isFinite(secondes) || secondes < 0) return "0:00";

  minutes = Math.floor(secondes / 60);
  reste = Math.floor(secondes % 60);
  return `${minutes}:${reste.toString().padStart(2, "0")}`;
}

/**
 * Lecteur audio Howler   lecture, pause, seek, progression.
 */
export function useLecteurAudio() {
  const [enLecture, setEnLecture] = useState(false);
  const [progression, setProgression] = useState(0);
  const [duree, setDuree] = useState(0);
  const [erreurChargement, setErreurChargement] = useState(false);

  const sonRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);
  const dureeRef = useRef(0);

  const tempsActuel = duree * progression;

  const demarrer = () => {
    sonRef.current?.play();
  };

  const mettreEnPause = () => {
    sonRef.current?.pause();
  };

  const basculerLecture = () => {
    const son = sonRef.current;
    if (!son) return;
    if (son.playing()) son.pause();
    else son.play();
  };

  const allerA = (ratio: number) => {
    const son = sonRef.current;
    let d = 0;
    let borne = 0;

    if (!son) return;
    d = son.duration();
    if (!d) return;
    borne = Math.min(1, Math.max(0, ratio));
    son.seek(borne * d);
    setProgression(borne);
  };

  useEffect(() => {
    const son = new Howl({
      src: [SITE.audio.source],
      html5: true,
      loop: true,
      volume: 0.55,
      onload: () => {
        const d = son.duration();
        dureeRef.current = d;
        setDuree(d);
        setErreurChargement(false);
      },
      onloaderror: () => {
        setErreurChargement(true);
      },
      onplay: () => setEnLecture(true),
      onpause: () => setEnLecture(false),
      onstop: () => setEnLecture(false),
      onend: () => setEnLecture(false),
    });
    sonRef.current = son;

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      son.unload();
      sonRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const son = sonRef.current;
      let d = 0;
      let position = 0;

      if (son?.playing()) {
        d = son.duration() || dureeRef.current;
        position = (son.seek() as number) || 0;
        if (d > 0) {
          setProgression(position / d);
          if (d !== dureeRef.current) {
            dureeRef.current = d;
            setDuree(d);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (enLecture) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enLecture]);

  return {
    enLecture,
    progression,
    duree,
    tempsActuel,
    erreurChargement,
    demarrer,
    mettreEnPause,
    basculerLecture,
    allerA,
  };
}
