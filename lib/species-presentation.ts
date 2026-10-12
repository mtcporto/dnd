import type { SpeciesEntry } from "@/domain/character";

// Editorial art direction; mechanical traits are read from the SRD catalogue.
export const speciesPresentation: Record<string, { title: string; description: string }> = {
  dragonborn: { title: "Uma presença dracônica", description: "Escamas, chifres e um olhar marcante. Uma identidade dracônica para uma história que você ainda vai escrever." },
  dwarf: { title: "Firme como a pedra", description: "Uma figura robusta entre salões de pedra e luz de forja. Escolha seu próprio caminho além das montanhas." },
  elf: { title: "Entre o antigo e o encantado", description: "Uma silhueta elegante entre ruínas e florestas. Um ponto de partida para histórias de descoberta, memória e magia." },
  gnome: { title: "Curiosidade em cada passo", description: "Pequena estatura, um olhar atento e possibilidades imensas. Há sempre algo novo esperando além da próxima porta." },
  goliath: { title: "À altura das montanhas", description: "Uma presença imponente em meio à névoa dos picos. A próxima aventura pode levar você muito além deles." },
  halfling: { title: "Grandes histórias, pequenos passos", description: "Uma figura pequena numa estrada cheia de possibilidades. O tamanho da aventura é você quem escolhe." },
  human: { title: "Um caminho para descobrir", description: "Uma viajante diante dos portões de uma cidade antiga. Suas escolhas, encontros e ambições darão forma à história." },
  orc: { title: "Uma presença que se impõe", description: "Um viajante de porte forte entre pedras antigas. Sua origem é o começo; o destino pertence às suas escolhas." },
  tiefling: { title: "Uma origem extraordinária", description: "Chifres, cauda e uma silhueta inconfundível sob o luar. Uma aparência extraordinária para um destino que você decide." },
};

export function speciesSize(entry: SpeciesEntry) {
  const labels: Record<string, string> = { Small: "Pequeno", Medium: "Médio", Large: "Grande" };
  const choices = entry.size_options?.from.options?.map((option) => labels[option.size] || option.size);
  return choices?.length ? choices.join(" ou ") : labels[entry.size] || entry.size || "Não informado";
}
