import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogue } from "@/lib/catalogue";
import { speciesNames } from "@/lib/labels";
import { speciesPresentation, speciesSize } from "@/lib/species-presentation";

type Props = { params: Promise<{ especie: string }> };

export async function generateMetadata({ params }: Props) {
  const { especie } = await params;
  return { title: catalogue.species.some((entry) => entry.index === especie) ? `${speciesNames[especie]} · Compêndio` : "Espécie não encontrada" };
}

export default async function Page({ params }: Props) {
  const { especie } = await params;
  const entry = catalogue.species.find((item) => item.index === especie);
  if (!entry) notFound();
  const profile = speciesPresentation[especie];
  return (
    <main id="main" className="character-space class-reference-page species-reference-page">
      <Link className="back-link" href="/regras#species">← Todas as espécies</Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image src={`/images/species/${especie}.webp`} alt={`Ilustração de um aventureiro da espécie ${speciesNames[especie]}`} fill sizes="(max-width: 760px) 100vw, 40vw" preload />
        </aside>
        <div className="class-reference-content">
          <p className="stage-kicker">Compêndio · {profile.title}</p>
          <h1>{speciesNames[especie]}</h1>
          <p className="class-reference-description">{profile.description}</p>
          <dl className="class-reference-facts">
            <div><dt>Tamanho</dt><dd>{speciesSize(entry)}</dd></div>
            <div><dt>Deslocamento</dt><dd>{entry.speed} pés</dd></div>
            <div><dt>Classe</dt><dd>À sua escolha</dd></div>
          </dl>
          <Link className="class-confirm" href={`/personagens/novo?especie=${especie}`}>Criar personagem {speciesNames[especie]} <span aria-hidden="true">→</span></Link>
          <section className="class-reference-section">
            <p className="stage-kicker">Sua origem</p>
            <h2>Traços da espécie</h2>
            <p className="compendium-intro">Regras do SRD {catalogue.srdVersion}, apresentadas no idioma original da fonte. A ilustração é um exemplo visual, sem definir a classe ou aparência do seu personagem.</p>
            {entry.traits.map((trait) => <article className="class-reference-feature" key={trait.index}><h3>{trait.name}</h3><p className="rules-description">{trait.desc?.join("\n\n")}</p></article>)}
          </section>
        </div>
      </div>
    </main>
  );
}
