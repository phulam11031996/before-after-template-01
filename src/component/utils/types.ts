// types.ts
export type ImageData = {
  before_image_presigned_url: string;
  after_image_presigned_url: string;
};

export type ImagesResponse = {
  id: string;
  images: ImageData[];
  watermark_url: string;
};
