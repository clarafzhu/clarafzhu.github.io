import os
from pathlib import Path


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def extract_pdf_text_and_images(pdf_path: Path, out_dir: Path, images_dir: Path) -> dict:
    import fitz  # PyMuPDF

    ensure_dir(out_dir)
    ensure_dir(images_dir)

    doc = fitz.open(pdf_path)
    chunks = []
    img_count = 0

    rendered_pages = 0
    for page_index in range(len(doc)):
        page = doc[page_index]
        text = page.get_text("text")
        if text:
            chunks.append(f"\n\n--- page {page_index + 1} ---\n\n{text.strip()}\n")
        else:
            # Likely a scanned page. Render to an image for OCR/reading later.
            zoom = 2
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            rendered_pages += 1
            img_path = images_dir / f"{pdf_path.stem}_page_{page_index+1:03d}.png"
            pix.save(img_path)

        # Extract embedded images
        for img in page.get_images(full=True):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n >= 5:  # CMYK or other
                pix = fitz.Pixmap(fitz.csRGB, pix)
            img_count += 1
            img_path = images_dir / f"{pdf_path.stem}_p{page_index+1:03d}_{img_count:03d}.png"
            pix.save(img_path)

    text_out = out_dir / f"{pdf_path.stem}.txt"
    text_out.write_text("".join(chunks), encoding="utf-8")

    return {
        "pages": len(doc),
        "images": img_count,
        "rendered_pages": rendered_pages,
        "text_path": str(text_out),
    }


def extract_docx_text_and_images(docx_path: Path, out_dir: Path, images_dir: Path) -> dict:
    from docx import Document

    ensure_dir(out_dir)
    ensure_dir(images_dir)

    doc = Document(docx_path)
    paras = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    text_out = out_dir / f"{docx_path.stem}.txt"
    text_out.write_text("\n\n".join(paras), encoding="utf-8")

    # Extract images from docx zip (word/media)
    import zipfile

    img_count = 0
    with zipfile.ZipFile(docx_path, "r") as z:
        for name in z.namelist():
            if name.startswith("word/media/") and not name.endswith("/"):
                img_count += 1
                ext = Path(name).suffix or ".bin"
                out_path = images_dir / f"{docx_path.stem}_{img_count:03d}{ext}"
                with z.open(name) as src, open(out_path, "wb") as dst:
                    dst.write(src.read())

    return {"paragraphs": len(paras), "images": img_count, "text_path": str(text_out)}


def main() -> None:
    base = Path(__file__).resolve().parents[1]  # /.../jdp官网设计
    out_root = base / "source_extract"
    ensure_dir(out_root)

    pydeps = base / ".pydeps"
    if pydeps.exists():
        os.environ["PYTHONPATH"] = f"{pydeps}{os.pathsep}{os.environ.get('PYTHONPATH','')}"

    yc_docx = Path("/Volumes/502/cnpaf/文件all/yc/YouthCabinetBrochureEN.docx")
    yc_pdf = Path("/Volumes/502/cnpaf/文件all/yc/YouthCabinetBrochureEN.pdf")
    minds_pdf = Path("/Volumes/502/cnpaf/文件all/政府的/MINDSBRIDGE（心桥）实践报告(2).pdf")

    results = {}

    if yc_docx.exists():
        results["YouthCabinetBrochureEN.docx"] = extract_docx_text_and_images(
            yc_docx, out_root / "yc", out_root / "yc" / "images"
        )
    elif yc_pdf.exists():
        results["YouthCabinetBrochureEN.pdf"] = extract_pdf_text_and_images(
            yc_pdf, out_root / "yc", out_root / "yc" / "images"
        )
    else:
        results["YouthCabinet"] = {"error": "Source not found"}

    if minds_pdf.exists():
        results["MINDSBRIDGE.pdf"] = extract_pdf_text_and_images(
            minds_pdf, out_root / "mindsbridge", out_root / "mindsbridge" / "images"
        )
    else:
        results["MINDSBRIDGE"] = {"error": "Source not found"}

    summary_path = out_root / "summary.json"
    import json

    summary_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(summary_path)


if __name__ == "__main__":
    main()

