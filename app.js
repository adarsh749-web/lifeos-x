import zipfile, os, shutil

src="/mnt/data/LIFEOS-X_COMPLETE.zip"
out_dir="/mnt/data/LIFEOS-X_FIXED"
os.makedirs(out_dir, exist_ok=True)

with zipfile.ZipFile(src) as z:
    z.extractall(out_dir)

app_path=os.path.join(out_dir,"LIFEOS-X","app.js")
with open(app_path,"r",encoding="utf-8") as f:
    code=f.read()

# Fix the exact blank-page bug: shell() was called without an active tab name.
code=code.replace(
    'function shell(title,sub,body,active){',
    'function shell(title,sub,body,active="Dashboard"){'
)

with open(app_path,"w",encoding="utf-8") as f:
    f.write(code)

# Standalone corrected app.js for easy replacement
standalone="/mnt/data/LIFEOS-X_FIXED_app.js"
shutil.copy2(app_path, standalone)

# Make a fresh ZIP with the corrected app.js
zip_path="/mnt/data/LIFEOS-X_FIXED.zip"
with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED) as z:
    base=os.path.join(out_dir,"LIFEOS-X")
    for name in os.listdir(base):
        z.write(os.path.join(base,name), arcname=f"LIFEOS-X/{name}")

print(f"Corrected files created:\n{standalone}\n{zip_path}")
