import { Helmet } from "react-helmet";
import { useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import heic2any from "heic2any";

function Button(props) {
  return (
    <button
      {...props}
      className={
        !props.disabled
          ? "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          : "bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
      }
    >
      {props.children}
    </button>
  );
}

function Spinner() {
  return (
    <>
      <svg
        className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </>
  );
}

function loadImageBlob(file, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", (e) => {
    const data = e.target.result;
    const blob = new Blob([data]);
    callback(blob);
  });
  reader.readAsArrayBuffer(file);
}

function blobToDataURL(blob) {
  return new Promise((res, rej) => {
    var a = new FileReader();
    a.onload = function (e) {
      res(e.target.result);
    };
    a.readAsDataURL(blob);
  });
}

function drawToCanvas(canvas, image) {
  const ctx = canvas.getContext("2d");
  const img = new window.Image();
  img.onload = (e) => {
    const height = e.target.height;
    const width = e.target.width;
    canvas.height = height;
    canvas.width = width;

    ctx.drawImage(e.target, 0, 0, width, height); // Or at whatever offset you like
  };
  img.setAttribute("src", image);
}

function downloadImage(dataURI, extention) {
  const a = document.createElement("a");
  a.href = dataURI;
  a.download = `output.${extention}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function ImageTransform({ srcFormat, dstFormat, transform }) {
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef();

  useEffect(() => {
    if (image) {
      const canvas = canvasRef.current;
      drawToCanvas(canvas, image);
    }
  }, [image]);

  function download() {
    const canvas = canvasRef.current;
    downloadImage(canvas.toDataURL(`image/${dstFormat}`), dstFormat);
    toast.success("image downloaded");
  }

  return (
    <div>
      <input
        type="file"
        onChange={(event) => {
          const file = event.target.files[0];

          setLoading(true);
          loadImageBlob(file, async (blob) => {
            const [dataURI, error] = await transform(blob);
            if (dataURI) {
              setImage(dataURI);
              toast.success("success");
            } else {
              toast.error(error);
            }
            setLoading(false);
          });
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: image ? "block" : "none", maxWidth: "40%" }}
      ></canvas>
      {loading ? (
        <Spinner />
      ) : (
        <Button disabled={!image} onClick={download}>
          convert
        </Button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>Create App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5895424026455875"
          crossOrigin="anonymous"
        ></script>
      </Helmet>

      <Toaster />
      <main>
        <h1 className="font-medium leading-tight text-5xl mt-0 mb-2 text-black-600">
          Image conversion
        </h1>
        <h1>jpeg to png</h1>
        <ImageTransform
          srcFormat="jpeg"
          dstFormat="png"
          transform={async function transform(blob) {
            try {
              const dataURI = await blobToDataURL(blob);
              return [dataURI, null];
            } catch (e) {
              return [null, e];
            }
          }}
        />
        <h1>png to jpeg</h1>
        <ImageTransform
          srcFormat="png"
          dstFormat="jpeg"
          transform={async function transform(blob) {
            try {
              const dataURI = await blobToDataURL(blob);
              return [dataURI, null];
            } catch (e) {
              return [null, e];
            }
          }}
        />
        <h1>heic to png</h1>
        <ImageTransform
          srcFormat="heic"
          dstFormat="png"
          transform={async function transform(blob) {
            try {
              const data = await heic2any({ blob });
              const dataURI = await blobToDataURL(data);
              return [dataURI, null];
            } catch (e) {
              return [null, e];
            }
          }}
        />
      </main>
    </div>
  );
}
