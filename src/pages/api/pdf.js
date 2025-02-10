import path from "path";
const pdf = require("pdf-parse");
import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: "public/",
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  let list = [];
  let pages = [];

  try {
    await upload.array("files", 10)(req, res, async (err) => {
      if (err) {
        throw err;
      }

      const fileNames = req.files.map((file) => file.filename);

      for (let index = 0; index < fileNames.length; index++) {
        const fileName = fileNames[index];

        // default render callback
        function render_page(pageData) {
          //check documents https://mozilla.github.io/pdf.js/
          let render_options = {
            //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
            normalizeWhitespace: false,
            //do not attempt to combine same line TextItem's. The default value is `false`.
            disableCombineTextItems: false,
          };

          return pageData
            .getTextContent(render_options)
            .then(function (textContent) {
              let lastY,
                text = "";
              for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                  text += item.str;
                } else {
                  text += "\n" + item.str;
                }
                lastY = item.transform[5];
              }

              return text + "^^^";
            });
        }

        let options = {
          pagerender: render_page,
        };

        let dataBuffer = fs.readFileSync(
          path.join(process.cwd(), "public", fileName)
        );
        pdf(dataBuffer, options).then(function (data) {
          //use new format

          list.push(data);

          fs.unlinkSync(path.join(process.cwd(), "public", fileName));
          if (index === fileNames.length - 1) {
            res.status(200).json(list);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
