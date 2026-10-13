import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";

export async function IllustratedBackdrop({
  image,
  mobileImage,
  caption,
}: {
  image: string;
  mobileImage: string;
  caption: string;
}) {
  const { t } = await getI18n();

  return (
    <>
      <div className="login-art" aria-hidden="true">
        <Image
          className="login-panorama"
          src={image}
          alt=""
          fill
          sizes="100vw"
          preload
        />
        <Image
          className="login-mobile-scene"
          src={mobileImage}
          alt=""
          fill
          sizes="(max-width: 760px) 100vw, 1px"
        />
      </div>
      <p className="login-scene-caption">{t(caption)}</p>
    </>
  );
}
