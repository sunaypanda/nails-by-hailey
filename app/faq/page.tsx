import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { getSettings } from "@/lib/data";
export const metadata: Metadata = { title: "FAQs & nail care", alternates: { canonical: "/faq" } };
export const dynamic = "force-dynamic";
export default async function FAQ() {
  const settings = await getSettings();
  const groups = [
    { id: "ordering", title: "Finding your set", questions: [
      ["How do I order?", "Browse the shop, choose a set and size, and add it to your bag. Online payment is available only when checkout is connected. You can also contact Hailey on Instagram to ask about ordering."],
      ["Can I design my own set?", "Yes! Use the custom form to share your colors, shape, length, size, and inspiration photos. Hailey will confirm the design, price, and timing with you before an order is arranged."],
      ["How do I find my size?", "Use the size guide to measure the widest part of each natural nail in millimeters. Measure both hands. If you’re unsure, ask Hailey for help before ordering."],
      ["Are these nail appointments?", "You’re shopping for handmade press-on nail products to apply yourself at home. Nails by Hailey doesn’t offer nail application or manicure appointments through this site."],
      ["Do charms cost extra?", settings.charm_surcharge_cents !== null ? `1–2 charms are free. Designs with 3 or more charms have a $${(settings.charm_surcharge_cents / 100).toFixed(2)} surcharge. Hailey will confirm the complete quote.` : "1–2 charms are free. There’s an additional charge for 3 or more charms; Hailey will confirm that amount as part of your custom quote."]
    ] },
    { id: "care", title: "A little nail love", questions: [
      ["Are my press-ons reusable?", "They’re designed to be reusable when removed and cared for gently. Rewear depends on your adhesive, how you apply and remove them, and how the set is cared for. There isn’t a guaranteed number of wears."],
      ["How do I apply them?", "Start with clean, dry, healthy natural nails. Gently push back the cuticles and select a press-on that fits from side to side. Apply using your chosen adhesive’s instructions, avoiding your skin. Don’t apply over damaged or irritated nails. Confirm with Hailey which supplies come with your set."],
      ["How do I remove them?", "Follow the removal instructions for the adhesive you used. Never pull or force press-ons off. Take your time, and stop if you feel pain or resistance. Ask Hailey if you need help choosing a method that protects both your natural nails and the design."],
      ["How should I care for my set?", "Treat your nails as little works of art. Avoid using them to open or pry things, protect them from harsh chemicals, and store clean, dry nails safely between wears. Stop using an adhesive if it causes irritation."],
      ["What comes in the package?", "Check the ‘little details’ section of each product for its confirmed contents. If the contents aren’t listed, ask Hailey before ordering; application supplies aren’t assumed to be included."]
    ] },
    { id: "delivery", title: "Getting the little details right", questions: [
      ["Do you offer shipping or pickup?", settings.shipping_policy || (settings.shipping_enabled || settings.pickup_enabled ? `${settings.shipping_enabled ? "Shipping is enabled at checkout. " : ""}${settings.pickup_enabled ? "Houston pickup is enabled at checkout. Specific pickup details are shared privately after ordering." : ""}` : "Shipping and Houston pickup arrangements are being confirmed. Please contact Hailey before ordering to check the options available for your set.")],
      ["How long will my order take?", settings.processing || "Processing times depend on the set and Hailey’s availability. Please confirm timing with Hailey before ordering, especially for a special occasion. A requested date on the custom form isn’t a guaranteed delivery date."],
      ["What is the returns and exchanges policy?", settings.returns_policy || "Please ask Hailey to confirm the returns and exchanges terms before purchasing. The final policy will be published here once approved."],
      ["How can I check a custom request?", "Use the private tracking link shown after submitting your request. Keep the link safe; it contains your access token. If you’ve lost it, message Hailey using the email or Instagram account you shared."]
    ] }
  ];
  return <><PageIntro eyebrow="A LITTLE HELP, WITH LOTS OF LOVE" title={<>The little things, <em>answered.</em></>}><p>From your first set to your next rewear.<br />Everything you need for a little nail confidence.</p></PageIntro><div className="container page-content faq-layout"><nav className="faq-nav" aria-label="FAQ topics">{groups.map(g => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}<Link className="text-link" href="/contact">Still wondering? Say hello ↗</Link></nav><div>{groups.map(group => <section key={group.id} className="faq-group" id={group.id}><h2>{group.title}</h2>{group.questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>)}</div></div></>;
}
