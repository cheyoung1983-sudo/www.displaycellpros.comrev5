/**
 * Next's webpack loader returns an object ({ src, width, height }) for static
 * image imports, while plain <img> wants a string. Normalizing here keeps
 * every `<img src={...}>` call site simple regardless of loader shape.
 */
export type StaticImageLike = string | { src: string };

export function staticImageSrc(image: StaticImageLike): string {
  return typeof image === 'string' ? image : image.src;
}
