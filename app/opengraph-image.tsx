import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt = "Nails by Hailey — handmade press-ons, with lots of love";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#332e2b", border: "25px solid #efd8d6" }}><div style={{ fontSize: 24, letterSpacing: 6, marginBottom: 40 }}>HANDMADE IN HOUSTON, TEXAS</div><div style={{ fontFamily: "serif", fontSize: 100, letterSpacing: -5 }}>nails by Hailey</div><div style={{ fontFamily: "serif", fontSize: 36, marginTop: 35, color: "#9a5e67" }}>A little detail. A lot of you.</div><div style={{ fontSize: 22, marginTop: 50 }}>With lots of love.</div></div>, { ...size }); }
