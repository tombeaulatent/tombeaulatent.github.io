import { AsciiBackground } from "@asciitopia/react";
import { AuroraPattern } from "@asciitopia/core/patterns/aurora";

const auroraMono = new AuroraPattern({
  palette: "mono",
  speed: 0.05,
  threshold: 0.28,
});

const engineOptions = {
  fps: 30,
  font: 'Bloody',
  fontSize: 14,
};

/**
 * Fond ASCII aurora (mono)
 * @see https://flawnn.github.io/asciitopia/#/pattern/aurora
 */
export default function AuroraBg() {
  return (
    <AsciiBackground
      pattern={auroraMono}
      engineOptions={engineOptions}
      className="ascii-bg"
    />
  );
}
