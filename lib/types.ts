export type TipoVehiculo = {
  id: string;
  carwash_id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  created_at: string;
};

export type Servicio = {
  id: string;
  carwash_id: string;
  nombre: string;
  descripcion: string | null;
  grupo: string | null;
  activo: boolean;
  created_at: string;
};

export type Precio = {
  id: string;
  carwash_id: string;
  servicio_id: string;
  tipo_vehiculo_id: string;
  precio: number;
};

export type Lavador = {
  id: string;
  carwash_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
  created_at: string;
};

export type FormaPago = {
  id: string;
  carwash_id: string;
  nombre: string;
  moneda: string;
  activo: boolean;
  created_at: string;
};

export type Atencion = {
  id: string;
  carwash_id: string;
  cliente_nombre: string;
  cliente_correo: string;
  cliente_celular: string;
  placa: string;
  marca_modelo: string | null;
  tipo_vehiculo_id: string;
  servicio_id: string;
  precio: number;
  lavador_id: string;
  forma_pago_id: string;
  fecha_hora: string;
  created_at: string;
};
