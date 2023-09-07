export default class LegacyMemcache<T> {
  private readonly cache: { [key: string]: T } = {}

  get(key: string): T | null {
    return this.cache[key] || null
  }

  put(key: string, thing: T) {
    this.cache[key] = thing
  }
}
