import { useState, useEffect } from 'react';
import { Package, BarChart3, AlertTriangle, Ban, Pencil, Trash2 } from 'lucide-react';
import { itemService, categoryService, statusService } from '../api/axiosConfig';

const STATUS_BADGE = {
  'Disponible': 'badge--disponible',
  'En uso': 'badge--uso',
  'En mantenimiento': 'badge--mantenimiento',
  'Dado de baja': 'badge--baja',
};

export default function ItemList({ onEdit, onRefresh }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ categoryId: '', statusId: '', search: '' });

  const loadCatalogs = async () => {
    const [catRes, statRes] = await Promise.all([
      categoryService.getAll(),
      statusService.getAll(),
    ]);
    setCategories(catRes.data);
    setStatuses(statRes.data);
  };

  // isCurrent descarta la respuesta si los filtros ya cambiaron: al escribir en
  // la búsqueda, la respuesta de "L" podía llegar después de la de "LAPTOP" y
  // dejar la tabla con resultados viejos.
  const loadItems = async (isCurrent = () => true) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.statusId) params.statusId = filters.statusId;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await itemService.getAll(params);
      if (isCurrent()) setItems(res.data);
    } catch (err) {
      if (isCurrent()) setError('Error al cargar el inventario. ¿El backend está corriendo?');
    } finally {
      if (isCurrent()) setLoading(false);
    }
  };

  useEffect(() => { loadCatalogs(); }, []);
  useEffect(() => {
    let current = true;
    loadItems(() => current);
    return () => { current = false; };
  }, [filters]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await itemService.delete(id);
      onRefresh();
    } catch {
      setError('Error al eliminar el elemento');
    }
  };

  const formatCurrency = (value) =>
    value != null ? `$${Number(value).toLocaleString('es-CO')}` : '-';

  const totalStock = items.reduce((s, i) => s + (i.stock || 0), 0);
  const lowStockItems = items.filter((i) => i.stock != null && i.minStock != null && i.stock > 0 && i.stock <= i.minStock);
  const outOfStock = items.filter((i) => i.stock == null || i.stock <= 0);
  const totalValue = items.reduce((s, i) => s + ((i.purchaseValue || 0) * (i.stock || 0)), 0);

  return (
    <>
      {/* Summary cards */}
      <div className="cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card">
          <div className="card__icon" style={{ color: 'var(--neon-cyan)' }}><Package size={24} /></div>
          <div className="card__body">
            <div className="card__value">{items.length}</div>
            <div className="card__label">Productos</div>
          </div>
        </div>
        <div className="card">
          <div className="card__icon" style={{ color: 'var(--neon-cyan)' }}><BarChart3 size={24} /></div>
          <div className="card__body">
            <div className="card__value">{totalStock}</div>
            <div className="card__label">Stock total</div>
          </div>
        </div>
        <div className="card">
          <div className="card__icon" style={{ color: 'var(--neon-orange)' }}><AlertTriangle size={24} /></div>
          <div className="card__body">
            <div className="card__value">{lowStockItems.length}</div>
            <div className="card__label">Stock bajo</div>
          </div>
        </div>
        <div className="card">
          <div className="card__icon" style={{ color: 'var(--neon-pink)' }}><Ban size={24} /></div>
          <div className="card__body">
            <div className="card__value">{outOfStock.length}</div>
            <div className="card__label">Sin stock</div>
          </div>
        </div>
      </div>
      {totalValue > 0 && (
        <div style={{ textAlign: 'right', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Valor total en inventario: <strong style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>
            {formatCurrency(totalValue)}
          </strong>
        </div>
      )}

      {/* Filters */}
      <div className="filters" style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Buscar…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.statusId}
          onChange={(e) => setFilters((f) => ({ ...f, statusId: e.target.value }))}
        >
          <option value="">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando inventario…</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Stock</th>
                <th>Stock mín.</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay elementos registrados
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.stock != null && item.minStock != null && item.stock > 0 && item.stock <= item.minStock;
                  const isOut = item.stock == null || item.stock <= 0;
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.categoryName}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[item.statusName] || ''}`}>
                          {item.statusName}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: isOut ? 'var(--neon-pink)' : isLow ? 'var(--neon-orange)' : 'var(--neon-green)',
                        }}>
                          {item.stock ?? 0}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.minStock ?? 0}</td>
                      <td>{formatCurrency(item.purchaseValue)}</td>
                      <td>
                        <button className="btn-icon" title="Editar" onClick={() => onEdit(item)}><Pencil size={16} /></button>
                        <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(item.id, item.name)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
