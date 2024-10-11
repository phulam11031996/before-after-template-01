// useImages.ts
import { useEffect, useState } from "react";
import { ImagesResponse } from "../utils/types";

const useImages = () => {
  const [imagesData, setImagesData] = useState<ImagesResponse | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:8000/images", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }); // Hardcoded URL
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data: ImagesResponse = await response.json(); // Type the response data
        setImagesData(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return { imagesData, error, loading };
};

export default useImages;
