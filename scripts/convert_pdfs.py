import os
import pypdf

def convert_pdfs_to_md(source_dir):
    for filename in os.listdir(source_dir):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(source_dir, filename)
            md_filename = os.path.splitext(filename)[0] + '.md'
            md_path = os.path.join(source_dir, md_filename)
            
            print(f"Processing {filename}...")
            
            try:
                reader = pypdf.PdfReader(pdf_path)
                text_content = []
                
                # Add title
                text_content.append(f"# {filename}\n")
                
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text:
                        text_content.append(f"## Page {i+1}\n")
                        text_content.append(text)
                        text_content.append("\n---\n")
                
                with open(md_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(text_content))
                
                print(f"Created {md_filename}")
                
            except Exception as e:
                print(f"Failed to process {filename}: {str(e)}")

if __name__ == "__main__":
    convert_pdfs_to_md('./references')
