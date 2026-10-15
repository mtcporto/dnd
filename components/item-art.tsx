import { MonsterImage } from "@/components/monster-image";
export function ItemArt({
  image,
  name,
  large = false,
}: {
  image?: string;
  name: string;
  large?: boolean;
}) {
  return (
    <div className={large ? "item-art-large" : "item-thumbnail"}>
      <MonsterImage
        key={image || name}
        src={image}
        name={name}
        priority={large}
      />
    </div>
  );
}
