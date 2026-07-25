// Validaciones transversales de los formularios.

// Nombre del cliente: solo letras (con tildes/ñ) y espacios; sin números.
const NOMBRE_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
export function validarNombre(v: string): string | null {
  const t = v.trim();
  if (!t) return "Ingresa el nombre";
  if (!NOMBRE_RE.test(t)) return "Solo letras y espacios, sin números";
  return null;
}

// Correo: formato válido, debe contener "@" y "."
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validarCorreo(v: string): string | null {
  const t = v.trim();
  if (!t) return "Ingresa el correo";
  if (!EMAIL_RE.test(t)) return "Ingresa un correo válido";
  return null;
}

// Celular Perú: numérico, exactamente 9 dígitos.
export function validarCelular(v: string): string | null {
  const t = v.trim();
  if (!t) return "Ingresa el celular";
  if (!/^\d{9}$/.test(t)) return "Debe tener 9 dígitos";
  return null;
}

// Teléfono del lavador: numérico (permite longitudes de fijo/celular).
export function validarTelefono(v: string): string | null {
  const t = v.trim();
  if (!t) return "Ingresa el teléfono";
  if (!/^\d{6,12}$/.test(t)) return "Solo números (6 a 12 dígitos)";
  return null;
}

// Placa: requerida; se normaliza a mayúsculas.
export function validarPlaca(v: string): string | null {
  const t = v.trim();
  if (!t) return "Ingresa la placa";
  if (t.length < 5) return "Placa demasiado corta";
  return null;
}

export function normalizarPlaca(v: string): string {
  return v.trim().toUpperCase();
}

export function soloDigitos(v: string): string {
  return v.replace(/\D+/g, "");
}
