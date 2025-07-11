import mongoose from 'mongoose'

export type Relation<T> = mongoose.PopulatedDoc<mongoose.Document<mongoose.ObjectId> & T>
export type RelationList<T> = Relation<T>[]

export const ObjectId = mongoose.Schema.Types.ObjectId

// Helper type for working with populated documents
export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Relation<infer U> ? U : T[P] extends RelationList<infer U> ? U[] : T[P]
}