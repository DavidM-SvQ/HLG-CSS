import { toast } from "sonner";

export async function copyImageToClipboard(
  blobPromise: Promise<Blob>, 
  fallbackDownloadName: string, 
  dataUrlPromise?: Promise<string>
) {
  try {
    if (typeof ClipboardItem !== "undefined") {
      try {
        // Try the Safari Promise-based approach first to avoid user gesture timeout
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blobPromise
          })
        ]);
        toast.success("Imagen copiada al portapapeles", {
          description: "Lista para pegar en tu destino."
        });
        return true;
      } catch (e) {
        // Fallback for Chrome/Firefox which might not support Promise in ClipboardItem
        const blob = await blobPromise;
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type || "image/png"]: blob
          })
        ]);
        toast.success("Imagen copiada al portapapeles", {
          description: "Lista para pegar en tu destino."
        });
        return true;
      }
    }
    throw new Error("ClipboardItem not defined");
  } catch (error) {
    console.warn("Clipboard copy failed, falling back to download", error);
    try {
      let dataUrl;
      if (dataUrlPromise) {
        dataUrl = await dataUrlPromise;
      } else {
        const blob = await blobPromise;
        dataUrl = URL.createObjectURL(blob);
      }
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fallbackDownloadName;
      link.click();
      
      if (!dataUrlPromise) {
         URL.revokeObjectURL(dataUrl);
      }
      
      toast.info("Imagen descargada", {
        description: "Tu navegador no permite copiar imágenes directamente."
      });
      return false;
    } catch (e) {
      console.error("Fallback download failed", e);
      toast.error("Error", {
        description: "No se pudo copiar ni descargar la imagen."
      });
      return false;
    }
  }
}

export async function copyTextToClipboard(text: string, fallbackDownloadName: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado al portapapeles");
      return true;
    }
    throw new Error("Clipboard not supported");
  } catch (error) {
    console.warn("Text copy failed, falling back to download", error);
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fallbackDownloadName;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.info("Texto descargado", {
        description: "Tu navegador no permite copiar texto directamente."
      });
      return false;
    } catch (e) {
      console.error("Fallback download failed", e);
      toast.error("Error", {
        description: "No se pudo copiar ni descargar el texto."
      });
      return false;
    }
  }
}
