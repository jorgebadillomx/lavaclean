import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';

const CONFIG_FILENAME = 'admin.config.json';

interface AdminConfig {
  adminHash: string;
}

export class AdminAuthService {
  private readonly salt: string;

  constructor(private readonly config: { salt: string }) {
    this.salt = config.salt;
  }

  async verify(name: string): Promise<boolean> {
    try {
      const configPath = `${FileSystem.documentDirectory}${CONFIG_FILENAME}`;

      const fileInfo = await FileSystem.getInfoAsync(configPath);
      if (!fileInfo.exists) {
        return false;
      }

      const content = await FileSystem.readAsStringAsync(configPath);
      const { adminHash } = JSON.parse(content) as AdminConfig;

      const normalized = name.toLowerCase().trim();
      // INVARIANTE DE SEGURIDAD: nunca logear `name`, `normalized`, ni `adminHash`
      const computed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        normalized + this.salt
      );

      return computed === adminHash;
    } catch {
      // Captura errores de IO, JSON inválido, etc.
      // SEGURIDAD: nunca propagar detalles del error — retornar false silenciosamente
      return false;
    }
  }
}
