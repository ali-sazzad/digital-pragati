// Mountain-ridge graph in its own row of the two-city band, below the clocks and
// meters so no line runs behind text. It draws itself on load, then a signal pulse
// keeps sweeping each ridge like a live monitor (see "Ridge graph" in globals.css).
//
// Two shapes, each shown at its own aspect ratio and never stretched, so stroke
// widths stay even and pathLength=1000 keeps the dash maths exact: a long, low
// strip for wide screens and a shorter one for phones.
const shapes = {
  wide: {
    viewBox: "0 0 1200 100",
    front:
      "M0 89 L70 78 L120 83 L190 65 L240 73 L310 53 L350 60 L420 39 L470 54 L520 49 L590 68 L650 59 L710 73 L780 55 L830 63 L900 44 L950 56 L1010 51 L1080 69 L1140 61 L1200 66",
    back: "M0 95 L90 89 L160 92 L240 80 L300 86 L390 71 L450 78 L540 68 L610 76 L690 70 L770 79 L850 66 L920 74 L1000 68 L1080 76 L1200 73",
    floor: "L1200 100 L0 100Z",
  },
  narrow: {
    viewBox: "0 0 600 160",
    front:
      "M0 135 L60 117 L95 126 L150 86 L185 101 L240 58 L270 74 L330 25 L365 52 L400 43 L450 77 L500 62 L545 92 L600 80",
    back: "M0 145 L70 132 L120 138 L180 111 L230 123 L300 92 L350 108 L420 80 L480 101 L540 92 L600 105",
    floor: "L600 160 L0 160Z",
  },
} as const;

export function Ridge() {
  return (
    <>
      {(Object.keys(shapes) as (keyof typeof shapes)[]).map((key) => {
        const s = shapes[key];
        const fillId = `ridge-fill-${key}`;
        return (
          <svg key={key} className={`ridge ridge-${key}`} viewBox={s.viewBox} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff7a8c" stopOpacity="0.22" />
                <stop offset="1" stopColor="#ff7a8c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="ridge-area" style={{ fill: `url(#${fillId})` }} d={`${s.front} ${s.floor}`} />
            <path className="ridge-line ridge-back" pathLength={1000} d={s.back} />
            <path className="ridge-line ridge-front" pathLength={1000} d={s.front} />
            <path className="ridge-pulse ridge-pulse-back" pathLength={1000} d={s.back} />
            <path className="ridge-pulse ridge-pulse-front" pathLength={1000} d={s.front} />
          </svg>
        );
      })}
    </>
  );
}
