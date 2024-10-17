export type CreateSnapshot = {
  message: string;
} & ({ relation_id: string } | { related_to_relation_id: string });
