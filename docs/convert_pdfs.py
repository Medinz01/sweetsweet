import fitz
import os

docs_path = os.path.dirname(os.path.abspath(__file__))
pdfs = ['0th.pdf', '1st.pdf', 'final.pdf']

for pdf_name in pdfs:
    pdf_path = os.path.join(docs_path, pdf_name)
    txt_path = os.path.join(docs_path, pdf_name.replace('.pdf', '.txt'))
    doc = fitz.open(pdf_path)
    page_count = doc.page_count
    text = ''
    for page_num, page in enumerate(doc):
        text += f'\n\n===== PAGE {page_num + 1} =====\n\n'
        text += page.get_text()
    doc.close()
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Converted {pdf_name} -> {pdf_name.replace(".pdf",".txt")} ({len(text)} chars, {page_count} pages)')

print('All done.')
