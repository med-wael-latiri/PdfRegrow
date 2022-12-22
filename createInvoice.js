const fs = require("fs");
const { page } = require("pdfkit");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path) {
  let doc = new PDFDocument({
    size: "A4",
    margin: 50,

    bufferPages: true,
  });

  //Global Edits to All Pages (Header/Footer, etc)

  //doc.on("pageAdded", () => generateHeader(doc));

  //generateHeader(doc);
  //generateInvoiceTable(doc, invoice);
  // doc.on("pageAdded", () => generateInvoiceTable(doc, invoice));
  generateHeader(doc, invoice);

  generateInvoiceTable(doc, invoice);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc, invoice) {
  doc
    .image("logo.png", 260, 57, { width: 80 })
    .fillColor("#444444")
    .fontSize(20)
    // .text("Regrow-Pdf", 280, 57)
    .fontSize(15)
    .text("Search Date:", -430, 160, { align: "center" })
    .text("Source:", -33, 160, { align: "center" })
    .text("Agent/Api Name:", 250, 160, { align: "center" })
    .fontSize(10)
    .text(invoice.createdAt, -220, 163, { align: "center" })
    .text(invoice.agent, 60, 162, { align: "center" })
    .fontSize(10)
    .text(page, 60, 780, { align: "center" })
    .moveDown();

  let DataType = invoice.search_params.listDataType;
  let Data = DataType.replaceAll("'", "");
  let listDataType = JSON.parse(Data);
  console.log(listDataType);
  if (listDataType == "individual") {
    doc
      .fontSize(10)
      .text(listDataType, 430, 145, { align: "center" })
      .text(invoice.search_params.firstName, 410, 160, { align: "center" })
      .text(invoice.search_params.lastName, 450, 160, { align: "center" })
      .text(invoice.search_params.birthPlace, 430, 175, { align: "center" })
      .text(invoice.search_params.birthDate, 450, 190, { align: "center" });
  } else if (listDataType == "entity") {
    let Data = invoice.search_params.full_name.replaceAll("%20", " ");

    doc
      .text(listDataType, 390, 163, { align: "center" })
      .text(":", 415, 163, { align: "center" })
      .text(Data, 480, 163, { align: "center" });
  }
  doc.rect(15, 120, 570, 100).stroke();
  doc.rect(15, 220, 570, 600).stroke();
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 270;
  doc
    .font("Times-Bold")
    .fontSize(18)
    .text("List of correspendace:", 50, 228, { align: "center" });

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Full name",
    "List",
    "Similarity",
    "isLinked"
  );
  generateHr(doc, invoiceTableTop + 40);

  for (i = 0; i < invoice.profiles.length; i++) {
    const profile = invoice.profiles[i];
    const position = invoiceTableTop + (i + 1) * 30;
    if (position > 750) {
      if (position <= 780) {
        doc.addPage();
      }
      doc.font("Helvetica-Bold");
      const pos = position - 750;
      generateHr(doc, pos + 10);
      generateTableRow(
        doc,
        pos,
        profile.full_name,
        profile.full_name,
        profile.Similarity.toFixed(3),
        profile.isLinked ? "Yes" : "No"
      );
    } else {
      // console.log(profile.full_name, " ....");
      generateHr(doc, position + 40);
      generateTableRow(
        doc,
        position,
        profile.full_name,
        profile.full_name,
        profile.Similarity.toFixed(3),
        profile.isLinked ? "Yes" : "No"
      );
    }
  }
  let pages = doc.bufferedPageRange();
  console.log(pages);
  for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);

    let oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.text(
      `Page: ${i + 1} of ${pages.count}`,
      0,
      doc.page.height - oldBottomMargin / 2,
      { align: "center" }
    );
    doc.page.margins.bottom = oldBottomMargin;
  }
}

function generateTableRow(
  doc,
  y,
  profiles,
  full_name,
  list,
  Similarity,
  isLinked
) {
  doc
    .fontSize(10)
    .text(profiles, 50, y)
    .text(Similarity, 150, y, { width: 90, align: "center" })
    .text(isLinked, 50, y, { width: 90, align: "right" })
    .text(full_name, 250, y)
    .text(list, 450, y);
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = {
  createInvoice,
};
