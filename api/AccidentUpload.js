const fs = require("fs");
const path = require("path");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const nodemailer = require("nodemailer");

// הגדרת `multer` לניהול העלאת קבצים
const upload = multer({ dest: "/tmp/uploads/" });
const from_email = process.env.FROM_EMAIL;
const from_pass = process.env.FROM_PASS;
const to_email = process.env.TO_EMAIL;

module.exports = async (req, res) => {
    if (req.method === "POST") {
        upload.single("insurance_img")(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "שגיאה בהעלאת הקובץ" });
            }

            const { insurance_id } = req.body;
            const imageFile = req.file;

            if (!insurance_id || !imageFile) {
                return res.status(400).json({ success: false, message: "חסר מספר ביטוח או תמונה" });
            }

            try {
                // יצירת קובץ PDF
                const pdfPath = `/tmp/report.pdf`;
                const pdfDoc = new PDFDocument();
                const writeStream = fs.createWriteStream(pdfPath);

                pdfDoc.pipe(writeStream);
                pdfDoc.fontSize(20).text("דו\"ח ביטוח רכב", { align: "center" });
                pdfDoc.moveDown();
                pdfDoc.fontSize(14).text(`מספר ביטוח: ${insurance_id}`);
                pdfDoc.moveDown();
                pdfDoc.text("תמונה:", { align: "left" });
                pdfDoc.image(imageFile.path, { width: 300 });

                pdfDoc.end();

                // מחכים שהקובץ יישמר
                await new Promise((resolve) => writeStream.on("finish", resolve));

                // יצירת קובץ Word
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: "דו\"ח ביטוח רכב", bold: true, size: 36 })]
                            }),
                            new Paragraph({ children: [new TextRun({ text: `מספר ביטוח: ${insurance_id}`, size: 24 })] }),
                        ]
                    }]
                });

                const wordBuffer = await Packer.toBuffer(doc);
                const wordPath = `/tmp/report.docx`;
                fs.writeFileSync(wordPath, wordBuffer);

                // שליחת מייל עם הקבצים
                await sendEmail(pdfPath, wordPath);
                // מחיקת הקבצים אחרי השליחה
                fs.unlinkSync(pdfPath);
                fs.unlinkSync(wordPath);

                return res.status(200).json({ success: true, message: "הדו\"ח נשלח בהצלחה!" });
            } catch (error) {
                return res.status(500).json({ success: false, message: "שגיאת שרת", error });
            }
        });
    } else {
        res.status(405).json({ success: false, message: "Method Not Allowed" });
    }
};

// 📌 פונקציה לשליחת מייל עם הקבצים
const sendEmail = async (pdfPath, wordPath) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: from_email,
            pass: from_pass
        }
    });

    const mailOptions = {
        from: from_email,
        to: to_email,
        subject: "דו\"ח ביטוח רכב",
        text: "מצורף דו\"ח ביטוח רכב בפורמט PDF ו-Word",
        attachments: [
            { filename: "report.pdf", path: pdfPath },
            { filename: "report.docx", path: wordPath }
        ]
    };

    await transporter.sendMail(mailOptions);
};
