from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = BASE_DIR / "assets" / "Firma Digital" / "plantillafirma.PNG"
FONT_DIR = BASE_DIR / "assets" / "fonts"

POPPINS_REGULAR = FONT_DIR / "Poppins-Regular.ttf"
POPPINS_BOLD = FONT_DIR / "Poppins-Bold.ttf"

NEGRO = (0, 0, 0)
BLANCO = (255, 255, 255)
PLACEHOLDER_FOTO = (220, 224, 230)

FOTO_BOX = (0.118, 0.157, 0.327, 0.749)
NOMBRE_XY = (0.368, 0.157)
CARGO_XY = (0.368, 0.290)
DEPTO_XY = (0.368, 0.386)
DIVISORIA_Y = 0.476
DIVISORIA_X1 = 0.368
DIVISORIA_X2 = 0.855
TEXTO_MAX_X = 0.855

CORREO_ICONO = (0.379, 0.552)
CORREO_TEXTO_DX = 0.03

DIR_ICONO = (0.379, 0.673)
DIR_TEXTO_DX = 0.03
DIR_LINEA1 = "Calle 80 Km 2 - Cota"
DIR_LINEA2 = "Parque Empresarial Tecnológico"

BARRA_Y = 0.889
BARRA_TEXTO_DX = 0.02
BARRA_TELEFONO_X = 0.173
BARRA_CORREO_X = 0.355
BARRA_WHATSAPP_X = 0.663
BARRA_TELEFONO_TEXTO = "601 8766500 Ext. 2"
BARRA_CORREO_TEXTO = "servicioalcliente@impresistem.com"
BARRA_WHATSAPP_TEXTO = "WhatsApp: 317 430 3907"


def _load_font(path: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(str(path), size)
    except Exception:
        return ImageFont.load_default()


def _text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


def _fit_font(
    draw: ImageDraw.ImageDraw, path: Path, text: str, size: int, max_width: int
) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font = _load_font(path, size)
    while size > 8:
        width, _ = _text_size(draw, text, font)
        if width <= max_width:
            return font
        size -= 1
        font = _load_font(path, size)
    return font


def generar_firma(empleado, debug: bool = False) -> Image.Image:
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"No se encontro la plantilla: {TEMPLATE_PATH}")

    img = Image.open(TEMPLATE_PATH).convert("RGB")
    draw = ImageDraw.Draw(img)
    W, H = img.size

    nombre = (empleado.nombre_completo or "").upper()
    cargo = empleado.cargo or ""
    departamento = empleado.departamento or ""
    correo = empleado.correo or ""

    max_text_w = int(TEXTO_MAX_X * W) - int(NOMBRE_XY[0] * W)

    x_text = int(NOMBRE_XY[0] * W)
    y_nombre = int(NOMBRE_XY[1] * H)
    y_cargo = int(CARGO_XY[1] * H)
    y_depto = int(DEPTO_XY[1] * H)

    fn = _fit_font(draw, POPPINS_BOLD, nombre, int(0.08 * H), max_text_w)
    draw.text((x_text, y_nombre), nombre, font=fn, fill=NEGRO)

    fc = _fit_font(draw, POPPINS_REGULAR, cargo, int(0.05 * H), max_text_w)
    draw.text((x_text, y_cargo), cargo, font=fc, fill=NEGRO)

    fd = _fit_font(draw, POPPINS_BOLD, departamento, int(0.05 * H), max_text_w)
    draw.text((x_text, y_depto), departamento, font=fd, fill=NEGRO)
    draw.line(
        [(x_text, int(DIVISORIA_Y * H)), (int(DIVISORIA_X2 * W), int(DIVISORIA_Y * H))],
        fill=NEGRO,
        width=max(1, int(0.004 * W)),
    )

    foto_box = (
        int(FOTO_BOX[0] * W),
        int(FOTO_BOX[1] * H),
        int(FOTO_BOX[2] * W),
        int(FOTO_BOX[3] * H),
    )
    if getattr(empleado, "foto_path", None):
        foto_ruta = BASE_DIR / empleado.foto_path
        if foto_ruta.exists():
            foto = Image.open(foto_ruta).convert("RGB")
            box_w = foto_box[2] - foto_box[0]
            box_h = foto_box[3] - foto_box[1]
            foto = foto.resize((box_w, box_h), Image.Resampling.LANCZOS)
            img.paste(foto, (foto_box[0], foto_box[1]))
        else:
            draw.rectangle(foto_box, fill=PLACEHOLDER_FOTO)
    else:
        draw.rectangle(foto_box, fill=PLACEHOLDER_FOTO)

    icono_correo_x = int(CORREO_ICONO[0] * W)
    icono_correo_y = int(CORREO_ICONO[1] * H)
    correo_x = icono_correo_x + int(CORREO_TEXTO_DX * W)
    f_correo = _fit_font(draw, POPPINS_REGULAR, correo, int(0.035 * H), int(TEXTO_MAX_X * W) - correo_x)
    draw.text((correo_x, icono_correo_y), correo, font=f_correo, fill=NEGRO, anchor="lm")

    icono_dir_x = int(DIR_ICONO[0] * W)
    icono_dir_y = int(DIR_ICONO[1] * H)
    dir_x = icono_dir_x + int(DIR_TEXTO_DX * W)
    f_dir1 = _fit_font(draw, POPPINS_BOLD, DIR_LINEA1, int(0.035 * H), int(TEXTO_MAX_X * W) - dir_x)
    f_dir2 = _fit_font(draw, POPPINS_REGULAR, DIR_LINEA2, int(0.028 * H), int(TEXTO_MAX_X * W) - dir_x)
    _, h1 = _text_size(draw, DIR_LINEA1, f_dir1)
    _, h2 = _text_size(draw, DIR_LINEA2, f_dir2)
    gap = int(0.006 * H)
    bloque_h = h1 + gap + h2
    dir_y_inicio = icono_dir_y - bloque_h // 2
    draw.text((dir_x, dir_y_inicio), DIR_LINEA1, font=f_dir1, fill=NEGRO, anchor="la")
    draw.text((dir_x, dir_y_inicio + h1 + gap), DIR_LINEA2, font=f_dir2, fill=NEGRO, anchor="la")

    barra_y = int(BARRA_Y * H)
    for icono_x, texto, tam in (
        (BARRA_TELEFONO_X, BARRA_TELEFONO_TEXTO, 0.035),
        (BARRA_CORREO_X, BARRA_CORREO_TEXTO, 0.035),
        (BARRA_WHATSAPP_X, BARRA_WHATSAPP_TEXTO, 0.035),
    ):
        x = int(icono_x * W) + int(BARRA_TEXTO_DX * W)
        f = _fit_font(draw, POPPINS_REGULAR, texto, int(tam * H), int(TEXTO_MAX_X * W) - x)
        draw.text((x, barra_y), texto, font=f, fill=BLANCO, anchor="lm")

    if debug:
        draw.rectangle(foto_box, outline=(255, 0, 0), width=3)
        draw.line([(x_text, 0), (x_text, H)], fill=(0, 0, 255), width=1)
        draw.line([(int(TEXTO_MAX_X * W), 0), (int(TEXTO_MAX_X * W), H)], fill=(0, 255, 0), width=1)

    return img
