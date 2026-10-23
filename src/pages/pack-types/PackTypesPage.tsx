import {
  useCreatePackTypeMutation,
  useDeletePackTypeMutation,
  useGetPackTypesQuery,
  useUpdatePackTypeMutation,
} from '../../features/catalog-units/api'
import { CatalogUnitsWorkspace } from '../../features/catalog-units/components/CatalogUnitsWorkspace'

export function PackTypesPage() {
  return (
    <CatalogUnitsWorkspace
      title="Pack types"
      description="What inventory counts: bottles, strips, vials, and any pack you add later."
      createLabel="Create pack type"
      entityLabel="Pack type"
      singularHint="Used in labels such as 1 bottle."
      pluralHint="Used in labels such as 20 bottles."
      useListQuery={useGetPackTypesQuery}
      useCreateMutation={useCreatePackTypeMutation}
      useUpdateMutation={useUpdatePackTypeMutation}
      useDeleteMutation={useDeletePackTypeMutation}
    />
  )
}
