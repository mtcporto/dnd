import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogue } from "@/lib/catalogue";
import { abilityNames, backgroundNames, proficiencyName } from "@/lib/labels";
import { backgroundPresentation } from "@/lib/background-presentation";

type Props = { params: Promise<{ antecedente: string }> };

export async function generateMetadata({ params }: Props) {
  const { antecedente } = await params;
  return { title: catalogue.backgrounds.some((entry) => entry.index === antecedente) ? `${backgroundNames[antecedente]} · Compêndio` : "Antecedente não encontrado" };
}

export default async function Page({ params }: Props) {
  const { antecedente } = await params;
  const entry = catalogue.backgrounds.find((item) => item.index === antecedente);
  if (!entry) notFound();
  const profile = backgroundPresentation[antecedente];
  return (
    <main id="main" className="character-space class-reference-page background-reference-page">
      <Link className="back-link" href="/regras#backgrounds">← Todos os antecedentes</Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image src={`/images/backgrounds/${antecedente}.webp`} alt={`Ilustração do antecedente ${backgroundNames[antecedente]}`} fill sizes="(max-width: 760px) 100vw, 40vw" preload />
        </aside>
        <div className="class-reference-content">
          <p className="stage-kicker">Compêndio · {profile.title}</p>
          <h1>{backgroundNames[antecedente]}</h1>
          <p className="class-reference-description">{profile.description}</p>
          <dl className="class-reference-facts">
            <div><dt>Atributos disponíveis</dt><dd>{entry.ability_scores.map((score) => abilityNames[score.index.toUpperCase()] || score.name).join(", ")}</dd></div>
            <div><dt>Talento de origem</dt><dd>{entry.feat.name}</dd></div>
            <div><dt>Classe</dt><dd>À sua escolha</dd></div>
          </dl>
          <section className="class-reference-section">
            <h2>Proficiências</h2>
            <p>{entry.proficiencies.map((item) => proficiencyName(item.index, item.name)).join(" · ")}</p>
            {entry.proficiency_choices?.map((choice, index) => <p key={index}>Escolha {choice.choose}: {(choice.from.options || []).flatMap((option) => option.item ? [proficiencyName(option.item.index, option.item.name)] : option.choice?.desc ? [option.choice.desc] : []).join(", ")}.</p>)}
          </section>
          <section className="class-reference-section">
            <p className="stage-kicker">Sua formação</p>
            <h2>Talento de origem</h2>
            <p className="compendium-intro">Regras do SRD {catalogue.srdVersion}, apresentadas no idioma original da fonte. A ilustração representa uma ocupação anterior à aventura, sem definir sua espécie ou classe.</p>
            <article className="class-reference-feature"><h3>{entry.feat.name}</h3><p className="rules-description">{entry.feat.desc?.join("\n\n")}</p></article>
          </section>
          <Link className="class-confirm" href="/personagens/novo">Criar personagem <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </main>
  );
}
