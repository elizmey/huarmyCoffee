function normalizePreds(value) {
  if (Array.isArray(value)) return value.map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n));
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,;\s]+/).map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n));
  }
  return [];
}

function computeCpm(rawTasks) {
  const tasks = rawTasks.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    duracion: Math.max(1, parseInt(t.duracion_dias, 10) || 1),
    fecha_inicio: t.fecha_inicio,
    responsable: t.responsable || '',
    modulo: t.modulo || '',
    predecesoras: normalizePreds(t.predecesoras),
  }));

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const ids = tasks.map((t) => t.id);

  const incoming = new Map(ids.map((id) => [id, 0]));
  for (const t of tasks) {
    t.predecesoras = t.predecesoras.filter((p) => byId.has(p) && p !== t.id);
    for (const p of t.predecesoras) incoming.set(t.id, (incoming.get(t.id) || 0) + 1);
  }

  const queue = ids.filter((id) => incoming.get(id) === 0);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const t of tasks) {
      if (t.predecesoras.includes(id)) {
        incoming.set(t.id, incoming.get(t.id) - 1);
        if (incoming.get(t.id) === 0) queue.push(t.id);
      }
    }
  }

  if (order.length !== ids.length) {
    return { error: 'Hay un ciclo en las predecesoras. Revisa la red de tareas.', tasks: [], critica: [], duracion_proyecto: 0 };
  }

  const es = {};
  const ef = {};
  for (const id of order) {
    const t = byId.get(id);
    const predEf = t.predecesoras.map((p) => ef[p] || 0);
    es[id] = predEf.length ? Math.max(...predEf) : 0;
    ef[id] = es[id] + t.duracion;
  }

  const projectEnd = Math.max(0, ...Object.values(ef));
  const successors = new Map(ids.map((id) => [id, []]));
  for (const t of tasks) {
    for (const p of t.predecesoras) successors.get(p).push(t.id);
  }

  const ls = {};
  const lf = {};
  for (const id of [...order].reverse()) {
    const t = byId.get(id);
    const succs = successors.get(id) || [];
    lf[id] = succs.length ? Math.min(...succs.map((s) => ls[s])) : projectEnd;
    ls[id] = lf[id] - t.duracion;
  }

  const result = tasks.map((t) => {
    const holgura = ls[t.id] - es[t.id];
    return {
      ...t,
      es: es[t.id],
      ef: ef[t.id],
      ls: ls[t.id],
      lf: lf[t.id],
      holgura,
      critica: holgura === 0,
    };
  });

  return {
    duracion_proyecto: projectEnd,
    critica: result.filter((t) => t.critica).map((t) => t.nombre),
    tasks: result,
  };
}

module.exports = { computeCpm, normalizePreds };
