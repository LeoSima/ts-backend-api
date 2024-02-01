import NodeCache from "node-cache";

import config from "@AncientOne/config";

type Key = string | number;

class CacheLocal {
    private static _instancia: CacheLocal;
    private cache: NodeCache;

    private constructor(ttlSeconds: number) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    public static recuperaInstancia(): CacheLocal {
        if (!CacheLocal._instancia)
            CacheLocal._instancia = new CacheLocal(config.localCacheTtl);

        return CacheLocal._instancia;
    }

    public get<T>(key: Key): T | undefined { return this.cache.get<T>(key) }
    public set<T>(key: Key, value: T): void { this.cache.set(key, value); }
}

export default CacheLocal.recuperaInstancia();
