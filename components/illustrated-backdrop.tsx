import Image from "next/image";

export function IllustratedBackdrop({
  image,
  mobileImage,
  caption,
}: {
  image: string;
  mobileImage: string;
  caption: string;
}) {
  return (
    <>
      <div className="login-art" aria-hidden="true">
        <Image className="login-panorama" src={image} alt="" fill sizes="100vw" preload />
        <Image className="login-mobile-scene" src={mobileImage} alt="" fill sizes="(max-width: 760px) 100vw, 1px" />
      </div>
      <p className="login-scene-caption">{caption}</p>
    </>
  );
}
