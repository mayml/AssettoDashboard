import type { EntityService } from '~/services/contracts'
import { DataError } from '~/services/dataError'
import type { MockCollection } from '~/services/mock/store'

export function createMockCrudService<T extends { id: string }, CreateInput, UpdateInput extends Partial<Omit<T, 'id'>>>(
  collection: MockCollection<T>,
  idPrefix: string,
  makeItem: (id: string, input: CreateInput) => T,
  delayMs = 300,
): EntityService<T, CreateInput, UpdateInput> {
  function wait() {
    return new Promise<void>(resolve => setTimeout(resolve, delayMs))
  }

  return {
    async list() {
      await wait()
      return collection.items.value.map(item => ({ ...item }))
    },

    async get(id) {
      await wait()
      const item = collection.items.value.find(record => record.id === id)
      if (!item) throw new DataError('Запись не найдена.', 404, 'NOT_FOUND')
      return { ...item }
    },

    async create(input) {
      await wait()
      const id = `${idPrefix}-${collection.nextId.value}`
      collection.nextId.value += 1
      const item = makeItem(id, input)
      collection.items.value = [item, ...collection.items.value]
      return { ...item }
    },

    async update(id, input) {
      await wait()
      const current = collection.items.value.find(record => record.id === id)
      if (!current) throw new DataError('Запись не найдена.', 404, 'NOT_FOUND')

      const updated = { ...current, ...input, id: current.id }
      collection.items.value = collection.items.value.map(record => record.id === id ? updated : record)
      return { ...updated }
    },

    async remove(id) {
      await wait()
      const exists = collection.items.value.some(record => record.id === id)
      if (!exists) throw new DataError('Запись не найдена.', 404, 'NOT_FOUND')
      collection.items.value = collection.items.value.filter(record => record.id !== id)
    },
  }
}
