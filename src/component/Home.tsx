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
    console.log("currentImageIndex", currentImageIndex);
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

  if (!imagesData || loading || error) return null;

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
              !currentImageIndex
                ? imagesData?.images[currentImageIndex]
                    .before_image_presigned_url
                : imagesData?.images[currentImageIndex - 1]
                    .before_image_presigned_url
            }
            alt="before"
          />
        </div>
        <div
          style={{
            ...elements.afterImage,
          }}
          className="resize-drag afterImage"
        >
          <img
            src={
              !currentImageIndex
                ? imagesData?.images[currentImageIndex]
                    .after_image_presigned_url
                : imagesData?.images[currentImageIndex - 1]
                    .after_image_presigned_url
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
          <img src={imagesData?.watermark_url} alt="watermark" />
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
