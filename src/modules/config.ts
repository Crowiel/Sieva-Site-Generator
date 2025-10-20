/**
 * Configuration loader for site settings
 * Priority: config-user.json > config-default.json
 * 
 * Users should copy config-default.json to config-user.json to customize
 * config-user.json is gitignored and won't be overwritten by upstream updates
 */

interface SiteConfig {
  site: {
    name: string;
    subtitle: string;
    footer: string;
    showGeneratorCredit?: boolean;
    domain?: string;
  };
  navigation: {
    home: string;
    projects: string;
    blog: string;
    about: string;
  };
  pages: {
    blog: {
      title: string;
      description: string;
    };
    projects: {
      title: string;
      description: string;
    };
    about: {
      title: string;
      description: string;
    };
    tags: {
      title: string;
      description: string;
    };
  };
}

let cachedConfig: SiteConfig | null = null;

export async function loadConfig(): Promise<SiteConfig> {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig;
  }

  // Try to load user config first, fall back to default
  try {
    const userConfigPath = new URL("../../config-user.json", import.meta.url);
    const userConfigText = await Deno.readTextFile(userConfigPath);
    const config: SiteConfig = JSON.parse(userConfigText);
    cachedConfig = config;
    console.log("✅ Using config-user.json");
    return config;
  } catch {
    // User config doesn't exist, use default
    try {
      const defaultConfigPath = new URL("../../config-default.json", import.meta.url);
      const defaultConfigText = await Deno.readTextFile(defaultConfigPath);
      const config: SiteConfig = JSON.parse(defaultConfigText);
      cachedConfig = config;
      console.log("📋 Using config-default.json (copy to config-user.json to customize)");
      return config;
    } catch (error) {
      console.error("❌ Failed to load configuration:", error);
      throw new Error("Could not load configuration file");
    }
  }
}

// Helper function to reset cache (useful for testing)
export function resetConfigCache() {
  cachedConfig = null;
}
