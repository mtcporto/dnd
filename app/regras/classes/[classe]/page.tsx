import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogue } from "@/lib/catalogue";
import { classPresentation } from "@/lib/class-presentation";
import { abilityNames, classNames, proficiencyName } from "@/lib/labels";

type Props = { params: Promise<{ classe: string }> };

export async function generateMetadata({ params }: Props) {
  const { classe } = await params;
  return { title: catalogue.classes.some((entry) => entry.index === classe) ? `${classNames[classe]} · Compêndio` : "Classe não encontrada" };
}

export default async function Page({ params }: Props) {
  const { classe } = await params;
  const entry = catalogue.classes.find((item) => item.index === classe);
  if (!entry) notFound();
  const profile = classPresentation[classe];
  const options = entry.primary_ability?.ability_score_options;
  const primary = options
    ? (options.from.options || []).flatMap((option) => option.item ? [option.item] : [])
    : entry.primary_ability?.ability_scores || [];
  return (
    <main id="main" className="character-space class-reference-page">
      <Link className="back-link" href="/regras#classes">← Todas as classes</Link>
      <div className="class-reference-layout">
        <aside className="class-reference-art">
          <Image src={`/images/classes/${classe}.webp`} alt={`Ilustração de ${classNames[classe]}`} fill sizes="(max-width: 760px) 100vw, 40vw" preload />
        </aside>
        <div className="class-reference-content">
          <p className="stage-kicker">Compêndio · {profile.title}</p>
          <h1>{classNames[classe]}</h1>
          <p className="class-reference-description">{profile.description}</p>
          <dl className="class-reference-facts">
            <div><dt>Dado de vida</dt><dd>d{entry.hit_die}</dd></div>
            <div><dt>Atributo principal</dt><dd>{primary.map((score) => abilityNames[score.index.toUpperCase()] || score.name).join(options ? " ou " : " e ")}</dd></div>
            <div><dt>Testes de resistência</dt><dd>{entry.saving_throws?.map((score) => abilityNames[score.index.toUpperCase()] || score.name).join(" e ")}</dd></div>
          </dl>
          <Link className="class-confirm" href={`/personagens/novo?classe=${classe}`}>Criar {classNames[classe]} <span aria-hidden="true">→</span></Link>
          <section className="class-reference-section">
            <h2>Proficiências</h2>
            <p>{entry.proficiencies?.map((item) => proficiencyName(item.index, item.name)).join(" · ")}</p>
            {entry.proficiency_choices?.map((choice, index) => <p key={index}>Escolha {choice.choose}: {(choice.from.options || []).flatMap((option) => option.item ? [proficiencyName(option.item.index, option.item.name)] : option.choice?.desc ? [option.choice.desc] : []).join(", ")}.</p>)}
          </section>
          <section className="class-reference-section">
            <p className="stage-kicker">Primeiros passos · Nível 1</p>
            <h2>Características da classe</h2>
            <p className="compendium-intro">Regras do SRD {catalogue.srdVersion}. Os textos abaixo estão no idioma original da fonte; esta referência cobre as características de nível 1 disponíveis no catálogo.</p>
            {entry.levelOne.features.map((feature) => <article className="class-reference-feature" key={feature.index}><h3>{feature.name}</h3><p className="rules-description">{feature.desc?.join("\n\n")}</p></article>)}
          </section>
        </div>
      </div>
    </main>
  );
}
