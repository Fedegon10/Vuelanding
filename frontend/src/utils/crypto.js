import CryptoJS from 'crypto-js';

// Función para convertir un archivo (File object) a una cadena Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Encripta el contenido de un archivo usando una contraseña
export const encryptFile = async (file, password) => {
  try {
    const base64File = await fileToBase64(file);
    const encrypted = CryptoJS.AES.encrypt(base64File, password).toString();
    
    // Crea un nuevo archivo Blob con el contenido de texto encriptado
    const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
    
    // Retorna un nuevo objeto File listo para ser subido a Cloudinary
    return new File([encryptedBlob], `${file.name}.encrypted`, { type: 'text/plain' });
  } catch (error) {
    console.error("Error al encriptar el archivo:", error);
    throw error;
  }
};

// Desencripta el contenido de texto (previamente descargado) usando una contraseña
export const decryptFileContent = (encryptedContent, password) => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, password);
    const decryptedBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedBase64) {
      throw new Error('Contraseña incorrecta o archivo corrupto.');
    }
    
    return decryptedBase64;
  } catch (error) {
    console.error("Error al desencriptar:", error);
    throw error;
  }
};

// Convierte la cadena Base64 desencriptada de vuelta a un Blob para visualizar o descargar
export const base64ToBlob = (base64) => {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const byteString = atob(data);
    let n = byteString.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = byteString.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
};