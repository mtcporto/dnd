import Image from "next/image";

export function CampfireBackdrop() {
  return (
    <>
      <div className="login-art" aria-hidden="true">
        <Image className="login-panorama" src="/images/heroes/adventurers-campfire-wide.webp" alt="" fill sizes="100vw" preload />
        <Image className="login-mobile-scene" src="/images/heroes/adventurers-campfire.webp" alt="" fill sizes="(max-width: 760px) 100vw, 1px" />
      </div>
      <p className="login-scene-caption">Histórias que começam ao redor de uma fogueira.</p>
    </>
  );
}
