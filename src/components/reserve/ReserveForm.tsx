import { useState } from "react";

interface Reserva {
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
}

export default function ReserveForm() {
  const [formData, setFormData] = useState<Reserva>({
    nombre: "",
    telefono: "",
    fecha: "",
    hora: "",
    personas: 1,
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reservasPrevias = JSON.parse(localStorage.getItem("reservas") || "[]");
    reservasPrevias.push(formData);
    localStorage.setItem("reservas", JSON.stringify(reservasPrevias));

    setMensaje("✅ ¡Reserva registrada con éxito!");
    setFormData({ nombre: "", telefono: "", fecha: "", hora: "", personas: 1 });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
        Reserva tu mesa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <input
          type="time"
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <input
          type="number"
          name="personas"
          min={1}
          value={formData.personas}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Reservar
        </button>
      </form>

      {mensaje && <p className="text-center mt-4 text-green-600">{mensaje}</p>}
    </div>
  );
}
