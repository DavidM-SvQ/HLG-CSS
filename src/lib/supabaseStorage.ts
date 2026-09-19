import { SupabaseClient } from "@supabase/supabase-js";

export const CHUNK_SIZE = 10000;

/**
 * Saves data to Supabase global_files table.
 * If data is an array with more than CHUNK_SIZE rows, it is automatically chunked
 * into separate rows (e.g. id__chunk_0, id__chunk_1) and a manifest row (id) to prevent
 * PostgreSQL statement timeouts on large datasets (e.g. 70k+ rows).
 */
export async function saveGlobalFile(
  supabase: SupabaseClient | any,
  id: string,
  data: any,
  isoDate: string = new Date().toISOString()
): Promise<void> {
  if (Array.isArray(data) && data.length > CHUNK_SIZE) {
    const chunkCount = Math.ceil(data.length / CHUNK_SIZE);

    // 1. Save all chunks sequentially to avoid saturating connection/pool
    for (let i = 0; i < chunkCount; i++) {
      const slice = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkId = `${id}__chunk_${i}`;
      const { error } = await supabase.from("global_files").upsert({
        id: chunkId,
        data: slice,
        updated_at: isoDate,
      });
      if (error) {
        throw new Error(
          `Error guardando bloque ${i + 1}/${chunkCount} de ${id}: ${error.message || JSON.stringify(error)}`
        );
      }
    }

    // 2. Save manifest
    const { error: manifestError } = await supabase.from("global_files").upsert({
      id,
      data: { __isChunked: true, chunkCount, totalRows: data.length },
      updated_at: isoDate,
    });
    if (manifestError) {
      throw new Error(`Error guardando índice principal de ${id}: ${manifestError.message}`);
    }

    // 3. Clean up any obsolete extra chunks if chunkCount decreased
    try {
      const { data: existingChunks } = await supabase
        .from("global_files")
        .select("id")
        .like("id", `${id}__chunk_%`);

      const activeChunkIds = new Set(
        Array.from({ length: chunkCount }, (_, i) => `${id}__chunk_${i}`)
      );
      const obsoleteIds = (existingChunks || [])
        .map((c: any) => c.id)
        .filter((chunkId: string) => !activeChunkIds.has(chunkId));

      if (obsoleteIds.length > 0) {
        await supabase.from("global_files").delete().in("id", obsoleteIds);
      }
    } catch {
      // Non-fatal cleanup
    }
  } else {
    // Normal single-record upsert
    const { error } = await supabase.from("global_files").upsert({
      id,
      data,
      updated_at: isoDate,
    });
    if (error) {
      throw new Error(`Error Supabase al guardar ${id}: ${error.message || JSON.stringify(error)}`);
    }

    // Clean up any legacy chunks if data shrank below CHUNK_SIZE
    try {
      const { data: existingChunks } = await supabase
        .from("global_files")
        .select("id")
        .like("id", `${id}__chunk_%`);
      if (existingChunks && existingChunks.length > 0) {
        await supabase
          .from("global_files")
          .delete()
          .in("id", existingChunks.map((c: any) => c.id));
      }
    } catch {
      // Non-fatal
    }
  }
}

/**
 * Loads and reconstructs a global_file record.
 * If the record is chunked (__isChunked: true), it loads all parts in batch,
 * orders them, and combines them back into the complete original array.
 */
export async function loadGlobalFileData(
  supabase: SupabaseClient | any,
  record: { id: string; data: any; updated_at?: string } | null
): Promise<{ data: any; updated_at?: string } | null> {
  if (!record) return null;

  if (record.data && typeof record.data === "object" && record.data.__isChunked) {
    const chunkCount = record.data.chunkCount || 0;
    if (chunkCount === 0) {
      return { data: [], updated_at: record.updated_at };
    }

    const chunkIds = Array.from({ length: chunkCount }, (_, i) => `${record.id}__chunk_${i}`);
    const { data: chunkRecords, error } = await supabase
      .from("global_files")
      .select("id, data")
      .in("id", chunkIds);

    if (error) {
      throw new Error(`Error al recuperar bloques de ${record.id}: ${error.message}`);
    }

    const sortedChunks = (chunkRecords || []).sort((a: any, b: any) => {
      const idxA = parseInt(a.id.split("__chunk_").pop() || "0", 10);
      const idxB = parseInt(b.id.split("__chunk_").pop() || "0", 10);
      return idxA - idxB;
    });

    const fullArray = sortedChunks.flatMap((c: any) => (Array.isArray(c.data) ? c.data : []));
    return {
      data: fullArray,
      updated_at: record.updated_at,
    };
  }

  return {
    data: record.data,
    updated_at: record.updated_at,
  };
}
