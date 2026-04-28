import pandas as pd
from pypdf import PdfReader

def parse_file(file_bytes, filename):

    if filename.endswith(".pdf"):

        reader = PdfReader(file_bytes)
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return text

    elif filename.endswith(".csv"):

        df = pd.read_csv(file_bytes)
        return df.to_string()

    else:
        return file_bytes.decode("utf-8")