import { CSSProperties, useEffect, useState } from "react";
import { ImagesResponse } from "../utils/types";

const TEMPLATE_PARAM_KEY = "template";
const PAIRED_IMAGE_PATHS_PARAM_KEY = "paired_image_paths";
const CONCAT_IMAGE_FILENAMES_PARAM_KEY = "concat_image_filenames";

// IMPORTANT NOTE: For the next developer, this is the type of the template object
// follow this type when creating a new template
export type TemplateT = {
  beforeImageContainer: CSSProperties;
  afterImageContainer: CSSProperties;
  outerContainer: CSSProperties;
  beforeImage: CSSProperties;
  afterImage: CSSProperties;
  texts: CSSProperties[];
  images: {
    src: string; // IMPORTANT NOTE: If there is a CORS issue with the image src, the concatenation will fail
    image: CSSProperties;
    imageContainer: CSSProperties;
  }[];
  divs: CSSProperties[];
};

// TODO: Come up with a better name for this hook
const useImages = () => {
  const [imagesData, setImagesData] = useState<ImagesResponse | null>(null);
  const [template, setTemplate] = useState<TemplateT | null>(null);
  const [concatImageFilenames, setConcatImageFilenames] = useState<string[]>(
    [],
  );

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const pairedImagePaths = params.get(PAIRED_IMAGE_PATHS_PARAM_KEY) ?? "";
        const template = params.get(TEMPLATE_PARAM_KEY) ?? "";
        const concatImageFilenames =
          params.get(CONCAT_IMAGE_FILENAMES_PARAM_KEY) ?? "";
        setTemplate(JSON.parse(template));
        setConcatImageFilenames(JSON.parse(concatImageFilenames));

        const response = await fetch(
          `http://localhost:8000/images${`?${PAIRED_IMAGE_PATHS_PARAM_KEY}=${encodeURIComponent(pairedImagePaths)}`}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data: ImagesResponse = await response.json();
        setImagesData(data);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return { imagesData, template, concatImageFilenames, error, loading };
};

export default useImages;
