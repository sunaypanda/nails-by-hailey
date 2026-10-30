"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-cart" style={{ paddingTop: 65 }}><h2>A little hiccup.</h2><p>We couldn’t load this page. Please try again.</p><button onClick={reset} className="button button-dark">Try again</button></div>; }
