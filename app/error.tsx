'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="standalone-state"><span className="eyebrow">UNE INTERRUPTION PASSAGÈRE</span><h1>Réessayons<span className="text-blue">.</span></h1><p>Le contenu n’a pas pu être chargé. Merci de réessayer dans un instant.</p><button className="button" onClick={reset}>Réessayer ↗︎</button></div>; }
