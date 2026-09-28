import { ImageResponse } from "next/og";

// Brand tile used for app icons. `inset` shrinks the artwork into the
// maskable safe zone so Android's circle/squircle crops don't clip it.
export function brandIcon(size: number, inset = 0) {
  const art = size * (1 - inset * 2);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E2350",
        }}
      >
        <div
          style={{
            width: art,
            height: art,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: art * 0.58,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          P
          <div style={{ width: art * 0.56, height: art * 0.08, marginTop: art * 0.06, background: "#E8A317", borderRadius: art }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
