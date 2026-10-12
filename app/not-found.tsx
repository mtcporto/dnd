export default function NotFound() {
  return (
    <main id="main" className="page empty-state">
      <h1>Esta página não foi encontrada.</h1>
      <p>Volte aos personagens para continuar.</p>
      <a href="/personagens" className="button primary">
        Meus personagens
      </a>
    </main>
  );
}
