'use client';

import React, { useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loadLocationData, saveLocationData } from '@/lib/firestoreService';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState('inicializando');
  const [data, setData] = useState<any>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const LOCATION = 'TEST_LOCATION';

  useEffect(() => {
    (async () => {
      try {
        setStatus('autenticando...');
        await signInAnonymously(auth);
        setStatus('autenticado, cargando datos...');
        const remote = await loadLocationData(LOCATION);
        setData(remote);
        setStatus(remote ? 'datos cargados' : 'no hay datos (vacío)');
      } catch (err) {
        console.error('Carga inicial fallida:', err);
        setErrorDetail(serializeError(err));
        setStatus('error durante la carga (ver detalles)');
      }
    })();
  }, []);

  async function handleSave() {
    try {
      setStatus('guardando...');
      await saveLocationData(LOCATION, { lastTestSave: new Date().toISOString() });
      setStatus('guardado, refrescando...');
      const remote = await loadLocationData(LOCATION);
      setData(remote);
      setStatus('guardado y cargado');
    } catch (err) {
      console.error('Error guardando prueba:', err);
      setErrorDetail(serializeError(err));
      setStatus('error guardando (ver detalles)');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Prueba Firebase</h1>
      <p>Estado: {status}</p>
      <div className="mt-4">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar prueba</button>
        <button onClick={async () => { setStatus('refrescando...'); const r = await loadLocationData(LOCATION); setData(r); setStatus('refrescado'); }} className="ml-2 px-4 py-2 border rounded">Refrescar</button>
      </div>
      <pre className="mt-4 bg-gray-100 p-4 rounded max-h-80 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      <p className="mt-4 text-sm text-muted-foreground">Después de guardar, revisa la colección <strong>nordico_locations</strong> en la consola de Firestore para ver el documento <strong>TEST_LOCATION</strong>.</p>
      {errorDetail && (
        <div className="mt-4 p-3 border border-red-300 rounded bg-red-50">
          <strong>Detalles del error:</strong>
          <pre className="whitespace-pre-wrap mt-2 text-sm">{errorDetail}</pre>
        </div>
      )}
    </div>
  );
}

function serializeError(err: unknown) {
  try {
    if (!err) return String(err);
    const asAny = err as any;
    const props: Record<string, any> = {};
    Object.getOwnPropertyNames(asAny).forEach(k => {
      try { props[k] = asAny[k]; } catch (e) { props[k] = String(e); }
    });
    if (asAny.message) props.message = asAny.message;
    if (asAny.stack) props.stack = asAny.stack;
    return JSON.stringify(props, null, 2);
  } catch (e) {
    return String(err);
  }
}
