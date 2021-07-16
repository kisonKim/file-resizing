import React from "react";
import "./styles.css";
import { Upload, Button } from "antd";
import "antd/dist/antd.css";
import jszip from "jszip";

export default function App() {
  return (
    <Upload
      accept=".zip"
      showUploadList={false}
      onChange={async info => {
        const unzip = new jszip();
        const oldZipFile = info.file;
        const loadedZipFile = await unzip.loadAsync(oldZipFile);

        const oldImageFiles = await new Promise(ok => {
          const filesInZipFile = [];

          loadedZipFile.forEach((_, file) => {
            filesInZipFile.push(file);
          });

          const oldImageFiles = [];

          filesInZipFile.forEach(async file => {
            const oldImageblob = await file.async("blob");

            oldImageFiles.push(new File([oldImageblob], file.name));

            if (oldImageFiles.length === filesInZipFile.length) {
              ok(oldImageFiles);
            }
          });
        });
        const newImageFiles = await new Promise(async ok => {
          const newImageFiles = [];

          for (const oldImageFile of oldImageFiles) {
            const image = document.createElement("img");

            image.src = URL.createObjectURL(oldImageFile);

            image.onload = () => {
              URL.revokeObjectURL(image.src);

              const canvas = document.createElement("canvas");

              canvas.width = 125;
              canvas.height = 125;

              const context = canvas.getContext("2d");

              context.drawImage(image, 0, 0, 125, 125);
              context.canvas.toBlob(
                oldImageblob => {
                  newImageFiles.push(
                    new File([oldImageblob], oldImageFile.name)
                  );

                  if (oldImageFiles.length === newImageFiles.length) {
                    ok(newImageFiles);
                  }
                },
                "image/png",
                0.5
              );
            };
          }
        });

        const zip = new jszip();

        for (const newImageFile of newImageFiles) {
          zip.file(newImageFile.name, newImageFile);
        }

        const newZipBlob = await zip.generateAsync({ type: "blob" });
        const newZipFile = new File([newZipBlob], oldZipFile.name);
        const formData = new FormData();

        formData.append("file", newZipFile);
        fetch("url", { method: "post", body: formData }).then(res => {});
      }}
      beforeUpload={() => false}
    >
      <Button>upload</Button>
    </Upload>
  );
}
