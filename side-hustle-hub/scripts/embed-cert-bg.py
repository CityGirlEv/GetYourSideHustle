from pathlib import Path
import base64

src = Path(
    r"C:\Users\evely\.cursor\projects\c-Users-evely-Documents-antigravity-eager-hypatia-side-hustle-hub\assets\c__Users_evely_AppData_Roaming_Cursor_User_workspaceStorage_0a0e454ca6b6e6fcb4dcb0a8a128b66e_images_image-a6a1b531-df1c-4095-a6a8-bccc77233670.jpg"
)
root = Path(__file__).resolve().parents[1]
brand = root / "public" / "brand"
brand.mkdir(parents=True, exist_ok=True)
dest = brand / "gysh-family-certificate.jpg"
data = src.read_bytes()
dest.write_bytes(data)
b64 = base64.b64encode(data).decode("ascii")
out = root / "functions" / "_lib" / "certificate-bg-data.ts"
out.write_text(
    "/** Official Get Your Side Hustle family certificate background (JPEG). */\n"
    "export const CERT_BG_WIDTH = 1024;\n"
    "export const CERT_BG_HEIGHT = 682;\n"
    "export const CERT_BG_JPEG_BASE64 =\n"
    f'  "{b64}";\n',
    encoding="utf-8",
)
print(f"jpg={dest.stat().st_size} ts={out.stat().st_size} b64={len(b64)}")
