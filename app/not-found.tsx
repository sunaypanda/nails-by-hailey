import Link from "next/link";
import { PageIntro } from "@/components/ui";
export default function NotFound() { return <><PageIntro eyebrow="A LITTLE DETOUR" title={<>This little page <em>got away.</em></>}><p>That set or page may have moved. There’s more to love in the shop.</p></PageIntro><div className="empty-cart"><Link className="button button-dark" href="/shop">Back to the collection ↗</Link></div></>; }
