"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="page empty-state">
      <h1>Não foi possível abrir esta página.</h1>
      <p>Tente novamente em instantes.</p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
