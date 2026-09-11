import os
from typing import Optional

import PyPDF2


class PDFParserService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
        """
        Extrae todo el texto de un archivo PDF usando PyPDF2.
        Maneja errores básicos de lectura.
        """
        text_content = []
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                # Iterar sobre cada página
                for page in reader.pages:
                    try:
                        extracted = page.extract_text()
                        if extracted.strip():
                            text_content.append(extracted)
                    except Exception as page_error:
                        print(f"Error leyendo página: {page_error}")
                        continue

            full_text = "\n".join(text_content)
            return full_text if full_text.strip() else None

        except Exception as e:
            print(f"Error crítico abriendo PDF: {e}")
            return None

    @staticmethod
    def extract_text_from_txt(file_path: str, encoding: str = "utf-8") -> Optional[str]:
        """Extrae texto plano de un archivo TXT."""
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    return f.read()
            except Exception as e:
                print(f"Error crítico abriendo TXT: {e}")
                return None
        except Exception as e:
            print(f"Error crítico abriendo TXT: {e}")
            return None

    @staticmethod
    def extract_text_from_docx(file_path: str) -> Optional[str]:
        """Extrae texto de un archivo DOCX (OpenXML) usando python-docx."""
        try:
            import docx
            document = docx.Document(file_path)
            paragraphs = [p.text.strip() for p in document.paragraphs if p.text.strip()]
            return "\n".join(paragraphs) or None
        except Exception as e:
            print(f"Error crítico abriendo DOCX: {e}")
            return None

    @staticmethod
    def extract_text(file_path: str, mime_or_ext: str = "") -> Optional[str]:
        """Dispatcher por tipo de archivo (extensión)."""
        ext = mime_or_ext.lower()
        if not ext:
            _, ext = os.path.splitext(file_path)
        if ext == "pdf" or ext == ".pdf" or "pdf" in ext:
            return PDFParserService.extract_text_from_pdf(file_path)
        if ext == "txt" or ext == ".txt":
            return PDFParserService.extract_text_from_txt(file_path)
        if ext in ("docx", ".docx"):
            return PDFParserService.extract_text_from_docx(file_path)
        return None