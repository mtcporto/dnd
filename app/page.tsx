import { HomeCharacterCarousel } from "@/components/home-character-carousel";

export default function Home() {
  return (
    <main id="main" className="character-space adventure-home">
      <section className="adventure-home-hero">
        <div className="adventure-home-intro">
          <p className="stage-kicker">D&D Aventuras · Regras de 2024</p>
          <h1>
            Toda aventura
            <br />
            começa com <em>você.</em>
          </h1>
          <p className="adventure-home-description">
            Escolha seu caminho. Descubra suas origens. Dê vida ao aventureiro
            que levará sua história adiante.
          </p>
          <div className="adventure-home-actions">
            <a href="/personagens/novo" className="class-confirm">
              Criar personagem <span aria-hidden="true">→</span>
            </a>
            <a href="/personagens" className="adventure-home-secondary">
              Meus personagens <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="adventure-home-note">
            Sua história começa com uma ficha. As aventuras solo serão o próximo
            capítulo.
          </p>
        </div>
        <HomeCharacterCarousel />
      </section>
      <div className="adventure-home-catalogue" aria-label="Opções de criação">
        <p>
          <strong>12</strong> classes
        </p>
        <span aria-hidden="true">◆</span>
        <p>
          <strong>9</strong> espécies
        </p>
        <span aria-hidden="true">◆</span>
        <p>
          <strong>4</strong> antecedentes
        </p>
      </div>
      <nav className="adventure-home-paths" aria-label="Explore D&D Aventuras">
        <a href="/personagens/novo">
          <span className="home-path-number">01</span>
          <div>
            <h2>Escolha seu caminho</h2>
            <p>Encontre sua classe e comece a criar seu personagem.</p>
          </div>
          <span className="home-path-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <a href="/personagens">
          <span className="home-path-number">02</span>
          <div>
            <h2>Reencontre seus aventureiros</h2>
            <p>Suas fichas, suas origens e as histórias que você começou.</p>
          </div>
          <span className="home-path-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <a href="/regras">
          <span className="home-path-number">03</span>
          <div>
            <h2>Conheça as regras</h2>
            <p>Explore classes, espécies e talentos no compêndio.</p>
          </div>
          <span className="home-path-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </nav>
    </main>
  );
}
