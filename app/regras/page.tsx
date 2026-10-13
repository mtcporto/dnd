import { catalogue } from "@/lib/catalogue";
import { classNames, speciesNames, backgroundNames } from "@/lib/labels";
import Image from "next/image";
import Link from "next/link";
import { classPresentation } from "@/lib/class-presentation";
import { speciesPresentation, speciesSize } from "@/lib/species-presentation";
import { backgroundPresentation } from "@/lib/background-presentation";
export const metadata = { title: "Compêndio" };
export default function Page() {
  return (
    <main id="main" className="character-space compendium-page">
      <header className="compendium-hero">
        <div className="compendium-hero-art" aria-hidden="true">
          <Image src="/images/heroes/arcane-library-wide.webp" alt="" fill sizes="100vw" preload />
        </div>
        <div className="compendium-heading">
        <p className="stage-kicker">Compêndio · Regras de 2024</p>
        <h1>Conheça suas possibilidades</h1>
        <p>
          Uma referência das origens e características disponíveis para montar o
          rascunho. Descrições da fonte são apresentadas no idioma original.
        </p>
        </div>
      </header>
      <nav className="compendium-nav" aria-label="Categorias do compêndio">
        <a href="#classes">Classes</a>
        <a href="#species">Espécies</a>
        <a href="#backgrounds">Antecedentes</a>
      </nav>
      <section className="compendium-section" id="classes">
        <h2>Classes</h2>
        <p className="compendium-intro">Doze caminhos para sua aventura. Explore uma classe para conhecer suas características e começar seu personagem.</p>
        <div className="compendium-class-grid">
        {catalogue.classes.map((entry) => (
          <Link className="compendium-class-card" href={`/regras/classes/${entry.index}`} key={entry.index}>
            <div className="compendium-class-art"><Image src={`/images/classes/${entry.index}.webp`} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" /></div>
            <div className="compendium-class-copy">
              <span className="stage-kicker">Dado de vida · d{entry.hit_die}</span>
              <h3>{classNames[entry.index]}</h3>
              <p>{classPresentation[entry.index].title}</p>
              <span className="compendium-card-action">Conhecer classe <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
        </div>
      </section>
      <section className="compendium-section" id="species">
        <h2>Espécies</h2>
        <p className="compendium-intro">Nove origens para seu aventureiro. Conheça seus traços e escolha como sua história começa. Cada ilustração apresenta um exemplo de personagem; qualquer espécie pode seguir diferentes classes.</p>
        <div className="compendium-class-grid compendium-species-grid">
        {catalogue.species.map((entry) => (
          <Link className="compendium-class-card" href={`/regras/especies/${entry.index}`} key={entry.index}>
            <div className="compendium-class-art"><Image src={`/images/species/${entry.index}.webp`} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" /></div>
            <div className="compendium-class-copy">
              <span className="stage-kicker">{speciesSize(entry)} · {entry.speed} pés</span>
              <h3>{speciesNames[entry.index]}</h3>
              <p>{speciesPresentation[entry.index].title}</p>
              <span className="compendium-card-action">Conhecer espécie <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
        </div>
      </section>
      <section className="compendium-section" id="backgrounds">
        <h2>Antecedentes</h2>
        <p className="compendium-intro">Quem você era antes de se tornar aventureiro? Conheça as quatro formações do catálogo e o que cada uma acrescenta ao seu personagem.</p>
        <div className="compendium-class-grid compendium-background-grid">
        {catalogue.backgrounds.map((entry) => (
          <Link className="compendium-class-card" href={`/regras/antecedentes/${entry.index}`} key={entry.index}>
            <div className="compendium-class-art"><Image src={`/images/backgrounds/${entry.index}.webp`} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" /></div>
            <div className="compendium-class-copy">
              <span className="stage-kicker">Sua vida antes da aventura</span>
              <h3>{backgroundNames[entry.index]}</h3>
              <p>{backgroundPresentation[entry.index].title}</p>
              <span className="compendium-card-action">Conhecer antecedente <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
        </div>
      </section>
    </main>
  );
}
