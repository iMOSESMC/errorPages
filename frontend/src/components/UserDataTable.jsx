import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import Swal from "sweetalert2";

const UserDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("accessToken"); // JWT de acceso

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/users/api/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const decoded = parseJwt(token);
        setCurrentUserId(decoded?.user_id);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        setLoading(false);
      });
  }, []);

  const fetchData = () => {
    axios
      .get("http://127.0.0.1:8000/users/api/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar los datos:", error);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (id === currentUserId) {
      Swal.fire("Error", "No puedes eliminar tu propio usuario.", "error");
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://127.0.0.1:8000/users/api/${id}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");
            fetchData();
          })
          .catch(() => {
            Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
          });
      }
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleUpdate = () => {
    Swal.fire({
      title: "¿Actualizar usuario?",
      text: "¿Estás seguro de que quieres modificar esta información?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Actualizar",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(
            `http://127.0.0.1:8000/users/api/${editingUser.id}/`,
            editingUser,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            Swal.fire("¡Actualizado!", "La información del usuario fue modificada.", "success");
            fetchData();
            setShowModal(false);
          })
          .catch(() => {
            Swal.fire("Error", "No se pudo actualizar el usuario.", "error");
          });
      }
    });
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row.tel,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <span>
          <button
            className="btn btn-warning me-2"
            onClick={() => handleEdit(row)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Tabla de usuarios</h3>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
      />

      {/* Modal de edición */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Nombre"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="form-control mb-2"
                  placeholder="Email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Teléfono"
                  value={editingUser.tel}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, tel: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDataTable;
