import { useState, useEffect, useRef } from "react";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import interact from "@interactjs/interact";
import useImages from "./customHooks/useImages";
import { toPng } from "html-to-image";
import { base64ToBlob } from "./utils/helpers";
import "./Home.css";

const TEMPLATE_WIDTH = "1000px";
const IMAGE_SRC =
  "data:image/jpeg;base64,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";

type ElementStyle = {
  top: string;
  left: string;
  width?: string;
  height?: string;
};

type Elements = {
  beforeImage: ElementStyle;
  afterImage: ElementStyle;
  watermark: ElementStyle;
  beforeText: ElementStyle;
  afterText: ElementStyle;
};

export default function App() {
  const templateContainer = useRef<HTMLDivElement>(null); // Create a ref for the parent container
  const { imagesData, error, loading } = useImages();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [templateImages, setTemplateImages] = useState<Blob[]>([]);

  // @typescript-eslint/no-unused-vars
  const [elements, _] = useState<Elements>({
    watermark: {
      top: "85%",
      left: "40%",
      width: "20%",
      height: "10%",
    },
    beforeImage: {
      top: "2%",
      left: "2%",
      width: "47%",
      height: "96%",
    },
    afterImage: {
      top: "2%",
      left: "51%",
      width: "47%",
      height: "96%",
    },
    beforeText: {
      top: "10%",
      left: "25%",
    },
    afterText: {
      top: "90%",
      left: "75%",
    },
  });
  const [secondElement, setSecondElement] = useState<Elements>({
    watermark: { top: "0%", left: "0%", width: "0%", height: "0%" },
    beforeImage: { top: "0%", left: "0%", width: "0%", height: "0%" },
    afterImage: { top: "0%", left: "0%", width: "0%", height: "0%" },
    beforeText: { top: "0%", left: "0%" },
    afterText: { top: "0%", left: "0%" },
  });

  useEffect(() => {
    setSecondElement(elements);
  }, [elements]);

  useEffect(() => {
    const containerWidth = 1000;
    const containerHeight = 1000;
    interact(".resize-drag")
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const target = event.target;
            let x = parseFloat(target.getAttribute("data-x")) || 0;
            let y = parseFloat(target.getAttribute("data-y")) || 0;

            target.style.width = event.rect.width + "px";
            target.style.height = event.rect.height + "px";

            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = "translate(" + x + "px," + y + "px)";

            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            // For updating the state with the new width and height
            const target = event.target;
            const { width, height } = event.target.getBoundingClientRect();
            const widthPercentage = (width / containerWidth) * 100;
            const heightPercentage = (height / containerHeight) * 100;
            setSecondElement((prev) => ({
              ...prev,
              [target.className.split(" ")[1]]: {
                // @ts-ignore
                ...prev[target.className.split(" ")[1]],
                width: `${widthPercentage}%`,
                height: `${heightPercentage}%`,
              },
            }));
          },
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 50, height: 50 },
          }),
        ],
      })
      .draggable({
        listeners: {
          move(event) {
            const target = event.target;
            const x =
              (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y =
              (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
          },
          end(event) {
            const target = event.target;
            // Get the current position using getBoundingClientRect
            const rect = target.getBoundingClientRect();
            if (!templateContainer.current) return;
            const parentRect =
              templateContainer.current.getBoundingClientRect();

            // Calculate top and left relative to the parent container
            const relativeTop = rect.top - parentRect.top;
            const relativeLeft = rect.left - parentRect.left;
            const topPercentage = (relativeTop / 1000) * 100; // Assuming 1000 is the container height
            const leftPercentage = (relativeLeft / 1000) * 100; // Assuming 1000 is the container width
            setSecondElement((prev) => ({
              ...prev,
              [target.className.split(" ")[1]]: {
                // @ts-ignore
                ...prev[target.className.split(" ")[1]],
                top: `${topPercentage}%`,
                left: `${leftPercentage}%`,
              },
            }));
          },
        },
      });

    interact(".drag").draggable({
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
          target.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
        end(event) {
          if (!templateContainer.current) return;

          // Get the current position using getBoundingClientRect
          const target = event.target;
          const rect = target.getBoundingClientRect();
          const parentRect = templateContainer.current.getBoundingClientRect();

          // Calculate top and left relative to the parent container
          const relativeTop = rect.top - parentRect.top;
          const relativeLeft = rect.left - parentRect.left;
          const topPercentage = (relativeTop / 1000) * 100; // Assuming 1000 is the container height
          const leftPercentage = (relativeLeft / 1000) * 100; // Assuming 1000 is the container width
          setSecondElement((prev) => ({
            ...prev,
            [target.className.split(" ")[1]]: {
              // @ts-ignore
              ...prev[target.className.split(" ")[1]],
              top: `${topPercentage}%`,
              left: `${leftPercentage}%`,
            },
          }));
        },
      },
    });
  }, []);

  // Function to handle the export
  const handleExport = () => {
    const templateContainer = document.querySelector(".template-container");

    toPng(templateContainer as HTMLElement)
      .then((dataUrl) => {
        const imageBlob = base64ToBlob(dataUrl);
        setTemplateImages((prev) => [...prev, imageBlob]);
      })
      .catch((error) => {
        console.error("Error exporting image:", error);
      });
  };

  useEffect(() => {
    if (!imagesData || currentImageIndex >= imagesData.images.length) return;

    handleExport();
    setCurrentImageIndex((prev) => prev + 1);
  }, [currentImageIndex, imagesData]);

  useEffect(() => {
    if (templateImages.length !== imagesData?.images.length) return;
    const fetchImages = async () => {
      try {
        const formData = new FormData();
        const id = imagesData.id;
        formData.append("id", id);
        templateImages.forEach((image, index) => {
          // Convert blob to file if necessary
          const file =
            image instanceof Blob
              ? new File([image], `image_${index}.jpg`, { type: image.type })
              : image;
          formData.append("files", file);
        });
        const response = await fetch("http://localhost:8000/upload-images", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Network response was not ok");
        }
        const result = await response.json();
        console.log("Upload successful:", result);
      } catch (error) {
        console.error("Upload failed:");
      }
    };
    fetchImages();
  }, [templateImages, imagesData]);

  console.log();
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "grey",
        overflow: "auto",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: TEMPLATE_WIDTH,
          height: TEMPLATE_WIDTH,
          backgroundColor: "white",
          position: "relative",
        }}
        className="template-container"
        ref={templateContainer}
      >
        <div
          style={{
            ...elements.beforeImage,
          }}
          className="resize-drag beforeImage"
        >
          <img
            src={
              (imagesData &&
                imagesData.images &&
                imagesData.images[0]
                  .before_image_presigned_url) ||
              IMAGE_SRC
            }
            alt="before"
          />
        </div>
        <div
          style={{ ...elements.afterImage }}
          className="resize-drag afterImage"
        >
          <img
            src={
              (imagesData &&
                imagesData.images &&
                imagesData.images[0].after_image_presigned_url) ||
              IMAGE_SRC
            }
            alt="after"
          />
        </div>
        <div
          style={{
            ...elements.watermark,
            opacity: 0.5,
          }}
          className="resize-drag watermark"
        >
          <img
            src={(imagesData && imagesData.watermark_url) || IMAGE_SRC}
            alt="watermark"
          />
        </div>
        <div
          style={{
            ...elements.beforeText,
          }}
          className="drag beforeText"
        >
          Before
        </div>
        <div
          style={{
            ...elements.afterText,
          }}
          className="drag afterText"
        >
          After
        </div>
      </div>
      <button onClick={handleExport}>Export as Image</button>
      <button onClick={() => {}}>Save Template</button>
      <pre
        style={{ background: "white", padding: "20px", width: TEMPLATE_WIDTH }}
      >
        {JSON.stringify(secondElement, null, 2)}
      </pre>
    </div>
  );
}
